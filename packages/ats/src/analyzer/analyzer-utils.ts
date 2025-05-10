// analyzer-utils.ts
// Shared utilities for CV analyzers (classic and TF-IDF)
import type { CVData } from '@dzb-cv/types';
import type { JobPosting } from '@dzb-cv/types/job';

/**
 * Default stop words for keyword extraction.
 */
export const DEFAULT_STOP_WORDS = new Set<string>([
  'the',
  'a',
  'an',
  'and',
  'or',
  'but',
  'of',
  'for',
  'with',
  'in',
  'on',
  'at',
  'to',
  'from',
  'by',
  'as',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'shall',
  'should',
  'can',
  'could',
  'may',
  'might',
  'must',
  'this',
  'that',
  'these',
  'those',
  'job',
  'work',
  'role',
  'position',
  'candidate',
  'applicant',
  'required',
  'preferred',
  'qualification',
  'experience',
  'skill',
  'ability',
  'about',
  'our',
  'we',
  'us',
  'you',
  'your',
  'their',
  'they',
  'it',
  'its',
  'company',
  'team',
  'opportunity',
  'looking',
  'join',
  'working',
  'responsibilities',
  'skills',
  'year',
  'years',
  'good',
  'great',
  'excellent',
  'strong',
  'amp',
  'also',
  'etc',
  'please',
  'want',
  'help',
  'using',
  'not',
  'no',
  'yes',
  'if',
  'then',
  'else',
  'so',
  'very',
  'just',
  'how',
  'when',
  'where',
  'why',
  'what',
  'who',
  'whom',
  'which',
  'any',
  'all',
  'each',
  'every',
  'some',
  'more',
  'most',
  'other',
  'such',
  'only',
  'than',
  'too',
  'very',
  'just',
  'over',
  'before',
  'after',
  'between',
  'under',
  'above',
  'below',
  'during',
  'since',
  'until',
  'while',
  'like',
  'through',
  'at',
  'least',
  'minimum',
  'maximum',
  'plus',
  'plus',
  'add',
  'remove',
  'present',
  'current',
  'past',
  'future',
  'now',
  'new',
  'old',
  'recent',
  'former',
  'previous',
  'next',
  'first',
  'last',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '0',
]);

/**
 * Extracts keywords from text using regexes and stop word filtering.
 */
export function extractKeywords(
  text: string,
  stopWords: Set<string> = DEFAULT_STOP_WORDS
): string[] {
  if (!text || text.trim() === '') return [];
  // Compound/tech terms
  const techTermsRegex =
    /\b(React|TypeScript|JavaScript|Vue\.js|Angular|Node\.js|Next\.js|HTML5|CSS3|jQuery|Express\.js|MongoDB|SQL|AWS|Azure|Docker|Kubernetes|Git|Jest|Webpack|Babel|Gulp|Grunt|Redux|Vuex|GraphQL|REST|API|JSON|XML|SASS|SCSS|LESS|Tailwind|Bootstrap|Material-UI|Storybook|Cypress|Selenium|Jenkins|Travis|CircleCI|Github Actions)\b/gi;
  const specificTechRegex =
    /\b(jest|webpack|docker|typescript|node\.js|react\.js|vue\.js|next\.js)\b/gi;
  let match;
  const compoundTerms: string[] = [];
  while ((match = techTermsRegex.exec(text)) !== null) compoundTerms.push(match[0]);
  while ((match = specificTechRegex.exec(text)) !== null) compoundTerms.push(match[0]);
  // Experience phrases
  const experienceRegex =
    /\b(\d+\+?\s*(?:to\s+\d+\s*)?(?:-\s*\d+\s*)?years?(?:\s+(?:of|in))?\s+(?:experience|exp\.?|work(?:ing)?(?:\s+experience)?)|minimum\s+of\s+\d+\+?\s*years?|at\s+least\s+\d+\+?\s*years?|\d+\+?\s*years?\s+(?:of|in)?\s*(?:experience|exp\.?))\b/gi;
  while ((match = experienceRegex.exec(text)) !== null) compoundTerms.push(match[0]);
  // Tokenize and filter
  const tokens = text.split(/\W+/).filter(Boolean);
  const filteredTokens = [...new Set(tokens)].filter(
    (token) => token.length > 2 && !stopWords.has(token.toLowerCase())
  );
  return [...new Set([...compoundTerms, ...filteredTokens])];
}

/**
 * Calculates the highest education level in a CV and required by a job posting.
 * Returns [cvLevel, requiredLevel].
 */
