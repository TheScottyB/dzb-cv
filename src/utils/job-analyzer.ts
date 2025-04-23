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
 * Analyzes a job posting URL and extracts relevant information
 * 
 * @param url The URL of the job posting
 * @returns A structured JobPostingAnalysis object with extracted information
 * @throws Error if the URL is invalid or content cannot be fetched/parsed
 */
/**
 * Rate limiting configuration to avoid overloading job sites
 */
const rateLimits = {
  requestsPerMinute: 10,
  lastRequestTime: 0,
  minTimeBetweenRequests: 6000, // milliseconds (6 seconds)
};

/**
 * Analyzes a job posting URL and extracts relevant information
 * 
 * @param url The URL of the job posting
 * @param options Optional configuration for analysis
 * @returns A structured JobPostingAnalysis object with extracted information
 * @throws Error if the URL is invalid or content cannot be fetched/parsed
 */
export async function analyzeJobPosting(
  url: string, 
  options?: { 
    skipRateLimiting?: boolean, 
    forceGenericParser?: boolean 
  }
): Promise<JobPostingAnalysis> {
  try {
    // Apply rate limiting unless explicitly skipped
    if (!options?.skipRateLimiting) {
      await applyRateLimit();
    }
    
    const jobSite = options?.forceGenericParser ? JobSite.GENERIC : identifyJobSite(url);
    const html = await fetchJobPostingHtml(url);
    
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    switch (jobSite) {
      case JobSite.LINKEDIN:
        return parseLinkedInJob(document, url);
      case JobSite.INDEED:
        return parseIndeedJob(document, url);
      case JobSite.USAJOBS:
        return parseUSAJobsJob(document, url);
      case JobSite.MONSTER:
        return parseMonsterJob(document, url);
      case JobSite.GLASSDOOR:
        return parseGlassdoorJob(document, url);
      default:
        return parseGenericJob(document, url);
    }
  } catch (error) {
    throw new Error(`Failed to analyze job posting: ${error instanceof Error ? error.message : String(error)}`);
  }
}

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
/**
 * Applies rate limiting to prevent overloading job sites
 * Waits if necessary to maintain the specified request rate
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
 * 
 * @returns The HTML content as a string
 * @throws Error if the fetching fails or returns a non-200 status
 */
async function fetchJobPostingHtml(url: string): Promise<string> {
  try {
    // Set up timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    // Use a modern User-Agent to avoid being blocked
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      },
      redirect: 'follow',
      signal: controller.signal
    });
    
    // Clear the timeout if the request completes
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    throw new Error(`Failed to fetch job posting: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Escapes special characters in a string for use in a regular expression
 * 
 * @param str The string to escape
 * @returns A string with special regex characters escaped
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * Extracts key terms from text content
 * 
 * @param text The text content to analyze for key terms
 * @param additionalTerms Optional additional terms to look for beyond common skills
 * @returns An array of unique key terms found in the text
 */
function extractKeyTerms(text: string, additionalTerms: string[] = []): string[] {
  const commonSkills = [
    'javascript', 'typescript', 'python', 'java', 'c#', 'c\\+\\+', 'ruby', 'go', 'rust',
    'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'jenkins', 'git',
    'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'oracle', 'redis',
    'rest', 'graphql', 'api', 'microservices', 'serverless',
    'agile', 'scrum', 'kanban', 'jira', 'confluence',
    'leadership', 'management', 'teamwork', 'communication',
    // Government terms
    'federal', 'government', 'clearance', 'security', 'public sector',
    'state', 'local', 'municipality', 'policy', 'regulation',
    // State government specific terms
    'civil service', 'public administration', 'public policy', 'state agency',
    'rutan', 'public employment', 'state employment', 'hiring process',
    'central management services', 'cms', 'recruitment', 'human resources',
    'applicant tracking', 'selection process', 'interview panel', 'administrative',
    'program management', 'grant', 'grants management', 'procurement',
    'budget', 'fiscal', 'legislative', 'statutory', 'compliance'
  ];
  
  // Combine common skills with any additional terms
  const allTerms = [...commonSkills, ...additionalTerms];
  
  const terms: string[] = [];
  // Extract skills
  for (const skill of allTerms) {
    try {
      // Properly escape the skill for regex use
      const escapedSkill = skill.includes('\\') ? skill : escapeRegExp(skill);
      const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
      
      if (regex.test(text)) {
        // Store the original skill term without escaping
        const originalTerm = skill.replace(/\\\+/g, '+').replace(/\\/g, '');
        terms.push(originalTerm.toLowerCase());
      }
    } catch (error) {
      // Skip problematic patterns but log for debugging
      console.warn(`Skipping problematic term "${skill}": ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  return [...new Set(terms)]; // Remove duplicates
}

