import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';
// Supported job sites with their parsing strategies
var JobSite;
(function (JobSite) {
    JobSite["LINKEDIN"] = "linkedin";
    JobSite["INDEED"] = "indeed";
    JobSite["USAJOBS"] = "usajobs";
    JobSite["MONSTER"] = "monster";
    JobSite["GLASSDOOR"] = "glassdoor";
    JobSite["GENERIC"] = "generic";
})(JobSite || (JobSite = {}));
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
// --- Parser Function Definitions (Moved above analyzeJobPosting) ---

/**
 * Extracts list items from a collection of elements
 */
function extractListItemsFromElements(elements) {
    const items = [];
    for (const element of elements) {
        if (element.tagName === 'UL' || element.tagName === 'OL') {
            const listItems = Array.from(element.querySelectorAll('li'))
                .map(li => li.textContent?.trim())
                .filter(Boolean);
            items.push(...listItems);
        }
        else if (element.querySelectorAll('ul, ol').length > 0) {
            const listItems = Array.from(element.querySelectorAll('li'))
                .map(li => li.textContent?.trim())
                .filter(Boolean);
            items.push(...listItems);
        }
        else if (element.textContent && element.textContent.trim().length > 0) {
            items.push(element.textContent.trim());
        }
    }
    return items;
}
/**
 * Parses LinkedIn job postings
 */
function parseLinkedInJob(document, url) {
    const title = document.querySelector('.top-card-layout__title')?.textContent?.trim()
        || document.querySelector('h1')?.textContent?.trim()
        || 'Unknown Position';
    const company = document.querySelector('.topcard__org-name-link')?.textContent?.trim()
        || document.querySelector('.topcard__flavor--metadata')?.textContent?.trim()
        || 'Unknown Company';
    const location = document.querySelector('.topcard__flavor--bullet')?.textContent?.trim()
        || document.querySelector('.topcard__flavor-row')?.textContent?.trim();
    const description = document.querySelector('.description__text')?.textContent?.trim() || '';
    const responsibilities = [];
    const qualifications = [];
    const keyTerms = extractKeyTerms(description);
    return {
        title, company, location, description, responsibilities, qualifications, keyTerms,
        requiredSkills: keyTerms, desiredSkills: [],
        source: { url, site: 'LinkedIn', fetchDate: new Date() }
    };
}
/**
 * Parses Indeed job postings
 */
function parseIndeedJob(document, url) {
    const title = document.querySelector('.jobsearch-JobInfoHeader-title')?.textContent?.trim() || 'Unknown Position';
    let company = document.querySelector('.jobsearch-InlineCompanyRating-companyName')?.textContent?.trim() || 'Unknown Company';
    const location = document.querySelector('.jobsearch-JobInfoHeader-subtitle .jobsearch-JobInfoHeader-locationText')?.textContent?.trim();
    const description = document.querySelector('#jobDescriptionText')?.textContent || '';
    const jobTypeElement = Array.from(document.querySelectorAll('.jobsearch-JobDescriptionSection-sectionItem'))
        .find(item => item.textContent?.includes('Job Type'));
    const jobType = jobTypeElement?.textContent?.replace('Job Type', '').trim();
    const sections = document.querySelectorAll('#jobDescriptionText > div, #jobDescriptionText > p');
    let responsibilities = [];
    let qualifications = [];
    sections.forEach(section => {
        const textContent = section.textContent?.trim() || '';
        if (textContent.toLowerCase().startsWith('responsibilities') || textContent.toLowerCase().startsWith('duties')) {
            responsibilities = extractListItemsFromElements(Array.from(section.querySelectorAll('li, p')));
        }
        else if (textContent.toLowerCase().startsWith('qualifications') || textContent.toLowerCase().startsWith('requirements')) {
            qualifications = extractListItemsFromElements(Array.from(section.querySelectorAll('li, p')));
        }
    });
    if (company.includes('|')) {
        const parts = company.split('|').map(s => s.trim());
        if (parts[parts.length - 1]?.length > 1)
            company = parts[parts.length - 1];
    }
    if (company.toLowerCase().includes(' at ')) {
        company = company.split(' at ').pop()?.trim() || company;
    }
    const keyTerms = extractKeyTerms(description);
    return {
        title, company, location, description, jobType,
        responsibilities: responsibilities.length ? responsibilities : [],
        qualifications: qualifications.length ? qualifications : [],
        keyTerms, requiredSkills: keyTerms, desiredSkills: [],
        source: { url, site: 'Indeed', fetchDate: new Date() }
    };
}
/**
 * Parses USAJobs job postings
 */
