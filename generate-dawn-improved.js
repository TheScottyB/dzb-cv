#!/usr/bin/env node
/**
 * Generate Dawn's CV with improved scaling parameters
 */
import { DefaultPDFGenerator } from './src/core/services/pdf/pdf-generator.js';
import { verifyPDF, printVerificationResults } from './src/shared/utils/pdf-verifier.js';
import fs from 'fs';
import path from 'path';

// Load Dawn's base data
const baseInfoPath = path.join(process.cwd(), 'data', 'base-info.json');
const baseData = JSON.parse(fs.readFileSync(baseInfoPath, 'utf-8'));

// Transform data for PDF generator
function transformToCVData(rawData) {
    const experience = [];
    const categories = ['healthcare', 'realEstate', 'foodIndustry'];
    categories.forEach(category => {
        if (rawData.workExperience[category] && Array.isArray(rawData.workExperience[category])) {
            rawData.workExperience[category].forEach((job) => {
                let startDate = 'Unknown';
                let endDate = 'Present';
                if (job.period) {
                    const parts = job.period.split(' - ');
                    startDate = parts[0].trim();
                    if (parts.length > 1 && !parts[1].includes('Present')) {
                        endDate = parts[1].trim();
                    }
                }
                experience.push({
                    title: job.position || job.title || 'Position',
                    company: job.employer || job.company || 'Company',
                    startDate: startDate,
                    endDate: endDate,
                    responsibilities: job.duties || job.responsibilities || []
                });
            });
        }
    });

    const skills = [];
    if (rawData.skills && typeof rawData.skills === 'object') {
        const skillCategories = ['managementAndLeadership', 'realEstateOperations', 'healthcareAdministration', 'technical', 'leadership'];
        skillCategories.forEach(category => {
            if (rawData.skills[category] && Array.isArray(rawData.skills[category])) {
                skills.push(...rawData.skills[category]);
            }
        });
    }

    const certifications = [];
    if (rawData.skills?.certifications && Array.isArray(rawData.skills.certifications)) {
        certifications.push(...rawData.skills.certifications);
    }
    if (rawData.skills?.realEstateCertifications && Array.isArray(rawData.skills.realEstateCertifications)) {
        certifications.push(...rawData.skills.realEstateCertifications);
    }

    const education = [];
    if (rawData.education && Array.isArray(rawData.education)) {
        rawData.education.forEach((edu) => {
            education.push({
                degree: edu.certification || edu.degree || 'Certification',
                institution: edu.institution || 'Institution',
                year: edu.year || edu.graduationDate || edu.endDate || 'N/A'
            });
        });
    }

    return {
        personalInfo: {
            name: {
                first: rawData.personalInfo?.name?.preferred?.split(' ')[0] || 'Unknown',
                last: rawData.personalInfo?.name?.full?.split(' ').slice(1).join(' ') || 'Unknown',
                full: rawData.personalInfo?.name?.full || 'Unknown Name'
            },
            contact: {
                email: rawData.personalInfo?.contact?.email || 'email@example.com',
                phone: rawData.personalInfo?.contact?.phone || 'Phone not available',
                address: rawData.personalInfo?.contact?.address || 'Address not available'
            },
            title: 'Professional'
        },
        professionalSummary: rawData.professionalSummary || 'Experienced professional.',
        experience: experience,
        education: education,
        skills: skills,
        certifications: certifications
    };
}

async function generateDawnCV() {
    console.log('🎯 Generating Dawn CV with Improved Scaling Parameters');
    
    const cvData = transformToCVData(baseData);
    const generator = new DefaultPDFGenerator();
    
    // Test different improved configurations
    const configs = [
        {
            name: 'Improved_SinglePage',
            filename: 'Dawn_CV_Improved_SinglePage.pdf',
            options: {
                singlePage: true,
                scale: 0.88,
                minFontSize: 9,
                lineHeight: 1.25,
                margins: { top: '0.35in', right: '0.35in', bottom: '0.35in', left: '0.35in' }
            }
        },
        {
            name: 'Improved_MultiPage',
            filename: 'Dawn_CV_Improved_MultiPage.pdf',
            options: {
                singlePage: false,
                margins: { top: '1in', right: '1in', bottom: '1in', left: '1in' }
            }
        }
    ];
    
    for (const config of configs) {
        console.log(`\n📄 Generating: ${config.name}`);
        try {
            const pdfBuffer = await generator.generate(cvData, config.options);
            fs.writeFileSync(config.filename, pdfBuffer);
            
            console.log(`💾 Generated: ${config.filename} (${(pdfBuffer.length/1024).toFixed(1)}KB)`);
            
            // Verify
            const verificationResult = await verifyPDF(config.filename);
            console.log(`✅ Valid: ${verificationResult.isValid}, Pages: ${verificationResult.pageCount}, Content: ${verificationResult.contentLength} chars`);
            
            if (verificationResult.issues.length > 0) {
                console.log(`🚨 Issues: ${verificationResult.issues.join(', ')}`);
            }
        } catch (error) {
            console.error(`❌ Error generating ${config.name}:`, error.message);
        }
    }
    
    console.log('\n🎉 Dawn CV generation complete!');
}

generateDawnCV().catch(console.error);
