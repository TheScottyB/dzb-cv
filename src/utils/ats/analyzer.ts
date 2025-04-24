import type { ATSAnalysis, ATSScore, ATSImprovement } from '../../types/ats-types';

/**
 * Common ATS parsing issues and their impact scores
 */
const ATS_ISSUES = {
  COMPLEX_FORMATTING: {
    score: -10,
    message: 'Complex formatting may prevent proper parsing',
    fix: 'Use simple formatting with clear headings and bullet points'
  },
  UNUSUAL_HEADINGS: {
    score: -5,
    message: 'Non-standard section headings',
    fix: 'Use standard section headings (e.g., "Experience", "Education", "Skills")'
  },
  MISSING_DATES: {
    score: -15,
    message: 'Missing or unclear dates',
    fix: 'Ensure all experience includes clear start and end dates (MM/YYYY)'
  },
  GRAPHICS: {
    score: -20,
    message: 'Graphics or special characters detected',
    fix: 'Remove graphics and use standard characters only'
  },
  CONTACT_INFO: {
    score: -10,
    message: 'Contact information not clearly formatted',
    fix: 'Place contact information at the top in a clear format'
  }
};

/**
 * Analyzes CV content for ATS compatibility
 */
export async function analyzeATSCompatibility(content: string): Promise<ATSAnalysis> {
  const issues: ATSImprovement[] = [];
  let totalScore = 100;

  // Check for complex formatting
  if (hasComplexFormatting(content)) {
    issues.push({
      type: 'COMPLEX_FORMATTING',
      ...ATS_ISSUES.COMPLEX_FORMATTING
    });
    totalScore += ATS_ISSUES.COMPLEX_FORMATTING.score;
  }

  // Check section headings
  if (hasUnusualHeadings(content)) {
    issues.push({
      type: 'UNUSUAL_HEADINGS',
      ...ATS_ISSUES.UNUSUAL_HEADINGS
    });
    totalScore += ATS_ISSUES.UNUSUAL_HEADINGS.score;
  }

  // Check date formats
  if (hasMissingDates(content)) {
    issues.push({
      type: 'MISSING_DATES',
      ...ATS_ISSUES.MISSING_DATES
    });
    totalScore += ATS_ISSUES.MISSING_DATES.score;
  }

  // Check for graphics
  if (hasGraphics(content)) {
    issues.push({
      type: 'GRAPHICS',
      ...ATS_ISSUES.GRAPHICS
    });
    totalScore += ATS_ISSUES.GRAPHICS.score;
  }

  // Check contact information
  if (!hasProperContactInfo(content)) {
    issues.push({
      type: 'CONTACT_INFO',
      ...ATS_ISSUES.CONTACT_INFO
    });
    totalScore += ATS_ISSUES.CONTACT_INFO.score;
  }

  // Generate improvement suggestions
  const improvements = generateImprovements(issues);

  return {
    score: Math.max(0, totalScore),
    issues,
    improvements,
    warnings: issues.length > 0 ? ['Some ATS compatibility issues found'] : []
  };
}

// Helper functions

function hasComplexFormatting(content: string): boolean {
  const complexPatterns = [
    /\t/,           // Tabs
    /\{.*?\}/,      // CSS-style formatting
    /<.*?>/,        // HTML tags
    /[""]/,         // Smart quotes
    /[•◦‣⁃]/       // Special bullets
  ];

  return complexPatterns.some(pattern => pattern.test(content));
}

function hasUnusualHeadings(content: string): boolean {
  const standardHeadings = [
    'experience',
    'education',
    'skills',
    'summary',
    'professional experience',
    'work history',
    'certifications',
    'professional summary'
  ];

  const headingPattern = /^#+\s*(.*?)$/gm;
  const matches = content.match(headingPattern) || [];
  
  return matches.some(heading => {
    const headingText = heading.replace(/^#+\s*/, '').toLowerCase();
    return !standardHeadings.includes(headingText);
  });
}

function hasMissingDates(content: string): boolean {
  const datePattern = /(?:19|20)\d{2}(?:\s*-\s*(?:present|(?:19|20)\d{2}))?/gi;
  const sections = content.split(/^#+\s/m);
  
  // Check experience/education sections for dates
  const relevantSections = sections.filter(section => 
    /experience|education|work|history/i.test(section)
  );

  return relevantSections.some(section => !datePattern.test(section));
}

function hasGraphics(content: string): boolean {
  const graphicsPatterns = [
    /[^\x00-\x7F]+/,      // Non-ASCII characters
    /[✓✔★☆→⇒♦♠♣♥]/,    // Special symbols
    /\|\s*\|/,            // Table markers
    /```/                 // Code blocks
  ];

  return graphicsPatterns.some(pattern => pattern.test(content));
}

function hasProperContactInfo(content: string): boolean {
  const firstParagraph = content.split('\n\n')[0];
  const contactPatterns = [
    /[\w.-]+@[\w.-]+\.[A-Za-z]{2,}/,  // Email
    /\d{3}[.-]\d{3}[.-]\d{4}/,        // Phone
    /[A-Za-z]+,\s*[A-Za-z]+/          // City, State
  ];

  return contactPatterns.every(pattern => pattern.test(firstParagraph));
}

function generateImprovements(issues: ATSImprovement[]): string[] {
  return issues.map(issue => {
    return `${issue.message}. Suggestion: ${issue.fix}`;
  });
}
