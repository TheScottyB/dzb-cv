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
                
                // Extract salary information
                let salary = null;
                const description = jobData.description || '';
                
                // Extract sign-on bonus
                const signOnBonusMatch = description.match(/\$(\d{1,3}(?:,\d{3})*)\s+Sign On Bonus/i);
                const signOnBonus = signOnBonusMatch ? parseInt(signOnBonusMatch[1].replace(/,/g, '')) : null;
                
                // Extract work schedule
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

                // Extract department from description
                const departmentMatch = description.match(/Department:\s*([^\n<]+)/i);
                const department = departmentMatch ? departmentMatch[1].trim() : 'Medical Laboratory';

                // Extract hospital from description
                const hospitalMatch = description.match(/([^,]+)\s+Hospital/i);
                const hospital = hospitalMatch ? hospitalMatch[1].trim() : null;

                // Extract responsibilities
                const responsibilities = [];
                const responsibilitiesMatch = description.match(/<strong>Essential Duties and Responsibilities<\/strong><\/p><ul>(.*?)<\/ul>/is);
                if (responsibilitiesMatch) {
                    const items = responsibilitiesMatch[1].match(/<li>(.*?)<\/li>/gis);
                    if (items) {
                        responsibilities.push({
                            title: "Essential Duties and Responsibilities",
                            items: items.map(item => item.replace(/<[^>]+>/g, '').trim())
                        });
                    }
                }

                // Extract qualifications
                const qualifications = {
                    education: [],
                    certification: []
                };
                
                // Extract education requirements
                const educationMatch = description.match(/Education and Experience<br><br>(.*?)<br>/is);
                if (educationMatch) {
                    const educationText = educationMatch[1].replace(/<[^>]+>/g, '');
                    qualifications.education = educationText.split(/<br\s*\/?>/).map(item => item.trim()).filter(Boolean);
                }

                // Extract certification requirements
                const certificationMatch = description.match(/Certification\/Licensure<br><br>(.*?)<br>/is);
                if (certificationMatch) {
                    const certificationText = certificationMatch[1].replace(/<[^>]+>/g, '');
                    qualifications.certification = certificationText.split(/<br\s*\/?>/).map(item => item.trim()).filter(Boolean);
                }

                // Extract culture of excellence
                const cultureOfExcellence = {
                    quality: [],
                    service: [],
                    partnering: [],
                    cost: []
                };

                const cultureMatch = description.match(/Culture of Excellence Behavior Expectations<br><br>(.*?)<br>/is);
                if (cultureMatch) {
                    const cultureText = cultureMatch[1];
                    const sections = cultureText.match(/<u>([^<]+)<\/u>\s*-\s*([^<]+)/g);
                    if (sections) {
                        sections.forEach(section => {
                            const match = section.match(/<u>([^<]+)<\/u>\s*-\s*([^<]+)/);
                            if (match) {
                                const type = match[1].toLowerCase();
                                const content = match[2].trim();
                                if (cultureOfExcellence[type]) {
                                    cultureOfExcellence[type] = content.split(';').map(item => item.trim());
                                }
                            }
                        });
                    }
                }

                // Extract physical demands
                const physicalDemands = {
                    description: '',
                    requirements: [],
                    visionRequirements: []
                };

                const physicalMatch = description.match(/Special Physical Demands<br><br>(.*?)<br>/is);
                if (physicalMatch) {
                    const physicalText = physicalMatch[1].replace(/<[^>]+>/g, '');
                    const sentences = physicalText.split('.');
                    
                    physicalDemands.description = sentences[0].trim();
                    
                    const requirementsMatch = physicalText.match(/required to ([^.;]+)/gi);
                    if (requirementsMatch) {
                        physicalDemands.requirements = requirementsMatch.map(req => req.trim());
                    }

                    const visionMatch = physicalText.match(/vision abilities required by this job include ([^.;]+)/i);
                    if (visionMatch) {
                        physicalDemands.visionRequirements = visionMatch[1].split(',').map(item => item.trim());
                    }
                }

                return {
                    url: jobData.url,
                    title: jobData.title,
                    company: jobData.hiringOrganization?.name || 'Mercyhealth',
                    department: department,
                    location: jobData.jobLocation?.address ? {
                        city: jobData.jobLocation.address.addressLocality,
                        state: jobData.jobLocation.address.addressRegion,
                        hospital: hospital,
                        address: jobData.jobLocation.address.streetAddress
                    } : null,
                    employmentType: jobData.employmentType,
                    jobId: jobData.jobId,
                    salary: salary,
                    description: description,
                    responsibilities: responsibilities,
                    qualifications: qualifications,
                    cultureOfExcellence: cultureOfExcellence,
                    physicalDemands: physicalDemands
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

    // Add basic job information
    xml += `  <title>${escapeXML(jsonLdData.title)}</title>\n`;
    xml += `  <company>${escapeXML(jsonLdData.hiringOrganization?.name || '')}</company>\n`;
    
    // Add location information
    if (jsonLdData.jobLocation?.address) {
        const address = jsonLdData.jobLocation.address;
        xml += '  <location>\n';
        xml += `    <city>${escapeXML(address.addressLocality || '')}</city>\n`;
        xml += `    <state>${escapeXML(address.addressRegion || '')}</state>\n`;
        xml += `    <address>${escapeXML(address.streetAddress || '')}</address>\n`;
        xml += '  </location>\n';
    }

    // Add employment type
    xml += `  <employment-type>${escapeXML(jsonLdData.employmentType || '')}</employment-type>\n`;

    // Process description sections
    const description = jsonLdData.description || '';
    const sections = description.split(/<br>([^<]+)<br>/g)
        .filter(Boolean)
        .map(section => section.trim())
        .filter(section => section.length > 0);

    let currentSection = '';
    for (const section of sections) {
        const sectionMatch = section.match(/^([^<]+)/);
        if (sectionMatch) {
            currentSection = sectionMatch[1].trim();
            xml += `  <section name="${escapeXML(currentSection)}">\n`;
            
            // Extract content
            const content = section.replace(/^[^<]+/, '').trim();
            if (content) {
                // Handle lists
                if (content.includes('<ul>')) {
                    const listItems = content.match(/<li>([^<]+)<\/li>/g);
                    if (listItems) {
                        xml += '    <list>\n';
                        listItems.forEach(item => {
                            const text = item.replace(/<\/?li>/g, '').trim();
                            xml += `      <item>${escapeXML(text)}</item>\n`;
                        });
                        xml += '    </list>\n';
                    }
                } else {
                    // Handle paragraphs
                    const paragraphs = content.split(/<p[^>]*>/).filter(Boolean);
                    paragraphs.forEach(p => {
                        const text = p.replace(/<[^>]+>/g, '').trim();
                        if (text) {
                            xml += `    <paragraph>${escapeXML(text)}</paragraph>\n`;
                        }
                    });
                }
            }
            xml += '  </section>\n';
        }
    }

    // Add responsibilities section if available separately
    if (jsonLdData.responsibilities) {
        xml += '  <section name="Responsibilities">\n';
        const responsibilities = jsonLdData.responsibilities
            .replace(/<\/?p[^>]*>/g, '')
            .replace(/<\/?strong[^>]*>/g, '')
            .replace(/<ul>/g, '')
            .replace(/<\/ul>/g, '')
            .split(/<li>/)
            .filter(Boolean)
            .map(item => item.replace(/<\/li>/g, '').trim());

        xml += '    <list>\n';
        responsibilities.forEach(item => {
            xml += `      <item>${escapeXML(item)}</item>\n`;
        });
        xml += '    </list>\n';
        xml += '  </section>\n';
    }

    // Add qualifications section if available separately
    if (jsonLdData.qualifications) {
        xml += '  <section name="Qualifications">\n';
        const qualifications = jsonLdData.qualifications
            .replace(/<\/?p[^>]*>/g, '')
            .split(/<br\s*\/?>/g)
            .filter(Boolean)
            .map(item => item.trim());

        qualifications.forEach(item => {
            xml += `    <paragraph>${escapeXML(item)}</paragraph>\n`;
        });
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