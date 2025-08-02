/**
 * Content Analysis Engine
 * 
 * This engine parses and analyzes all sections of a CV, understanding the
 * relevance and impact of each piece of content. It identifies key achievements,
 * skills, experiences, and qualifications for intelligent curation.
 */

import type { CVData } from '@dzb-cv/types';
import type {
  ContentItem,
  ContentType,
  ContentMetadata,
  ContentAnalysis,
  ContentCluster,
  JobContext
} from '../types/curation.js';

/**
 * Content Analysis Engine
 */
export class ContentAnalyzer {
  private keywordExtractor: KeywordExtractor;
  private impactAnalyzer: ImpactAnalyzer;
  private clusterAnalyzer: ClusterAnalyzer;

  constructor() {
    this.keywordExtractor = new KeywordExtractor();
    this.impactAnalyzer = new ImpactAnalyzer();
    this.clusterAnalyzer = new ClusterAnalyzer();
  }

  /**
   * Analyzes a complete CV and extracts all content items
   */
  public async analyzeCV(cv: CVData, jobContext?: JobContext): Promise<ContentAnalysis> {
    const contentItems = await this.extractAllContent(cv);
    const clusters = await this.clusterAnalyzer.clusterContent(contentItems, jobContext);
    
    const summary = this.generateAnalysisSummary(contentItems, clusters, jobContext);

    return {
      contentItems,
      scores: [], // Will be populated by scoring engine
      clusters,
      summary
    };
  }

  /**
   * Extracts all content items from the CV
   */
  private async extractAllContent(cv: CVData): Promise<ContentItem[]> {
    const contentItems: ContentItem[] = [];

    // Extract personal info and summary
    if (cv.personalInfo) {
      contentItems.push(...await this.extractPersonalInfo(cv.personalInfo));
    }

    // Extract experience items
    if (cv.experience?.length) {
      contentItems.push(...await this.extractExperience(cv.experience));
    }

    // Extract education items
    if (cv.education?.length) {
      contentItems.push(...await this.extractEducation(cv.education));
    }

    // Extract skills
    if (cv.skills?.length) {
      contentItems.push(...await this.extractSkills(cv.skills));
    }

    // Extract certifications
    if (cv.certifications?.length) {
      contentItems.push(...await this.extractCertifications(cv.certifications));
    }

    // Extract projects if present
    if ((cv as any).projects?.length) {
      contentItems.push(...await this.extractProjects((cv as any).projects));
    }

    return contentItems;
  }

  /**
   * Extracts personal information content items
   */
  private async extractPersonalInfo(personalInfo: any): Promise<ContentItem[]> {
    const items: ContentItem[] = [];

    if (personalInfo.summary) {
      const metadata = await this.analyzeContentMetadata(
        personalInfo.summary,
        ContentType.SUMMARY
      );

      items.push({
        id: `personal-summary`,
        type: ContentType.SUMMARY,
        content: personalInfo.summary,
        section: 'Personal Information',
        metadata,
        rawData: { summary: personalInfo.summary }
      });
    }

    if (personalInfo.name) {
      const nameContent = typeof personalInfo.name === 'string' 
        ? personalInfo.name 
        : personalInfo.name.full || `${personalInfo.name.first} ${personalInfo.name.last}`;

      const metadata = await this.analyzeContentMetadata(
        nameContent,
        ContentType.PERSONAL_INFO
      );

      items.push({
        id: `personal-name`,
        type: ContentType.PERSONAL_INFO,
        content: nameContent,
        section: 'Personal Information',
        metadata,
        rawData: personalInfo.name
      });
    }

    return items;
  }