function parseUSAJobsJob(document, url) {
    const title = document.querySelector('#job-title')?.textContent?.trim() || 'Unknown Position';
    let company = document.querySelector('.usajobs-joa-banner__agency')?.textContent?.trim() || 'Unknown Agency';
    const locationNodes = document.querySelectorAll('.usajobs-joa-locations__list-item');
    const locations = Array.from(locationNodes).map(node => node.textContent?.trim()).filter(Boolean);
    const location = locations.join('; ');
    const description = document.querySelector('.usajobs-joa-section--summary .usajobs-joa-section__body')?.textContent?.trim() || '';
    const getSectionContent = (id) => {
        const sectionBody = document.querySelector(`#${id} .usajobs-joa-section__body`);
        return extractListItemsFromElements(Array.from(sectionBody?.querySelectorAll('p, li') || []));
    };
    const responsibilities = getSectionContent('duties');
    const qualifications = getSectionContent('qualifications');
    if (!company.includes('Department of'))
        company = `${company}, U.S. Federal Government`;
    const keyTerms = extractKeyTerms(description + responsibilities.join(' ') + qualifications.join(' '));
    return {
        title, company, location, description, responsibilities, qualifications, keyTerms,
        requiredSkills: keyTerms, desiredSkills: [],
        source: { url, site: 'USAJobs', fetchDate: new Date() }
    };
}
/**
 * Parses Monster job postings
 */
function parseMonsterJob(document, url) {
    const title = document.querySelector('h1.job_title')?.textContent?.trim() || 'Unknown Position';
    const company = document.querySelector('.h_subtitle a')?.textContent?.trim() || 'Unknown Company';
    const location = document.querySelector('.location')?.textContent?.trim();
    const description = document.querySelector('#JobDescription')?.textContent?.trim() || '';
    const responsibilities = [];
    const qualifications = [];
    const keyTerms = extractKeyTerms(description);
    return {
        title, company, location, description, responsibilities, qualifications, keyTerms,
        requiredSkills: keyTerms, desiredSkills: [],
        source: { url, site: 'Monster', fetchDate: new Date() }
    };
}
/**
 * Parses Glassdoor job postings
 */