/**
 * Gets all text content from elements matching a selector
 * 
 * @param document The DOM document to query
 * @param selector The CSS selector to match elements
 * @returns An array of trimmed text content from matched elements
 */
function getTextFromElements(document: Document, selector: string): string[] {
  const elements = document.querySelectorAll(selector);
  return Array.from(elements).map(el => el.textContent?.trim()).filter(Boolean) as string[];
}

/**
 * Detects section headings in a document by looking for common heading patterns
 * 
 * @param document The DOM document to analyze
 * @returns An object mapping section types to their content elements
 */
function detectDocumentSections(document: Document): Record<string, Element[]> {
  const sectionMap: Record<string, Element[]> = {
    responsibilities: [],
    qualifications: [],
    requirements: [],
    skills: [],
    benefits: [],
    about: [],
    education: []
  };
  
  // Find all potential section headings
  const headers = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, strong, b'));
  
  for (const header of headers) {
    const text = header.textContent?.toLowerCase() || '';
    let sectionType: string | null = null;
    
    if (/responsib|duties|what you('ll)? do|role|functions|day to day/i.test(text)) {
      sectionType = 'responsibilities';
    } else if (/qualif|what you('ll)? need|experience|background/i.test(text)) {
      sectionType = 'qualifications';
    } else if (/requirements?|must have|essential/i.test(text)) {
      sectionType = 'requirements';
    } else if (/skills?|competenc|proficien|expertise/i.test(text)) {
      sectionType = 'skills';
    } else if (/benefits?|perks|offer|compensation|salary/i.test(text)) {
      sectionType = 'benefits';
    } else if (/about|company|who we are|our team/i.test(text)) {
      sectionType = 'about';
    } else if (/education|degree|academic|diploma/i.test(text)) {
      sectionType = 'education';
    }
    
    if (sectionType) {
      // Collect all sibling elements until the next heading
      let sibling = header.nextElementSibling;
      while (sibling && 
             !['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(sibling.tagName) &&
             !(sibling.tagName === 'STRONG' && sibling.textContent && sibling.textContent.length > 15)) {
        if (sibling.textContent?.trim()) {
          sectionMap[sectionType].push(sibling);
        }
        sibling = sibling.nextElementSibling;
      }
    }
  }
  
  return sectionMap;
}

/**
 * Extracts list items from a collection of elements
 * 
 * @param elements Array of DOM elements to extract list items from
 * @returns Array of text content from list items or paragraphs
 */
function extractListItemsFromElements(elements: Element[]): string[] {
  const items: string[] = [];
  
  for (const element of elements) {
    // If element is a list, extract all items
    if (element.tagName === 'UL' || element.tagName === 'OL') {
      const listItems = Array.from(element.querySelectorAll('li'))
        .map(li => li.textContent?.trim())
        .filter(Boolean) as string[];
      items.push(...listItems);
    } 
    // If element contains lists, extract those
    else if (element.querySelectorAll('ul, ol').length > 0) {
      const listItems = Array.from(element.querySelectorAll('li'))
        .map(li => li.textContent?.trim())
        .filter(Boolean) as string[];
      items.push(...listItems);
    }
    // Otherwise use the element's text if it's not too long (likely a paragraph)
    else if (element.textContent?.trim() && element.textContent.length < 200) {
      items.push(element.textContent.trim());
    }
  }
  
  return items;
}

/**
 * Parses LinkedIn job postings
 * 
 * @param document The DOM document of the LinkedIn job posting
 * @param url The original URL of the job posting
 * @returns Structured JobPostingAnalysis object with extracted information
 */
function parseLinkedInJob(document: Document, url: string): JobPostingAnalysis {
  const title = document.querySelector('.top-card-layout__title')?.textContent?.trim() || 'Unknown Position';
  const company = document.querySelector('.topcard__org-name-link')?.textContent?.trim() || 'Unknown Company';
  const location = document.querySelector('.topcard__flavor--bullet')?.textContent?.trim();
  
  // Extract job description
  const description = document.querySelector('.description__text')?.textContent || '';
  
  // Extract responsibilities and qualifications
  const sections = Array.from(document.querySelectorAll('.description__text > section'));
  
  let responsibilities: string[] = [];
  let qualifications: string[] = [];
  
  for (const section of sections) {
    const heading = section.querySelector('h3, h2')?.textContent?.toLowerCase() || '';
    const listItems = Array.from(section.querySelectorAll('li')).map(li => li.textContent?.trim()).filter(Boolean) as string[];
    
    if (heading.includes('responsib') || heading.includes('duties') || heading.includes('what you\'ll do')) {
      responsibilities = listItems;
    } else if (heading.includes('qualif') || heading.includes('require') || heading.includes('skills') || heading.includes('what you need')) {
      qualifications = listItems;
    }
  }
  
  // Extract skills from the description
  const keyTerms = extractKeyTerms(description);
  
  // Determine required vs desired skills
  const requiredSkills: string[] = [];
  const desiredSkills: string[] = [];
  
  // Try to find required vs preferred sections
  const descriptionLower = description.toLowerCase();
  const requiredSection = descriptionLower.indexOf('required');
  const preferredSection = descriptionLower.indexOf('preferred');
  
  for (const term of keyTerms) {
    if (requiredSection > -1 && preferredSection > -1) {
      const termIndex = descriptionLower.indexOf(term);
      if (termIndex > -1) {
        if (termIndex < preferredSection && termIndex > requiredSection) {
          requiredSkills.push(term);
        } else if (termIndex > preferredSection) {
          desiredSkills.push(term);
        }
      }
    } else {
      // If we can't clearly separate, put all in required
      requiredSkills.push(term);
    }
  }
  
  return {
    title,
    company,
    location,
    requiredSkills: requiredSkills.length > 0 ? requiredSkills : keyTerms,
    desiredSkills: desiredSkills.length > 0 ? desiredSkills : [],
    responsibilities,
    qualifications,
    keyTerms,
    source: {
      url,
      site: 'LinkedIn',
      fetchDate: new Date()
    }
  };
}

/**
 * Parses Indeed job postings
 * 
 * @param document The DOM document of the Indeed job posting
 * @param url The original URL of the job posting
 * @returns Structured JobPostingAnalysis object with extracted information
 */
function parseIndeedJob(document: Document, url: string): JobPostingAnalysis {
  const title = document.querySelector('.jobsearch-JobInfoHeader-title')?.textContent?.trim() || 'Unknown Position';
  const company = document.querySelector('.jobsearch-InlineCompanyRating-companyName')?.textContent?.trim() || 'Unknown Company';
  const location = document.querySelector('.jobsearch-JobInfoHeader-subtitle .jobsearch-JobInfoHeader-locationText')?.textContent?.trim();
  
  // Extract job description
  const description = document.querySelector('#jobDescriptionText')?.textContent || '';
  
  // Extract job type
  const jobType = Array.from(document.querySelectorAll('.jobsearch-JobDescriptionSection-sectionItem'))
    .find(item => item.textContent?.includes('Job Type'))
    ?.textContent?.replace('Job Type:', '')?.trim();
  
  // Extract responsibilities and qualifications
  let responsibilities: string[] = [];
  let qualifications: string[] = [];
  
  // Look for list items in the description
  const listItems = Array.from(document.querySelectorAll('#jobDescriptionText li')).map(li => li.textContent?.trim()).filter(Boolean) as string[];
  
  // Try to categorize list items by looking at preceding headers
  const headers = Array.from(document.querySelectorAll('#jobDescriptionText h2, #jobDescriptionText h3, #jobDescriptionText strong'));
  
  for (const header of headers) {
    const headerText = header.textContent?.toLowerCase() || '';
    if (headerText.includes('responsib') || headerText.includes('duties')) {
      let sibling = header.nextElementSibling;
      while (sibling && sibling.tagName !== 'H2' && sibling.tagName !== 'H3') {
        if (sibling.tagName === 'UL' || sibling.tagName === 'OL') {
          responsibilities = Array.from(sibling.querySelectorAll('li')).map(li => li.textContent?.trim()).filter(Boolean) as string[];
          break;
        }
        sibling = sibling.nextElementSibling;
      }
    } else if (headerText.includes('qualif') || headerText.includes('require') || headerText.includes('skills')) {
      let sibling = header.nextElementSibling;
      while (sibling && sibling.tagName !== 'H2' && sibling.tagName !== 'H3') {
        if (sibling.tagName === 'UL' || sibling.tagName === 'OL') {
          qualifications = Array.from(sibling.querySelectorAll('li')).map(li => li.textContent?.trim()).filter(Boolean) as string[];
          break;
        }
        sibling = sibling.nextElementSibling;
      }
    }
  }
  
  // If we couldn't categorize, use all list items as qualifications
  if (responsibilities.length === 0 && qualifications.length === 0 && listItems.length > 0) {
    qualifications = listItems;
  }
  
  // Extract skills from the description
  const keyTerms = extractKeyTerms(description);
  
  return {
    title,
    company,
    location,
    jobType,
    requiredSkills: keyTerms,
    responsibilities: responsibilities,
    qualifications: qualifications,
    keyTerms,
    source: {
      url,
      site: 'Indeed',
      fetchDate: new Date()
    }
  };
}

/**
 * Parses USAJobs job postings
 * 
 * @param document The DOM document of the USAJobs job posting
 * @param url The original URL of the job posting
 * @returns Structured JobPostingAnalysis object with extracted information
 */
function parseUSAJobsJob(document: Document, url: string): JobPostingAnalysis {
  const title = document.querySelector('.usajobs-joa-title')?.textContent?.trim() || 'Unknown Position';
  const agency = document.querySelector('.usajobs-joa-header--v1-5 .usajobs-joa-header--v1-5__agency')?.textContent?.trim() || 'Unknown Agency';
  const department = document.querySelector('.usajobs-joa-header--v1-5 .usajobs-joa-header--v1-5__department-name')?.textContent?.trim() || '';
  const company = department || agency;
  const location = document.querySelector('.usajobs-joa-header--v1-5 .usajobs-joa-header--v1-5__location')?.textContent?.trim();
  
  // Get salary range
  const salaryText = document.querySelector('.usajobs-joa-header--v1-5 .usajobs-joa-header--v1-5__salary')?.textContent?.trim() || '';
  const salaryMatch = salaryText.match(/\$([0-9,]+)(?:\s*-\s*\$([0-9,]+))?/);
  
  const salaryRange = salaryMatch ? {
    min: salaryMatch[1] ? parseInt(salaryMatch[1].replace(/,/g, ''), 10) : undefined,
    max: salaryMatch[2] ? parseInt(salaryMatch[2].replace(/,/g, ''), 10) : undefined,
    currency: 'USD',
    period: 'yearly'
  } : undefined;
  
  // Extract description, duties and requirements
  const description = document.querySelector('.usajobs-joa-section--duties')?.textContent || '';
  const requirementsText = document.querySelector('.usajobs-joa-section--requirements')?.textContent || '';
  
  const responsibilities = Array.from(document.querySelectorAll('.usajobs-joa-section--duties li, .usajobs-joa-section--duties p')).map(el => el.textContent?.trim()).filter(Boolean) as string[];
  
  // Get qualifications and requirements
  const qualificationsSection = document.querySelector('.usajobs-joa-section--requirements');
  const qualifications = qualificationsSection ? 
    Array.from(qualificationsSection.querySelectorAll('li, p')).map(el => el.textContent?.trim()).filter(Boolean) as string[] : [];

  // Extract education requirements
  const educationSection = document.querySelector('.usajobs-joa-section--requirements .usajobs-joa-sub-section:nth-child(2)');
  const educationRequirements = educationSection ?
    Array.from(educationSection.querySelectorAll('li, p')).map(el => el.textContent?.trim()).filter(Boolean) as string[] : [];

  // Extract key terms
  const fullText = document.body.textContent || '';
  const keyTerms = extractKeyTerms(fullText, [
    'federal', 'government', 'public service', 'clearance', 'GS', 'general schedule',
    'exempt', 'non-exempt', 'veteran', 'military', 'security clearance', 'public trust',
    'recruitment', 'training', 'development', 'personnel', 'workforce', 'staffing'
  ]);

  return {
    title,
    company,
    location,
    requiredSkills: keyTerms,
    responsibilities,
    qualifications,
    educationRequirements,
    keyTerms,
    source: {
      url,
      site: 'USAJobs',
      fetchDate: new Date()
    },
    salaryRange
  };
}

/**
 * Parses Monster job postings
 * 
 * @param document The DOM document of the Monster job posting
 * @param url The original URL of the job posting
 * @returns Structured JobPostingAnalysis object with extracted information
 */
function parseMonsterJob(document: Document, url: string): JobPostingAnalysis {
  const title = document.querySelector('.job-title')?.textContent?.trim() || 'Unknown Position';
  const company = document.querySelector('.company-name')?.textContent?.trim() || 'Unknown Company';
  const location = document.querySelector('.location')?.textContent?.trim();
  
  // Extract job type info
  const jobMetadata = Array.from(document.querySelectorAll('.job-metadata li'));
  const jobTypeEl = jobMetadata.find(el => el.innerHTML.includes('Employment Type'));
  const jobType = jobTypeEl?.textContent?.replace('Employment Type:', '')?.trim();

  // Extract experience level from the job description
  const jobSummary = document.querySelector('.job-description')?.textContent || '';
  const experienceLevelMatch = jobSummary.match(/(\d+)[+]?\s+years? of experience/i);
  const experienceLevel = experienceLevelMatch ? `${experienceLevelMatch[1]}+ years` : undefined;
  
  // Use section detection to find responsibilities and qualifications
  const sections = detectDocumentSections(document);
  
  const responsibilities = extractListItemsFromElements(sections.responsibilities);
  const qualifications = [
    ...extractListItemsFromElements(sections.qualifications),
    ...extractListItemsFromElements(sections.requirements)
  ];
  const educationRequirements = extractListItemsFromElements(sections.education);
  
  // Extract skills
  const keyTerms = extractKeyTerms(jobSummary);
  
  return {
    title,
    company,
    location,
    jobType,
    experienceLevel,
    requiredSkills: keyTerms,
    responsibilities,
    qualifications,
    educationRequirements,
    keyTerms,
    source: {
      url,
      site: 'Monster',
      fetchDate: new Date()
    }
  };
}

/**
 * Parses Glassdoor job postings
 * 
 * @param document The DOM document of the Glassdoor job posting
 * @param url The original URL of the job posting
 * @returns Structured JobPostingAnalysis object with extracted information
 */
function parseGlassdoorJob(document: Document, url: string): JobPostingAnalysis {
  const title = document.querySelector('[data-test="job-title"]')?.textContent?.trim() || 
                document.querySelector('.JobDetails_jobTitle__Unbyl')?.textContent?.trim() ||
                document.querySelector('h1')?.textContent?.trim() || 
                'Unknown Position';
  
  const company = document.querySelector('[data-test="employer-name"]')?.textContent?.trim() || 
                  document.querySelector('.EmployerProfile_employerName__Xemli')?.textContent?.trim() ||
                  document.querySelector('.css-87uc0g')?.textContent?.trim() || 
                  'Unknown Company';
  
  const location = document.querySelector('[data-test="location"]')?.textContent?.trim() || 
                   document.querySelector('.JobDetails_location__Y8R1n')?.textContent?.trim();
  
  // Try to find the job description
  const jobDescriptionSelector = '[data-test="jobDescriptionContent"], .JobDetails_jobDescription__6VeDR, .desc';
  const jobDescription = document.querySelector(jobDescriptionSelector)?.textContent || document.body.textContent || '';
  
  // Look for salary information
  const salaryText = document.querySelector('[data-test="salary"]')?.textContent || 
                      document.querySelector('.JobDetails_salaryEstimate__F81MQ')?.textContent || '';
  
  let salaryRange: JobPostingAnalysis['salaryRange'] = undefined;
  
  const salaryMatch = salaryText.match(/\$([0-9,.]+)K?\s*-\s*\$?([0-9,.]+)K?/i);
  if (salaryMatch) {
    const parseAmount = (str: string) => {
      let amount = parseFloat(str.replace(/[,$]/g, ''));
      if (str.toLowerCase().includes('k')) {
        amount *= 1000;
      }
      return amount;
    };
    
    salaryRange = {
      min: parseAmount(salaryMatch[1]),
      max: parseAmount(salaryMatch[2]),
      currency: 'USD',
      period: salaryText.toLowerCase().includes('hour') ? 'hourly' : 'yearly'
    };
  }
  
  // Extract experience level
  const experienceLevelMatch = jobDescription.match(/(\d+)[+]?\s+years?(?:\s+of)?\s+experience/i);
  const experienceLevel = experienceLevelMatch ? `${experienceLevelMatch[1]}+ years` : undefined;
  
  // Use section detection to find responsibilities and qualifications
  const sections = detectDocumentSections(document);
  
  const responsibilities = extractListItemsFromElements(sections.responsibilities);
  const qualifications = [
    ...extractListItemsFromElements(sections.qualifications),
    ...extractListItemsFromElements(sections.requirements),
    ...extractListItemsFromElements(sections.skills)
  ];
  const educationRequirements = extractListItemsFromElements(sections.education);
  
  // If no sections found through headers, look for bulleted lists
  if (responsibilities.length === 0 && qualifications.length === 0) {
    const lists = Array.from(document.querySelectorAll('ul, ol'));
    
    for (const list of lists) {
      const previousEl = list.previousElementSibling;
      const prevText = previousEl?.textContent?.toLowerCase() || '';
      
      const listItems = Array.from(list.querySelectorAll('li'))
        .map(li => li.textContent?.trim())
        .filter(Boolean) as string[];
      
      if (prevText.includes('responsib') || prevText.includes('duties') || prevText.includes('what you will do')) {
        responsibilities.push(...listItems);
      } else if (prevText.includes('qualif') || prevText.includes('requir') || prevText.includes('skills') || 
                 prevText.includes('experience') || prevText.includes('looking for')) {
        qualifications.push(...listItems);
      } else if (prevText.includes('education') || prevText.includes('degree')) {
        educationRequirements.push(...listItems);
      } else if (responsibilities.length === 0 && listItems.length > 0) {
        // If we haven't found responsibilities yet and this list doesn't have a clear header,
        // assume it might be responsibilities
        responsibilities.push(...listItems);
      } else if (qualifications.length === 0 && listItems.length > 0) {
        // If we haven't found qualifications yet, assume this list might be qualifications
        qualifications.push(...listItems);
      }
    }
  }
  
  // Extract key terms from the job description
  const keyTerms = extractKeyTerms(jobDescription);
  
  return {
    title,
    company,
    location,
    jobType: jobDescription.includes('full-time') ? 'Full-time' : 
             jobDescription.includes('part-time') ? 'Part-time' : 
             jobDescription.includes('contract') ? 'Contract' : undefined,
    experienceLevel,
    requiredSkills: keyTerms,
    responsibilities,
    qualifications,
    educationRequirements,
    keyTerms,
    source: {
      url,
      site: 'Glassdoor',
      fetchDate: new Date()
    },
    salaryRange
  };
}

/**
 * Generic parser for unknown job sites
 * Attempts to extract job information using common patterns and HTML structure
 * 
 * @param document The DOM document to analyze
 * @param url The original URL of the job posting
 * @returns Structured JobPostingAnalysis with best-effort extracted information
 */
function parseGenericJob(document: Document, url: string): JobPostingAnalysis {
  // Try to extract from page metadata first
  const metaTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
                    document.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
  
  // Then try standard heading elements
  const title = metaTitle || 
                document.querySelector('h1')?.textContent?.trim() ||
                document.querySelector('.job-title, .jobtitle, .position-title, .posting-title')?.textContent?.trim() ||
                document.title.replace(/\s*\|.*$/, '').trim() ||
                'Unknown Position';
  
  // Try to find company name
  const metaCompany = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
  const company = metaCompany ||
                 document.querySelector('.company-name, .employer, .org, [itemprop="hiringOrganization"]')?.textContent?.trim() ||
                 'Unknown Company';
  
  // Try to find location
  const location = document.querySelector('.location, .job-location, [itemprop="jobLocation"]')?.textContent?.trim();
  
  // Identify the main content area (likely to contain the job description)
  const mainContent = document.querySelector('main, #main, .main, #content, .content, article, .job-description, .jobsearch-JobComponent') || document.body;
  const fullText = mainContent.textContent || document.body.textContent || '';
  
  // Attempt to detect job type
  let jobType: string | undefined = undefined;
  if (fullText.match(/\bfull[ -]time\b/i)) jobType = 'Full-time';
  else if (fullText.match(/\bpart[ -]time\b/i)) jobType = 'Part-time';
  else if (fullText.match(/\bcontract(or)?\b/i)) jobType = 'Contract';
  else if (fullText.match(/\bfreelance\b/i)) jobType = 'Freelance';
  else if (fullText.match(/\bintern(ship)?\b/i)) jobType = 'Internship';
  
  // Extract experience level
  const experienceRegex = /(\d+)[+]?\s+years?(?:\s+of)?\s+experience/i;
  const experienceMatch = fullText.match(experienceRegex);
  const experienceLevel = experienceMatch ? `${experienceMatch[1]}+ years` : undefined;
  
  // Try to identify sections and their content
  const sections = detectDocumentSections(document);
  
  // Extract lists from the most likely content areas
  const lists = Array.from(mainContent.querySelectorAll('ul, ol'));
  
  // Process each list to determine if it contains responsibilities, qualifications, etc.
  let responsibilities: string[] = extractListItemsFromElements(sections.responsibilities);
  let qualifications: string[] = [
    ...extractListItemsFromElements(sections.qualifications),
    ...extractListItemsFromElements(sections.requirements),
    ...extractListItemsFromElements(sections.skills)
  ];
  const educationRequirements = extractListItemsFromElements(sections.education);
  
  // If section detection didn't find responsibilities or qualifications, try to infer from lists
  if (responsibilities.length === 0 || qualifications.length === 0) {
    for (const list of lists) {
      // Check if there's a header before this list that might indicate what it contains
      let headerEl = list.previousElementSibling;
      while (headerEl && !headerEl.textContent?.trim()) {
        headerEl = headerEl.previousElementSibling;
      }
      
      const headerText = headerEl?.textContent?.toLowerCase() || '';
      const listItems = Array.from(list.querySelectorAll('li'))
        .map(li => li.textContent?.trim())
        .filter(Boolean) as string[];
      
      if (listItems.length > 0) {
        if (headerText.match(/responsib|duties|functions|what you('ll)? do/i) && responsibilities.length === 0) {
          responsibilities = listItems;
        } else if (headerText.match(/qualif|requir|skills|experience|what you('ll)? need/i) && qualifications.length === 0) {
          qualifications = listItems;
        }
      }
    }
  }
  
  // If we still don't have responsibilities or qualifications, make an educated guess based on list content
  if (responsibilities.length === 0 && qualifications.length === 0 && lists.length > 0) {
    // First list might be responsibilities, second might be qualifications
    if (lists.length >= 2) {
      responsibilities = Array.from(lists[0].querySelectorAll('li'))
        .map(li => li.textContent?.trim())
        .filter(Boolean) as string[];
      
      qualifications = Array.from(lists[1].querySelectorAll('li'))
        .map(li => li.textContent?.trim())
        .filter(Boolean) as string[];
    } else if (lists.length === 1) {
      // If only one list, consider its items as qualifications
      qualifications = Array.from(lists[0].querySelectorAll('li'))
        .map(li => li.textContent?.trim())
        .filter(Boolean) as string[];
    }
  }
  
  // Extract key terms
  const keyTerms = extractKeyTerms(fullText);
  
  // Try to extract salary information using various patterns
  const salaryRegex = /\$([0-9,.]+)K?\s*(?:-|to|–)\s*\$?([0-9,.]+)K?/i;
  const salaryMatch = fullText.match(salaryRegex);
  
  let salaryRange: JobPostingAnalysis['salaryRange'] = undefined;
  
  if (salaryMatch) {
    const parseAmount = (str: string) => {
      let amount = parseFloat(str.replace(/[,$]/g, ''));
      if (str.toLowerCase().includes('k')) {
        amount *= 1000;
      }
      return amount;
    };
    
    salaryRange = {
      min: parseAmount(salaryMatch[1]),
      max: parseAmount(salaryMatch[2]),
      currency: 'USD',
      period: fullText.toLowerCase().includes('hour') ? 'hourly' : 'yearly'
    };
  }
  
  // Determine source site from URL
  const urlObj = new URL(url);
  const domain = urlObj.hostname.replace(/^www\./, '');
  
  return {
    title,
    company,
    location,
    jobType,
    experienceLevel,
    requiredSkills: keyTerms,
    responsibilities,
    qualifications,
    educationRequirements,
    keyTerms,
    source: {
      url,
      site: domain,
      fetchDate: new Date()
    },
    salaryRange
  };
}

/**
 * Detects if a job site has anti-bot measures active
 * 
 * @param document The DOM document to analyze
 * @returns Boolean indicating if anti-bot measures were detected
 */
/**
 * Detects if a job site has anti-bot measures active
 * 
 * @param document The DOM document to analyze
 * @returns Boolean indicating if anti-bot measures were detected
 */
function detectAntiBotMeasures(document: Document): boolean {
  // Check for common CAPTCHA providers and anti-bot measures
  const selectors = [
    // reCAPTCHA
    '.g-recaptcha',
    'iframe[src*="recaptcha"]',
    // hCaptcha
    '.h-captcha',
    'iframe[src*="hcaptcha"]',
    // Cloudflare
    'iframe[src*="cloudflare"]',
    '#challenge-form',
    // Common captcha text
    '#captcha',
    '.captcha',
    '[id*="captcha"]',
    '[class*="captcha"]'
  ];
  
  // Check if any anti-bot selectors are present
  for (const selector of selectors) {
    if (document.querySelector(selector)) {
      return true;
    }
  }
  
  // Check for anti-bot text in page
  const pageText = document.body.textContent?.toLowerCase() || '';
  const suspiciousTexts = [
    'bot detected',
    'automated access',
    'are you a robot',
    'suspicious activity',
    'unusual traffic',
    'security check',
    'please verify',
    'access denied'
  ];
  
  for (const text of suspiciousTexts) {
    if (pageText.includes(text)) {
      return true;
    }
  }
  
  // Not detected as anti-bot page
  return false;
}
