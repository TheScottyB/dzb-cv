import { Command } from 'commander';
import { CVService } from '@dzb-cv/core';
import { createPDFGenerator } from '@dzb-cv/pdf';
import type { CVData } from '@dzb-cv/types';
import * as fs from 'fs';
import * as path from 'path';

function loadBaseInfoData(): any {
  try {
    const baseInfoPath = path.join(process.cwd(), 'data', 'base-info.json');
    const baseInfoContent = fs.readFileSync(baseInfoPath, 'utf8');
    return JSON.parse(baseInfoContent);
  } catch (error) {
    console.warn('⚠️  Could not load base-info.json, using minimal data');
    return null;
  }
}

function transformBaseInfoToCVData(baseInfo: any, name: string, email: string): CVData {
  const [firstName, ...lastNameParts] = name.split(' ');
  const lastName = lastNameParts.join(' ') || 'Unknown';
  
  if (!baseInfo) {
    // Fallback to minimal data
    return {
      personalInfo: {
        name: {
          first: firstName || 'Unknown',
          last: lastName,
          full: name,
        },
        contact: {
          email: email,
          phone: '',
        },
      },
      experience: [],
      education: [],
      skills: [],
    };
  }

  // Extract work experience from nested structure
  const experience: any[] = [];
  if (baseInfo.workExperience) {
    const categories = ['healthcare', 'realEstate', 'foodIndustry'];
    categories.forEach(category => {
      if (baseInfo.workExperience[category] && Array.isArray(baseInfo.workExperience[category])) {
        baseInfo.workExperience[category].forEach((job: any) => {
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
            position: job.position || job.title || 'Position',
            employer: job.employer || job.company || 'Company',
            startDate: startDate,
            endDate: endDate,
            responsibilities: job.duties || job.responsibilities || [],
            employmentType: 'full-time' as const,
          });
        });
      }
    });
  }
  
  // Extract skills from nested structure and convert to Skill objects
  const skills: any[] = [];
  if (baseInfo.skills && typeof baseInfo.skills === 'object') {
    const skillCategories = ['managementAndLeadership', 'realEstateOperations', 'healthcareAdministration', 'technical', 'leadership'];
    skillCategories.forEach(category => {
      if (baseInfo.skills[category] && Array.isArray(baseInfo.skills[category])) {
        baseInfo.skills[category].forEach((skillName: string) => {
          skills.push({
            name: skillName,
            level: 'intermediate' as const,
            category: category,
          });
        });
      }
    });
  }
  
  // Extract education
  const education: any[] = [];
  if (baseInfo.education && Array.isArray(baseInfo.education)) {
    baseInfo.education.forEach((edu: any) => {
      education.push({
        institution: edu.institution || 'Institution',
        degree: edu.certification || edu.degree || 'Certification',
        field: 'General',
        graduationDate: edu.year || edu.graduationDate || edu.endDate || 'N/A',
      });
    });
  }
  
  return {
    personalInfo: {
      name: {
        first: firstName || 'Unknown',
        last: lastName,
        full: name,
      },
      contact: {
        email: email,
        phone: baseInfo.personalInfo?.contact?.phone || '',
        address: baseInfo.personalInfo?.contact?.address,
      },
      professionalTitle: 'Professional',
      summary: baseInfo.professionalSummary,
    },
    experience: experience,
    education: education,
    skills: skills,
  };
}

export function createCVCommand(program: Command): void {
  program
    .command('create')
    .description('Create a new CV')
    .requiredOption('-n, --name <name>', 'Full name')
    .requiredOption('-e, --email <email>', 'Email address')
    .option('-o, --output <file>', 'Output PDF file')
    .option('--single-page', 'Force PDF to fit on a single page')
    .option('--template <template>', 'Template to use (default, minimal, federal, academic)', 'default')
    .option('--format <format>', 'Paper format (A4, Letter)', 'Letter')
    .action(async (options) => {
      const [firstName, ...lastNameParts] = options.name.split(' ');
      const lastName = lastNameParts.join(' ');

      console.log(`Creating CV for ${firstName} ${lastName}`);

      // Load base info data and transform it
      const baseInfo = loadBaseInfoData();
      const cvData = transformBaseInfoToCVData(baseInfo, options.name, options.email);

      const storage = {
         
        save: async (id: string, _data: CVData): Promise<void> => {
          console.log(`Saving CV with ID: ${id}`);
        },
         
        load: async (_id: string): Promise<CVData> => {
          throw new Error('Not implemented');
        },
         
        delete: async (_id: string): Promise<void> => {
          throw new Error('Not implemented');
        },
      };

      const pdfGenerator = createPDFGenerator();
      const service = new CVService(storage, pdfGenerator);
      
      // Build PDF generation options from CLI flags
      const pdfOptions = {
        singlePage: options.singlePage || false,
        template: options.template as 'default' | 'minimal' | 'federal' | 'academic',
        format: options.format as 'A4' | 'Letter',
        metadata: {
          title: `${options.name} - CV`,
          author: options.name,
          subject: 'Curriculum Vitae',
          keywords: ['CV', 'resume', options.template],
        },
      };
      
      try {
        await service.createCV(cvData);
        const pdf = await service.generatePDF(cvData, pdfOptions);
        
        // Determine output file path
        const outputPath = options.output || `${options.name.toLowerCase().replace(/\s+/g, '-')}-cv.pdf`;
        
        // Save PDF to file
        const fs = await import('fs');
        const path = await import('path');
        
        // Ensure output directory exists
        const outputDir = path.dirname(outputPath);
        if (outputDir !== '.') {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        fs.writeFileSync(outputPath, pdf);
        console.log(`Generated PDF: ${pdf.length} bytes`);
        console.log(`✅ CV saved to: ${path.resolve(outputPath)}`);
      } catch (error) {
        console.error('Error creating CV:', error);
        process.exit(1);
      }
    });
}
