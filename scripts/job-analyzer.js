import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs/promises';
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
 * Applies rate limiting to prevent overloading job sites
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
 */
async function fetchJobPostingHtml(url) {
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
        if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);
        return await response.text();
    }
    catch (error) {
        throw new Error(`Failed to fetch job posting: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Escapes special characters in a string for use in a regular expression
 */
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
/**
 * Extracts key terms from text content
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
    const terms = [];
    for (const skill of allTerms) {
        try {
            const escapedSkill = skill.includes('\\') ? skill : escapeRegExp(skill);
            const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
            if (regex.test(text)) {
                const originalTerm = skill.replace(/\\\+/g, '+').replace(/\\/g, '');
                terms.push(originalTerm.toLowerCase());
            }
        }
        catch (error) {
            console.warn(`Skipping problematic term "${skill}": ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    return [...new Set(terms)];
}
/**
 * Gets all text content from elements matching a selector
 */
function getTextFromElements(document, selector) {
    const elements = document.querySelectorAll(selector);
    return Array.from(elements).map(el => el.textContent?.trim()).filter(Boolean);
}
/**
 * Detects section headings in a document by looking for common heading patterns
 */
function detectDocumentSections(document) {
    const sectionMap = {
        responsibilities: [], qualifications: [], requirements: [], skills: [],
        benefits: [], about: [], education: []
    };
    const headers = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, strong, b'));
    for (const header of headers) {
        const text = header.textContent?.toLowerCase() || '';
        let sectionType = null;
        if (/responsib|duties|what you('ll)? do|role|functions|day to day/i.test(text))
            sectionType = 'responsibilities';
        else if (/qualif|what you('ll)? need|experience|background/i.test(text))
            sectionType = 'qualifications';
        else if (/requirements?|must have|essential/i.test(text))
            sectionType = 'requirements';
        else if (/skills?|competenc|proficien|expertise/i.test(text))
            sectionType = 'skills';
        else if (/benefits?|perks|offer|compensation|salary/i.test(text))
            sectionType = 'benefits';
        else if (/about|company|who we are|our team/i.test(text))
            sectionType = 'about';
        else if (/education|degree|academic|diploma/i.test(text))
            sectionType = 'education';
        if (sectionType) {
            let sibling = header.nextElementSibling;
            while (sibling && !['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(sibling.tagName) && !(sibling.tagName === 'STRONG' && sibling.textContent && sibling.textContent.length > 15)) {
                if (sibling.textContent?.trim())
                    sectionMap[sectionType].push(sibling);
                sibling = sibling.nextElementSibling;
            }
        }
    }
    return sectionMap;
}
// Added parseLinkedInJob definition here
/**
 * Parses LinkedIn job postings
 */
function parseLinkedInJob(document, url) {
    const title = document.querySelector('.top-card-layout__title')?.textContent?.trim() || document.querySelector('h1')?.textContent?.trim() || 'Unknown Position';
    const company = document.querySelector('.topcard__org-name-link')?.textContent?.trim() || document.querySelector('.topcard__flavor--metadata')?.textContent?.trim() || 'Unknown Company';
    const location = document.querySelector('.topcard__flavor--bullet')?.textContent?.trim() || document.querySelector('.topcard__flavor-row')?.textContent?.trim();
    const descriptionText = document.querySelector('.description__text')?.textContent?.trim() || '';
    const responsibilities = [];
    const qualifications = [];
    const keyTerms = extractKeyTerms(descriptionText);

    return {
        title,
        company,
        location,
        responsibilities,
        qualifications,
        keyTerms,
        requiredSkills: keyTerms,
        desiredSkills: [],
        source: { url, site: 'LinkedIn', fetchDate: new Date() }
    };
}
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
        else if (element.textContent && element.textContent.trim().length > 0) {
            items.push(element.textContent.trim());
        }
    }
    return items;
}
/**
 * Parses Indeed job postings
 */
function parseIndeedJob(document, url) {
    const title = document.querySelector('.jobsearch-JobInfoHeader-title')?.textContent?.trim() || 'Unknown Position';
    const company = document.querySelector('.jobsearch-InlineCompanyRating-companyName')?.textContent?.trim() || 'Unknown Company';
    const location = document.querySelector('.jobsearch-JobInfoHeader-subtitle .jobsearch-JobInfoHeader-locationText')?.textContent?.trim();
    const description = document.querySelector('#jobDescriptionText')?.textContent || '';
    const jobTypeElement = Array.from(document.querySelectorAll('.jobsearch-JobDescriptionSection-sectionItem'))
        .find(item => item.textContent?.includes('Job Type'));
    const jobType = jobTypeElement?.textContent?.replace('Job Type', '').trim();
    const sections = document.querySelectorAll('#jobDescriptionText > div, #jobDescriptionText > p');
    const responsibilities = [];
    const qualifications = [];

    sections.forEach(section => {
        const textContent = section.textContent?.trim() || '';
        if (textContent.toLowerCase().startsWith('responsibilities') || textContent.toLowerCase().startsWith('duties')) {
            responsibilities.push(...extractListItemsFromElements(Array.from(section.querySelectorAll('li, p'))));
        }
        else if (textContent.toLowerCase().startsWith('qualifications') || textContent.toLowerCase().startsWith('requirements')) {
            qualifications.push(...extractListItemsFromElements(Array.from(section.querySelectorAll('li, p'))));
        }
    });

    const keyTerms = extractKeyTerms(description);

    return {
        title,
        company,
        location,
        jobType,
        responsibilities,
        qualifications,
        keyTerms,
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
        title, company, location, // description, // Removed to match interface
        responsibilities, qualifications, keyTerms,
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
        title, company, location, // description, // Removed to match interface
        responsibilities, qualifications, keyTerms,
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
    // --- Detailed Glassdoor Parsing Logic ---
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
                .map(li => li.textContent?.trim()).filter(Boolean);
            if (prevText.includes('responsib') || prevText.includes('duties') || prevText.includes('what you will do')) {
                responsibilities.push(...listItems);
            }
            else if (prevText.includes('qualif') || prevText.includes('requir') || prevText.includes('skills') || prevText.includes('experience') || prevText.includes('looking for')) {
                qualifications.push(...listItems);
            }
            else if (prevText.includes('education') || prevText.includes('degree')) {
                educationRequirements.push(...listItems);
            }
            else if (responsibilities.length === 0 && listItems.length > 0) {
                responsibilities.push(...listItems);
            }
            else if (qualifications.length === 0 && listItems.length > 0) {
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
function parseGenericJob(document, url) {
    // Try multiple selectors for title
    const title = document.querySelector('h1')?.textContent?.trim() ||
        document.querySelector('[data-test="job-title"]')?.textContent?.trim() ||
        document.querySelector('.job-title')?.textContent?.trim() ||
        document.querySelector('[class*="title" i]')?.textContent?.trim() ||
        document.querySelector('[id*="title" i]')?.textContent?.trim() ||
        document.title.split('|')[0].trim() ||
        'Unknown Position';

    // Try multiple selectors for company
    const company = document.querySelector('h2')?.textContent?.trim() ||
        document.querySelector('[data-test="employer"]')?.textContent?.trim() ||
        document.querySelector('.company-name')?.textContent?.trim() ||
        document.querySelector('[class*="company" i]')?.textContent?.trim() ||
        document.querySelector('[id*="company" i]')?.textContent?.trim() ||
        'Unknown Company';

    // Try multiple selectors for location
    const location = document.querySelector('h3')?.textContent?.trim() ||
        document.querySelector('[data-test="location"]')?.textContent?.trim() ||
        document.querySelector('.location')?.textContent?.trim() ||
        document.querySelector('[class*="location" i]')?.textContent?.trim() ||
        document.querySelector('[id*="location" i]')?.textContent?.trim();

    // Get all text content for analysis
    const fullText = document.body.textContent || '';
    
    // Extract sections using common patterns
    const sections = detectDocumentSections(document);
    
    // Get responsibilities from multiple sources
    const responsibilities = [
        ...extractListItemsFromElements(sections.responsibilities),
        ...Array.from(document.querySelectorAll('ul li, ol li')).filter(li => {
            const text = li.textContent?.toLowerCase() || '';
            return text.includes('responsible') || text.includes('duties') || text.includes('will');
        }).map(li => li.textContent?.trim()).filter(Boolean)
    ];

    // Get qualifications from multiple sources
    const qualifications = [
        ...extractListItemsFromElements(sections.requirements),
        ...extractListItemsFromElements(sections.qualifications),
        ...Array.from(document.querySelectorAll('ul li, ol li')).filter(li => {
            const text = li.textContent?.toLowerCase() || '';
            return text.includes('require') || text.includes('qualif') || text.includes('must have');
        }).map(li => li.textContent?.trim()).filter(Boolean)
    ];

    // Extract key terms
    const keyTerms = extractKeyTerms(fullText, [
        'patient', 'healthcare', 'medical', 'clinical', 'hospital',
        'registration', 'scheduling', 'insurance', 'billing', 'hipaa',
        'customer service', 'patient care', 'electronic health record',
        'ehr', 'emr', 'epic', 'cerner', 'meditech'
    ]);

    return {
        title,
        company,
        location,
        responsibilities,
        qualifications,
        keyTerms,
        source: { url, site: 'Generic', fetchDate: new Date() }
    };
}
// --- Main analyzeJobPosting function ---
async function extractFullDescription(document) {
    console.log('Extracting full description...');
    
    // Try to find the JSON-LD script tag containing job data
    const scriptTags = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scriptTags) {
        try {
            const jobData = JSON.parse(script.textContent);
            if (jobData['@type'] === 'JobPosting') {
                console.log('Found job data in JSON-LD');
                return {
                    title: jobData.title,
                    description: jobData.description,
                    responsibilities: jobData.responsibilities,
                    qualifications: jobData.qualifications,
                    location: jobData.jobLocation?.address ? {
                        city: jobData.jobLocation.address.addressLocality,
                        state: jobData.jobLocation.address.addressRegion,
                        address: jobData.jobLocation.address.streetAddress,
                        postalCode: jobData.jobLocation.address.postalCode
                    } : null,
                    employmentType: jobData.employmentType,
                    datePosted: jobData.datePosted,
                    validThrough: jobData.validThrough,
                    organization: jobData.hiringOrganization?.name,
                    baseSalary: jobData.baseSalary,
                    benefits: jobData.jobBenefits
                };
            }
        } catch (error) {
            console.error('Error parsing JSON-LD:', error);
        }
    }

    // Fallback to traditional content extraction if JSON-LD not found
    console.log('No JSON-LD found, trying traditional content extraction...');
    const selectors = [
        'main .job-description',
        'main .description',
        'main .job-details',
        'main .job-content',
        'main article',
        'main section',
        'main .content',
        'main'
    ];

    let content = '';
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            console.log(`Found content with selector: ${selector}`);
            const walker = document.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
                {
                    acceptNode: function(node) {
                        if (node.nodeName === 'SCRIPT' || node.nodeName === 'STYLE') {
                            return NodeFilter.FILTER_REJECT;
                        }
                        return NodeFilter.FILTER_ACCEPT;
                    }
                }
            );

            let currentNode;
            while (currentNode = walker.nextNode()) {
                if (currentNode.nodeType === Node.TEXT_NODE) {
                    const text = currentNode.textContent.trim();
                    if (text) {
                        content += text + '\n\n';
                    }
                } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
                    const tagName = currentNode.tagName.toLowerCase();
                    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
                        content += currentNode.textContent.trim() + '\n\n';
                    }
                }
            }
            break;
        }
    }

    if (!content) {
        console.log('No content found with selectors, trying fallback...');
        const main = document.querySelector('main');
        if (main) {
            content = main.textContent;
        }
    }

    console.log(`Extracted content length: ${content.length}`);
    return content.trim();
}

function generateXMLFromHTML(document) {
    const mainContent = document.querySelector('main') || 
                       document.querySelector('.job-description') ||
                       document.querySelector('[class*="description" i]') ||
                       document.querySelector('[id*="description" i]') ||
                       document.body;

    const sections = [];
    let currentSection = null;

    Array.from(mainContent.children).forEach(element => {
        const tagName = element.tagName.toLowerCase();
        const text = element.textContent?.trim();

        if (!text) return;

        if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
            if (currentSection) {
                sections.push(currentSection);
            }
            currentSection = {
                title: text,
                content: []
            };
        } else if (currentSection) {
            if (tagName === 'ul' || tagName === 'ol') {
                const items = Array.from(element.querySelectorAll('li'))
                    .map(li => li.textContent?.trim())
                    .filter(Boolean);
                currentSection.content.push({
                    type: 'list',
                    items
                });
            } else {
                currentSection.content.push({
                    type: 'text',
                    content: text
                });
            }
        }
    });

    if (currentSection) {
        sections.push(currentSection);
    }

    // Generate XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<job-description>\n';
    
    sections.forEach(section => {
        xml += `  <section title="${section.title.replace(/"/g, '&quot;')}">\n`;
        section.content.forEach(content => {
            if (content.type === 'list') {
                xml += '    <list>\n';
                content.items.forEach(item => {
                    xml += `      <item>${item.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</item>\n`;
                });
                xml += '    </list>\n';
            } else {
                xml += `    <text>${content.content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>\n`;
            }
        });
        xml += '  </section>\n';
    });
    
    xml += '</job-description>';
    return xml;
}

