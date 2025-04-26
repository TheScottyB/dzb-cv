import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import cheerio, { CheerioAPI } from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface JobDetails {
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  skills: string[];
  jobDetails: {
    pay: string;
    type: string;
  };
  qualifications: string[];
  requirements: string[];
  metadata: {
    jobId: string;
    scrapedAt: string;
    source: string;
    url: string;
  };
}

function cleanLocation(location: string): string {
  if (!location) return '';

  const components = {
    streetAddress: '',
    city: '',
    state: '',
    zip: '',
  };

  const parts = location.split(',').map((part) => part.trim());

  for (const part of parts) {
    if (part.match(/^\d+/)) {
      components.streetAddress = part;
    } else if (part.match(/^[A-Z]{2}\s*\d{5}/)) {
      const stateZip = part.match(/([A-Z]{2})\s*(\d{5})/);
      if (stateZip) {
        [, components.state, components.zip] = stateZip;
      }
    } else if (part.match(/^[A-Z]{2}$/)) {
      components.state = part;
    } else if (part.match(/^\d{5}$/)) {
      components.zip = part;
    } else {
      components.city = part;
    }
  }

  return Object.values(components).filter(Boolean).join(', ');
}

async function extractJobDetails($: cheerio.CheerioAPI, jobId: string): Promise<JobDetails> {
  const jobContainer = $('div[class*="jobsearch-BodyContainer"]');
  const jobDescriptionText = $('#jobDescriptionText');

  const titleFromHeader = $('h1.jobsearch-JobInfoHeader-title').text().trim();
  const titleFromDescription = jobDescriptionText
    .find('b')
    .first()
    .text()
    .trim()
    .replace(/Ignite Team Partners is looking for a|to join our team\./g, '')
    .trim();

  const companyFromHeader = $('[data-company-name="true"]').text().trim();
  const rawLocation = $('[data-testid="job-location"]').text().trim();

  const jobData: JobDetails = {
    title: titleFromHeader || titleFromDescription || 'Medical Cash Poster',
    company: companyFromHeader || 'Ignite Team Partners',
    location: cleanLocation(rawLocation),
    salary: $('.jobsearch-JobMetadataHeader-item').text().trim(),
    description: jobDescriptionText.text().trim(),
    skills: extractSkills($),
    jobDetails: {
      pay: extractPayDetails($),
      type: extractJobType($),
    },
    qualifications: extractListItems($, 'first'),
    requirements: extractListItems($, 'last'),
    metadata: {
      jobId,
      scrapedAt: new Date().toISOString(),
      source: 'indeed.com',
      url: `https://www.indeed.com/viewjob?jk=${jobId}`,
    },
  };

  return jobData;
}

function extractSkills($: CheerioAPI): string[] {
  return $('div[aria-label="Skills"] span[class*="js-match-insights-provider-1vjtffa"]')
    .map((_: number, el: any) => $(el).text().trim())
    .get()
    .filter(Boolean);
}

function extractPayDetails($: cheerio.CheerioAPI): string {
  return $('div[aria-label="Pay"] span[class*="js-match-insights-provider-1vjtffa"]')
    .first()
    .text()
    .trim();
}

function extractJobType($: cheerio.CheerioAPI): string {
  return $('div[aria-label="Job type"] span[class*="js-match-insights-provider-1vjtffa"]')
    .first()
    .text()
    .trim();
}

function extractListItems($: CheerioAPI, position: 'first' | 'last'): string[] {
  const list = $('#jobDescriptionText').find('ul');
  const items = position === 'first' ? list.first() : list.last();

  return items
    .find('li')
    .map((_: number, el: any) => $(el).text().trim())
    .get()
    .filter(Boolean);
}

async function parseJobPage(htmlPath: string, jobId: string): Promise<void> {
  try {
    const jobDir = join(process.cwd(), 'job-postings', jobId);
    const sourceDir = join(jobDir, 'source');
    const generatedDir = join(jobDir, 'generated');
    const outputPath = join(generatedDir, 'job-data.json');

    await fs.mkdir(generatedDir, { recursive: true });

    console.log('Reading HTML from:', htmlPath);
    const html = await fs.readFile(htmlPath, 'utf8');
    const $ = cheerio.load(html);

    const jobData = await extractJobDetails($, jobId);

    // Log extracted data
    console.log('\nExtracted Job Details:');
    console.log('Title:', jobData.title);
    console.log('Company:', jobData.company);
    console.log('Location:', jobData.location);
    console.log('Salary:', jobData.salary);
    console.log('\nSkills:', jobData.skills.length);
    console.log('Qualifications:', jobData.qualifications.length);
    console.log('Requirements:', jobData.requirements.length);

    await fs.writeFile(outputPath, JSON.stringify(jobData, null, 2));
    console.log('\nParsed data saved to:', outputPath);
  } catch (error) {
    console.error(
      'Error parsing job page:',
      error instanceof Error ? error.message : String(error),
    );
    throw error;
  }
}

async function main(): Promise<void> {
  const jobId = process.argv[2];
  if (!jobId) {
    console.error('Please provide a job ID');
    process.exit(1);
  }

  try {
    const htmlPath = join(process.cwd(), 'job-postings', jobId, 'source', 'job-page.html');
    await parseJobPage(htmlPath, jobId);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
