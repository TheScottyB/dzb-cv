import fs from 'fs/promises';
import path from 'path';

const AGENCY_ABBREVIATIONS: Record<string, string> = {
  'Illinois Department of Human Services': 'idhs',
  'California Department of Human Resources': 'calhr',
  'State Compensation Insurance Fund': 'scif',
  'Northwestern Medicine': 'northwestern-medicine',
  Mercyhealth: 'mercyhealth',
  // Add more as needed
};

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-');
}

export async function getJobPostingFolderName(jobDataPath: string): Promise<string | null> {
  try {
    const raw = await fs.readFile(jobDataPath, 'utf-8');
    const data = JSON.parse(raw);
    // Source
    let source = '';
    if (data.source && typeof data.source === 'string') {
      source = slugify(data.source);
    } else if (data.url) {
      const match = data.url.match(/https?:\/\/(www\.)?([\w.-]+)/);
      source = match ? slugify(match[2]) : '';
    } else if (data.urlInfo && data.urlInfo.baseUrl) {
      const match = data.urlInfo.baseUrl.match(/https?:\/\/(www\.)?([\w.-]+)/);
      source = match ? slugify(match[2]) : '';
    }
    // Company
    let company = '';
    if (data.company && AGENCY_ABBREVIATIONS[data.company]) {
      company = AGENCY_ABBREVIATIONS[data.company];
    } else if (data.company) {
      company = slugify(data.company);
    }
    // Job Title
    let jobTitle = '';
    if (data.title) {
      jobTitle = slugify(data.title)
        .replace(/-technician/, '-tech')
        .replace(/-representative/, '-rep')
        .replace(/-laboratory/, '-lab')
        .replace(/-supervisor/, '-supervisor')
        .replace(/-assistant/, '-asst');
    }
    // Job ID
    let jobId = '';
    if (data.jobId) {
      jobId = slugify(String(data.jobId));
    }
    // Compose folder name
    let folder = [source, company, jobTitle].filter(Boolean).join('-');
    if (jobId && !jobTitle.includes(jobId)) {
      folder += `-${jobId}`;
    }
    return folder;
  } catch (e) {
    return null;
  }
}
