#!/usr/bin/env node

/**
 * A/B Testing Script for CV Distillation Models
 * 
 * This script runs comparative tests on CV distillation using different:
 * - AI models (gpt-4o-mini vs gpt-4o)
 * - Temperature settings
 * - Prompt variations
 * 
 * Generates quantitative metrics and comparative analysis.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import CVQualityEvaluator from './evaluate-cv-quality.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CVDistillationABTest {
  constructor() {
    this.results = {
      testConfigurations: [],
      comparativeResults: [],
      summary: {},
      recommendations: []
    };
    this.testStartTime = new Date();
  }

  /**
   * Define test configurations for A/B testing
   */
  getTestConfigurations() {
    return [
      {
        id: 'baseline_gpt4o_mini',
        name: 'GPT-4o-mini (Baseline)',
        model: 'gpt-4o-mini',
        temperature: 0.3,
        description: 'Original configuration before improvements'
      },
      {
        id: 'improved_gpt4o',
        name: 'GPT-4o (Improved)',
        model: 'gpt-4o',
        temperature: 0.3,
        description: 'New model with enhanced prompting'
      },
      {
        id: 'gpt4o_creative',
        name: 'GPT-4o Creative',
        model: 'gpt-4o',
        temperature: 0.7,
        description: 'Higher temperature for more creative distillation'
      },
      {
        id: 'gpt4o_precise',
        name: 'GPT-4o Precise',
        model: 'gpt-4o',
        temperature: 0.1,
        description: 'Lower temperature for more consistent results'
      }
    ];
  }

  /**
   * Run CV distillation with specific configuration
   */
  async runDistillation(cvPath, config, outputDir) {
    const outputPath = path.join(outputDir, `${config.id}_output.md`);
    
    try {
      console.log(`🔄 Running distillation with ${config.name}...`);
      
      // Create a temporary config file for this test
      const tempConfig = {
        model: config.model,
        temperature: config.temperature,
        // Add other configuration parameters as needed
      };
      
      const tempConfigPath = path.join(outputDir, `${config.id}_config.json`);
      fs.writeFileSync(tempConfigPath, JSON.stringify(tempConfig, null, 2));
      
      // Run the CV generation with the specific configuration
      // Note: This assumes your CLI supports model/temperature overrides
      const command = `node src/cli.js ai generate single-page --input "${cvPath}" --output "${outputPath}" --config "${tempConfigPath}"`;
      
      console.log(`   Command: ${command}`);
      const output = execSync(command, { 
        cwd: process.cwd(),
        encoding: 'utf8',
        timeout: 60000 
      });
      
      console.log(`   ✅ Generated: ${outputPath}`);
      return outputPath;
      
    } catch (error) {
      console.error(`   ❌ Failed for ${config.name}:`, error.message);
      
      // Create a placeholder file to indicate failure
      fs.writeFileSync(outputPath, `# Generation Failed\n\nError: ${error.message}\n\nConfiguration: ${config.name}`);
      return outputPath;
    }
  }

  /**
   * Evaluate a single test result
   */
  evaluateResult(outputPath, config, keywords = []) {
    const evaluator = new CVQualityEvaluator();
    
    try {
      const content = fs.readFileSync(outputPath, 'utf8');
      
      // Check if this was a failed generation
      if (content.includes('# Generation Failed')) {
        return {
          configId: config.id,
          configName: config.name,
          failed: true,
          error: content.match(/Error: (.+)/)?.[1] || 'Unknown error',
          metrics: null
        };
      }
      
      const metrics = evaluator.evaluate(content, { targetKeywords: keywords });
      
      return {
        configId: config.id,
        configName: config.name,
        model: config.model,
        temperature: config.temperature,
        failed: false,
        metrics,
        recommendations: evaluator.generateRecommendations(),
        contentLength: content.length,
        lineCount: content.split('\n').filter(line => line.trim()).length
      };
      
    } catch (error) {
      return {
        configId: config.id,
        configName: config.name,
        failed: true,
        error: error.message,
        metrics: null
      };
    }
  }

  /**
   * Run complete A/B test suite
   */
  async runABTest(cvPath, options = {}) {
    const {
      outputDir = './ab-test-results',
      keywords = [],
      iterations = 1
    } = options;

    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const configs = this.getTestConfigurations();
    console.log(`🧪 Starting A/B Test with ${configs.length} configurations\n`);
    console.log(`📁 Output directory: ${outputDir}`);
    console.log(`📄 Source CV: ${cvPath}`);
    console.log(`🔄 Iterations per config: ${iterations}\n`);

    const allResults = [];

    // Run tests for each configuration
    for (const config of configs) {
      console.log(`\n📊 Testing Configuration: ${config.name}`);
      console.log(`   Model: ${config.model}`);
      console.log(`   Temperature: ${config.temperature}`);
      console.log(`   Description: ${config.description}\n`);

      const configResults = [];

      // Run multiple iterations if specified
      for (let i = 0; i < iterations; i++) {
        const iterationSuffix = iterations > 1 ? `_iter${i + 1}` : '';
        const configWithIteration = {
          ...config,
          id: config.id + iterationSuffix
        };

        const outputPath = await this.runDistillation(cvPath, configWithIteration, outputDir);
        const result = this.evaluateResult(outputPath, config, keywords);
        
        result.iteration = i + 1;
        configResults.push(result);
        allResults.push(result);

        if (!result.failed && result.metrics) {
          console.log(`   📈 Iteration ${i + 1} Score: ${result.metrics.overallScore}/100`);
        }
      }

      // Calculate average metrics for this configuration
      const successfulResults = configResults.filter(r => !r.failed && r.metrics);
      if (successfulResults.length > 0) {
        const avgMetrics = this.calculateAverageMetrics(successfulResults);
        console.log(`   ⭐ Average Score: ${avgMetrics.overallScore}/100`);
        
        this.results.testConfigurations.push({
          ...config,
          iterations,
          successfulRuns: successfulResults.length,
          averageMetrics: avgMetrics,
          results: configResults
        });
      }
    }

    this.results.comparativeResults = allResults;
    this.generateComparativeAnalysis();
    
    return this.results;
  }

  /**
   * Calculate average metrics across multiple results
   */
  calculateAverageMetrics(results) {
    const avgMetrics = {
      relevanceScore: 0,
      informationDensity: 0,
      readabilityScore: 0,
      lengthCompliance: 0,
      orphanedHeaders: 0,
      overallScore: 0
    };

    results.forEach(result => {
      Object.keys(avgMetrics).forEach(key => {
        avgMetrics[key] += result.metrics[key];
      });
    });

    Object.keys(avgMetrics).forEach(key => {
      avgMetrics[key] = Math.round(avgMetrics[key] / results.length);
    });

    return avgMetrics;
  }

  /**
   * Generate comparative analysis between configurations
   */
  generateComparativeAnalysis() {
    const successful = this.results.testConfigurations.filter(config => config.successfulRuns > 0);
    
    if (successful.length === 0) {
      this.results.summary = { error: 'No successful test runs' };
      return;
    }

    // Sort by overall score
    successful.sort((a, b) => b.averageMetrics.overallScore - a.averageMetrics.overallScore);
    
    const best = successful[0];
    const worst = successful[successful.length - 1];

    this.results.summary = {
      totalConfigurations: this.results.testConfigurations.length,
      successfulConfigurations: successful.length,
      bestConfiguration: {
        name: best.name,
        model: best.model,
        temperature: best.temperature,
        score: best.averageMetrics.overallScore,
        improvements: this.calculateImprovements(best, worst)
      },
      worstConfiguration: {
        name: worst.name,
        score: worst.averageMetrics.overallScore
      },
      averageScoreAcrossAll: Math.round(
        successful.reduce((sum, config) => sum + config.averageMetrics.overallScore, 0) / successful.length
      )
    };

    // Generate recommendations
    this.generateRecommendations(successful);
  }

  /**
   * Calculate improvements between best and worst configurations
   */
  calculateImprovements(best, worst) {
    const improvements = {};
    Object.keys(best.averageMetrics).forEach(key => {
      const improvement = best.averageMetrics[key] - worst.averageMetrics[key];
      improvements[key] = improvement;
    });
    return improvements;
  }

  /**
   * Generate actionable recommendations based on test results
   */
  generateRecommendations(successfulConfigs) {
    const recommendations = [];

    // Model recommendations
    const gpt4oConfigs = successfulConfigs.filter(c => c.model === 'gpt-4o');
    const gpt4oMiniConfigs = successfulConfigs.filter(c => c.model === 'gpt-4o-mini');

    if (gpt4oConfigs.length > 0 && gpt4oMiniConfigs.length > 0) {
      const gpt4oAvg = gpt4oConfigs.reduce((sum, c) => sum + c.averageMetrics.overallScore, 0) / gpt4oConfigs.length;
      const gpt4oMiniAvg = gpt4oMiniConfigs.reduce((sum, c) => sum + c.averageMetrics.overallScore, 0) / gpt4oMiniConfigs.length;
      
      if (gpt4oAvg > gpt4oMiniAvg + 5) {
        recommendations.push(`Use GPT-4o model for ${(gpt4oAvg - gpt4oMiniAvg).toFixed(1)} point improvement`);
      }
    }

    // Temperature recommendations
    const tempAnalysis = successfulConfigs.map(c => ({
      temp: c.temperature,
      score: c.averageMetrics.overallScore
    }));
    
    const bestTemp = tempAnalysis.reduce((best, current) => 
      current.score > best.score ? current : best
    );
    
    recommendations.push(`Optimal temperature setting: ${bestTemp.temp} (Score: ${bestTemp.score})`);

    // Quality-specific recommendations
    const bestOverall = successfulConfigs[0];
    if (bestOverall.averageMetrics.orphanedHeaders === 0) {
      recommendations.push('Orphaned header prevention is working effectively');
    }

    this.results.recommendations = recommendations;
  }

  /**
   * Display comprehensive test results
   */
  displayResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 A/B TEST RESULTS SUMMARY');
    console.log('='.repeat(60));

    const summary = this.results.summary;
    if (summary.error) {
      console.log(`❌ ${summary.error}`);
      return;
    }

    console.log(`\n📊 Test Overview:`);
    console.log(`   Total Configurations: ${summary.totalConfigurations}`);
    console.log(`   Successful Runs: ${summary.successfulConfigurations}`);
    console.log(`   Average Score: ${summary.averageScoreAcrossAll}/100`);

    console.log(`\n🏆 Best Configuration:`);
    console.log(`   Name: ${summary.bestConfiguration.name}`);
    console.log(`   Model: ${summary.bestConfiguration.model}`);
    console.log(`   Temperature: ${summary.bestConfiguration.temperature}`);
    console.log(`   Score: ${summary.bestConfiguration.score}/100`);

    console.log(`\n📈 Detailed Results:`);
    this.results.testConfigurations
      .filter(config => config.successfulRuns > 0)
      .sort((a, b) => b.averageMetrics.overallScore - a.averageMetrics.overallScore)
      .forEach((config, index) => {
        const rank = index + 1;
        const metrics = config.averageMetrics;
        console.log(`\n   ${rank}. ${config.name}`);
        console.log(`      Overall: ${metrics.overallScore}/100`);
        console.log(`      Relevance: ${metrics.relevanceScore}/100`);
        console.log(`      Density: ${metrics.informationDensity}/100`);
        console.log(`      Readability: ${metrics.readabilityScore}/100`);
        console.log(`      Length: ${metrics.lengthCompliance}/100`);
        console.log(`      Orphaned Headers: ${metrics.orphanedHeaders}`);
      });

    console.log(`\n💡 Recommendations:`);
    this.results.recommendations.forEach(rec => {
      console.log(`   • ${rec}`);
    });

    const testDuration = ((new Date() - this.testStartTime) / 1000).toFixed(1);
    console.log(`\n⏱️  Test Duration: ${testDuration} seconds`);
  }

  /**
   * Export results to JSON file
   */
  exportResults(filePath) {
    const exportData = {
      ...this.results,
      metadata: {
        testStartTime: this.testStartTime.toISOString(),
        testEndTime: new Date().toISOString(),
        duration: (new Date() - this.testStartTime) / 1000
      }
    };

    fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
    console.log(`\n📄 Results exported to: ${filePath}`);
    return exportData;
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node ab-test-cv-distillation.js <cv-file-path> [options]');
    console.log('Options:');
    console.log('  --output-dir DIR           Output directory for test results (default: ./ab-test-results)');
    console.log('  --keywords "k1,k2"         Target keywords for relevance scoring');
    console.log('  --iterations N             Number of iterations per configuration (default: 1)');
    console.log('  --export path.json         Export results to JSON file');
    process.exit(1);
  }

  const cvPath = args[0];
  const options = {};
  
  // Parse command line options
  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case '--output-dir':
        options.outputDir = args[++i];
        break;
      case '--keywords':
        options.keywords = args[++i].split(',').map(k => k.trim());
        break;
      case '--iterations':
        options.iterations = parseInt(args[++i]);
        break;
      case '--export':
        options.exportPath = args[++i];
        break;
    }
  }

  // Run A/B test
  const abTest = new CVDistillationABTest();
  
  abTest.runABTest(cvPath, options)
    .then(results => {
      abTest.displayResults();
      
      if (options.exportPath) {
        abTest.exportResults(options.exportPath);
      }
      
      // Exit with success if best configuration score >= 70
      const bestScore = results.summary.bestConfiguration?.score || 0;
      process.exit(bestScore >= 70 ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ A/B Test failed:', error.message);
      process.exit(1);
    });
}

export default CVDistillationABTest;
