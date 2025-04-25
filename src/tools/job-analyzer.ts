import type { JobPostingAnalysis } from '../shared/types/cv-types.js';
import puppeteer from 'puppeteer';

interface JobDetails {
  title: string;
  company: string;
  location: string;
  responsibilities: string[];
  qualifications: string[];
  educationRequirements: string[];
  fullContent: string;
}

export async function analyzeJobPosting(url: string): Promise<JobPostingAnalysis> {
  let browser;
  try {
    console.log('Launching browser...');
    browser = await puppeteer.launch();
    const page = await browser.newPage();

    console.log('Navigating to URL...');
    const response = await page.goto(url);

    if (!response) {
      throw new Error('Failed to get response from page');
    }

    const status = response.status();
    if (status !== 200) {
      throw new Error(`Page returned status ${status}`);
    }

    console.log('Waiting for content to load...');
    await page.waitForSelector('body');

    console.log('Extracting job details...');
    const jobDetails = await page.evaluate((): JobDetails => {
      // Helper function to safely get text content
      const getText = (selector: string): string => {
        const element = document.querySelector(selector);
        return element ? element.textContent?.trim() || '' : '';
      };

      // Helper function to get text from multiple possible selectors
      const getTextFromMultiple = (selectors: string[]): string => {
        for (const selector of selectors) {
          const text = getText(selector);
          if (text) return text;
        }
        return '';
      };

      // Helper function to get list items from a section
      const getListItemsFromSection = (element: Element): string[] => {
        const listItems = element.querySelectorAll('li');
        if (listItems.length > 0) {
          return Array.from(listItems)
            .map(li => li.textContent?.trim() || '')
            .filter(text => text.length > 0);
        }
        return splitIntoBullets(element.textContent || '');
      };

      // Function to clean and split text into bullet points
      const splitIntoBullets = (text: string): string[] => {
        return text.split(/[•\-\*]|\d+\./)
          .map(item => item.trim())
          .filter(item => item.length > 0);
      };

      // Try to find structured data first (JSON-LD)
      const jsonLd = document.querySelector('script[type="application/ld+json"]');
      if (jsonLd) {
        try {
          const data = JSON.parse(jsonLd.textContent || '');
          if (data && typeof data === 'object' && data['@type'] === 'JobPosting') {
            const jobData = data as {
              title?: string;
              hiringOrganization?: { name?: string };
              jobLocation?: { 
                address?: { 
                  addressLocality?: string;
                  addressRegion?: string;
                }
              };
              responsibilities?: unknown;
              qualifications?: unknown;
              educationRequirements?: unknown;
            };

            return {
              title: jobData.title || '',
              company: (jobData.hiringOrganization?.name) || '',
              location: (jobData.jobLocation?.address) ? 
                `${jobData.jobLocation.address.addressLocality || ''}, ${jobData.jobLocation.address.addressRegion || ''}`.trim() : '',
              responsibilities: Array.isArray(jobData.responsibilities) ? jobData.responsibilities.map(String) : [],
              qualifications: Array.isArray(jobData.qualifications) ? jobData.qualifications.map(String) : [],
              educationRequirements: Array.isArray(jobData.educationRequirements) ? jobData.educationRequirements.map(String) : [],
              fullContent: document.body.textContent || ''
            };
          }
        } catch (e) {
          console.error('Failed to parse JSON-LD:', e);
        }
      }

      // Title selectors
      const titleSelectors = [
        'h1',
        '.job-title',
        '[data-automation="job-title"]',
        '.posting-title',
        '.position-title',
        '[itemprop="title"]',
        '#job-title',
        '.jobTitle',
        // Mercy-specific selectors
        '.job-description__heading',
        '.job-description-title'
      ];

      // Company selectors
      const companySelectors = [
        '.company-name',
        '[data-automation="employer-name"]',
        '.employer',
        '[itemprop="hiringOrganization"]',
        '#employer-name',
        '.organizationName',
        // Mercy-specific selectors
        '.job-description__company',
        '.employer-name'
      ];

      // Location selectors
      const locationSelectors = [
        '.location',
        '[data-automation="job-location"]',
        '[itemprop="jobLocation"]',
        '#job-location',
        '.jobLocation',
        // Mercy-specific selectors
        '.job-description__location',
        '.location-name'
      ];

      // Extract sections by looking for headers and their content
      const sections = {
        responsibilities: [] as string[],
        qualifications: [] as string[],
        education: [] as string[]
      };

      type SectionType = keyof typeof sections;

      // Look for sections in the document
      document.querySelectorAll('h1, h2, h3, h4, h5, h6, strong, b, .job-description__section-header').forEach(heading => {
        const text = heading.textContent?.toLowerCase() || '';
        let sectionType: SectionType | '' = '';
        
        if (text.includes('responsibilities') || text.includes('duties') || text.includes('what you will do') || text.includes('essential functions')) {
          sectionType = 'responsibilities';
        } else if (text.includes('qualifications') || text.includes('requirements') || text.includes('what you need') || text.includes('required skills')) {
          sectionType = 'qualifications';
        } else if (text.includes('education') || text.includes('degree') || text.includes('certification')) {
          sectionType = 'education';
        }

        if (sectionType) {
          let currentElement = heading.nextElementSibling;
          const content: string[] = [];

          // For Mercy's new job board, look for specific content containers
          const contentContainer = heading.closest('.job-description__section')?.querySelector('.job-description__section-content');
          if (contentContainer) {
            content.push(...getListItemsFromSection(contentContainer));
          } else {
            while (currentElement && 
                   !['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(currentElement.tagName) &&
                   !currentElement.classList.contains('job-description__section-header')) {
              if (currentElement.textContent?.trim()) {
                content.push(...getListItemsFromSection(currentElement));
              }
              currentElement = currentElement.nextElementSibling;
            }
          }

          if (content.length > 0) {
            sections[sectionType] = content;
          }
        }
      });

      return {
        title: getTextFromMultiple(titleSelectors),
        company: getTextFromMultiple(companySelectors),
        location: getTextFromMultiple(locationSelectors),
        responsibilities: sections.responsibilities,
        qualifications: sections.qualifications,
        educationRequirements: sections.education,
        fullContent: document.body.textContent || ''
      };
    });

    console.log('Creating analysis...');
    return {
      title: jobDetails.title || 'Unknown Position',
      company: jobDetails.company || 'Unknown Company',
      location: jobDetails.location,
      responsibilities: jobDetails.responsibilities || ['Not specified'],
      qualifications: jobDetails.qualifications || ['Not specified'],
      keyTerms: extractKeyTerms(jobDetails.fullContent),
      educationRequirements: jobDetails.educationRequirements || [],
      source: {
        url,
        site: new URL(url).hostname,
        fetchDate: new Date()
      }
    };
  } catch (error) {
    console.error('Error details:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function extractKeyTerms(content: string): string[] {
  // Common key terms to look for in job postings
  const keyTermPatterns = [
    /\b(?:proficient|experience|skill|knowledge)\s+(?:in|with)?\s+([A-Za-z0-9+#\s]+)/gi,
    /\b(?:certification|degree|diploma)\s+(?:in)?\s+([A-Za-z0-9\s]+)/gi,
    /\b(?:familiar|expertise)\s+(?:with)?\s+([A-Za-z0-9+#\s]+)/gi,
    /\b(?:understanding|mastery)\s+of\s+([A-Za-z0-9+#\s]+)/gi,
    /\b(?:years|yrs)\s+(?:of)?\s+experience\s+(?:in|with)?\s+([A-Za-z0-9+#\s]+)/gi
  ];

  const terms = new Set<string>();
  
  // Extract terms using patterns
  keyTermPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      if (match[1]) {
        const term = match[1].trim();
        if (term.length > 2) { // Ignore very short terms
          terms.add(term);
        }
      }
    }
  });

  // Extract technical terms and skills
  const technicalTerms = content.match(/\b[A-Z][A-Za-z0-9+#]+(?:\.[A-Za-z0-9+#]+)*\b/g) || [];
  technicalTerms.forEach(term => {
    if (term.length > 2) {
      terms.add(term);
    }
  });

  return Array.from(terms);
} 