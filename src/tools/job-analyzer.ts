import type { JobPostingAnalysis } from '../shared/types/cv-types.js';

export async function analyzeJobPosting(url: string): Promise<JobPostingAnalysis> {
  const domain = new URL(url).hostname;

  return {
    title: '',
    company: '',
    responsibilities: [],
    qualifications: [],
    keyTerms: [],
    source: {
      url,
      site: domain || 'Generic',
      fetchDate: new Date(),
    },
  };
}

export function extractKeyTerms(text: string): string[] {
  return text
    .split(/\W+/)
    .filter((word) => word.length > 2)
    .map((word) => word.toLowerCase());
}
