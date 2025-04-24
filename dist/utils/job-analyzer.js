import { JSDOM } from 'jsdom';
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
// --- Parser Function Definitions (Moved above analyzeJobPosting) ---
/**
 * Extracts list items from a collection of elements
function extractListItemsFromElements(elements: Element[]): string[] {
  const items: string[] = [];
  for (const element of elements) {
    if (element.tagName === 'UL' || element.tagName === 'OL') {
      const listItems = Array.from(element.querySelectorAll('li'))
        .map(li => li.textContent?.trim())
        .filter(Boolean) as string[];
      items.push(...listItems);
    } else if (element.querySelectorAll('ul, ol').length > 0) {
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
//# sourceMappingURL=job-analyzer.js.map