  /**
   * Extracts experience content items
   */
  private async extractExperience(experience: any[]): Promise<ContentItem[]> {
    const items: ContentItem[] = [];

    for (let i = 0; i < experience.length; i++) {
      const exp = experience[i];
      
      // Main experience entry
      const expContent = `${exp.position} at ${exp.employer}`;
      const expMetadata = await this.analyzeContentMetadata(expContent, ContentType.EXPERIENCE);
      
      // Add date range information to metadata
      if (exp.startDate || exp.endDate) {
        expMetadata.dateRange = {
          start: exp.startDate,
          end: exp.endDate || 'Present'
        };
        expMetadata.recency = this.calculateRecency(exp.startDate, exp.endDate);
      }

      items.push({
        id: `experience-${i}`,
        type: ContentType.EXPERIENCE,
        content: expContent,
        section: 'Experience',
        metadata: expMetadata,
        rawData: exp
      });

      // Extract individual responsibilities
      if (exp.responsibilities?.length) {
        for (let j = 0; j < exp.responsibilities.length; j++) {
          const responsibility = exp.responsibilities[j];
          const respMetadata = await this.analyzeContentMetadata(
            responsibility,
            ContentType.RESPONSIBILITY
          );

          // Inherit date information from parent experience
          respMetadata.dateRange = expMetadata.dateRange;
          respMetadata.recency = expMetadata.recency;

          items.push({
            id: `experience-${i}-resp-${j}`,
            type: ContentType.RESPONSIBILITY,
            content: responsibility,
            section: 'Experience',
            metadata: respMetadata,
            rawData: { parentExperience: exp, responsibility }
          });
        }
      }

      // Extract achievements
      if (exp.achievements?.length) {
        for (let j = 0; j < exp.achievements.length; j++) {
          const achievement = exp.achievements[j];
          const achMetadata = await this.analyzeContentMetadata(
            achievement,
            ContentType.ACHIEVEMENT
          );

          // Inherit date information and boost impact score for achievements
          achMetadata.dateRange = expMetadata.dateRange;
          achMetadata.recency = expMetadata.recency;
          achMetadata.impact = Math.min(1, achMetadata.impact + 0.2); // Achievements get impact boost

          items.push({
            id: `experience-${i}-ach-${j}`,
            type: ContentType.ACHIEVEMENT,
            content: achievement,
            section: 'Experience',
            metadata: achMetadata,
            rawData: { parentExperience: exp, achievement }
          });
        }
      }
    }

    return items;
  }

  /**
   * Extracts education content items
   */
  private async extractEducation(education: any[]): Promise<ContentItem[]> {
    const items: ContentItem[] = [];

    for (let i = 0; i < education.length; i++) {
      const edu = education[i];
      const eduContent = `${edu.degree} in ${edu.field} from ${edu.institution}`;
      
      const metadata = await this.analyzeContentMetadata(eduContent, ContentType.EDUCATION);
      
      // Add graduation date information
      if (edu.graduationDate || edu.startDate) {
        metadata.dateRange = {
          start: edu.startDate,
          end: edu.graduationDate
        };
        metadata.recency = this.calculateRecency(edu.startDate, edu.graduationDate);
      }

      items.push({
        id: `education-${i}`,
        type: ContentType.EDUCATION,
        content: eduContent,
        section: 'Education',
        metadata,
        rawData: edu
      });
    }

    return items;
  }

  /**
   * Extracts skills content items
   */
  private async extractSkills(skills: any[]): Promise<ContentItem[]> {
    const items: ContentItem[] = [];

    for (let i = 0; i < skills.length; i++) {
      const skill = skills[i];
      const skillName = typeof skill === 'string' ? skill : skill.name;
      const skillContent = skillName;

      const metadata = await this.analyzeContentMetadata(skillContent, ContentType.SKILL);
      
      // Skills are generally current, so high recency
      metadata.recency = 0.9;

      items.push({
        id: `skill-${i}`,
        type: ContentType.SKILL,
        content: skillContent,
        section: 'Skills',
        metadata,
        rawData: skill
      });
    }

    return items;
  }

  /**
   * Extracts certification content items
   */
  private async extractCertifications(certifications: any[]): Promise<ContentItem[]> {
    const items: ContentItem[] = [];

    for (let i = 0; i < certifications.length; i++) {
      const cert = certifications[i];
      const certContent = typeof cert === 'string' ? cert : cert.name || cert.title;

      const metadata = await this.analyzeContentMetadata(certContent, ContentType.CERTIFICATION);
      
      // Add certification date if available
      if (cert.dateObtained) {
        metadata.dateRange = {
          start: cert.dateObtained,
          end: cert.expirationDate
        };
        metadata.recency = this.calculateRecency(cert.dateObtained, cert.expirationDate);
      }

      // Certifications have higher impact scores
      metadata.impact = Math.min(1, metadata.impact + 0.3);

      items.push({
        id: `certification-${i}`,
        type: ContentType.CERTIFICATION,
        content: certContent,
        section: 'Certifications',
        metadata,
        rawData: cert
      });
    }

    return items;
  }

  /**
   * Extracts project content items
   */
  private async extractProjects(projects: any[]): Promise<ContentItem[]> {
    const items: ContentItem[] = [];

    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      const projectContent = `${project.name}: ${project.description || ''}`;

      const metadata = await this.analyzeContentMetadata(projectContent, ContentType.PROJECT);
      
      if (project.startDate || project.endDate) {
        metadata.dateRange = {
          start: project.startDate,
          end: project.endDate
        };
        metadata.recency = this.calculateRecency(project.startDate, project.endDate);
      }

      items.push({
        id: `project-${i}`,
        type: ContentType.PROJECT,
        content: projectContent,
        section: 'Projects',
        metadata,
        rawData: project
      });
    }

