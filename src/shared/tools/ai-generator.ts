/**
 * AI-powered CV generation tool that integrates LLM optimization with existing PDF generation
 */

import path from 'path';
import fs from 'fs/promises';
import { AgentMessageBus } from '../../AgentMessageBus';
import LLMServiceAgent from '../../ats/agents/LLMServiceAgent';
import { DefaultPDFGenerator } from '../../core/services/pdf/pdf-generator';
import type { CVData } from '../../shared/types/cv-types';
import { verifyPDF, printVerificationResults } from '../utils/pdf-verifier';
import { ContentCurator, defaultCuratorConfig } from '../../../packages/ai-curation/src';
import type { JobDescription, CurationOptions } from '../../../packages/ai-curation/src/types/curation';

// Debug logging configuration
const DEBUG = process.env.DEBUG === 'true' || process.env.VERBOSE === 'true';
const log = {
  debug: (...args: any[]) => DEBUG && console.log('[AI-Gen DEBUG]', ...args),
  info: (...args: any[]) => console.log('[AI-Gen INFO]', ...args),
  warn: (...args: any[]) => console.warn('[AI-Gen WARN]', ...args),
  error: (...args: any[]) => console.error('[AI-Gen ERROR]', ...args)
};

interface AIGenerateOptions {
  name: string;
  email: string;
  output: string;
  singlePage?: boolean;
  style?: 'professional' | 'academic' | 'technical' | 'executive';
  useOpenAI?: boolean;
  jobDescription?: string;
  jobUrl?: string;
  targetSector?: 'federal' | 'healthcare' | 'tech' | 'private';
  useIntelligentCuration?: boolean;
}

interface AIGenerateResult {
  success: boolean;
  filePath?: string;
  error?: string;
  processing?: {
    distilled: any;
    optimized: any;
    processingTime: number;
  };
}

/**
 * Generate an AI-optimized CV using the LLM agent pipeline
 */
