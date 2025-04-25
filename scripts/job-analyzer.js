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
    maxRetries: 3,
    retryDelay: 1000, // Initial retry delay in milliseconds
};

class JobAnalyzerError extends Error {
    constructor(message, type, details = {}) {
        super(message);
        this.name = 'JobAnalyzerError';
        this.type = type;
        this.details = details;
    }
}

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
async function applyRateLimit(retryCount = 0) {
    const now = Date.now();
    const timeSinceLastRequest = now - rateLimits.lastRequestTime;
    
    if (timeSinceLastRequest < rateLimits.minTimeBetweenRequests) {
        const waitTime = rateLimits.minTimeBetweenRequests - timeSinceLastRequest;
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    rateLimits.lastRequestTime = Date.now();
    
    // Implement exponential backoff for retries
    if (retryCount > 0) {
        const backoffDelay = Math.min(
            rateLimits.retryDelay * Math.pow(2, retryCount - 1),
            30000 // Max 30 seconds
        );
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
}
/**
 * Fetches the HTML content from a job posting URL
 */
async function fetchJobPostingHtml(url, options = {}) {
    try {
        await applyRateLimit(options.retryCount || 0);
        
        // If we're in test mode and have a mock fetch function, use it
        if (options.testMode && global.fetch) {
            const response = await global.fetch(url);
            if (!response.ok) {
                throw new JobAnalyzerError(
                    `HTTP error! Status: ${response.status}`,
                    'HTTP_ERROR',
                    { status: response.status, url }
                );
            }
            return await response.text();
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
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
        
        if (!response.ok) {
            if (response.status === 429 && (options.retryCount || 0) < rateLimits.maxRetries) {
                return fetchJobPostingHtml(url, { ...options, retryCount: (options.retryCount || 0) + 1 });
            }
            throw new JobAnalyzerError(
                `HTTP error! Status: ${response.status}`,
                'HTTP_ERROR',
                { status: response.status, url }
            );
        }
        
        return await response.text();
    } catch (error) {
        if (error.name === 'AbortError' && (options.retryCount || 0) < rateLimits.maxRetries) {
            return fetchJobPostingHtml(url, { ...options, retryCount: (options.retryCount || 0) + 1 });
        }
        throw new JobAnalyzerError(
            `Failed to fetch job posting: ${error.message}`,
            'FETCH_ERROR',
            { originalError: error, url, retryCount: options.retryCount || 0 }
        );
    }
}
/**
 * Escapes special characters in a string for use in a regular expression
 */
function _extractBenefitsSection(document) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
/**
 * Extracts key terms from text content
 */
function extractKeyTerms(text, additionalTerms = []) {
    const categories = {
        programming: [
            'javascript', 'typescript', 'python', 'java', 'c#', 'c++', 'ruby', 'go', 'rust',
            'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring',
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'jenkins', 'git',
            'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'oracle', 'redis',
            'rest', 'graphql', 'api', 'microservices', 'serverless',
            'html', 'css', 'sass', 'less', 'webpack', 'babel', 'typescript',
            'redux', 'vuex', 'mobx', 'rxjs', 'jquery', 'bootstrap', 'material-ui',
            'php', 'laravel', 'symfony', 'wordpress', 'drupal',
            'swift', 'objective-c', 'kotlin', 'android', 'ios', 'react native', 'flutter'
        ],
        methodologies: [
            'agile', 'scrum', 'kanban', 'jira', 'confluence',
            'devops', 'tdd', 'bdd', 'ci/cd', 'pair programming',
            'waterfall', 'lean', 'xp', 'extreme programming',
            'continuous integration', 'continuous deployment', 'continuous delivery',
            'code review', 'peer review', 'version control'
        ],
        softSkills: [
            'leadership', 'management', 'teamwork', 'communication',
            'problem solving', 'critical thinking', 'time management',
            'collaboration', 'adaptability', 'creativity',
            'presentation', 'negotiation', 'conflict resolution',
            'mentoring', 'coaching', 'public speaking',
            'project management', 'stakeholder management',
            'analytical', 'detail oriented', 'multitasking'
        ],
        government: [
            'federal', 'government', 'clearance', 'security', 'public sector',
            'state', 'local', 'municipality', 'policy', 'regulation',
            'civil service', 'public administration', 'public policy', 'state agency',
            'rutan', 'public employment', 'state employment', 'hiring process',
            'central management services', 'cms', 'recruitment', 'human resources',
            'applicant tracking', 'selection process', 'interview panel', 'administrative',
            'program management', 'grant', 'grants management', 'procurement',
            'budget', 'fiscal', 'legislative', 'statutory', 'compliance'
        ],
        healthcare: [
            'patient', 'healthcare', 'medical', 'clinical', 'hospital',
            'registration', 'scheduling', 'insurance', 'billing', 'hipaa',
            'customer service', 'patient care', 'electronic health record',
            'ehr', 'emr', 'epic', 'cerner', 'meditech',
            'medical coding', 'medical billing', 'medical records',
            'healthcare compliance', 'healthcare administration',
            'patient safety', 'patient experience', 'patient satisfaction'
        ],
        certifications: [
            'pmp', 'scrum master', 'csm', 'aws certified', 'azure certified',
            'cissp', 'ceh', 'comptia', 'itil', 'prince2',
            'cpa', 'cfa', 'series 7', 'series 63', 'finra',
            'rn', 'bsn', 'msn', 'np', 'pa',
            'cna', 'lpn', 'md', 'do', 'phd'
        ],
        education: [
            'bachelor', 'master', 'phd', 'doctorate', 'mba',
            'bs', 'ba', 'ms', 'ma', 'associate',
            'certification', 'degree', 'diploma', 'graduate',
            'computer science', 'information technology', 'engineering',
            'business administration', 'finance', 'accounting'
        ],
        industries: [
            'healthcare', 'finance', 'banking', 'insurance', 'technology',
            'retail', 'manufacturing', 'education', 'government',
            'consulting', 'telecommunications', 'media', 'advertising',
            'automotive', 'aerospace', 'defense', 'energy', 'utilities',
            'real estate', 'construction', 'transportation', 'logistics'
        ]
    };

    const allTerms = [
        ...Object.values(categories).flat(),
        ...additionalTerms
    ];

    const terms = {
        programming: new Set(),
        methodologies: new Set(),
        softSkills: new Set(),
        government: new Set(),
        healthcare: new Set(),
        certifications: new Set(),
        education: new Set(),
        industries: new Set(),
        other: new Set()
    };

    // First pass: exact matches
    for (const skill of allTerms) {
        try {
            const escapedSkill = skill.includes('\\') ? skill : escapeRegExp(skill);
            const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
            if (regex.test(text)) {
                const originalTerm = skill.replace(/\\\+/g, '+').replace(/\\/g, '');
                const category = Object.entries(categories).find(([_, terms]) => 
                    terms.includes(originalTerm.toLowerCase())
                )?.[0] || 'other';
                
                terms[category].add(originalTerm.toLowerCase());
            }
        } catch (error) {
            console.warn(`Skipping problematic term "${skill}": ${error.message}`);
        }
    }

    // Second pass: variations and combinations
    const variations = {
        'years of experience': /(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+experience/gi,
        'degree required': /(?:requires?|must have)\s+(?:a\s+)?([^.]+?(?:degree|certification))/gi,
        'programming languages': /(?:proficient|experienced?|skilled?)\s+in\s+([^.]+)/gi
    };

    for (const [key, pattern] of Object.entries(variations)) {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
            const value = match[1].trim().toLowerCase();
            if (key === 'years of experience') {
                terms.education.add(`${value} years experience`);
            } else if (key === 'degree required') {
                terms.education.add(value);
            } else if (key === 'programming languages') {
                const languages = value.split(/[,\s]+/)
                    .map(lang => lang.trim())
                    .filter(lang => categories.programming.includes(lang));
                languages.forEach(lang => terms.programming.add(lang));
            }
        }
    }

    // Convert Sets to arrays and add category information
    return Object.entries(terms).reduce((acc, [category, termSet]) => {
        acc[category] = Array.from(termSet);
        return acc;
    }, {});
}
/**
 * Gets all text content from elements matching a selector
 */
function _getTextFromElements(selector) {
    const elements = document.querySelectorAll(selector);
    return Array.from(elements).map(el => el.textContent?.trim()).filter(Boolean);
}
/**
 * Detects section headings in a document by looking for common heading patterns
 */
function detectDocumentSections(document) {
    const sectionMap = {
        responsibilities: [],
        qualifications: [],
        requirements: [],
        skills: [],
        benefits: [],
        about: [],
        education: [],
        experience: [],
        compensation: [],
        location: [],
        schedule: [],
        culture: []
    };

    const headers = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, strong, b'));
    
    for (const header of headers) {
        const text = header.textContent?.toLowerCase() || '';
        let sectionType = null;

        // Enhanced section detection patterns
        if (/responsib|duties|what you('ll)? do|role|functions|day to day|key accountabilities/i.test(text))
            sectionType = 'responsibilities';
        else if (/qualif|what you('ll)? need|experience|background|requirements?|must have|essential/i.test(text))
            sectionType = 'qualifications';
        else if (/skills?|competenc|proficien|expertise|technical skills|tools/i.test(text))
            sectionType = 'skills';
        else if (/benefits?|perks|offer|compensation|salary|pay|bonus|incentive/i.test(text))
            sectionType = 'benefits';
        else if (/about|company|who we are|our team|organization|mission|vision/i.test(text))
            sectionType = 'about';
        else if (/education|degree|academic|diploma|certification|training/i.test(text))
            sectionType = 'education';
        else if (/experience|years? of experience|work history|background/i.test(text))
            sectionType = 'experience';
        else if (/compensation|salary|pay|bonus|incentive|remuneration/i.test(text))
            sectionType = 'compensation';
        else if (/location|where you('ll)? work|office|remote|hybrid|onsite/i.test(text))
            sectionType = 'location';
        else if (/schedule|hours?|shift|work schedule|time|flexible/i.test(text))
            sectionType = 'schedule';
        else if (/culture|values?|environment|workplace|team|diversity|inclusion/i.test(text))
            sectionType = 'culture';

        if (sectionType) {
            let sibling = header.nextElementSibling;
            const sectionContent = [];

            // Collect content until next section header
            while (sibling && !['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(sibling.tagName)) {
                if (sibling.textContent?.trim()) {
                    // Handle different types of content
                    if (sibling.tagName === 'UL' || sibling.tagName === 'OL') {
                        const listItems = Array.from(sibling.querySelectorAll('li'))
                            .map(li => li.textContent?.trim())
                            .filter(Boolean);
                        sectionContent.push(...listItems);
                    } else if (sibling.tagName === 'P') {
                        const text = sibling.textContent?.trim();
                        if (text) {
                            // Split paragraphs that contain bullet points
                            if (text.includes('•') || text.includes('-') || text.includes('*')) {
                                const bulletPoints = text.split(/[•\-*]/)
                                    .map(point => point.trim())
                                    .filter(Boolean);
                                sectionContent.push(...bulletPoints);
                            } else {
                                sectionContent.push(text);
                            }
                        }
                    }
                }
                sibling = sibling.nextElementSibling;
            }

            sectionMap[sectionType] = sectionContent;
        }
    }

    return sectionMap;
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
            // Split text into bullet points if it contains bullet characters
            const text = element.textContent.trim();
            if (text.includes('•') || text.includes('-') || text.includes('*')) {
                const bulletPoints = text.split(/[•\-*]/)
                    .map(point => point.trim())
                    .filter(Boolean);
                items.push(...bulletPoints);
            } else {
                items.push(text);
            }
        }
    }
    return items;
}

const SITE_SELECTORS = {
    linkedin: {
        title: [
            'h1.job-title',
            'h1.top-card-layout__title',
            '.job-details-jobs-unified-top-card__job-title',
            'h1'
        ],
        company: [
            '.company-name',
            '.employer-name',
            '.job-details-jobs-unified-top-card__company-name',
            '.topcard__org-name-link'
        ],
        location: [
            '.job-details-jobs-unified-top-card__bullet',
            '.job-details-jobs-unified-top-card__workplace-type',
            '.topcard__flavor--bullet'
        ]
    },
    indeed: {
        title: [
            'h1.jobsearch-JobInfoHeader-title',
            '.jobsearch-JobComponent-title'
        ],
        company: [
            '.jobsearch-CompanyInfoContainer',
            '.jobsearch-InlineCompanyRating'
        ],
        location: [
            '.jobsearch-JobInfoHeader-subtitle',
            '.jobsearch-CompanyLocation'
        ]
    }
};

function trySelectors(document, selectors) {
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            const text = element.textContent.trim();
            if (text) return text;
        }
    }
    return null;
}

function parseLinkedInJob(document, url) {
    try {
        // Try structured data first
        const jsonLd = document.querySelector('script[type="application/ld+json"]');
        let structuredData = null;
        if (jsonLd) {
            try {
                structuredData = JSON.parse(jsonLd.textContent);
            } catch (e) {
                console.warn('Failed to parse LinkedIn JSON-LD:', e);
            }
        }

        const title = structuredData?.title || 
                     trySelectors(document, SITE_SELECTORS.linkedin.title) || 
                     'Unknown Title';

        const company = structuredData?.hiringOrganization?.name || 
                       trySelectors(document, SITE_SELECTORS.linkedin.company) || 
                       'Unknown Company';

        const location = structuredData?.jobLocation?.address?.addressLocality || 
                        trySelectors(document, SITE_SELECTORS.linkedin.location) || 
                        'Unknown Location';

        // Extract sections with validation
        const sections = extractSectionContent(document, 'responsibilities');
        const qualifications = extractSectionContent(document, 'qualifications');

        if (!sections && !qualifications) {
            throw new JobAnalyzerError(
                'Failed to extract both responsibilities and qualifications',
                'PARSING_ERROR',
                { url }
            );
        }

        const fullDescription = extractFullDescription(document);
        const keyTerms = extractKeyTerms(fullDescription);

        return {
            title,
            company,
            location: formatLocation(location),
            responsibilities: sections || [],
            qualifications: qualifications || [],
            fullDescription,
            keyTerms,
            url
        };
    } catch (error) {
        throw new JobAnalyzerError(
            'Failed to parse LinkedIn job posting',
            'PARSING_ERROR',
            { url, originalError: error }
        );
    }
}

function parseIndeedJob(document, url) {
    try {
        // Try structured data first
        const jsonLd = document.querySelector('script[type="application/ld+json"]');
        let structuredData = null;
        if (jsonLd) {
            try {
                structuredData = JSON.parse(jsonLd.textContent);
            } catch (e) {
                console.warn('Failed to parse Indeed JSON-LD:', e);
            }
        }

        const title = structuredData?.title || 
                     trySelectors(document, SITE_SELECTORS.indeed.title) || 
                     'Unknown Title';

        const company = structuredData?.hiringOrganization?.name || 
                       trySelectors(document, SITE_SELECTORS.indeed.company) || 
                       'Unknown Company';

        const location = structuredData?.jobLocation?.address?.addressLocality || 
                        trySelectors(document, SITE_SELECTORS.indeed.location) || 
                        'Unknown Location';

        // Extract sections with validation
        const sections = extractSectionContent(document, 'responsibilities');
        const qualifications = extractSectionContent(document, 'qualifications');

        if (!sections && !qualifications) {
            throw new JobAnalyzerError(
                'Failed to extract both responsibilities and qualifications',
                'PARSING_ERROR',
                { url }
            );
        }

        const fullDescription = extractFullDescription(document);
        const keyTerms = extractKeyTerms(fullDescription);

        return {
            title,
            company,
            location: formatLocation(location),
            responsibilities: sections || [],
            qualifications: qualifications || [],
            fullDescription,
            keyTerms,
            url
        };
    } catch (error) {
        throw new JobAnalyzerError(
            'Failed to parse Indeed job posting',
            'PARSING_ERROR',
            { url, originalError: error }
        );
    }
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
async function analyzeJobPosting(url, options = {}) {
    const startTime = Date.now();
    const analysisId = Math.random().toString(36).substring(7);
    
    console.log(`[${analysisId}] Starting job analysis for URL: ${url}`);
    
    try {
        // Standardize URL
        const urlInfo = standardizeUrl(url);
        console.log(`[${analysisId}] Standardized URL:`, urlInfo);
        
        // Apply rate limiting
        await applyRateLimit();
        
        // Fetch HTML content
        console.log(`[${analysisId}] Fetching job posting HTML...`);
        const html = await fetchJobPostingHtml(urlInfo.fullUrl, { ...options, analysisId });
        
        // Save the raw HTML content
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const domain = new URL(urlInfo.fullUrl).hostname;
        const basePath = path.join('job-postings', `${domain}-${urlInfo.jobId}`);
        
        // Ensure directory exists
        await fs.mkdir(basePath, { recursive: true });
        
        // Save HTML
        const htmlFilename = `${domain}-jobs-${urlInfo.jobId}-${timestamp}.html`;
        const htmlPath = path.join(basePath, htmlFilename);
        await fs.writeFile(htmlPath, html, 'utf-8');
        console.log(`[${analysisId}] Saved raw HTML content to: ${htmlPath}`);
        
        // Parse HTML
        const dom = new JSDOM(html);
        const document = dom.window.document;
        
        // Extract full description
        console.log(`[${analysisId}] Extracting full description...`);
        const fullDescription = await extractFullDescription(document);
        
        // Generate XML
        console.log(`[${analysisId}] Generating XML description...`);
        const xml = generateXMLFromHTML(document);
        const xmlPath = path.join(basePath, `job-description-${urlInfo.jobId}.xml`);
        await fs.writeFile(xmlPath, xml, 'utf-8');
        console.log(`[${analysisId}] Saved XML description to: ${xmlPath}`);
        
        // Identify job site and parse accordingly
        const jobSite = identifyJobSite(urlInfo.fullUrl);
        console.log(`[${analysisId}] Identified job site: ${jobSite}`);
        
        let analysis;
        try {
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
        } catch (parseError) {
            throw new JobAnalyzerError(
                `Failed to parse job posting: ${parseError.message}`,
                'PARSE_ERROR',
                { originalError: parseError, jobSite }
            );
        }
        
        // Add URL information to analysis
        analysis.urlInfo = urlInfo;
        
        // Create separate JSON files for different data types
        const jobDataPath = path.join(basePath, 'job-data.json');
        const jobTextPath = path.join(basePath, 'job-text.json');
        const jobMetadataPath = path.join(basePath, 'job-metadata.json');
        
        // Split the data
        const { description, responsibilities, qualifications } = fullDescription || {};
        const textData = {
            description,
            responsibilities,
            qualifications
        };
        
        // Create metadata
        const metadata = {
            analysisId,
            timestamp: new Date().toISOString(),
            processingTime: Date.now() - startTime,
            url: urlInfo.fullUrl,
            jobSite,
            files: {
                html: htmlFilename,
                xml: `job-description-${urlInfo.jobId}.xml`,
                data: 'job-data.json',
                text: 'job-text.json',
                metadata: 'job-metadata.json'
            }
        };
        
        // Merge the data, prioritizing fullDescription over analysis
        const mainData = {
            url: fullDescription?.url || urlInfo.fullUrl,
            title: fullDescription?.title || analysis.title,
            company: fullDescription?.company || analysis.company,
            department: fullDescription?.department || 'Unknown Department',
            location: formatLocation(fullDescription?.location || analysis.location),
            employmentType: fullDescription?.employmentType || analysis.employmentType,
            jobId: fullDescription?.jobId || urlInfo.jobId,
            salary: fullDescription?.salary || analysis.salary,
            description: fullDescription?.description || '',
            sections: fullDescription?.sections || {},
            datePosted: fullDescription?.datePosted || new Date().toISOString(),
            validThrough: fullDescription?.validThrough || null,
            responsibilities: analysis.responsibilities || [],
            qualifications: analysis.qualifications || [],
            keyTerms: analysis.keyTerms || {},
            source: {
                url: urlInfo.fullUrl,
                site: jobSite,
                fetchDate: new Date().toISOString()
            },
            urlInfo: urlInfo
        };
        
        // Save all files
        await Promise.all([
            fs.writeFile(jobDataPath, JSON.stringify(mainData, null, 2), 'utf-8'),
            fs.writeFile(jobTextPath, JSON.stringify(textData, null, 2), 'utf-8'),
            fs.writeFile(jobMetadataPath, JSON.stringify(metadata, null, 2), 'utf-8')
        ]);
        
        console.log(`[${analysisId}] Analysis completed successfully in ${Date.now() - startTime}ms`);
        console.log(`[${analysisId}] Results saved to: ${basePath}`);
        
        return {
            ...mainData,
            metadata
        };
    } catch (error) {
        console.error(`[${analysisId}] Error analyzing job posting:`, error);
        throw new JobAnalyzerError(
            `Failed to analyze job posting: ${error.message}`,
            'ANALYSIS_ERROR',
            { originalError: error, url, analysisId }
        );
    }
}

function extractFullDescription(document) {
    console.log('Extracting full description...');
    
    // Try to find the JSON-LD script tag containing job data
    const scriptTags = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scriptTags) {
        try {
            const jobData = JSON.parse(script.textContent);
            if (jobData['@type'] === 'JobPosting') {
                console.log('Found job data in JSON-LD');
                
                const description = jobData.description || '';
                
                // Extract salary information
                let salary = null;
                const signOnBonusMatch = description.match(/\$(\d{1,3}(?:,\d{3})*)\s+Sign On Bonus/i);
                const signOnBonus = signOnBonusMatch ? parseInt(signOnBonusMatch[1].replace(/,/g, '')) : null;
                const scheduleMatch = description.match(/(\d+)\s+Hours\/(\d+)\s+Weeks/i);
                const shiftMatch = description.match(/Shift:\s*([^\n<]+)/i);
                
                if (signOnBonus || scheduleMatch || shiftMatch) {
                    salary = {
                        signOnBonus: signOnBonus,
                        type: jobData.employmentType,
                        hours: scheduleMatch ? `${scheduleMatch[1]} Hours/${scheduleMatch[2]} Weeks` : null,
                        shift: shiftMatch ? shiftMatch[1].trim() : null
                    };
                }

                // Extract sections with improved regex patterns
                const sections = {
                    overview: extractSection(description, 'Overview', 'Responsibilities'),
                    responsibilities: extractSection(description, 'Responsibilities', 'Education and Experience'),
                    education: extractSection(description, 'Education and Experience', 'Certification/Licensure'),
                    certification: extractSection(description, 'Certification/Licensure', 'Special Physical Demands'),
                    physicalDemands: extractSection(description, 'Special Physical Demands', 'Culture of Excellence'),
                    culture: extractSection(description, 'Culture of Excellence', 'Benefits'),
                    benefits: extractSection(description, 'Benefits', null)
                };

                // Process sections to extract text and lists
                Object.keys(sections).forEach(key => {
                    if (sections[key]) {
                        const lists = sections[key].match(/<ul>.*?<\/ul>/gs) || [];
                        sections[key] = {
                            text: sections[key].replace(/<ul>.*?<\/ul>/gs, '').replace(/<[^>]+>/g, '').trim(),
                            lists: lists.map(list => {
                                const items = list.match(/<li>.*?<\/li>/g) || [];
                                return items.map(item => item.replace(/<\/?li>/g, '').trim());
                            })
                        };
                    }
                });

                // Extract responsibilities and qualifications
                const responsibilities = sections.responsibilities?.lists?.[0] || [];
                const qualifications = extractQualifications(sections);

                // Extract culture of excellence
                const cultureText = sections.culture?.text || '';
                const cultureOfExcellence = extractCultureOfExcellence(cultureText);

                // Extract benefits
                const benefitsText = sections.benefits?.text || '';
                const benefits = extractBenefits(benefitsText);

                // Extract physical demands
                const physicalDemandsText = sections.physicalDemands?.text || '';
                const physicalDemands = {
                    text: physicalDemandsText,
                    requirements: extractPhysicalRequirements(physicalDemandsText)
                };

                // Extract key terms
                const keyTerms = extractKeyTerms(description, [
                    'patient', 'healthcare', 'medical', 'clinical', 'hospital',
                    'registration', 'scheduling', 'insurance', 'billing', 'hipaa',
                    'customer service', 'patient care', 'electronic health record',
                    'ehr', 'emr', 'epic', 'cerner', 'meditech'
                ]);

                return {
                    url: jobData.url,
                    title: jobData.title,
                    company: jobData.hiringOrganization?.name || 'Unknown Company',
                    department: extractDepartment(description),
                    location: {
                        city: jobData.jobLocation?.address?.addressLocality || 'Unknown',
                        state: jobData.jobLocation?.address?.addressRegion || 'Unknown',
                        hospital: extractHospital(description),
                        address: jobData.jobLocation?.address?.streetAddress || 'Unknown'
                    },
                    employmentType: jobData.employmentType,
                    jobId: jobData.jobId,
                    salary: salary,
                    description: description,
                    sections: sections,
                    responsibilities: responsibilities,
                    qualifications: qualifications,
                    cultureOfExcellence: cultureOfExcellence,
                    benefits: benefits,
                    physicalDemands: physicalDemands,
                    keyTerms: keyTerms,
                    datePosted: jobData.datePosted,
                    validThrough: jobData.validThrough
                };
            }
        } catch (error) {
            console.error('Error parsing JSON-LD:', error);
        }
    }
    return null;
}

function extractSection(text, startSection, endSection) {
    const startRegex = new RegExp(`${startSection}<br><br>(.*?)${endSection ? `(?=${endSection}<br><br>)` : '$'}`, 's');
    const match = text.match(startRegex);
    return match ? match[1].trim() : null;
}

function extractDepartment(text) {
    const match = text.match(/Department:\s*([^<\n]+)/i);
    return match ? match[1].trim() : 'Medical Laboratory';
}

function extractHospital(description) {
    const hospitalPatterns = [
        /at\s+([A-Za-z\s]+Hospital)/i,
        /([A-Za-z\s]+Hospital\s+and\s+Medical\s+Center)/i,
        /([A-Za-z\s]+Hospital)/i
    ];
    
    for (const pattern of hospitalPatterns) {
        const match = description.match(pattern);
        if (match) {
            return match[1].trim();
        }
    }
    return null;
}

function generateXMLFromHTML(document) {
    // Extract job data from JSON-LD first
    const scriptTags = document.querySelectorAll('script[type="application/ld+json"]');
    let jsonLdData = null;
    for (const script of scriptTags) {
        try {
            const data = JSON.parse(script.textContent);
            if (data['@type'] === 'JobPosting') {
                jsonLdData = data;
                break;
            }
        } catch (error) {
            console.error('Error parsing JSON-LD:', error);
        }
    }

    if (!jsonLdData) {
        console.log('Could not find job data in JSON-LD');
        return '<?xml version="1.0" encoding="UTF-8"?>\n<job-description></job-description>';
    }

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<job-description>\n';

    // Add metadata
    xml += '  <metadata>\n';
    xml += `    <title>${escapeXML(jsonLdData.title)}</title>\n`;
    xml += `    <company>${escapeXML(jsonLdData.hiringOrganization?.name || '')}</company>\n`;
    xml += `    <employment-type>${escapeXML(jsonLdData.employmentType || '')}</employment-type>\n`;
    xml += `    <date-posted>${escapeXML(jsonLdData.datePosted || '')}</date-posted>\n`;
    xml += `    <valid-through>${escapeXML(jsonLdData.validThrough || '')}</valid-through>\n`;
    
    // Add location information
    if (jsonLdData.jobLocation?.address) {
        const address = jsonLdData.jobLocation.address;
        xml += '    <location>\n';
        xml += `      <city>${escapeXML(address.addressLocality || '')}</city>\n`;
        xml += `      <state>${escapeXML(address.addressRegion || '')}</state>\n`;
        xml += `      <address>${escapeXML(address.streetAddress || '')}</address>\n`;
        xml += '    </location>\n';
    }
    xml += '  </metadata>\n\n';

    // Process description sections
    const description = jsonLdData.description || '';
    const sections = {
        overview: extractSection(description, 'Overview', 'Responsibilities'),
        responsibilities: extractSection(description, 'Responsibilities', 'Education and Experience'),
        education: extractSection(description, 'Education and Experience', 'Certification/Licensure'),
        certification: extractSection(description, 'Certification/Licensure', 'Special Physical Demands'),
        physicalDemands: extractSection(description, 'Special Physical Demands', 'Culture of Excellence'),
        culture: extractSection(description, 'Culture of Excellence', 'Benefits'),
        benefits: extractSection(description, 'Benefits', null)
    };

    // Add each section to XML
    Object.entries(sections).forEach(([sectionName, content]) => {
        if (content) {
            xml += `  <section name="${escapeXML(sectionName)}">\n`;
            
            // Extract and clean the main text content
            const mainText = content.replace(/<ul>.*?<\/ul>/gs, '')
                                  .replace(/<[^>]+>/g, '')
                                  .trim();
            if (mainText) {
                xml += `    <description>${escapeXML(mainText)}</description>\n`;
            }

            // Extract lists
            const lists = content.match(/<ul>.*?<\/ul>/gs) || [];
            if (lists.length > 0) {
                xml += '    <list>\n';
                lists.forEach(list => {
                    const items = list.match(/<li>.*?<\/li>/g) || [];
                    items.forEach(item => {
                        const text = item.replace(/<\/?li>/g, '').trim();
                        if (text) {
                            xml += `      <item>${escapeXML(text)}</item>\n`;
                        }
                    });
                });
                xml += '    </list>\n';
            }

            xml += '  </section>\n';
        }
    });

    // Add special sections if they exist
    const departmentMatch = description.match(/Department:\s*([^<\n]+)/i);
    if (departmentMatch) {
        xml += '  <section name="department">\n';
        xml += `    <value>${escapeXML(departmentMatch[1].trim())}</value>\n`;
        xml += '  </section>\n';
    }

    const hospitalMatch = description.match(/([^,]+)\s+Hospital/i);
    if (hospitalMatch) {
        xml += '  <section name="hospital">\n';
        xml += `    <value>${escapeXML(hospitalMatch[1].trim())}</value>\n`;
        xml += '  </section>\n';
    }

    // Add salary information if available
    const salaryMatch = description.match(/\$(\d{1,3}(?:,\d{3})*)\s+Sign On Bonus/i);
    if (salaryMatch) {
        xml += '  <section name="compensation">\n';
        xml += `    <sign-on-bonus>${escapeXML(salaryMatch[1])}</sign-on-bonus>\n`;
        xml += '  </section>\n';
    }

    xml += '</job-description>';
    return xml;
}

function escapeXML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function standardizeUrl(url) {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const jobId = pathParts[pathParts.length - 1].replace(/\?.*$/, ''); // Remove query parameters
    return {
        fullUrl: `${urlObj.origin}${urlObj.pathname.replace(/\?.*$/, '')}`,
        baseUrl: urlObj.origin,
        jobId
    };
}

function extractListItems(items) {
    return items.map(item => item.trim()).filter(item => item.length > 0);
}

function extractCultureOfExcellence(text) {
    const culture = {
        quality: [],
        service: [],
        partnering: [],
        cost: []
    };

    const sections = {
        quality: /Quality[^-]*-([^]*?)(?=Service)/i,
        service: /Service[^-]*-([^]*?)(?=Partnering)/i,
        partnering: /Partnering[^-]*-([^]*?)(?=Cost)/i,
        cost: /Cost[^-]*-([^]*?)(?=\n|$)/i
    };

    Object.entries(sections).forEach(([key, pattern]) => {
        const match = text.match(pattern);
        if (match) {
            culture[key] = match[1].split(';')
                .map(item => item.trim())
                .filter(Boolean);
        }
    });

    return culture;
}

function extractBenefits(text) {
    const benefits = {
        comprehensiveBenefits: [],
        compensation: [],
        timeOff: [],
        careerAdvancement: [],
        employeeWellbeing: [],
        additionalBenefits: []
    };

    const sections = {
        comprehensiveBenefits: /Comprehensive Benefits Package:\s*([^•]+)/i,
        compensation: /Competitive Compensation:\s*([^•]+)/i,
        timeOff: /Paid Time Off:\s*([^•]+)/i,
        careerAdvancement: /Career Advancement:\s*([^•]+)/i,
        employeeWellbeing: /Employee Wellbeing:\s*([^•]+)/i,
        additionalBenefits: /Additional Benefits:\s*([^•]+)/i
    };

    Object.entries(sections).forEach(([key, pattern]) => {
        const match = text.match(pattern);
        if (match) {
            benefits[key] = [match[1].trim()];
        }
    });

    return benefits;
}

function extractBulletPoints(text) {
    const points = [];
    const bulletRegex = /[•\-\*]\s*(.*?)(?=[•\-\*]|$)/g;
    let match;
    while ((match = bulletRegex.exec(text)) !== null) {
        points.push(match[1].trim());
    }
    return points;
}

function extractPhysicalRequirements(text) {
    const requirements = [];
    const sentences = text.split(/[.;]\s+/);
    
    for (const sentence of sentences) {
        const requirement = sentence.trim();
        if (requirement && !requirement.startsWith('The') && !requirement.startsWith('While')) {
            requirements.push(requirement);
        }
    }
    
    return requirements;
}

function extractQualifications(sections) {
    const qualifications = [];
    
    // Extract from education section
    if (sections.education?.text) {
        const educationText = sections.education.text;
        const requirements = educationText.split(/\s*(?:OR|AND)\s*/);
        qualifications.push(...requirements.map(req => req.trim()).filter(Boolean));
    }
    
    // Extract from certification section
    if (sections.certification?.text) {
        const certText = sections.certification.text;
        const requirements = certText.split(/\s*(?:OR|AND)\s*/);
        qualifications.push(...requirements.map(req => req.trim()).filter(Boolean));
    }
    
    return qualifications;
}

function extractCultureSection(text, sectionName, nextSection) {
    const pattern = nextSection
        ? new RegExp(`${sectionName}[^-]*-([^]*?)(?=${nextSection})`, 'i')
        : new RegExp(`${sectionName}[^-]*-([^]*)$`, 'i');
    
    const match = text.match(pattern);
    if (!match) return [];
    
    return match[1].split(';')
        .map(item => item.trim())
        .filter(Boolean);
}

function extractBenefitsSection(text, sectionName) {
    const pattern = new RegExp(`${sectionName}:\\s*([^•]+)`, 'i');
    const match = text.match(pattern);
    if (!match) return [];
    
    return [match[1].trim()];
}

function formatLocation(location) {
    if (typeof location === 'string') {
        return location;
    }
    
    if (typeof location === 'object') {
        const parts = [];
        if (location.city && location.city !== 'Unknown') parts.push(location.city);
        if (location.state && location.state !== 'Unknown') parts.push(location.state);
        if (location.address && location.address !== 'Unknown' && !parts.includes(location.address)) {
            parts.unshift(location.address);
        }
        if (location.hospital && location.hospital !== 'Unknown') {
            parts.unshift(location.hospital);
        }
        return parts.join(', ') || 'Unknown Location';
    }
    
    return 'Unknown Location';
}

function extractSectionContent(document, sectionType) {
    const sectionPatterns = {
        responsibilities: [
            'h2, h3',  // Select all h2 and h3 elements
            '.job-description h2, .job-description h3',
            '#job-details h2, #job-details h3',
            '.description h2, .description h3'
        ],
        qualifications: [
            'h2, h3',
            '.job-description h2, .job-description h3',
            '#job-details h2, #job-details h3',
            '.description h2, .description h3'
        ]
    };

    // First try to find the section using JSON-LD data
    const jsonLd = document.querySelector('script[type="application/ld+json"]');
    if (jsonLd) {
        try {
            const data = JSON.parse(jsonLd.textContent);
            if (sectionType === 'responsibilities' && data.responsibilities) {
                return Array.isArray(data.responsibilities) ? data.responsibilities : [data.responsibilities];
            }
            if (sectionType === 'qualifications' && data.qualifications) {
                return Array.isArray(data.qualifications) ? data.qualifications : [data.qualifications];
            }
        } catch (error) {
            console.log('Failed to parse JSON-LD data:', error);
        }
    }

    // If JSON-LD approach fails, try to find the section in the document
    const patterns = sectionPatterns[sectionType];
    let content = [];

    for (const selector of patterns) {
        const headers = document.querySelectorAll(selector);
        for (const header of headers) {
            const headerText = header.textContent.toLowerCase();
            if (headerText.includes(sectionType === 'responsibilities' ? 'responsibilit' : 'qualification') ||
                headerText.includes('requirements') ||
                (sectionType === 'responsibilities' && headerText.includes('what you\'ll do')) ||
                (sectionType === 'qualifications' && headerText.includes('what you\'ll need'))) {
                
                // Get the content following the header until the next header or end of section
                let currentNode = header.nextElementSibling;
                const sectionContent = [];
                
                while (currentNode && !['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(currentNode.tagName)) {
                    if (currentNode.tagName === 'UL' || currentNode.tagName === 'OL') {
                        const items = currentNode.querySelectorAll('li');
                        items.forEach(item => {
                            const text = item.textContent.trim();
                            if (text) sectionContent.push(text);
                        });
                    } else if (currentNode.tagName === 'P') {
                        const text = currentNode.textContent.trim();
                        if (text) sectionContent.push(text);
                    }
                    currentNode = currentNode.nextElementSibling;
                }

                if (sectionContent.length > 0) {
                    content = content.concat(sectionContent);
                }
            }
        }
    }

    return content.length > 0 ? content : null;
}

// Export necessary functions
export {
    analyzeJobPosting,
    extractKeyTerms,
    JobSite,
    JobAnalyzerError
};

// Add main function to run the script
if (process.argv[2]) {
    analyzeJobPosting(process.argv[2]).catch(console.error);
}
//# sourceMappingURL=job-analyzer.js.map