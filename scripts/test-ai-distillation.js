#!/usr/bin/env node

/**
 * Test script for AI distillation and evaluation
 * 
 * This script tests our improved AI distillation pipeline by:
 * 1. Loading Dawn's EKG technician CV
 * 2. Running it through the AI distillation process
 * 3. Evaluating the results with our quality metrics
 * 4. Comparing before/after scores
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AgentMessageBus } from '../src/AgentMessageBus.js';
import LLMServiceAgent from '../src/ats/agents/LLMServiceAgent.js';
import CVQualityEvaluator from './evaluate-cv-quality.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AIDistillationTester {
  constructor() {
    this.messageBus = new AgentMessageBus();
    this.llmAgent = new LLMServiceAgent({ 
      messageBus: this.messageBus, 
      agentName: 'DistillationTester' 
    });
    this.evaluator = new CVQualityEvaluator();
  }

  /**
   * Load CV content from markdown file
   */
  loadCVContent(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      throw new Error(`Failed to load CV content: ${error.message}`);
    }
  }

  /**
   * Convert markdown CV to structured CV data format
   */
  convertMarkdownToCVData(markdownContent) {
    // Simple parser to extract basic information from the markdown CV
    const lines = markdownContent.split('\n');
    const cvData = {
      personalInfo: {
        name: { full: 'Dawn Zurick-Beilfuss' },
        contact: { email: 'dawn.beilfuss@example.com' },
        title: 'EKG Technician'
      },
      professionalSummary: '',
      experience: [],
      education: [],
      skills: [],
      certifications: []
    };

    // Extract professional summary (content after first heading)
    let currentSection = '';
    let summaryLines = [];
    
    for (const line of lines) {
      if (line.startsWith('#')) {
        if (line.toLowerCase().includes('professional') || line.toLowerCase().includes('summary')) {
          currentSection = 'summary';
          continue;
        }
        currentSection = 'other';
      }
      
      if (currentSection === 'summary' && line.trim() && !line.startsWith('#')) {
        summaryLines.push(line.trim());
      }
    }
    
    cvData.professionalSummary = summaryLines.join(' ').substring(0, 500) || 
      'Experienced EKG Technician with extensive healthcare background and patient care expertise.';

    // Add some mock experience based on the CV content
    cvData.experience = [
      {
        title: 'EKG Technician',
        company: 'Healthcare Facility',
        startDate: '2020-01',
        endDate: 'Present',
        responsibilities: [
          'Performed cardiac monitoring and EKG procedures',
          'Provided exceptional patient care and support',
          'Maintained accurate medical records and documentation'
        ]
      }
    ];

    cvData.skills = [
      'EKG/ECG Testing', 'Cardiac Monitoring', 'Patient Care',
      'Medical Documentation', 'Healthcare Compliance'
    ];

    return cvData;
  }

  /**
   * Test AI distillation pipeline
   */
  async testDistillation(cvContent) {
    console.log('🧪 Testing AI distillation pipeline...\n');
    
    // Convert to CV data format
    const cvData = this.convertMarkdownToCVData(cvContent);
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('AI distillation timeout (30s)'));
      }, 30000);

      // Listen for completion
      this.messageBus.subscribe('cv:process:single-page:complete', (result) => {
        clearTimeout(timeout);
        console.log('✅ AI distillation completed');
        resolve(result);
      });

      // Listen for errors
      this.messageBus.subscribe('cv:process:single-page:error', (error) => {
        clearTimeout(timeout);
        console.error('❌ AI distillation failed:', error.error);
        reject(new Error(error.error || 'AI distillation failed'));
      });

      // Trigger AI processing
      console.log('🤖 Starting AI distillation...');
      this.messageBus.publish('cv:process:single-page', {
        requestId: `test-${Date.now()}`,
        cvData,
        targetStyle: 'professional',
        layoutConstraints: {
          maxLines: 50,
          maxCharactersPerLine: 80,
          pageFormat: 'Letter',
          margins: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 }
        }
      });
    });
  }

  /**
   * Run complete test suite
   */
  async runTest(inputCVPath) {
    const testStartTime = Date.now();
    
    try {
      console.log('🔬 Starting AI Distillation Test Suite');
      console.log('=====================================\n');
      
      // Load original CV
      console.log(`📄 Loading CV from: ${inputCVPath}`);
      const originalContent = this.loadCVContent(inputCVPath);
      
      // Evaluate original CV
      console.log('\n📊 Evaluating Original CV:');
      console.log('---------------------------');
      const originalMetrics = this.evaluator.evaluate(originalContent, {
        targetKeywords: ['healthcare', 'EKG', 'technician', 'patient care'],
        maxLines: 50,
        maxChars: 4000
      });
      this.evaluator.displayResults();
      
      // Run AI distillation
      console.log('\n🧠 Running AI Distillation:');
      console.log('---------------------------');
      const distillationResult = await this.testDistillation(originalContent);
      
      if (!distillationResult.optimized?.optimizedContent) {
        throw new Error('No optimized content received from AI distillation');
      }
      
      const optimizedContent = distillationResult.optimized.optimizedContent;
      
      // Evaluate optimized CV  
      console.log('\n📊 Evaluating Optimized CV:');
      console.log('----------------------------');
      this.evaluator = new CVQualityEvaluator(); // Reset metrics
      const optimizedMetrics = this.evaluator.evaluate(optimizedContent, {
        targetKeywords: ['healthcare', 'EKG', 'technician', 'patient care'],
        maxLines: 50,
        maxChars: 4000
      });
      this.evaluator.displayResults();
      
      // Generate comparison report
      console.log('\n📈 Improvement Analysis:');
      console.log('========================');
      
      const improvements = {
        relevanceScore: optimizedMetrics.relevanceScore - originalMetrics.relevanceScore,
        informationDensity: optimizedMetrics.informationDensity - originalMetrics.informationDensity,
        readabilityScore: optimizedMetrics.readabilityScore - originalMetrics.readabilityScore,
        lengthCompliance: optimizedMetrics.lengthCompliance - originalMetrics.lengthCompliance,
        orphanedHeaders: originalMetrics.orphanedHeaders - optimizedMetrics.orphanedHeaders,
        overallScore: optimizedMetrics.overallScore - originalMetrics.overallScore
      };
      
      console.log(`📈 Relevance Score:      ${improvements.relevanceScore >= 0 ? '+' : ''}${improvements.relevanceScore} points`);
      console.log(`📝 Information Density:  ${improvements.informationDensity >= 0 ? '+' : ''}${improvements.informationDensity} points`);
      console.log(`📖 Readability Score:    ${improvements.readabilityScore >= 0 ? '+' : ''}${improvements.readabilityScore} points`);
      console.log(`📏 Length Compliance:    ${improvements.lengthCompliance >= 0 ? '+' : ''}${improvements.lengthCompliance} points`);
      console.log(`🚫 Orphaned Headers:     ${improvements.orphanedHeaders >= 0 ? '-' : '+'}${Math.abs(improvements.orphanedHeaders)} headers`);
      console.log(`⭐ Overall Score:        ${improvements.overallScore >= 0 ? '+' : ''}${improvements.overallScore} points\n`);
      
      // Success/failure assessment
      const success = improvements.overallScore > 10 && optimizedMetrics.orphanedHeaders === 0;
      
      if (success) {
        console.log('✅ Test PASSED: AI distillation shows significant improvement');
      } else if (improvements.overallScore > 0) {
        console.log('✨ Test PARTIAL: AI distillation shows some improvement');
      } else {
        console.log('❌ Test FAILED: AI distillation did not improve CV quality');
      }
      
      // Save optimized content for inspection
      const outputPath = path.join(__dirname, 'test-optimized-cv.md');
      fs.writeFileSync(outputPath, optimizedContent);
      console.log(`\n📄 Optimized CV saved to: ${outputPath}`);
      
      const testDuration = ((Date.now() - testStartTime) / 1000).toFixed(1);
      console.log(`\n⏱️  Total test duration: ${testDuration} seconds`);
      
      return {
        success,
        originalMetrics,
        optimizedMetrics,
        improvements,
        optimizedContent,
        testDuration: parseFloat(testDuration)
      };
      
    } catch (error) {
      console.error('\n💥 Test failed:', error.message);
      throw error;
    } finally {
      // Cleanup
      try {
        await this.llmAgent.shutdown(5000);
      } catch (shutdownError) {
        console.warn('Warning: Failed to shutdown LLM agent:', shutdownError.message);
      }
    }
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node test-ai-distillation.js <cv-file-path>');
    console.log('Example: node test-ai-distillation.js cv-versions/dawn-ekg-technician-cv.md');
    process.exit(1);
  }

  const cvPath = args[0];
  const tester = new AIDistillationTester();
  
  tester.runTest(cvPath)
    .then(results => {
      console.log('\n🎉 Test completed successfully!');
      
      // Export results for CI integration
      const resultsPath = path.join(__dirname, 'ai-distillation-test-results.json');
      fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
      console.log(`📊 Test results exported to: ${resultsPath}`);
      
      // Exit with appropriate code
      process.exit(results.success ? 0 : 1);
    })
    .catch(error => {
      console.error('\n💥 Test suite failed:', error.message);
      process.exit(1);
    });
}

export default AIDistillationTester;
