/**
 * Test script to compare PDF scaling approaches and identify the optimal parameters
 */
import { DefaultPDFGenerator } from './src/core/services/pdf/pdf-generator.js';
import { verifyPDF, printVerificationResults } from './src/shared/utils/pdf-verifier.js';
import fs from 'fs/promises';
import path from 'path';

// Test data
const testData = {
  personalInfo: {
    name: { full: 'Test User' },
    contact: { email: 'test@example.com', phone: '555-0123' }
  },
  experience: [
    {
      title: 'Senior Developer',
      company: 'Tech Company', 
      startDate: '2020-01',
      endDate: 'Present',
      responsibilities: [
        'Led development of scalable web applications using modern technologies',
        'Collaborated with cross-functional teams to deliver high-quality software products',
        'Mentored junior developers and established best practices for code quality',
        'Architected and implemented microservices solutions for complex business requirements',
        'Optimized database performance and implemented caching strategies'
      ]
    },
    {
      title: 'Full Stack Developer',
      company: 'Previous Company',
      startDate: '2018-06',
      endDate: '2019-12',
      responsibilities: [
        'Developed responsive web applications using React and Node.js',
        'Built RESTful APIs and integrated with third-party services',
        'Implemented automated testing and CI/CD pipelines',
        'Collaborated with designers to create user-friendly interfaces'
      ]
    }
  ],
  education: [
    {
      degree: 'Bachelor of Science',
      institution: 'University of Technology',
      year: '2018'
    }
  ],
  skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'MongoDB', 'PostgreSQL'],
  certifications: ['AWS Certified Developer', 'React Professional Certificate']
};

const scalingConfigs = [
  {
    name: 'Current_AI_Settings',
    options: {
      singlePage: true,
      scale: 0.85,
      minFontSize: 9,
      margins: { top: '0.3in', right: '0.3in', bottom: '0.3in', left: '0.3in' }
    }
  },
  {
    name: 'Conservative_Scale',
    options: {
      singlePage: true,
      scale: 0.95,
      minFontSize: 10,
      margins: { top: '0.4in', right: '0.4in', bottom: '0.4in', left: '0.4in' }
    }
  },
  {
    name: 'Aggressive_Scale',
    options: {
      singlePage: true,
      scale: 0.75,
      minFontSize: 8,
      margins: { top: '0.25in', right: '0.25in', bottom: '0.25in', left: '0.25in' }
    }
  },
  {
    name: 'Optimal_Readability',
    options: {
      singlePage: true,
      scale: 0.88,
      minFontSize: 9,
      lineHeight: 1.25,
      margins: { top: '0.35in', right: '0.35in', bottom: '0.35in', left: '0.35in' }
    }
  },
  {
    name: 'No_Single_Page',
    options: {
      singlePage: false,
      margins: { top: '1in', right: '1in', bottom: '1in', left: '1in' }
    }
  }
];

async function testScalingConfiguration(config) {
  console.log(`\n🧪 Testing: ${config.name}`);
  console.log('Options:', JSON.stringify(config.options, null, 2));
  
  const generator = new DefaultPDFGenerator();
  const outputPath = `test-scaling-${config.name.toLowerCase()}.pdf`;
  
  try {
    const pdfBuffer = await generator.generate(testData, config.options);
    
    // Save PDF
    await fs.writeFile(outputPath, pdfBuffer);
    console.log(`💾 Generated: ${outputPath} (${pdfBuffer.length} bytes)`);
    
    // Verify PDF
    const verificationResult = await verifyPDF(outputPath);
    console.log(`📄 Valid: ${verificationResult.isValid ? '✅' : '❌'}`);
    console.log(`📊 Pages: ${verificationResult.pageCount}`);
    console.log(`📝 Content: ${verificationResult.contentLength} characters`);
    
    if (verificationResult.issues.length > 0) {
      console.log(`🚨 Issues: ${verificationResult.issues.join(', ')}`);
    }
    
    if (verificationResult.warnings.length > 0) {
      console.log(`⚠️  Warnings: ${verificationResult.warnings.join(', ')}`);
    }
    
    return {
      name: config.name,
      filePath: outputPath,
      fileSize: pdfBuffer.length,
      isValid: verificationResult.isValid,
      pageCount: verificationResult.pageCount,
      contentLength: verificationResult.contentLength,
      issues: verificationResult.issues.length,
      warnings: verificationResult.warnings.length
    };
  } catch (error) {
    console.error(`❌ Error testing ${config.name}:`, error.message);
    return {
      name: config.name,
      error: error.message
    };
  }
}

async function main() {
  console.log('🔬 PDF Scaling Test Suite');
  console.log('==========================');
  
  const results = [];
  
  for (const config of scalingConfigs) {
    const result = await testScalingConfiguration(config);
    results.push(result);
  }
  
  console.log('\n📊 SUMMARY RESULTS');
  console.log('==================');
  
  results.forEach(result => {
    if (result.error) {
      console.log(`❌ ${result.name}: ERROR - ${result.error}`);
    } else {
      console.log(`${result.isValid ? '✅' : '❌'} ${result.name}: ${(result.fileSize/1024).toFixed(1)}KB, ${result.pageCount} pages, ${result.contentLength} chars`);
      if (result.issues > 0) console.log(`   🚨 ${result.issues} issues`);
      if (result.warnings > 0) console.log(`   ⚠️  ${result.warnings} warnings`);
    }
  });
  
  // Find best configuration
  const validResults = results.filter(r => !r.error && r.isValid && r.pageCount === 1);
  if (validResults.length > 0) {
    const best = validResults.reduce((a, b) => 
      (a.contentLength > b.contentLength && a.issues === 0) ? a : b
    );
    console.log(`\n🏆 RECOMMENDED: ${best.name}`);
    console.log(`   📄 File: ${best.filePath}`);
    console.log(`   📊 Stats: ${(best.fileSize/1024).toFixed(1)}KB, ${best.contentLength} characters`);
  }
}

main().catch(console.error);