export function getEducationLevels(cv: CVData, posting: JobPosting): [number, number] {
  const EDUCATION_LEVELS: Record<string, number> = {
    'high school': 1,
    associate: 2,
    bachelor: 3,
    master: 4,
    phd: 5,
    doctorate: 5,
  };
  let highestCVEducation = 0;
  for (const edu of cv.education) {
    for (const [keyword, value] of Object.entries(EDUCATION_LEVELS)) {
      if (edu.degree.toLowerCase().includes(keyword)) {
        highestCVEducation = Math.max(highestCVEducation, value);
      }
    }
  }
  let requiredEducation = 0;
  const findLevel = (text: string): number => {
    let level = 0;
    for (const [keyword, value] of Object.entries(EDUCATION_LEVELS)) {
      if (text.toLowerCase().includes(keyword)) level = Math.max(level, value);
    }
    return level;
  };
  if (posting.qualifications) {
    for (const qual of posting.qualifications) {
      requiredEducation = Math.max(requiredEducation, findLevel(qual));
    }
  }
  if (requiredEducation === 0 && posting.description) {
    requiredEducation = findLevel(posting.description);
  }
  if (requiredEducation === 0) requiredEducation = 1;
  return [highestCVEducation, requiredEducation];
}

/**
 * Calculates the total years of experience in a CV and required by a job posting.
 * Returns [cvYears, requiredYears].
 */
export function getExperienceYears(cv: CVData, posting: JobPosting): [number, number] {
  let totalYears = 0;
  for (const exp of cv.experience) {
    if (!exp.startDate) continue;
    const startDate = new Date(exp.startDate);
    const endDate = exp.endDate ? new Date(exp.endDate) : new Date();
    const years =
      endDate.getFullYear() -
      startDate.getFullYear() +
      (endDate.getMonth() - startDate.getMonth()) / 12;
    totalYears += Math.max(0, years);
  }
  let requiredYears = 0;
  let found = false;
  const patterns = [
    /(\d+)\+?\s*years?\s*(?:of)?\s*experience/i,
    /experience\s*(?:of)?\s*(\d+)\+?\s*years?/i,
    /(\d+)\+?\s*\+\s*years?\s*(?:of)?\s*experience/i,
    /minimum\s*(?:of)?\s*(\d+)\+?\s*years?/i,
    /at\s*least\s*(\d+)\+?\s*years?/i,
  ];
  const check = (text: string) => {
    for (const pat of patterns) {
      const m = text.match(pat);
      if (m && m[1]) {
        requiredYears = Math.max(requiredYears, parseInt(m[1], 10));
        found = true;
      }
    }
  };
  if (posting.description) check(posting.description);
  if (posting.qualifications) posting.qualifications.forEach(check);
  return [totalYears, found ? requiredYears : 0];
}

/**
 * Generates suggestions for missing keywords, skills, experience, and education.
 */
export function generateSuggestions(
  cv: CVData,
  posting: JobPosting,
  missingKeywords: string[]
): string[] {
  const suggestions: string[] = [];
  if (missingKeywords.length > 0) {
    suggestions.push(`Consider adding these keywords to your CV: ${missingKeywords.join(', ')}`);
  }
  // Skills
  const jobSkills = posting.skills || [];
  const cvSkillsLower = new Set(cv.skills.map((s) => s.name.toLowerCase()));
  const missingSkills = jobSkills.filter((skill) => !cvSkillsLower.has(skill.toLowerCase()));
  if (missingSkills.length > 0) {
    suggestions.push(`Add relevant skills: ${missingSkills.join(', ')}`);
  }
  // Experience
  const [cvYears, requiredYears] = getExperienceYears(cv, posting);
  if (requiredYears > 0 && cvYears < requiredYears) {
    suggestions.push(
      `The job requires ${requiredYears} years of experience, but your CV shows ${Math.floor(cvYears)} years.`
    );
  }
  // Education
  const [cvLevel, requiredLevel] = getEducationLevels(cv, posting);
  if (requiredLevel > 0 && cvLevel < requiredLevel) {
    suggestions.push('Your education level might be below the job requirements.');
  }
  if (!cv.skills || cv.skills.length === 0) suggestions.push('Add a skills section to your CV.');
  if (!cv.experience || cv.experience.length === 0)
    suggestions.push('Add work experience to your CV.');
  if (!cv.education || cv.education.length === 0)
    suggestions.push('Add education details to your CV.');
  return suggestions;
}