    return items;
  }

  /**
   * Analyzes content metadata for a piece of content
   */
  private async analyzeContentMetadata(content: string, type: ContentType): Promise<ContentMetadata> {
    const keywords = await this.keywordExtractor.extractKeywords(content);
    const impact = await this.impactAnalyzer.analyzeImpact(content, type);
    const sectors = await this.identifySectors(content, keywords);

    return {
      recency: 0.5, // Default, will be overridden based on dates
      impact,
      length: content.length,
      keywords,
      sectors
    };
  }

  /**
   * Calculates recency score based on dates
   */
  private calculateRecency(startDate?: string, endDate?: string): number {
    if (!startDate) return 0.5;

    const now = new Date();
    const start = new Date(startDate);
    const end = endDate && endDate !== 'Present' ? new Date(endDate) : now;

    // Calculate how recent the end date is (more recent = higher score)
    const monthsAgo = (now.getTime() - end.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthsAgo <= 0) return 1.0; // Current
    if (monthsAgo <= 6) return 0.9; // Within 6 months
    if (monthsAgo <= 12) return 0.8; // Within 1 year
    if (monthsAgo <= 24) return 0.6; // Within 2 years
    if (monthsAgo <= 60) return 0.4; // Within 5 years
    
    return Math.max(0.1, 0.4 - (monthsAgo - 60) / 120); // Decay after 5 years
  }

  /**
   * Identifies relevant sectors for content
   */
  private async identifySectors(content: string, keywords: string[]): Promise<string[]> {
    const sectors: string[] = [];
    const contentLower = content.toLowerCase();
    const allKeywords = keywords.map(k => k.toLowerCase());

    // Federal/Government keywords
    const federalKeywords = ['federal', 'government', 'usajobs', 'clearance', 'security', 'policy', 'regulation', 'compliance', 'federal agency'];
    if (federalKeywords.some(kw => contentLower.includes(kw) || allKeywords.includes(kw))) {
      sectors.push('federal');
    }

    // State government keywords
    const stateKeywords = ['state', 'municipal', 'local government', 'public sector', 'cms', 'recruitment'];
    if (stateKeywords.some(kw => contentLower.includes(kw) || allKeywords.includes(kw))) {
      sectors.push('state');
    }

    // Healthcare keywords
    const healthcareKeywords = ['healthcare', 'medical', 'hospital', 'patient', 'clinical', 'nursing', 'physician', 'ehr', 'hipaa'];
    if (healthcareKeywords.some(kw => contentLower.includes(kw) || allKeywords.includes(kw))) {
      sectors.push('healthcare');
    }

    // Tech keywords
    const techKeywords = ['software', 'programming', 'development', 'javascript', 'python', 'react', 'api', 'database', 'cloud', 'devops'];
    if (techKeywords.some(kw => contentLower.includes(kw) || allKeywords.includes(kw))) {
      sectors.push('tech');
    }

    // If no specific sector identified, mark as general private
    if (sectors.length === 0) {
      sectors.push('private');
    }

    return sectors;
  }

  /**
   * Generates analysis summary
   */
  private generateAnalysisSummary(
    contentItems: ContentItem[],
    clusters: ContentCluster[],
    jobContext?: JobContext
  ) {
    const totalItems = contentItems.length;
    const averageQuality = contentItems.reduce((sum, item) => sum + item.metadata.impact, 0) / totalItems;
    
    const coverageAreas = [...new Set(contentItems.flatMap(item => item.metadata.sectors))];
    const strengthAreas = clusters
      .filter(cluster => cluster.jobRelevance > 0.7)
      .map(cluster => cluster.theme);
    
    const gapAreas = jobContext 
      ? this.identifyGaps(contentItems, jobContext)
      : [];

    return {
      totalItems,
      averageQuality,
      coverageAreas,
      strengthAreas,
      gapAreas
    };
  }

  /**
   * Identifies gaps in coverage relative to job requirements
   */
  private identifyGaps(contentItems: ContentItem[], jobContext: JobContext): string[] {
    const gaps: string[] = [];
    const allKeywords = contentItems.flatMap(item => item.metadata.keywords.map(k => k.toLowerCase()));

    // Check for missing required skills
    const missingSkills = jobContext.requiredSkills.filter(
      skill => !allKeywords.includes(skill.toLowerCase())
    );
    
    if (missingSkills.length > 0) {
      gaps.push(`Missing skills: ${missingSkills.join(', ')}`);
    }

    // Check sector alignment
    const contentSectors = [...new Set(contentItems.flatMap(item => item.metadata.sectors))];
    if (!contentSectors.includes(jobContext.sector)) {
      gaps.push(`Limited experience in ${jobContext.sector} sector`);
    }

    return gaps;
  }
}

/**
 * Keyword extraction utility
 */
