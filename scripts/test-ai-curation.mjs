#!/usr/bin/env node

/**
 * Test script for AI Content Curation System
 * 
 * This script validates that the AI curation system can be properly imported
 * and instantiated with sample CV data.
 */

import { ContentCurator, defaultCuratorConfig } from '../packages/ai-curation/dist/index.js';

// Sample CV data for testing
const sampleCVData = {
  personalInfo: {
    name: {
      first: 'John',
      last: 'Doe', 
      full: 'John Doe'
    },
    contact: {
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      address: 'New York, NY'
    },
    title: 'Software Engineer'
  },
  professionalSummary: 'Experienced software engineer with 5+ years of experience in web development.',
  experience: [
    {
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      startDate: '2020-01',
      endDate: 'Present',
      responsibilities: [
        'Led development of microservices architecture',
        'Mentored junior developers',
        'Implemented CI/CD pipelines'
      ]
    },
    {
      title: 'Software Engineer',
      company: 'StartupXYZ',
      startDate: '2018-06',
      endDate: '2019-12',
      responsibilities: [
        'Developed React.js applications',
        'Built RESTful APIs',
        'Collaborated with design team'
      ]
    }
  ],
  education: [
    {
      institution: 'University of Technology',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      year: '2018'
    }
  ],
  skills: [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 
    'Python', 'AWS', 'Docker', 'Kubernetes'
  ],
  certifications: [
    'AWS Certified Solutions Architect',
    'Certified Kubernetes Administrator'
  ]
};

// Sample job description
const sampleJobDescription = {
  text: `We are looking for a Senior Full-Stack Developer to join our team.
  
  Requirements:
  - 5+ years of experience in web development
  - Strong knowledge of React.js and Node.js
  - Experience with cloud platforms (AWS preferred)
  - Kubernetes experience is a plus
  - Strong leadership and mentoring skills
  
  Responsibilities:
  - Lead development of new features
  - Architect scalable solutions
  - Mentor team members
  - Collaborate with product team`,
  requirements: [
    '5+ years web development experience',
    'React.js expertise',
    'Node.js expertise', 
    'Cloud platforms (AWS)',
    'Leadership skills'
  ],
  sector: 'tech'
};

// Sample curation options
const sampleCurationOptions = {
  targetLength: 'single-page',
  targetAudience: 'professional',
  prioritizeRecent: true,
  maxExperienceItems: 3,
  maxSkillItems: 10,
  includeEducation: true,
  includeCertifications: true
};

async function testAICuration() {
  console.log('🧪 Testing AI Content Curation System...\n');
  
  try {
    // Initialize the content curator
    console.log('📋 Initializing ContentCurator...');
    const curator = new ContentCurator(defaultCuratorConfig);
    console.log('✅ ContentCurator initialized successfully\n');
    
    // Test content analysis
    console.log('🔍 Analyzing CV content...');
    const analysisResult = await curator.analyzeContent(sampleCVData);
    console.log(`✅ Content analysis completed. Found ${analysisResult.contentItems.length} content items\n`);
    
    // Test job alignment scoring
    if (sampleJobDescription) {
      console.log('📊 Scoring content for job alignment...');
      const scoringResult = await curator.scoreForJob(analysisResult, sampleJobDescription);
      console.log(`✅ Job alignment scoring completed. Average score: ${
        (scoringResult.scores.reduce((sum, score) => sum + score.totalScore, 0) / scoringResult.scores.length).toFixed(2)
      }\n`);
    }
    
    // Test full curation process
    console.log('🎯 Running full content curation...');
    const curationResult = await curator.curate(
      sampleCVData,
      sampleJobDescription,
      sampleCurationOptions
    );
    
    console.log('✅ Content curation completed successfully!\n');
    console.log('📊 Curation Summary:');
    console.log(`   • Original content items: ${curationResult.summary.totalContentItems}`);
    console.log(`   • Selected items: ${curationResult.summary.selectedItems}`);
    console.log(`   • Estimated length: ${curationResult.summary.estimatedLength} lines`);
    console.log(`   • Strategy used: ${curationResult.summary.strategyUsed}`);
    
    if (curationResult.summary.sectionsIncluded) {
      console.log(`   • Sections included: ${Object.entries(curationResult.summary.sectionsIncluded)
        .filter(([_, included]) => included)
        .map(([section, _]) => section)
        .join(', ')}`);
    }
    
    console.log('\n🎉 All tests passed! AI Content Curation System is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('\nThis may indicate missing dependencies or configuration issues.');
    console.error('Please ensure all packages are properly built and dependencies are installed.');
    process.exit(1);
  }
}

// Run the test
testAICuration().catch(console.error);
