#!/usr/bin/env node

/**
 * Automated CV Quality Evaluation Script
 * 
 * This script provides comprehensive metrics to evaluate the quality of
 * AI-generated single-page CV distillation, measuring:
 * - Relevance scoring
 * - Information density
 * - Readability metrics
 * - Length constraint compliance
 * - Orphaned header detection
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CVQualityEvaluator {
  constructor() {
    this.metrics = {
      relevanceScore: 0,
      informationDensity: 0,
      readabilityScore: 0,
      lengthCompliance: 0,
      orphanedHeaders: 0,
      overallScore: 0
    };
  }

  /**
   * Evaluate relevance scoring based on keyword density and section completeness
   */
  evaluateRelevance(content, targetKeywords = []) {
    const lines = content.split('\n').filter(line => line.trim());
    const totalWords = content.split(/\s+/).length;
    
    // Check for complete sections (header + content)
    const headers = content.match(/^#{1,3}\s+.+$/gm) || [];
    const sectionsWithContent = headers.filter(header => {
      const headerIndex = content.indexOf(header);
      const nextHeaderIndex = content.indexOf('\n#', headerIndex + 1);
      const sectionContent = nextHeaderIndex > -1 
        ? content.substring(headerIndex, nextHeaderIndex)
        : content.substring(headerIndex);
      
      // Section should have more than just the header
      const contentLines = sectionContent.split('\n').filter(line => 
        line.trim() && !line.match(/^#{1,3}\s+/)
      );
      return contentLines.length > 0;
    });

    // Keyword relevance (if provided)
    let keywordScore = 1; // Default to 1 if no keywords provided
    if (targetKeywords.length > 0) {
      const keywordMatches = targetKeywords.filter(keyword => 
        content.toLowerCase().includes(keyword.toLowerCase())
      ).length;
      keywordScore = keywordMatches / targetKeywords.length;
    }

    // Section completeness score
    const completenessScore = headers.length > 0 ? sectionsWithContent.length / headers.length : 0;
    
    this.metrics.relevanceScore = Math.round((keywordScore * 0.4 + completenessScore * 0.6) * 100);
    return this.metrics.relevanceScore;
  }

  /**
   * Calculate information density (meaningful content per character)
   */
  evaluateInformationDensity(content) {
    const totalChars = content.length;
    const meaningfulContent = content
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/^#{1,3}\s+/gm, '') // Remove headers
      .replace(/^\s*[-*+]\s*/gm, '') // Remove bullet points
      .replace(/^\s*\d+\.\s*/gm, '') // Remove numbered lists
      .trim();

    const bulletPoints = (content.match(/^\s*[-*+]\s+.+$/gm) || []).length;
    const numberedItems = (content.match(/^\s*\d+\.\s+.+$/gm) || []).length;
    const structuredItems = bulletPoints + numberedItems;

    // Density calculation: structured items boost density
    const baseDensity = meaningfulContent.length / totalChars;
    const structureBonus = Math.min(structuredItems * 0.05, 0.3); // Max 30% bonus
    
    this.metrics.informationDensity = Math.round((baseDensity + structureBonus) * 100);
    return this.metrics.informationDensity;
  }

  /**
   * Assess readability using simple metrics
   */
  evaluateReadability(content) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const totalSentences = sentences.length;
    const totalWords = words.length;

    if (totalSentences === 0 || totalWords === 0) {
      this.metrics.readabilityScore = 0;
      return 0;
    }

    // Average words per sentence
    const avgWordsPerSentence = totalWords / totalSentences;
    
    // Penalize very long sentences (> 25 words) and very short ones (< 5 words)
    const idealRange = avgWordsPerSentence >= 8 && avgWordsPerSentence <= 20;
    const readabilityScore = idealRange ? 85 : Math.max(20, 85 - Math.abs(14 - avgWordsPerSentence) * 5);

    // Check for bullet point usage (improves readability)
    const bulletPoints = (content.match(/^\s*[-*+]\s+/gm) || []).length;
    const bulletBonus = Math.min(bulletPoints * 2, 15); // Max 15% bonus

    this.metrics.readabilityScore = Math.round(Math.min(100, readabilityScore + bulletBonus));
    return this.metrics.readabilityScore;
  }

  /**
   * Check compliance with single-page length constraints
   */
  evaluateLengthCompliance(content, maxLines = 50, maxChars = 4000) {
    const lines = content.split('\n').filter(line => line.trim());
    const chars = content.length;

    const lineCompliance = lines.length <= maxLines ? 100 : Math.max(0, 100 - ((lines.length - maxLines) * 2));
    const charCompliance = chars <= maxChars ? 100 : Math.max(0, 100 - ((chars - maxChars) / 100));

    this.metrics.lengthCompliance = Math.round((lineCompliance + charCompliance) / 2);
    return this.metrics.lengthCompliance;
  }

  /**
   * Detect orphaned headers (headers without meaningful content)
   */
  detectOrphanedHeaders(content) {
    const headers = content.match(/^#{1,3}\s+.+$/gm) || [];
    let orphanedCount = 0;

    headers.forEach(header => {
      const headerIndex = content.indexOf(header);
      const nextHeaderIndex = content.indexOf('\n#', headerIndex + 1);
      const sectionContent = nextHeaderIndex > -1 
        ? content.substring(headerIndex, nextHeaderIndex)
        : content.substring(headerIndex);
      
      // Check if section has meaningful content
      const contentLines = sectionContent.split('\n').filter(line => 
        line.trim() && !line.match(/^#{1,3}\s+/)
      );

      const meaningfulLines = contentLines.filter(line => {
        const trimmed = line.trim();
        return trimmed.length > 10 || // Substantial text
               trimmed.match(/^\s*[-*+]\s+.{5,}/) || // Bullet points with content
               trimmed.match(/^\s*\d+\.\s+.{5,}/); // Numbered items with content
      });

      if (meaningfulLines.length === 0) {
        orphanedCount++;
        console.warn(`⚠️  Orphaned header detected: "${header.trim()}"`);
      }
    });

    this.metrics.orphanedHeaders = orphanedCount;
    return orphanedCount;
  }

  /**
   * Calculate overall quality score
   */
  calculateOverallScore() {
    const weights = {
      relevanceScore: 0.25,
      informationDensity: 0.25,
      readabilityScore: 0.20,
      lengthCompliance: 0.20,
      orphanedHeaders: 0.10 // Penalty weight
    };

    const orphanedPenalty = this.metrics.orphanedHeaders * 15; // 15 points per orphaned header
    
    this.metrics.overallScore = Math.round(
      this.metrics.relevanceScore * weights.relevanceScore +
      this.metrics.informationDensity * weights.informationDensity +
      this.metrics.readabilityScore * weights.readabilityScore +
      this.metrics.lengthCompliance * weights.lengthCompliance -
      orphanedPenalty
    );

    this.metrics.overallScore = Math.max(0, Math.min(100, this.metrics.overallScore));
    return this.metrics.overallScore;
  }

  /**
   * Run complete evaluation on CV content
   */
  evaluate(content, options = {}) {
    const {
      targetKeywords = [],
      maxLines = 50,
      maxChars = 4000
    } = options;

    console.log('🔍 Starting CV Quality Evaluation...\n');

    this.evaluateRelevance(content, targetKeywords);
    this.evaluateInformationDensity(content);
    this.evaluateReadability(content);
    this.evaluateLengthCompliance(content, maxLines, maxChars);
    this.detectOrphanedHeaders(content);
    this.calculateOverallScore();

    return this.metrics;
  }

  /**
   * Display evaluation results
   */
  displayResults() {
    console.log('📊 CV Quality Evaluation Results');
    console.log('================================\n');
    
    console.log(`📈 Relevance Score:      ${this.metrics.relevanceScore}/100`);
    console.log(`📝 Information Density:  ${this.metrics.informationDensity}/100`);
    console.log(`📖 Readability Score:    ${this.metrics.readabilityScore}/100`);
    console.log(`📏 Length Compliance:    ${this.metrics.lengthCompliance}/100`);
    console.log(`🚫 Orphaned Headers:     ${this.metrics.orphanedHeaders}`);
    console.log(`\n⭐ Overall Score:        ${this.metrics.overallScore}/100\n`);

    // Quality assessment
    if (this.metrics.overallScore >= 85) {
      console.log('✅ Excellent - CV meets high quality standards');
    } else if (this.metrics.overallScore >= 70) {
      console.log('✨ Good - CV quality is acceptable with minor improvements needed');
    } else if (this.metrics.overallScore >= 50) {
      console.log('⚠️  Fair - CV needs significant improvements');
    } else {
      console.log('❌ Poor - CV requires major revisions');
    }

    return this.metrics;
  }

  /**
   * Export results to JSON for CI integration
   */
  exportResults(filePath) {
    const results = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      passed: this.metrics.overallScore >= 70, // Quality threshold
      recommendations: this.generateRecommendations()
    };

    fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
    console.log(`\n📄 Results exported to: ${filePath}`);
    return results;
  }

  /**
   * Generate improvement recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.metrics.relevanceScore < 70) {
      recommendations.push('Improve keyword relevance and section completeness');
    }
    if (this.metrics.informationDensity < 60) {
      recommendations.push('Increase information density with more structured content');
    }
    if (this.metrics.readabilityScore < 70) {
      recommendations.push('Enhance readability with better sentence structure and bullet points');
    }
    if (this.metrics.lengthCompliance < 80) {
      recommendations.push('Reduce content length to meet single-page constraints');
    }
    if (this.metrics.orphanedHeaders > 0) {
      recommendations.push('Remove orphaned headers or add meaningful content');
    }

    return recommendations;
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node evaluate-cv-quality.js <cv-file-path> [options]');
    console.log('Options:');
    console.log('  --keywords "keyword1,keyword2"  Target keywords for relevance scoring');
    console.log('  --max-lines N                   Maximum lines for length compliance (default: 50)');
    console.log('  --max-chars N                   Maximum characters for length compliance (default: 4000)');
    console.log('  --export path.json              Export results to JSON file');
    process.exit(1);
  }

  const filePath = args[0];
  const options = {};
  
  // Parse command line options
  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case '--keywords':
        options.targetKeywords = args[++i].split(',').map(k => k.trim());
        break;
      case '--max-lines':
        options.maxLines = parseInt(args[++i]);
        break;
      case '--max-chars':
        options.maxChars = parseInt(args[++i]);
        break;
      case '--export':
        options.exportPath = args[++i];
        break;
    }
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const evaluator = new CVQualityEvaluator();
    
    evaluator.evaluate(content, options);
    evaluator.displayResults();
    
    if (options.exportPath) {
      evaluator.exportResults(options.exportPath);
    }

    // Exit with code 1 if quality is below threshold
    process.exit(evaluator.metrics.overallScore >= 70 ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Error evaluating CV:', error.message);
    process.exit(1);
  }
}

export default CVQualityEvaluator;
