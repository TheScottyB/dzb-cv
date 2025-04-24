import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';
import type { Response } from 'node-fetch';
import type { JobPostingAnalysis } from '../types/cv-types.js';

// Supported job sites with their parsing strategies
enum JobSite {
  LINKEDIN = 'linkedin',
  INDEED = 'indeed',
  USAJOBS = 'usajobs',
  MONSTER = 'monster',
  GLASSDOOR = 'glassdoor',
  GENERIC = 'generic'
}

/**
 * Rate limiting configuration to avoid overloading job sites
 */
const rateLimits = {
  requestsPerMinute: 10,
  lastRequestTime: 0,
  minTimeBetweenRequests: 6000, // milliseconds (6 seconds)
};
// --- Helper Functions (Moved to top) ---

/**
 * Identifies which job site the URL belongs to
 */
function identifyJobSite(url: string): JobSite {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('linkedin.com')) return JobSite.LINKEDIN;
  if (urlLower.includes('indeed.com')) return JobSite.INDEED;
  if (urlLower.includes('usajobs.gov')) return JobSite.USAJOBS;
  if (urlLower.includes('monster.com')) return JobSite.MONSTER;
  if (urlLower.includes('glassdoor.com')) return JobSite.GLASSDOOR;
  return JobSite.GENERIC;
}

/**
 * Applies rate limiting to prevent overloading job sites
 */
async function applyRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - rateLimits.lastRequestTime;
  if (timeSinceLastRequest < rateLimits.minTimeBetweenRequests) {
    const waitTime = rateLimits.minTimeBetweenRequests - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  rateLimits.lastRequestTime = Date.now();
}

/**
 * Fetches the HTML content from a job posting URL
 */