class KeywordExtractor {
  private stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'shall'
  ]);

  async extractKeywords(content: string): Promise<string[]> {
    // Simple keyword extraction - in a real implementation, this could use NLP libraries
    const words = content.toLowerCase()
      .replace(/[^\w\s.-]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !this.stopWords.has(word));

    // Remove duplicates and return unique keywords
    return [...new Set(words)];
  }
}

/**
 * Impact analysis utility
 */
class ImpactAnalyzer {
  async analyzeImpact(content: string, type: ContentType): Promise<number> {
    let baseImpact = 0.5;

    // Type-based impact scoring
    switch (type) {
      case ContentType.ACHIEVEMENT:
        baseImpact = 0.8;
        break;
      case ContentType.CERTIFICATION:
        baseImpact = 0.7;
        break;
      case ContentType.EXPERIENCE:
        baseImpact = 0.7;
        break;
      case ContentType.SKILL:
        baseImpact = 0.6;
        break;
      case ContentType.EDUCATION:
        baseImpact = 0.6;
        break;
      case ContentType.PROJECT:
        baseImpact = 0.5;
        break;
      case ContentType.SUMMARY:
        baseImpact = 0.9;
        break;
      default:
        baseImpact = 0.4;
    }

    // Content-based impact modifiers
    const contentLower = content.toLowerCase();
    
    // Achievement indicators
    const achievementWords = ['achieved', 'accomplished', 'improved', 'increased', 'decreased', 'led', 'managed', 'developed', 'created', 'implemented'];
    const achievementCount = achievementWords.filter(word => contentLower.includes(word)).length;
    baseImpact += achievementCount * 0.05;

    // Quantifiable results
    const hasNumbers = /\d+/.test(content);
    const hasPercentage = /%/.test(content);
    const hasCurrency = /\$/.test(content);
    
    if (hasNumbers) baseImpact += 0.1;
    if (hasPercentage) baseImpact += 0.1;
    if (hasCurrency) baseImpact += 0.1;

    // Length consideration (too short or too long might be less impactful)
    if (content.length < 20) baseImpact -= 0.1;
    if (content.length > 200) baseImpact -= 0.05;

    return Math.min(1, Math.max(0, baseImpact));
  }
}

/**
 * Content clustering utility
 */
class ClusterAnalyzer {
  async clusterContent(contentItems: ContentItem[], jobContext?: JobContext): Promise<ContentCluster[]> {
    const clusters: ContentCluster[] = [];
    
    // Simple clustering based on content types and keywords
    const experienceClusters = this.clusterByType(contentItems, ContentType.EXPERIENCE);
    const skillClusters = this.clusterByType(contentItems, ContentType.SKILL);
    const educationClusters = this.clusterByType(contentItems, ContentType.EDUCATION);

    clusters.push(...experienceClusters, ...skillClusters, ...educationClusters);

    // Calculate job relevance for each cluster
    if (jobContext) {
      for (const cluster of clusters) {
        cluster.jobRelevance = await this.calculateClusterJobRelevance(cluster, contentItems, jobContext);
      }
    }

    return clusters;
  }

  private clusterByType(contentItems: ContentItem[], type: ContentType): ContentCluster[] {
    const typeItems = contentItems.filter(item => item.type === type);
    if (typeItems.length === 0) return [];

    // For now, create one cluster per type
    // In a more sophisticated implementation, we could cluster by semantic similarity
    const allKeywords = typeItems.flatMap(item => item.metadata.keywords);
    const uniqueKeywords = [...new Set(allKeywords)];

    return [{
      id: `cluster-${type}`,
      theme: type.charAt(0).toUpperCase() + type.slice(1),
      contentIds: typeItems.map(item => item.id),
      jobRelevance: 0.5, // Will be calculated later
      keywords: uniqueKeywords.slice(0, 10) // Top 10 keywords
    }];
  }

  private async calculateClusterJobRelevance(
    cluster: ContentCluster,
    allContentItems: ContentItem[],
    jobContext: JobContext
  ): Promise<number> {
    const clusterItems = allContentItems.filter(item => cluster.contentIds.includes(item.id));
    const clusterKeywords = clusterItems.flatMap(item => item.metadata.keywords.map(k => k.toLowerCase()));
    
    const jobKeywords = [
      ...jobContext.requiredSkills.map(s => s.toLowerCase()),
      ...jobContext.responsibilities.map(r => r.toLowerCase().split(' ')).flat(),
      ...jobContext.description.toLowerCase().split(' ')
    ].filter(k => k.length > 2);

    const matches = clusterKeywords.filter(ck => jobKeywords.some(jk => jk.includes(ck) || ck.includes(jk)));
    
    return matches.length / Math.max(clusterKeywords.length, 1);
  }
}