function standardizeUrl(url) {
    try {
        const urlObj = new URL(url);
        // Remove tracking parameters
        const trackingParams = ['lang', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
        trackingParams.forEach(param => urlObj.searchParams.delete(param));
        
        // Get base URL and job ID
        const pathParts = urlObj.pathname.split('/');
        const jobId = pathParts[pathParts.length - 1];
        const baseUrl = `${urlObj.protocol}//${urlObj.hostname}`;
        
        return {
            fullUrl: urlObj.toString(),
            baseUrl,
            jobId
        };
    } catch (error) {
        console.error('Error standardizing URL:', error);
        return {
            fullUrl: url,
            baseUrl: '',
            jobId: ''
        };
    }
}

export async function analyzeJobPosting(url, options) {
    try {
        // Standardize URL
        const urlInfo = standardizeUrl(url);
        console.log('Standardized URL:', urlInfo);
        
        await applyRateLimit();
        const html = await fetchJobPostingHtml(urlInfo.fullUrl);
        
        // Save the raw HTML content
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const domain = new URL(urlInfo.fullUrl).hostname;
        const basePath = path.join('job-postings', `mercy-health-${urlInfo.jobId}`);
        
        // Ensure directory exists
        await fs.mkdir(basePath, { recursive: true });
        
        // Save HTML
        const htmlFilename = `${domain}-jobs-${urlInfo.jobId}-${timestamp}.html`;
        const htmlPath = path.join(basePath, htmlFilename);
        await fs.writeFile(htmlPath, html, 'utf-8');
        console.log(`Saved raw HTML content to: ${htmlPath}`);
        
        const dom = new JSDOM(html);
        const document = dom.window.document;
        
        // Extract full description
        const fullDescription = await extractFullDescription(document);
        
        // Generate XML
        const xml = generateXMLFromHTML(document);
        const xmlPath = path.join(basePath, `job-description-${urlInfo.jobId}.xml`);
        await fs.writeFile(xmlPath, xml, 'utf-8');
        console.log(`Saved XML description to: ${xmlPath}`);
        
        const jobSite = identifyJobSite(urlInfo.fullUrl);
        let analysis;

        switch (jobSite) {
            case JobSite.LINKEDIN:
                analysis = parseLinkedInJob(document, urlInfo.fullUrl);
                break;
            case JobSite.INDEED:
                analysis = parseIndeedJob(document, urlInfo.fullUrl);
                break;
            case JobSite.USAJOBS:
                analysis = parseUSAJobsJob(document, urlInfo.fullUrl);
                break;
            case JobSite.MONSTER:
                analysis = parseMonsterJob(document, urlInfo.fullUrl);
                break;
            case JobSite.GLASSDOOR:
                analysis = parseGlassdoorJob(document, urlInfo.fullUrl);
                break;
            default:
                analysis = parseGenericJob(document, urlInfo.fullUrl);
        }

        // Add URL information and full description to analysis
        analysis.urlInfo = urlInfo;
        analysis.fullDescription = fullDescription;

        // Save updated job data
        const jobDataPath = path.join(basePath, 'job-data.json');
        await fs.writeFile(jobDataPath, JSON.stringify(analysis, null, 2), 'utf-8');
        console.log(`Updated job data saved to: ${jobDataPath}`);

        return analysis;
    } catch (error) {
        console.error('Error analyzing job posting:', error);
        throw error;
    }
}

// Add main function to run the script
if (process.argv[2]) {
    analyzeJobPosting(process.argv[2]).catch(console.error);
}
//# sourceMappingURL=job-analyzer.js.map