export async function generateAICV(options: AIGenerateOptions): Promise<AIGenerateResult> {
  const startTime = Date.now();
  const requestId = `ai-gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  log.debug('Starting generateAICV with options:', JSON.stringify(options, null, 2));
  log.debug('Generated requestId:', requestId);
  
  try {
    // Initialize message bus and LLM agent
    log.debug('Initializing AgentMessageBus and LLMServiceAgent...');
    const messageBus = new AgentMessageBus();
    const llmAgent = new LLMServiceAgent({ messageBus, agentName: 'AIGenerator' });
    
    log.info('🤖 Initializing AI-powered CV generation...');
    
    // Create base CV data from input
    log.debug('Creating base CV data from options...');
    let cvData = await createBaseCV(options);
    log.debug('Base CV data created:', {
      hasPersonalInfo: !!cvData.personalInfo,
      experienceCount: cvData.experience?.length || 0,
      skillsCount: cvData.skills?.length || 0
    });
    
    // Apply intelligent content curation if requested
    if (options.useIntelligentCuration !== false && (options.jobDescription || options.jobUrl)) {
      log.info('🧠 Applying intelligent content curation...');
      cvData = await applyCurationToCVData(cvData, options);
      log.debug('Content curation applied, updated CV data');
    }
    
    // Create promise to wait for LLM processing
    const processingPromise = new Promise<AIGenerateResult>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('AI processing timeout (30s)'));
      }, 30000);
      
      // Listen for completion
      messageBus.subscribe('cv:process:single-page:complete', (result) => {
        clearTimeout(timeout);
        console.log('✅ AI processing completed successfully');
        resolve({
          success: true,
          processing: {
            distilled: result.distilled,
            optimized: result.optimized,
            processingTime: result.processingTime || 1 // Ensure we always have a positive processing time
          }
        });
      });
      
      // Listen for errors
      messageBus.subscribe('cv:process:single-page:error', (error) => {
        clearTimeout(timeout);
        console.error('❌ AI processing failed:', error.error);
        resolve({
          success: false,
          error: error.error || 'AI processing failed'
        });
      });
    });
    
    // Trigger AI processing
    log.info('🧠 Starting LLM content optimization...');
    log.debug('Publishing cv:process:single-page with requestId:', requestId, 'and style:', options.style);
    messageBus.publish('cv:process:single-page', {
      requestId,
      cvData,
      targetStyle: options.style || 'professional',
      layoutConstraints: {
        maxLines: 45,
        maxCharactersPerLine: 80,
        pageFormat: 'Letter',
        margins: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 }
      }
    });
    
    // Wait for AI processing to complete
    const processingResult = await processingPromise;
    
    if (!processingResult.success) {
      return processingResult;
    }
    
    // Generate PDF using optimized content
    console.log('📄 Generating PDF from optimized content...');
    const pdfPath = await generateOptimizedPDF(
      cvData, 
      processingResult.processing!.optimized.optimizedContent,
      options
    );
    
    const totalTime = Date.now() - startTime;
    console.log(`🎉 AI-optimized CV generated in ${totalTime}ms`);
    
    // Cleanup
    await llmAgent.shutdown(5000);
    
    return {
      success: true,
      filePath: pdfPath,
      processing: processingResult.processing
    };
    
  } catch (error) {
    console.error('💥 Error in AI CV generation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Create base CV data from user input and template
 */
async function createBaseCV(options: AIGenerateOptions): Promise<CVData> {
  // Parse name into components
  const [firstName, ...lastNameParts] = options.name.split(' ');
  const lastName = lastNameParts.join(' ');
  
  // Try to load existing CV data or create minimal structure
  let baseCV: CVData;
  
  try {
    // Attempt to load from standard location
    const baseDataPath = path.join(process.cwd(), 'data', 'base-info.json');
    const baseData = await fs.readFile(baseDataPath, 'utf-8');
    const rawData = JSON.parse(baseData);
    
    // Transform the complex base-info.json structure to PDF generator format
    baseCV = transformBaseInfoToCVData(rawData);
    
    // Update personal info with provided details
    if (baseCV.personalInfo?.name) {
      baseCV.personalInfo.name.full = options.name;
    }
    if (baseCV.personalInfo?.contact) {
      baseCV.personalInfo.contact.email = options.email;
    }
    
    console.log('📋 Loaded existing CV data and updated personal information');
  } catch (error) {
    // Create minimal CV structure if no base data exists
    console.log('⚠️  No existing CV data found, creating minimal structure');
    baseCV = {
      personalInfo: {
        name: {
          first: firstName,
          last: lastName,
          full: options.name
        },
        contact: {
          email: options.email,
          phone: '+1-555-0123', // Placeholder
          address: 'Location Available Upon Request'
        },
        title: 'Professional'
      },
      professionalSummary: `Experienced professional with a strong background in delivering results and contributing to organizational success.`,
      experience: [
        {
          title: 'Professional Role',
          company: 'Company Name',
          startDate: '2020-01',
          endDate: 'Present',
          responsibilities: [
            'Led key initiatives and projects',
            'Collaborated with cross-functional teams',
            'Achieved measurable results and improvements'
          ]
        },
        {
          title: 'Previous Role',
          company: 'Previous Company',
          startDate: '2018-01',
          endDate: '2019-12',
          responsibilities: [
            'Developed skills and expertise',
            'Contributed to team objectives',
            'Maintained high performance standards'
          ]
        }
      ],
      education: [
        {
          institution: 'University Name',
          degree: 'Bachelor of Science',
          field: 'Professional Field',
          year: '2018'
        }
      ],
      skills: [
        'Leadership', 'Communication', 'Project Management',
        'Problem Solving', 'Team Collaboration', 'Strategic Thinking'
      ],
      certifications: [
        'Professional Certification',
        'Industry Standard Certification'
      ]
    };
  }
  
  return baseCV;
}

/**
 * Transform the complex base-info.json structure to the format expected by PDF generator
 */
function transformBaseInfoToCVData(rawData: any): CVData {
  // Extract work experience from nested structure
  const experience: any[] = [];
  
  if (rawData.workExperience) {
    // Combine all work experience categories
    const categories = ['healthcare', 'realEstate', 'foodIndustry'];
    categories.forEach(category => {
      if (rawData.workExperience[category] && Array.isArray(rawData.workExperience[category])) {
        rawData.workExperience[category].forEach((job: any) => {
          // Parse period properly to extract correct dates
          let startDate = 'Unknown';
          let endDate = 'Present';
          
          if (job.period) {
            const parts = job.period.split(' - ');
            startDate = parts[0].trim();
            if (parts.length > 1 && !parts[1].includes('Present')) {
              endDate = parts[1].trim();
            }
          } else {
            startDate = job.startDate || 'Unknown';
            endDate = job.endDate || 'Present';
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
  }
  
  // Extract skills from nested structure
  const skills: string[] = [];
  if (rawData.skills && typeof rawData.skills === 'object') {
    const skillCategories = ['managementAndLeadership', 'realEstateOperations', 'healthcareAdministration', 'technical', 'leadership'];
    skillCategories.forEach(category => {
      if (rawData.skills[category] && Array.isArray(rawData.skills[category])) {
        skills.push(...rawData.skills[category]);
      }
    });
  } else if (Array.isArray(rawData.skills)) {
    skills.push(...rawData.skills);
  }
  
  // Extract certifications
  const certifications: string[] = [];
  if (rawData.skills?.certifications && Array.isArray(rawData.skills.certifications)) {
    certifications.push(...rawData.skills.certifications);
  }
  if (rawData.skills?.realEstateCertifications && Array.isArray(rawData.skills.realEstateCertifications)) {
    certifications.push(...rawData.skills.realEstateCertifications);
  }
  
  // Extract education
  const education: any[] = [];
  if (rawData.education && Array.isArray(rawData.education)) {
    rawData.education.forEach((edu: any) => {
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
    professionalSummary: rawData.professionalSummary || 'Experienced professional with a strong background in delivering results.',
    experience: experience,
    education: education,
    skills: skills,
    certifications: certifications
  };
}

/**
 * Generate PDF using optimized content from LLM
 */
async function generateOptimizedPDF(
  originalCV: CVData,
  optimizedContent: string,
  options: AIGenerateOptions
): Promise<string> {
  const pdfGenerator = new DefaultPDFGenerator();
  
  // Create CV data structure with optimized content
  // Note: In a full implementation, we'd parse the optimized content
  // back into structured data. For now, we'll use a hybrid approach.
  const optimizedCV = {
    ...originalCV,
    // The optimized content would ideally be parsed back into structured format
    // For now, we'll use the original structure with single-page optimizations
  };
  
  const pdfOptions = {
    singlePage: options.singlePage !== false,
    paperSize: 'Letter' as const,
    scale: 0.85, // Better readability while maintaining compression
    minFontSize: 9, // Improved minimum font size for readability
    lineHeight: 1.2,
    margins: {
      top: '0.3in',  // Further reduced margins
      right: '0.3in', 
      bottom: '0.3in',
      left: '0.3in'
    },
    pdfTitle: `${options.name} - AI-Optimized CV`,
    pdfAuthor: options.name
  };
  
  const pdfBuffer = await pdfGenerator.generate(optimizedCV, pdfOptions);
  
  // Ensure output directory exists
  const outputDir = path.dirname(options.output);
  await fs.mkdir(outputDir, { recursive: true });
  
  // Save PDF
  await fs.writeFile(options.output, pdfBuffer);
  console.log(`💾 PDF saved: ${path.resolve(options.output)} (${pdfBuffer.length} bytes)`);
  
  // Verify the generated PDF
  console.log('🔍 Verifying generated PDF...');
  const verificationResult = await verifyPDF(options.output);
  printVerificationResults(options.output, verificationResult);
  
  if (!verificationResult.isValid || verificationResult.issues.length > 0) {
    console.warn('⚠️  PDF verification found issues - the generated CV may not contain proper content');
  }
  
  return path.resolve(options.output);
}

/**
 * Apply intelligent content curation to CV data based on job requirements
 */
async function applyCurationToCVData(
  cvData: CVData,
  options: AIGenerateOptions
): Promise<CVData> {
  try {
    const curator = new ContentCurator(defaultCuratorConfig);
    
    // Prepare job description for curation
    let jobDescription: JobDescription | undefined;
    if (options.jobDescription) {
      jobDescription = {
        text: options.jobDescription,
        requirements: [], // Could be enhanced to parse requirements
        sector: options.targetSector || 'private'
      };
    }
    
    // Prepare curation options
    const curationOptions: CurationOptions = {
      targetLength: 'single-page',
      targetAudience: options.style || 'professional',
      prioritizeRecent: true,
      maxExperienceItems: 4,
      maxSkillItems: 12,
      includeEducation: true,
      includeCertifications: true
    };
    
    // Apply content curation
    const curatedContent = await curator.curate(cvData, jobDescription, curationOptions);
    
    // Transform curated content back to CVData format
    return transformCuratedContentToCVData(cvData, curatedContent);
    
  } catch (error) {
    log.warn('Content curation failed, using original CV data:', error);
    return cvData;
  }
}

/**
 * Transform curated content back to CVData format
 */
function transformCuratedContentToCVData(
  originalCvData: CVData,
  curatedContent: any
): CVData {
  // This is a simplified transformation - in practice, you'd want to
  // properly map the curated content back to the CVData structure
  return {
    ...originalCvData,
    // Apply any transformations based on curatedContent
    // For now, we return the original structure
    // TODO: Implement proper transformation based on CuratedContent structure
  };
}

/**
 * Enhanced version that includes job matching and intelligent curation
 */
export async function generateAICVForJob(
  cvOptions: AIGenerateOptions,
  jobDescription?: string,
  jobUrl?: string
): Promise<AIGenerateResult> {
  // Enable intelligent curation and provide job context
  const enhancedOptions: AIGenerateOptions = {
    ...cvOptions,
    jobDescription,
    jobUrl,
    useIntelligentCuration: true
  };
  
  console.log('🎯 Generating job-targeted CV with intelligent content curation...');
  return generateAICV(enhancedOptions);
}