async function fetchJobPostingHtml(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'follow',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.text();
  } catch (error) {
    throw new Error(`Failed to fetch job posting: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Escapes special characters in a string for use in a regular expression
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extracts key terms from text content
 */
export function extractKeyTerms(text: string, additionalTerms: string[] = []): string[] {
  const commonSkills = [
    'javascript', 'typescript', 'python', 'java', 'c#', 'c\\+\\+', 'ruby', 'go', 'rust',
    'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'jenkins', 'git',
    'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'oracle', 'redis',
    'rest', 'graphql', 'api', 'microservices', 'serverless',
    'agile', 'scrum', 'kanban', 'jira', 'confluence',
    'leadership', 'management', 'teamwork', 'communication',
    'federal', 'government', 'clearance', 'security', 'public sector',
    'state', 'local', 'municipality', 'policy', 'regulation',
    'civil service', 'public administration', 'public policy', 'state agency',
    'rutan', 'public employment', 'state employment', 'hiring process',
    'central management services', 'cms', 'recruitment', 'human resources',
    'applicant tracking', 'selection process', 'interview panel', 'administrative',
    'program management', 'grant', 'grants management', 'procurement',
    'budget', 'fiscal', 'legislative', 'statutory', 'compliance'
  ];
  const allTerms = [...commonSkills, ...additionalTerms];
  const terms: string[] = [];
  for (const skill of allTerms) {
    try {
      const escapedSkill = skill.includes('\\') ? skill : escapeRegExp(skill);
      const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
      if (regex.test(text)) {
        const originalTerm = skill.replace(/\\\+/g, '+').replace(/\\/g, '');
        terms.push(originalTerm.toLowerCase());
      }
    } catch (error) {
      console.warn(`Skipping problematic term "${skill}": ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return [...new Set(terms)];
}

/**
 * Gets all text content from elements matching a selector
 */
function getTextFromElements(document: Document, selector: string): string[] {
  const elements = document.querySelectorAll(selector);
  return Array.from(elements).map(el => el.textContent?.trim()).filter(Boolean) as string[];
}

/**
 * Detects section headings in a document by looking for common heading patterns
 */
function detectDocumentSections(document: Document): Record<string, Element[]> {
  const sectionMap: Record<string, Element[]> = {
    responsibilities: [], qualifications: [], requirements: [], skills: [],
    benefits: [], about: [], education: []
  };
  const headers = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, strong, b'));
  for (const header of headers) {
    const text = header.textContent?.toLowerCase() || '';
    let sectionType: string | null = null;
    if (/responsib|duties|what you('ll)? do|role|functions|day to day/i.test(text)) sectionType = 'responsibilities';
    else if (/qualif|what you('ll)? need|experience|background/i.test(text)) sectionType = 'qualifications';
    else if (/requirements?|must have|essential/i.test(text)) sectionType = 'requirements';
    else if (/skills?|competenc|proficien|expertise/i.test(text)) sectionType = 'skills';
    else if (/benefits?|perks|offer|compensation|salary/i.test(text)) sectionType = 'benefits';
    else if (/about|company|who we are|our team/i.test(text)) sectionType = 'about';
    else if (/education|degree|academic|diploma/i.test(text)) sectionType = 'education';

    if (sectionType) {
      let sibling = header.nextElementSibling;
      while (sibling && !['H1','H2','H3','H4','H5','H6'].includes(sibling.tagName) && !(sibling.tagName === 'STRONG' && sibling.textContent && sibling.textContent.length > 15)) {
        if (sibling.textContent?.trim()) sectionMap[sectionType].push(sibling);
        sibling = sibling.nextElementSibling;
      }
    }
  }
  return sectionMap;
}

/**
 * Extracts list items from a collection of elements
 */
function extractListItemsFromElements(elements: Element[]): string[] {
  const items: string[] = [];
  for (const element of elements) {
    if (element.tagName === 'UL' || element.tagName === 'OL') {
      const listItems = Array.from(element.querySelectorAll('li'))
        .map(li => li.textContent?.trim())
        .filter(Boolean) as string[];
      items.push(...listItems);
    } else if (element.textContent && element.textContent.trim().length > 0) {
      items.push(element.textContent.trim());
    }
  }
  return items;
}

// --- Parser Function Definitions ---

/**
 * Parses LinkedIn job postings
 */
function parseLinkedInJob(document: Document, url: string): JobPostingAnalysis {
  const title = document.querySelector('.top-card-layout__title')?.textContent?.trim() || document.querySelector('h1')?.textContent?.trim() || 'Unknown Position';
  const company = document.querySelector('.topcard__org-name-link')?.textContent?.trim() || document.querySelector('.topcard__flavor--metadata')?.textContent?.trim() || 'Unknown Company';
  const location = document.querySelector('.topcard__flavor--bullet')?.textContent?.trim() || document.querySelector('.topcard__flavor-row')?.textContent?.trim();
  const descriptionText = document.querySelector('.description__text')?.textContent?.trim() || ''; // Use a different variable name temporarily
  const responsibilities: string[] = [];
  const qualifications: string[] = [];
  const keyTerms = extractKeyTerms(descriptionText);

  return {
    title,
    company,
    location,
    // description: descriptionText, // Removed to match interface
    responsibilities,
    qualifications,
    keyTerms,
    requiredSkills: keyTerms,
    desiredSkills: [],
    source: { url, site: 'LinkedIn', fetchDate: new Date() }
  };
}

/**
 * Parses Indeed job postings
 */
function parseIndeedJob(document: Document, url: string): JobPostingAnalysis {
  const title = document.querySelector('.jobsearch-JobInfoHeader-title')?.textContent?.trim() || 'Unknown Position';
  let company = document.querySelector('.jobsearch-InlineCompanyRating-companyName')?.textContent?.trim() || 'Unknown Company';
  const location = document.querySelector('.jobsearch-JobInfoHeader-subtitle .jobsearch-JobInfoHeader-locationText')?.textContent?.trim();
  const description = document.querySelector('#jobDescriptionText')?.textContent || '';
  const jobTypeElement = Array.from(document.querySelectorAll('.jobsearch-JobDescriptionSection-sectionItem'))
    .find(item => item.textContent?.includes('Job Type'));
  const jobType = jobTypeElement?.textContent?.replace('Job Type', '').trim();
  const sections = document.querySelectorAll('#jobDescriptionText > div, #jobDescriptionText > p');
  let responsibilities: string[] = [];
  let qualifications: string[] = [];

  sections.forEach(section => {
      const textContent = section.textContent?.trim() || '';
      if (textContent.toLowerCase().startsWith('responsibilities') || textContent.toLowerCase().startsWith('duties')) {
          responsibilities = extractListItemsFromElements(Array.from(section.querySelectorAll('li, p')));
      } else if (textContent.toLowerCase().startsWith('qualifications') || textContent.toLowerCase().startsWith('requirements')) {
          qualifications = extractListItemsFromElements(Array.from(section.querySelectorAll('li, p')));
      }
  });

  if (company.includes('|')) {
      const parts = company.split('|').map(s => s.trim());
      if (parts[parts.length - 1]?.length > 1) company = parts[parts.length - 1];
  }
  if (company.toLowerCase().includes(' at ')) {
      company = company.split(' at ').pop()?.trim() || company;
  }
  const keyTerms = extractKeyTerms(description);

  return {
    title, company, location, // description, // Removed to match interface
    jobType,
    responsibilities: responsibilities.length ? responsibilities : [],
    qualifications: qualifications.length ? qualifications : [],
    keyTerms, requiredSkills: keyTerms, desiredSkills: [],
    source: { url, site: 'Indeed', fetchDate: new Date() }
  };
}

/**
 * Parses USAJobs job postings
 */
function parseUSAJobsJob(document: Document, url: string): JobPostingAnalysis {
    const title = document.querySelector('#job-title')?.textContent?.trim() || 'Unknown Position';
    let company = document.querySelector('.usajobs-joa-banner__agency')?.textContent?.trim() || 'Unknown Agency';
    const locationNodes = document.querySelectorAll('.usajobs-joa-locations__list-item');
    const locations = Array.from(locationNodes).map(node => node.textContent?.trim()).filter(Boolean) as string[];
    const location = locations.join('; ');
    const description = document.querySelector('.usajobs-joa-section--summary .usajobs-joa-section__body')?.textContent?.trim() || '';
    const getSectionContent = (id: string): string[] => {
        const sectionBody = document.querySelector(`#${id} .usajobs-joa-section__body`);
        return extractListItemsFromElements(Array.from(sectionBody?.querySelectorAll('p, li') || []));
    };
    const responsibilities = getSectionContent('duties');
    const qualifications = getSectionContent('qualifications');
    if (!company.includes('Department of')) company = `${company}, U.S. Federal Government`;
    const keyTerms = extractKeyTerms(description + responsibilities.join(' ') + qualifications.join(' '));

    return {
        title, company, location, // description, // Removed to match interface
        responsibilities, qualifications, keyTerms,
        requiredSkills: keyTerms, desiredSkills: [],
        source: { url, site: 'USAJobs', fetchDate: new Date() }
    };
}

/**
 * Parses Monster job postings
 */
function parseMonsterJob(document: Document, url: string): JobPostingAnalysis {
    const title = document.querySelector('h1.job_title')?.textContent?.trim() || 'Unknown Position';
    const company = document.querySelector('.h_subtitle a')?.textContent?.trim() || 'Unknown Company';
    const location = document.querySelector('.location')?.textContent?.trim();
    const description = document.querySelector('#JobDescription')?.textContent?.trim() || '';
    const responsibilities: string[] = [];
    const qualifications: string[] = [];
    const keyTerms = extractKeyTerms(description);

    return {
        title, company, location, // description, // Removed to match interface
        responsibilities, qualifications, keyTerms,
        requiredSkills: keyTerms, desiredSkills: [],
        source: { url, site: 'Monster', fetchDate: new Date() }
    };
}

/**
 * Parses Glassdoor job postings
 */
function parseGlassdoorJob(document: Document, url: string): JobPostingAnalysis {
    const title = document.querySelector('[data-test="jobTitle"]')?.textContent?.trim() || 'Unknown Position';
    const company = document.querySelector('[data-test="employerName"]')?.textContent?.trim() || 'Unknown Company';
    const location = document.querySelector('[data-test="location"]')?.textContent?.trim();
    const description = document.querySelector('#JobDescriptionContainer')?.textContent?.trim() || '';
    const jobDescription = description; // Use consistent variable name

    // --- Detailed Glassdoor Parsing Logic ---
    let salaryRange: JobPostingAnalysis['salaryRange'] = undefined;
    const salaryText = document.querySelector('[data-test="detailSalary"]')?.textContent || '';
    const salaryRegex = /\$([0-9,.]+)K?\s*(?:-|to|–)\s*\$?([0-9,.]+)K?/i;
    const salaryMatch = salaryText.match(salaryRegex);

    if (salaryMatch) {
      const parseAmount = (str: string) => {
        let amount = parseFloat(str.replace(/[,$]/g, ''));
        if (str.toLowerCase().includes('k')) amount *= 1000;
        return amount;
      };
      salaryRange = {
        min: parseAmount(salaryMatch[1]), max: parseAmount(salaryMatch[2]),
        currency: 'USD', period: salaryText.toLowerCase().includes('hour') ? 'hourly' : 'yearly'
      };
    }

    const experienceLevelMatch = jobDescription.match(/(\d+)[+]?\s+years?(?:\s+of)?\s+experience/i);
    const experienceLevel = experienceLevelMatch ? `${experienceLevelMatch[1]}+ years` : undefined;

    const sections = detectDocumentSections(document);
    const responsibilities = extractListItemsFromElements(sections.responsibilities);
    const qualifications = [
      ...extractListItemsFromElements(sections.qualifications),
      ...extractListItemsFromElements(sections.requirements),
      ...extractListItemsFromElements(sections.skills)
    ];
    const educationRequirements = extractListItemsFromElements(sections.education);

    if (responsibilities.length === 0 && qualifications.length === 0) {
      const lists = Array.from(document.querySelectorAll('ul, ol'));
      for (const list of lists) {
        const previousEl = list.previousElementSibling;
        const prevText = previousEl?.textContent?.toLowerCase() || '';
        const listItems = Array.from(list.querySelectorAll('li'))
          .map(li => li.textContent?.trim()).filter(Boolean) as string[];

        if (prevText.includes('responsib') || prevText.includes('duties') || prevText.includes('what you will do')) {
          responsibilities.push(...listItems);
        } else if (prevText.includes('qualif') || prevText.includes('requir') || prevText.includes('skills') || prevText.includes('experience') || prevText.includes('looking for')) {
          qualifications.push(...listItems);
        } else if (prevText.includes('education') || prevText.includes('degree')) {
          educationRequirements.push(...listItems);
        } else if (responsibilities.length === 0 && listItems.length > 0) {
          responsibilities.push(...listItems);
        } else if (qualifications.length === 0 && listItems.length > 0) {
          qualifications.push(...listItems);
        }
      }
    }

    const keyTerms = extractKeyTerms(jobDescription);

    return {
      title, company, location,
      // description: jobDescription, // Removed to match interface
      jobType: jobDescription.includes('full-time') ? 'Full-time' : (jobDescription.includes('part-time') ? 'Part-time' : undefined),
      responsibilities,
      qualifications,
      keyTerms,
      requiredSkills: keyTerms,
      desiredSkills: [],
      educationRequirements,
      experienceLevel,
      salaryRange,
      source: { url, site: 'Glassdoor', fetchDate: new Date() }
    };
}

/**
 * Parses Generic job postings
 */
function parseGenericJob(document: Document, url: string): JobPostingAnalysis {
  // Attempt generic extraction based on common patterns
  const title = document.querySelector('h1')?.textContent?.trim() ||
                document.querySelector('.job-title')?.textContent?.trim() ||
                document.title.split('|')[0].trim() || // Fallback to page title
                'Unknown Position';

  // Try common company selectors
  let company = document.querySelector('.company-name')?.textContent?.trim() ||
                document.querySelector('.employer')?.textContent?.trim() ||
                document.querySelector('.job-company')?.textContent?.trim() ||
                'Unknown Company';

  const location = document.querySelector('.location')?.textContent?.trim() ||
                   document.querySelector('.job-location')?.textContent?.trim();

  // Try common description selectors
  const description = document.querySelector('.job-description')?.textContent?.trim() ||
                      document.querySelector('#job-details')?.textContent?.trim() ||
                      document.querySelector('article')?.textContent?.trim() || // Fallback to article
                      '';

  // Simple extraction for responsibilities/qualifications by keywords
  const paragraphs = Array.from(document.querySelectorAll('p, li'));
  let responsibilities: string[] = [];
  let qualifications: string[] = [];

  paragraphs.forEach(p => {
      const text = p.textContent?.toLowerCase() || '';
      if (text.includes('responsibilities') || text.includes('duties')) {
          responsibilities.push(p.textContent?.trim() || '');
      } else if (text.includes('qualifications') || text.includes('requirements') || text.includes('skills')) {
          qualifications.push(p.textContent?.trim() || '');
      }
  });

  // Post-process company name
  if (company.includes('|')) {
      const parts = company.split('|').map(s => s.trim());
      if (parts[parts.length - 1]?.length > 1) company = parts[parts.length - 1];
  }
  if (company.toLowerCase().includes(' at ')) {
      company = company.split(' at ').pop()?.trim() || company;
  }
  if (company === title && document.title.includes('|')) {
      company = document.title.split('|').pop()?.trim() || company;
  }

  const fullText = description + responsibilities.join(' ') + qualifications.join(' ');
  const keyTerms = extractKeyTerms(fullText); // Now defined
  const urlObj = new URL(url);
  const domain = urlObj.hostname.replace(/^www\./, '');

  return {
    title, company, location,
    // description, // Removed to match interface
    responsibilities: responsibilities.filter(r => r.length > 10),
    qualifications: qualifications.filter(q => q.length > 10),
    keyTerms,
    requiredSkills: keyTerms,
    desiredSkills: [],
    source: { url, site: domain || 'Generic', fetchDate: new Date() }
  };
}

// --- Main analyzeJobPosting function ---

/**
 * Analyzes a job posting URL and extracts relevant information
 */
export async function analyzeJobPosting(
  url: string,
  options?: {
    skipRateLimiting?: boolean,
    forceGenericParser?: boolean
  }
): Promise<JobPostingAnalysis> {
  try {
    if (!options?.skipRateLimiting) await applyRateLimit();
    const jobSite = options?.forceGenericParser ? JobSite.GENERIC : identifyJobSite(url);
    const html = await fetchJobPostingHtml(url);
    const dom = new JSDOM(html);
    const document = dom.window.document;

    switch (jobSite) {
      case JobSite.LINKEDIN: return parseLinkedInJob(document, url);
      case JobSite.INDEED: return parseIndeedJob(document, url);
      case JobSite.USAJOBS: return parseUSAJobsJob(document, url);
      case JobSite.MONSTER: return parseMonsterJob(document, url);
      case JobSite.GLASSDOOR: return parseGlassdoorJob(document, url);
      default: return parseGenericJob(document, url);
    }
  } catch (error) {
    throw new Error(`Failed to analyze job posting: ${error instanceof Error ? error.message : String(error)}`);
  }
}
 * Identifies which job site the URL belongs to
 */
function identifyJobSite(url: string): JobSite {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('linkedin.com')) return JobSite.LINKEDIN;
  if (urlLower.includes('indeed.com')) return JobSite.INDEED;
  if (urlLower.includes('usajobs.gov')) return JobSite.USAJOBS;
  if (urlLower.includes('monster.com')) return JobSite.MONSTER;
  if (urlLower.includes('glassdoor.com')) return JobSite.GLASSDOOR;
  return JobSite.GENERIC;
}

/**
 * Applies rate limiting to prevent overloading job sites
async function applyRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - rateLimits.lastRequestTime;
  if (timeSinceLastRequest < rateLimits.minTimeBetweenRequests) {
    const waitTime = rateLimits.minTimeBetweenRequests - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  rateLimits.lastRequestTime = Date.now();
}

/**
 * Fetches the HTML content from a job posting URL
 */
async function fetchJobPostingHtml(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'follow',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.text();
  } catch (error) {
    throw new Error(`Failed to fetch job posting: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Escapes special characters in a string for use in a regular expression
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extracts key terms from text content
 */
 */
function getTextFromElements(document: Document, selector: string): string[] {
  const elements = document.querySelectorAll(selector);
  return Array.from(elements).map(el => el.textContent?.trim()).filter(Boolean) as string[];
}

/**
 * Detects section headings in a document by looking for common heading patterns
 */
function detectDocumentSections(document: Document): Record<string, Element[]> {
  const sectionMap: Record<string, Element[]> = {
    responsibilities: [], qualifications: [], requirements: [], skills: [],
    benefits: [], about: [], education: []
  };
  const headers = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, strong, b'));
  for (const header of headers) {
    const text = header.textContent?.toLowerCase() || '';
    let sectionType: string | null = null;
    if (/responsib|duties|what you('ll)? do|role|functions|day to day/i.test(text)) sectionType = 'responsibilities';
    else if (/qualif|what you('ll)? need|experience|background/i.test(text)) sectionType = 'qualifications';
    else if (/requirements?|must have|essential/i.test(text)) sectionType = 'requirements';
    else if (/skills?|competenc|proficien|expertise/i.test(text)) sectionType = 'skills';
    else if (/benefits?|perks|offer|compensation|salary/i.test(text)) sectionType = 'benefits';
    else if (/about|company|who we are|our team/i.test(text)) sectionType = 'about';
    else if (/education|degree|academic|diploma/i.test(text)) sectionType = 'education';

    if (sectionType) {
      let sibling = header.nextElementSibling;
      while (sibling && !['H1','H2','H3','H4','H5','H6'].includes(sibling.tagName) && !(sibling.tagName === 'STRONG' && sibling.textContent && sibling.textContent.length > 15)) {
        if (sibling.textContent?.trim()) sectionMap[sectionType].push(sibling);
        sibling = sibling.nextElementSibling;
      }
    }
  }
  return sectionMap;
// --- Parser Function Definitions ---

/**
 * Parses LinkedIn job postings
 */
function parseLinkedInJob(document: Document, url: string): JobPostingAnalysis {
  const title = document.querySelector('.top-card-layout__title')?.textContent?.trim() || document.querySelector('h1')?.textContent?.trim() || 'Unknown Position';
  const company = document.querySelector('.topcard__org-name-link')?.textContent?.trim() || document.querySelector('.topcard__flavor--metadata')?.textContent?.trim() || 'Unknown Company';
  const location = document.querySelector('.topcard__flavor--bullet')?.textContent?.trim() || document.querySelector('.topcard__flavor-row')?.textContent?.trim();
  const descriptionText = document.querySelector('.description__text')?.textContent?.trim() || ''; // Use a different variable name temporarily
  const responsibilities: string[] = [];
  const qualifications: string[] = [];
  const keyTerms = extractKeyTerms(descriptionText);

  return {
    title,
    company,
    location,
    // description: descriptionText, // Removed to match interface
    responsibilities,
    qualifications,
    keyTerms,
    requiredSkills: keyTerms,
    desiredSkills: [],
    source: { url, site: 'LinkedIn', fetchDate: new Date() }
  };
}

// --- Parser Function Definitions ---

/**
 * Extracts list items from a collection of elements
 */
/**
 * Extracts list items from a collection of elements
 */
function extractListItemsFromElements(elements: Element[]): string[] {
  const items: string[] = [];
  for (const element of elements) {
    if (element.tagName === 'UL' || element.tagName === 'OL') {
      const listItems = Array.from(element.querySelectorAll('li'))
        .map(li => li.textContent?.trim())
        .filter(Boolean) as string[];
      items.push(...listItems);
    } else if (element.textContent && element.textContent.trim().length > 0) {
      items.push(element.textContent.trim());
    }
  }
  return items;
}
function parseIndeedJob(document: Document, url: string): JobPostingAnalysis {
  const title = document.querySelector('.jobsearch-JobInfoHeader-title')?.textContent?.trim() || 'Unknown Position';
  let company = document.querySelector('.jobsearch-InlineCompanyRating-companyName')?.textContent?.trim() || 'Unknown Company';
  const location = document.querySelector('.jobsearch-JobInfoHeader-subtitle .jobsearch-JobInfoHeader-locationText')?.textContent?.trim();
  const description = document.querySelector('#jobDescriptionText')?.textContent || '';
  const jobTypeElement = Array.from(document.querySelectorAll('.jobsearch-JobDescriptionSection-sectionItem'))
    .find(item => item.textContent?.includes('Job Type'));
  const jobType = jobTypeElement?.textContent?.replace('Job Type', '').trim();
  const sections = document.querySelectorAll('#jobDescriptionText > div, #jobDescriptionText > p');
  let responsibilities: string[] = [];
  let qualifications: string[] = [];

  sections.forEach(section => {
      const textContent = section.textContent?.trim() || '';
      if (textContent.toLowerCase().startsWith('responsibilities') || textContent.toLowerCase().startsWith('duties')) {
          responsibilities = extractListItemsFromElements(Array.from(section.querySelectorAll('li, p')));
      } else if (textContent.toLowerCase().startsWith('qualifications') || textContent.toLowerCase().startsWith('requirements')) {
          qualifications = extractListItemsFromElements(Array.from(section.querySelectorAll('li, p')));
      }
  });

  if (company.includes('|')) {
      const parts = company.split('|').map(s => s.trim());
      if (parts[parts.length - 1]?.length > 1) company = parts[parts.length - 1];
  }
  if (company.toLowerCase().includes(' at ')) {
      company = company.split(' at ').pop()?.trim() || company;
  }
  const keyTerms = extractKeyTerms(description);

  return {
    title, company, location, // description, // Removed to match interface
    jobType,
    responsibilities: responsibilities.length ? responsibilities : [],
    qualifications: qualifications.length ? qualifications : [],
    keyTerms, requiredSkills: keyTerms, desiredSkills: [],
    source: { url, site: 'Indeed', fetchDate: new Date() }
  };
}

/**
 * Parses USAJobs job postings
 */
function parseUSAJobsJob(document: Document, url: string): JobPostingAnalysis {
    const title = document.querySelector('#job-title')?.textContent?.trim() || 'Unknown Position';
    let company = document.querySelector('.usajobs-joa-banner__agency')?.textContent?.trim() || 'Unknown Agency';
    const locationNodes = document.querySelectorAll('.usajobs-joa-locations__list-item');
    const locations = Array.from(locationNodes).map(node => node.textContent?.trim()).filter(Boolean) as string[];
    const location = locations.join('; ');
    const description = document.querySelector('.usajobs-joa-section--summary .usajobs-joa-section__body')?.textContent?.trim() || '';
    const getSectionContent = (id: string): string[] => {
        const sectionBody = document.querySelector(`#${id} .usajobs-joa-section__body`);
        return extractListItemsFromElements(Array.from(sectionBody?.querySelectorAll('p, li') || []));
    };
    const responsibilities = getSectionContent('duties');
    const qualifications = getSectionContent('qualifications');
    if (!company.includes('Department of')) company = `${company}, U.S. Federal Government`;
    const keyTerms = extractKeyTerms(description + responsibilities.join(' ') + qualifications.join(' '));

    return {
        title, company, location, // description, // Removed to match interface
        responsibilities, qualifications, keyTerms,
        requiredSkills: keyTerms, desiredSkills: [],
        source: { url, site: 'USAJobs', fetchDate: new Date() }
    };
}

/**
 * Parses Monster job postings
 */
function parseMonsterJob(document: Document, url: string): JobPostingAnalysis {
    const title = document.querySelector('h1.job_title')?.textContent?.trim() || 'Unknown Position';
    const company = document.querySelector('.h_subtitle a')?.textContent?.trim() || 'Unknown Company';
    const location = document.querySelector('.location')?.textContent?.trim();
    const description = document.querySelector('#JobDescription')?.textContent?.trim() || '';
    const responsibilities: string[] = [];
    const qualifications: string[] = [];
    const keyTerms = extractKeyTerms(description);

    return {
        title, company, location, // description, // Removed to match interface
        responsibilities, qualifications, keyTerms,
        requiredSkills: keyTerms, desiredSkills: [],
        source: { url, site: 'Monster', fetchDate: new Date() }
    };
}

/**
 * Parses Glassdoor job postings
 */
function parseGlassdoorJob(document: Document, url: string): JobPostingAnalysis {
    const title = document.querySelector('[data-test="jobTitle"]')?.textContent?.trim() || 'Unknown Position';
    const company = document.querySelector('[data-test="employerName"]')?.textContent?.trim() || 'Unknown Company';
    const location = document.querySelector('[data-test="location"]')?.textContent?.trim();
    const description = document.querySelector('#JobDescriptionContainer')?.textContent?.trim() || '';
    const jobDescription = description; // Use consistent variable name
    const responsibilities: string[] = []; // Simplified
    const qualifications: string[] = []; // Simplified
    const keyTerms = extractKeyTerms(jobDescription);

    // Glassdoor salary parsing logic (previously misplaced)
    let salaryRange: JobPostingAnalysis['salaryRange'] = undefined;
    const salaryText = document.querySelector('[data-test="detailSalary"]')?.textContent || '';
    const salaryRegex = /\$([0-9,.]+)K?\s*(?:-|to|–)\s*\$?([0-9,.]+)K?/i;
    const salaryMatch = salaryText.match(salaryRegex);
    if (salaryMatch) {
        const parseAmount = (str: string) => {
          let amount = parseFloat(str.replace(/[,$]/g, ''));
          if (str.toLowerCase().includes('k')) amount *= 1000;
          return amount;
        };
        salaryRange = {
          min: parseAmount(salaryMatch[1]), max: parseAmount(salaryMatch[2]),
          currency: 'USD', period: salaryText.toLowerCase().includes('hour') ? 'hourly' : 'yearly'
        };
    }

    // Glassdoor experience level parsing logic (previously misplaced)
    const experienceLevelMatch = jobDescription.match(/(\d+)[+]?\s+years?(?:\s+of)?\s+experience/i);
    const experienceLevel = experienceLevelMatch ? `${experienceLevelMatch[1]}+ years` : undefined;
    
    // Glassdoor education requirements parsing logic (previously misplaced)
    const sections = detectDocumentSections(document); // Assuming this helper exists
    const educationRequirements = extractListItemsFromElements(sections.education);

    return {
      title, company, location, 
      jobType: jobDescription.includes('full-time') ? 'Full-time' : (jobDescription.includes('part-time') ? 'Part-time' : undefined),
      responsibilities, 
      qualifications, 
      keyTerms, 
      requiredSkills: keyTerms, 
      desiredSkills: [],
      educationRequirements,
      experienceLevel,
      salaryRange,
      source: { url, site: 'Glassdoor', fetchDate: new Date() }
    };
} 

/**
      else if (text.includes('qualifications') || text.includes('requirements') || text.includes('skills')) qualifications.push(p.textContent?.trim() || '');
  });

  if (company.includes('|')) {
      const parts = company.split('|').map(s => s.trim());
      if (parts[parts.length - 1]?.length > 1) company = parts[parts.length - 1];
  }
   if (company.toLowerCase().includes(' at ')) {
      company = company.split(' at ').pop()?.trim() || company;
  }
  if (company === title && document.title.includes('|')) {
      company = document.title.split('|').pop()?.trim() || company;
  }

  const fullText = description + responsibilities.join(' ') + qualifications.join(' ');
  const keyTerms = extractKeyTerms(fullText);
  const urlObj = new URL(url);
  const domain = urlObj.hostname.replace(/^www\./, '');

  return {
    title, company, location, 
    responsibilities: responsibilities.filter(r => r.length > 10),
    qualifications: qualifications.filter(q => q.length > 10),
    keyTerms, 
    requiredSkills: keyTerms, 
    desiredSkills: [],
    source: { url, site: domain || 'Generic', fetchDate: new Date() } // Use domain for site if available
  };
} 

// --- Main analyzeJobPosting function ---
export async function analyzeJobPosting(
  url: string, 
  options?: { 
    skipRateLimiting?: boolean, 
    forceGenericParser?: boolean 
  }
): Promise<JobPostingAnalysis> {
  try {
    if (!options?.skipRateLimiting) await applyRateLimit();
    const jobSite = options?.forceGenericParser ? JobSite.GENERIC : identifyJobSite(url);
    const html = await fetchJobPostingHtml(url);
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    switch (jobSite) {
      case JobSite.LINKEDIN: return parseLinkedInJob(document, url);
      case JobSite.INDEED: return parseIndeedJob(document, url);
      case JobSite.USAJOBS: return parseUSAJobsJob(document, url);
      case JobSite.MONSTER: return parseMonsterJob(document, url);
      case JobSite.GLASSDOOR: return parseGlassdoorJob(document, url);
      default: return parseGenericJob(document, url);
    }
  } catch (error) {
    throw new Error(`Failed to analyze job posting: ${error instanceof Error ? error.message : String(error)}`);
  }
}