function parseGlassdoorJob(document, url) {
    const title = document.querySelector('[data-test="jobTitle"]')?.textContent?.trim() || 'Unknown Position';
    const company = document.querySelector('[data-test="employerName"]')?.textContent?.trim() || 'Unknown Company';
    const location = document.querySelector('[data-test="location"]')?.textContent?.trim();
    const description = document.querySelector('#JobDescriptionContainer')?.textContent?.trim() || '';
    const jobDescription = description; // Use consistent variable name
    const responsibilities = []; // Simplified
    const qualifications = []; // Simplified
    const keyTerms = extractKeyTerms(jobDescription);
    // Glassdoor salary parsing logic (previously misplaced)
    let salaryRange = undefined;
    const salaryText = document.querySelector('[data-test="detailSalary"]')?.textContent || '';
    const salaryRegex = /\$([0-9,.]+)K?\s*(?:-|to|–)\s*\$?([0-9,.]+)K?/i;
    const salaryMatch = salaryText.match(salaryRegex);
    if (salaryMatch) {
        const parseAmount = (str) => {
            let amount = parseFloat(str.replace(/[,$]/g, ''));
            if (str.toLowerCase().includes('k'))
                amount *= 1000;
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
        title, company, location, description, responsibilities, qualifications, keyTerms,
        requiredSkills: keyTerms, desiredSkills: [], educationRequirements, experienceLevel, salaryRange,
        source: { url, site: 'Glassdoor', fetchDate: new Date() }
    };
}
/**
 * Parses Generic job postings
 */
function parseGenericJob(document, url) {
    const title = document.querySelector('h1')?.textContent?.trim() || document.querySelector('.job-title')?.textContent?.trim() || document.title.split('|')[0].trim() || 'Unknown Position';
    let company = document.querySelector('.company-name')?.textContent?.trim() || document.querySelector('.employer')?.textContent?.trim() || document.querySelector('.job-company')?.textContent?.trim() || 'Unknown Company';
    const location = document.querySelector('.location')?.textContent?.trim() || document.querySelector('.job-location')?.textContent?.trim();
    const description = document.querySelector('.job-description')?.textContent?.trim() || document.querySelector('#job-details')?.textContent?.trim() || document.querySelector('article')?.textContent?.trim() || '';
    const paragraphs = Array.from(document.querySelectorAll('p, li'));
    let responsibilities = [];
    let qualifications = [];
    paragraphs.forEach(p => {
        const text = p.textContent?.toLowerCase() || '';
        if (text.includes('responsibilities') || text.includes('duties'))
            responsibilities.push(p.textContent?.trim() || '');
        else if (text.includes('qualifications') || text.includes('requirements') || text.includes('skills'))
            qualifications.push(p.textContent?.trim() || '');
    });
    if (company.includes('|')) {
        const parts = company.split('|').map(s => s.trim());
        if (parts[parts.length - 1]?.length > 1)
            company = parts[parts.length - 1];
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
        title, company, location, description,
        responsibilities: responsibilities.filter(r => r.length > 10),
        qualifications: qualifications.filter(q => q.length > 10),
        keyTerms, requiredSkills: keyTerms, desiredSkills: [],
        source: { url, site: domain, fetchDate: new Date() }
    };
}
// --- Main analyzeJobPosting function ---
/**
 * Analyzes a job posting URL and extracts relevant information
 */
export async function analyzeJobPosting(url, options) {
    try {
        if (!options?.skipRateLimiting)
            await applyRateLimit();
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
    }
    catch (error) {
        throw new Error(`Failed to analyze job posting: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Identifies which job site the URL belongs to
 */
function identifyJobSite(url) {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('linkedin.com'))
        return JobSite.LINKEDIN;
    if (urlLower.includes('indeed.com'))
        return JobSite.INDEED;
    if (urlLower.includes('usajobs.gov'))
        return JobSite.USAJOBS;
    if (urlLower.includes('monster.com'))
        return JobSite.MONSTER;
    if (urlLower.includes('glassdoor.com'))
        return JobSite.GLASSDOOR;
    return JobSite.GENERIC;
}
/**
/**
 * Applies rate limiting to prevent overloading job sites
 * Waits if necessary to maintain the specified request rate
 */
async function applyRateLimit() {
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
async function fetchJobPostingHtml(url) {
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
    }
    catch (error) {
        throw new Error(`Failed to fetch job posting: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Escapes special characters in a string for use in a regular expression
 *
 * @param str The string to escape
 * @returns A string with special regex characters escaped
 */
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
/**
 * Extracts key terms from text content
 *
 * @param text The text content to analyze for key terms
 * @param additionalTerms Optional additional terms to look for beyond common skills
 * @returns An array of unique key terms found in the text
 */
export function extractKeyTerms(text, additionalTerms = []) {
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
    const terms = [];
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
        }
        catch (error) {
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
function getTextFromElements(document, selector) {
    const elements = document.querySelectorAll(selector);
    return Array.from(elements).map(el => el.textContent?.trim()).filter(Boolean);
}
/**
 * Detects section headings in a document by looking for common heading patterns
 *
 * @param document The DOM document to analyze
 * @returns An object mapping section types to their content elements
 */
function detectDocumentSections(document) {
    const sectionMap = {
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
        let sectionType = null;
        if (/responsib|duties|what you('ll)? do|role|functions|day to day/i.test(text)) {
            sectionType = 'responsibilities';
        }
        else if (/qualif|what you('ll)? need|experience|background/i.test(text)) {
            sectionType = 'qualifications';
        }
        else if (/requirements?|must have|essential/i.test(text)) {
            sectionType = 'requirements';
        }
        else if (/skills?|competenc|proficien|expertise/i.test(text)) {
            sectionType = 'skills';
        }
        else if (/benefits?|perks|offer|compensation|salary/i.test(text)) {
            sectionType = 'benefits';
        }
        else if (/about|company|who we are|our team/i.test(text)) {
            sectionType = 'about';
        }
        else if (/education|degree|academic|diploma/i.test(text)) {
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
// --- Parser Functions (moved above analyzeJobPosting) ---
/**
 * Extracts list items from a collection of elements
 * @param elements Array of DOM elements to extract list items from
 * @returns Array of text content from list items or paragraphs
 */
function extractListItemsFromElements(elements) {
    const items = [];
    for (const element of elements) {
        // If element is a list, extract its items
        if (element.tagName === 'UL' || element.tagName === 'OL') {
            const listItems = Array.from(element.querySelectorAll('li'))
                .map(li => li.textContent?.trim())
                .filter(Boolean);
            items.push(...listItems);
        }
        // If element contains lists, extract those as well
        else if (element.querySelectorAll('ul, ol').length > 0) {
            const listItems = Array.from(element.querySelectorAll('li'))
                .map(li => li.textContent?.trim())
                .filter(Boolean);
            items.push(...listItems);
        }
        // Otherwise, if it's a paragraph or standalone with text
        else if (element.textContent && element.textContent.trim().length > 0) {
            items.push(element.textContent.trim());
        }
    }
    return items;
}
/**
 * Parses LinkedIn job postings
 */
function parseLinkedInJob(document, url) {
    const title = document.querySelector('.top-card-layout__title')?.textContent?.trim()
        || document.querySelector('h1')?.textContent?.trim()
        || 'Unknown Position';
    const company = document.querySelector('.topcard__org-name-link')?.textContent?.trim()
        || document.querySelector('.topcard__flavor--metadata')?.textContent?.trim()
        || 'Unknown Company';
    const location = document.querySelector('.topcard__flavor--bullet')?.textContent?.trim()
        || document.querySelector('.topcard__flavor-row')?.textContent?.trim();
    const description = document.querySelector('.description__text')?.textContent?.trim() || '';
    // For now, leave responsibilities and qualifications empty.
    const responsibilities = [];
    const qualifications = [];
    // Extract skills/key terms from the description.
    const keyTerms = extractKeyTerms(description);
    return {
        title,
        company,
        location,
        description,
        responsibilities,
        qualifications,
        keyTerms,
        requiredSkills: keyTerms,
        desiredSkills: [],
        source: {
            url,
            site: 'LinkedIn',
            fetchDate: new Date()
        }
    };
}
/**
 * Parses Indeed job postings
 */
function parseIndeedJob(document, url) {
    const title = document.querySelector('.jobsearch-JobInfoHeader-title')?.textContent?.trim() || 'Unknown Position';
    let company = document.querySelector('.jobsearch-InlineCompanyRating-companyName')?.textContent?.trim() || 'Unknown Company';
    const location = document.querySelector('.jobsearch-JobInfoHeader-subtitle .jobsearch-JobInfoHeader-locationText')?.textContent?.trim();
    // Extract job description
    const description = document.querySelector('#jobDescriptionText')?.textContent || '';
    // Extract job type
    const jobTypeElement = Array.from(document.querySelectorAll('.jobsearch-JobDescriptionSection-sectionItem'))
        .find(item => item.textContent?.includes('Job Type'));
    const jobType = jobTypeElement?.textContent?.replace('Job Type', '').trim();
    // Extract responsibilities and qualifications (simplified)
    const sections = document.querySelectorAll('#jobDescriptionText > div, #jobDescriptionText > p');
    let responsibilities = [];
    let qualifications = [];
    sections.forEach(section => {
        const textContent = section.textContent?.trim() || '';
        if (textContent.toLowerCase().startsWith('responsibilities') || textContent.toLowerCase().startsWith('duties')) {
            responsibilities = extractListItemsFromElements(Array.from(section.querySelectorAll('li, p')));
        }
        else if (textContent.toLowerCase().startsWith('qualifications') || textContent.toLowerCase().startsWith('requirements')) {
            qualifications = extractListItemsFromElements(Array.from(section.querySelectorAll('li, p')));
        }
    });
    // Post-process company name
    if (company.includes('|')) {
        const parts = company.split('|').map(s => s.trim());
        if (parts[parts.length - 1] && parts[parts.length - 1].length > 1) {
            company = parts[parts.length - 1];
        }
    }
    if (company.toLowerCase().includes(' at ')) {
        company = company.split(' at ').pop()?.trim() || company;
    }
    const keyTerms = extractKeyTerms(description);
    return {
        title,
        company,
        location,
        description,
        jobType,
        responsibilities: responsibilities.length ? responsibilities : [],
        qualifications: qualifications.length ? qualifications : [],
        keyTerms,
        requiredSkills: keyTerms,
        desiredSkills: [],
        source: { url, site: 'Indeed', fetchDate: new Date() }
    };
}
/**
 * Parses USAJobs job postings
 */
function parseUSAJobsJob(document, url) {
    const title = document.querySelector('#job-title')?.textContent?.trim() || 'Unknown Position';
    let company = document.querySelector('.usajobs-joa-banner__agency')?.textContent?.trim() || 'Unknown Agency';
    const locationNodes = document.querySelectorAll('.usajobs-joa-locations__list-item');
    const locations = Array.from(locationNodes).map(node => node.textContent?.trim()).filter(Boolean);
    const location = locations.join('; ');
    const description = document.querySelector('.usajobs-joa-section--summary .usajobs-joa-section__body')?.textContent?.trim() || '';
    const getSectionContent = (id) => {
        const sectionBody = document.querySelector(`#${id} .usajobs-joa-section__body`);
        return extractListItemsFromElements(Array.from(sectionBody?.querySelectorAll('p, li') || []));
    };
    const responsibilities = getSectionContent('duties');
    const qualifications = getSectionContent('qualifications');
    // Post-process company name for government structure
    if (company.includes('Department of')) {
        // Keep full name for federal agency
    }
    else {
        company = `${company}, U.S. Federal Government`;
    }
    const keyTerms = extractKeyTerms(description + responsibilities.join(' ') + qualifications.join(' '));
    return {
        title,
        company,
        location,
        description,
        responsibilities,
        qualifications,
        keyTerms,
        requiredSkills: keyTerms, // Simplified for now
        desiredSkills: [],
        source: { url, site: 'USAJobs', fetchDate: new Date() }
    };
}
/**
 * Parses Monster job postings
 */
function parseMonsterJob(document, url) {
    const title = document.querySelector('h1.job_title')?.textContent?.trim() || 'Unknown Position';
    const company = document.querySelector('.h_subtitle a')?.textContent?.trim() || 'Unknown Company';
    const location = document.querySelector('.location')?.textContent?.trim();
    const description = document.querySelector('#JobDescription')?.textContent?.trim() || '';
    // Monster structure is less predictable, simple extraction
    const responsibilities = [];
    const qualifications = [];
    const keyTerms = extractKeyTerms(description);
    return {
        title,
        company,
        location,
        description,
        responsibilities,
        qualifications,
        keyTerms,
        requiredSkills: keyTerms,
        desiredSkills: [],
        source: { url, site: 'Monster', fetchDate: new Date() }
    };
}
/**
 * Parses Glassdoor job postings
 */
function parseGlassdoorJob(document, url) {
    const title = document.querySelector('[data-test="jobTitle"]')?.textContent?.trim() || 'Unknown Position';
    const company = document.querySelector('[data-test="employerName"]')?.textContent?.trim() || 'Unknown Company';
    const location = document.querySelector('[data-test="location"]')?.textContent?.trim();
    const description = document.querySelector('#JobDescriptionContainer')?.textContent?.trim() || '';
    // Simplified extraction for Glassdoor
    const responsibilities = [];
    const qualifications = [];
    const keyTerms = extractKeyTerms(description);
    return {
        title,
        company,
        location,
        description,
        responsibilities,
        qualifications,
        keyTerms,
        requiredSkills: keyTerms,
        desiredSkills: [],
        source: { url, site: 'Glassdoor', fetchDate: new Date() }
    };
}
/**
 * Parses Generic job postings
 */
function parseGenericJob(document, url) {
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
    let responsibilities = [];
    let qualifications = [];
    paragraphs.forEach(p => {
        const text = p.textContent?.toLowerCase() || '';
        if (text.includes('responsibilities') || text.includes('duties')) {
            responsibilities.push(p.textContent?.trim() || '');
        }
        else if (text.includes('qualifications') || text.includes('requirements') || text.includes('skills')) {
            qualifications.push(p.textContent?.trim() || '');
        }
    });
    // Post-process company name
    if (company.includes('|')) {
        const parts = company.split('|').map(s => s.trim());
        if (parts[parts.length - 1] && parts[parts.length - 1].length > 1) {
            company = parts[parts.length - 1];
        }
    }
    if (company.toLowerCase().includes(' at ')) {
        company = company.split(' at ').pop()?.trim() || company;
    }
    // If company looks like the title, try to get it from page title
    if (company === title && document.title.includes('|')) {
        company = document.title.split('|').pop()?.trim() || company;
    }
    const keyTerms = extractKeyTerms(description + responsibilities.join(' ') + qualifications.join(' '));
    return {
        title,
        company,
        location,
        description,
        responsibilities: responsibilities.filter(r => r.length > 10), // Filter out short lines
        qualifications: qualifications.filter(q => q.length > 10),
        keyTerms,
        requiredSkills: keyTerms,
        desiredSkills: [],
        source: { url, site: 'Generic', fetchDate: new Date() }
    };
}
// --- End Parser Functions ---
// This block should already be moved above analyzeJobPosting. 
// No changes needed here if the previous step was applied correctly.
let amount = parseFloat(str.replace(/[,$]/g, ''));
if (str.toLowerCase().includes('k')) {
    amount *= 1000;
}
return amount;
;
salaryRange = {
    min: parseAmount(salaryMatch[1]),
    max: parseAmount(salaryMatch[2]),
    currency: 'USD',
    period: salaryText.toLowerCase().includes('hour') ? 'hourly' : 'yearly'
};
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
            .filter(Boolean);
        if (prevText.includes('responsib') || prevText.includes('duties') || prevText.includes('what you will do')) {
            responsibilities.push(...listItems);
        }
        else if (prevText.includes('qualif') || prevText.includes('requir') || prevText.includes('skills') ||
            prevText.includes('experience') || prevText.includes('looking for')) {
            qualifications.push(...listItems);
        }
        else if (prevText.includes('education') || prevText.includes('degree')) {
            educationRequirements.push(...listItems);
        }
        else if (responsibilities.length === 0 && listItems.length > 0) {
            // If we haven't found responsibilities yet and this list doesn't have a clear header,
            // assume it might be responsibilities
            responsibilities.push(...listItems);
        }
        else if (qualifications.length === 0 && listItems.length > 0) {
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
/**
 * Generic parser for unknown job sites
 * Attempts to extract job information using common patterns and HTML structure
 *
 * @param document The DOM document to analyze
 * @param url The original URL of the job posting
 * @returns Structured JobPostingAnalysis with best-effort extracted information
 */
function parseGenericJob(document, url) {
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
    let jobType = undefined;
    if (fullText.match(/\bfull[ -]time\b/i))
        jobType = 'Full-time';
    else if (fullText.match(/\bpart[ -]time\b/i))
        jobType = 'Part-time';
    else if (fullText.match(/\bcontract(or)?\b/i))
        jobType = 'Contract';
    else if (fullText.match(/\bfreelance\b/i))
        jobType = 'Freelance';
    else if (fullText.match(/\bintern(ship)?\b/i))
        jobType = 'Internship';
    // Extract experience level
    const experienceRegex = /(\d+)[+]?\s+years?(?:\s+of)?\s+experience/i;
    const experienceMatch = fullText.match(experienceRegex);
    const experienceLevel = experienceMatch ? `${experienceMatch[1]}+ years` : undefined;
    // Try to identify sections and their content
    const sections = detectDocumentSections(document);
    // Extract lists from the most likely content areas
    const lists = Array.from(mainContent.querySelectorAll('ul, ol'));
    // Process each list to determine if it contains responsibilities, qualifications, etc.
    let responsibilities = extractListItemsFromElements(sections.responsibilities);
    let qualifications = [
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
                .filter(Boolean);
            if (listItems.length > 0) {
                if (headerText.match(/responsib|duties|functions|what you('ll)? do/i) && responsibilities.length === 0) {
                    responsibilities = listItems;
                }
                else if (headerText.match(/qualif|requir|skills|experience|what you('ll)? need/i) && qualifications.length === 0) {
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
                .filter(Boolean);
            qualifications = Array.from(lists[1].querySelectorAll('li'))
                .map(li => li.textContent?.trim())
                .filter(Boolean);
        }
        else if (lists.length === 1) {
            // If only one list, consider its items as qualifications
            qualifications = Array.from(lists[0].querySelectorAll('li'))
                .map(li => li.textContent?.trim())
                .filter(Boolean);
        }
    }
    // Extract key terms
    const keyTerms = extractKeyTerms(fullText);
    // Try to extract salary information using various patterns
    const salaryRegex = /\$([0-9,.]+)K?\s*(?:-|to|–)\s*\$?([0-9,.]+)K?/i;
    const salaryMatch = fullText.match(salaryRegex);
    let salaryRange = undefined;
    if (salaryMatch) {
        const parseAmount = (str) => {
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
function detectAntiBotMeasures(document) {
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
//# sourceMappingURL=job-analyzer.js.map