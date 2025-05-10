/**
 * Data Transformer Utility
 *
 * Provides functions to transform CV data structure for compatibility with templates
 */

import type { CVData } from '../types/cv-types';

interface WorkExperienceItem {
  employer: string;
  position: string;
  period?: string;
  startDate?: string;
  endDate?: string;
  duties?: string[];
  achievements?: string[];
  [key: string]: unknown;
}

interface WorkExperienceCategories {
  [category: string]: WorkExperienceItem[];
}

/**
 * Transforms a period string like "January 2023 - February 2024" into start and end dates
 * @param period - Period string to parse
 * @returns Object containing startDate and endDate (undefined if "Present")
 */
function parsePeriod(period?: string): { startDate: string; endDate?: string } {
  if (!period) {
    return { startDate: new Date().toISOString() };
  }

  // Handle various period formats
  let startDate: string = new Date().toISOString();
  let endDate: string | undefined = undefined;

  if (period.includes('-')) {
    const parts = period.split('-').map((p) => p.trim());
    const start = parts[0];
    const end = parts[1];

    if (start) {
      startDate = parseDate(start);
    }

    if (end) {
      endDate = end.toLowerCase() === 'present' ? undefined : parseDate(end);
    }
  } else if (period.includes('to')) {
    const parts = period.split('to').map((p) => p.trim());
    const start = parts[0];
    const end = parts[1];

    if (start) {
      startDate = parseDate(start);
    }

    if (end) {
      endDate = end.toLowerCase() === 'present' ? undefined : parseDate(end);
    }
  } else {
    // Assume single year or date
    startDate = parseDate(period);
    endDate = undefined;
  }

  // Return the parsed dates
  return {
    startDate,
    ...(endDate !== undefined ? { endDate } : {}),
  };
}

/**
 * Parse a date string into ISO format
 * Handles various formats including "January 2023", "Jan 2023", "2023"
 */
function parseDate(dateStr: string): string {
  try {
    // If only year is provided
    if (/^\d{4}$/.test(dateStr)) {
      return new Date(`${dateStr}-01-01`).toISOString();
    }

    // Handle month and year format
    return new Date(dateStr).toISOString();
  } catch (error) {
    console.warn(`Could not parse date: ${dateStr}, using current date`);
    return new Date().toISOString();
  }
}

/**
 * Flattens the nested workExperience structure and adds date properties for sorting
 * @param workExperience - Nested work experience object
 * @returns Flattened array of work experience items with date properties
 */
export function flattenWorkExperience(
  workExperience: WorkExperienceCategories
): WorkExperienceItem[] {
  const result: WorkExperienceItem[] = [];

  // Iterate through each category and collect all experience items
  Object.keys(workExperience).forEach((category) => {
    const experiences = workExperience[category];

    if (Array.isArray(experiences)) {
      experiences.forEach((exp) => {
        const experience = { ...exp };

        // Parse period if present and add start/end dates
        if (experience.period) {
          const { startDate, endDate } = parsePeriod(experience.period as string);

          if (!experience.startDate) {
            experience.startDate = startDate;
          }

          if (!experience.endDate && endDate) {
            experience.endDate = endDate;
          }

          // Add date property for sorting (using startDate)
          experience.date = startDate;
        }

        // Add category for reference
        experience.category = category;

        result.push(experience as WorkExperienceItem);
      });
    }
  });

  return result;
}

/**
 * Transforms CV data for template compatibility
 * @param cvData - Original CV data structure
 * @returns Transformed CV data with flattened work experience
 */
export function transformCVData(cvData: CVData): CVData {
  // Create a deep copy to avoid modifying the original
  const transformedData = JSON.parse(JSON.stringify(cvData)) as CVData;

  // Flatten work experience if it's a nested object
  if (
    transformedData.workExperience &&
    typeof transformedData.workExperience === 'object' &&
    !Array.isArray(transformedData.workExperience)
  ) {
    // First capture the flattened array
    const flattened = flattenWorkExperience(
      transformedData.workExperience as unknown as WorkExperienceCategories
    );

    // Then construct a new object that has the same shape as the original
    // but with the flattened data added as a property
    const newWorkExperience: Record<string, any> = {};
    newWorkExperience.flattened = flattened;

    // Copy original categories as empty arrays to maintain structure
    Object.keys(transformedData.workExperience).forEach((key) => {
      newWorkExperience[key] = [];
    });

    // Replace the work experience with our modified version
    transformedData.workExperience = newWorkExperience as any;
  }

  return transformedData;
}
