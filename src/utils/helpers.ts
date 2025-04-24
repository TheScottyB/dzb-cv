// @ts-check
import { readFile } from "fs/promises";
import { join } from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import type { CVData } from "../types/cv-types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Current date for "present" calculations
const CURRENT_DATE = new Date();

export async function loadTemplate(templatePath: string): Promise<Handlebars.TemplateDelegate> {
  const template = await readFile(templatePath, "utf-8");
  return Handlebars.compile(template);
}

export async function loadCVData(dataPath: string): Promise<CVData> {
  const data = await readFile(dataPath, "utf-8");
  return JSON.parse(data) as CVData;
}

/**
 * Formats a date into a human-readable string (Month Year)
 * @param {Date|string} date - Date to format or ISO date string
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(date: Date | string, options: Intl.DateTimeFormatOptions = {}): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) return '';
  
  const defaultOptions = {
    year: "numeric",
    month: "long",
  };
  
  return dateObj.toLocaleDateString("en-US", { ...defaultOptions, ...options });
}

/**
 * Formats a date in MM/YYYY format for federal resume standards
 * @param {any} options - Handlebars options object containing the date string
 * @returns {string} Formatted date in MM/YYYY format
 */
export function formatUSDate(this: any, dateStr: string): string {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return '';
    
    // Format as MM/YYYY
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${month}/${year}`;
  } catch (error) {
    console.error(`Error formatting date: ${dateStr}`, error);
    return dateStr; // Return original if parsing fails
  }
}

/**
 * Sorts experiences by date in reverse chronological order (newest first)
 * @param {any} context - The current template context
 * @param {Handlebars.HelperOptions} options - Handlebars options object
 * @returns {string} Rendered template content with sorted experiences
 */
export function sortByDate(context: any, options: Handlebars.HelperOptions): string {
  // If called as a regular helper rather than a block helper, return empty string
  if (!options || typeof options.fn !== 'function') {
    console.error("sortByDate must be used as a block helper with {{#sortByDate}}...{{/sortByDate}}");
    return '';
  }
  
  // Create an array to hold all experiences
  const allExperiences: any[] = [];
  
  // Get the current context (either passed directly or available as 'this')
  const currentContext = context || this;
  
  // Make sure we have a valid context
  if (!currentContext || !currentContext.workExperience) {
    console.warn("sortByDate: No work experience found in context");
    return options.fn(currentContext); // Return the block with original context
  }
  
  // Extract work experience from the context
  const { workExperience } = currentContext;
  
  // Add healthcare experiences if available
  if (workExperience.healthcare && Array.isArray(workExperience.healthcare)) {
    allExperiences.push(...workExperience.healthcare.map((exp: any) => {
      return {
        ...exp,
        source: 'healthcare',
        startDateObj: parseDate(exp.startDate || parseTextualPeriod(exp.period))
      };
    }));
  }
  
  // Add real estate experiences if available
  if (workExperience.realEstate && Array.isArray(workExperience.realEstate)) {
    allExperiences.push(...workExperience.realEstate.map((exp: any) => {
      return {
        ...exp,
        source: 'realEstate',
        startDateObj: parseDate(exp.startDate || parseTextualPeriod(exp.period))
      };
    }));
  }
  
  // Add food industry experiences if available
  if (workExperience.foodIndustry && Array.isArray(workExperience.foodIndustry)) {
    allExperiences.push(...workExperience.foodIndustry.map((exp: any) => {
      return {
        ...exp,
        source: 'foodIndustry',
        startDateObj: parseDate(exp.startDate || parseTextualPeriod(exp.period))
      };
    }));
  }
  
  // Sort by start date in reverse chronological order (newest first)
  allExperiences.sort((a, b) => {
    // Handle missing dates - if no date, consider it oldest
    if (!a.startDateObj) return 1;
    if (!b.startDateObj) return -1;
    
    // Sort recent dates first (descending)
    return b.startDateObj.getTime() - a.startDateObj.getTime();
  });
  
  // Create a new context with the sorted experiences
  const newContext = { ...currentContext, allExperience: allExperiences };
  
  // Execute the block with the modified context
  return options.fn(newContext);
}

/**
 * Maps a position title to a federal GS grade level
 * @param {string} position - Job position or title
 * @returns {number} Estimated GS grade level (1-15)
 */
export function calculateGradeLevel(position: string): number {
  // Map position levels to approximate GS grades
  const levelMappings: Record<string, number> = {
    'Executive': 15,
    'Director': 14,
    'Manager': 13,
    'Supervisor': 12,
    'Senior': 11,
    'Lead': 10,
    'Specialist': 9,
    'Associate': 7,
    'Assistant': 5,
    'Secretary': 5,
    'Administrative': 6,
    'Technician': 7,
    'Coordinator': 8,
    'Clerk': 4,
    'Intern': 3
  };

  // Check if any keywords from the mapping appear in the position title
  const positionLower = position ? position.toLowerCase() : '';
  for (const [keyword, grade] of Object.entries(levelMappings)) {
    if (positionLower.includes(keyword.toLowerCase())) {
      return grade;
    }
  }
  
  // Default grades based on specific roles
  if (positionLower.includes('broker') || positionLower.includes('managing')) {
    return 13;
  } else if (positionLower.includes('agent') || positionLower.includes('representative')) {
    return 9;
  } else if (positionLower.includes('front desk') || positionLower.includes('pharmacy')) {
    return 6;
  } else if (positionLower.includes('veterinary') || positionLower.includes('medical')) {
    return 8;
  }

  // Default to GS-9 if no match found (mid-level professional)
  return 9;
}

/**
 * Calculates total years of professional experience from all work history
 * @param {any[]} experiences - Array of work experiences
 * @returns {number} Total years of professional experience
 */
export function calculateTotalYears(experiences: any[]): number {
  if (!experiences || !Array.isArray(experiences) || experiences.length === 0) {
    return 0;
  }
  
  let totalMonths = 0;
  
  experiences.forEach(exp => {
    let startDate = exp.startDate ? new Date(exp.startDate) : null;
    let endDate = exp.endDate ? new Date(exp.endDate) : new Date(); // Use current date for ongoing positions
    
    // If we have a period text instead of explicit dates
    if (!startDate && exp.period) {
      const dates = parseTextualPeriodForTotalYears(exp.period);
      if (dates.startDate) startDate = dates.startDate;
      if (dates.endDate) endDate = dates.endDate;
      if (dates.approximateYears) return dates.approximateYears;
    }
    
    // If we still don't have dates, skip this experience
    if (!startDate) return;
    
    // Calculate months between dates
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                   (endDate.getMonth() - startDate.getMonth());
    
    totalMonths += Math.max(0, months);
  });
  
  return Math.round(totalMonths / 12);
}

/**
 * Formats a salary value into a standardized string for templates
 * @param {number|string} salary - The salary value to format
 * @returns {string} Formatted salary string
 */
export function formatSalary(salary: number | string): string {
  if (!salary) return '';
  
  // Convert to number if it's a string
  const salaryNum = typeof salary === 'string' ? parseFloat(salary.replace(/[^\d.]/g, '')) : salary;
  
  // If parsing failed or value is invalid
  if (isNaN(salaryNum)) return String(salary);
  
  // Format the salary with a dollar sign and commas
  return `$${salaryNum.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

/**
 * Helper to extract date information from period text
 * @param {string} periodText - Text containing period information
 * @returns {string} ISO date string for the start date
 */
function parseTextualPeriod(periodText: string): string {
  if (!periodText) return '';
  
  try {
    // First check for formats like "January 2023 - February 2024"
    const fullDateMatch = /(\w+\s+\d{4})\s*-\s*(\w+\s+\d{4}|Present)/i.exec(periodText);
    if (fullDateMatch) {
      return fullDateMatch[1]; // Return start date portion
    }
    
    // Next check for formats like "2023-2024" or "2023-Present"
    const yearMatch = /(\d{4})\s*-\s*(\d{4}|Present)/i.exec(periodText);
    if (yearMatch) {
      return yearMatch[1]; // Return start year
    }
    
    // Check for approximate year counts like "Approximately 8 years"
    const approxYearsMatch = /[Aa]pproximately\s+(\d+)\s+years?/i.exec(periodText);
    if (approxYearsMatch) {
      const yearsAgo = parseInt(approxYearsMatch[1], 10);
      if (!isNaN(yearsAgo)) {
        const approximateStartDate = new Date();
        approximateStartDate.setFullYear(approximateStartDate.getFullYear() - yearsAgo);
        return approximateStartDate.toISOString();
      }
    }
    
    // For a single date like "January 2023" or "2023"
    const singleDateMatch = /(\w+\s+\d{4}|\d{4})/.exec(periodText);
    if (singleDateMatch) {
      return singleDateMatch[1];
    }
    
    // For just year ranges like "1995-1998"
    const yearRangeMatch = /(\d{4})\s*-\s*(\d{4})/i.exec(periodText);
    if (yearRangeMatch) {
      const startYear = parseInt(yearRangeMatch[1], 10);
      if (!isNaN(startYear)) {
        return `${startYear}-01-01`;
      }
    }
    
    // Couldn't parse it
    console.warn(`Could not parse period text: ${periodText}`);
    return '';
  } catch (error) {
    console.error(`Error parsing period text: ${periodText}`, error);
    return '';
  }
}

/**
 * Helper to extract both start and end dates from period text for calculations
 * @param {string} periodText - Text containing period information
 * @returns {{ startDate: Date|null, endDate: Date|null, approximateYears: number|null }} Extracted dates
 */
function parseTextualPeriodForTotalYears(periodText: string): { 
  startDate: Date|null, 
  endDate: Date|null, 
  approximateYears: number|null 
} {
  if (!periodText) return { startDate: null, endDate: null, approximateYears: null };
  
  try {
    // Check for approximate year counts like "Approximately 8 years"
    const approxYearsMatch = /[Aa]pproximately\s+(\d+)\s+years?/i.exec(periodText);
    if (approxYearsMatch) {
      const years = parseInt(approxYearsMatch[1], 10);
      if (!isNaN(years)) {
        return { startDate: null, endDate: null, approximateYears: years };
      }
    }
    
    // Full month/year to month/year format
    const fullDateMatch = /(\w+\s+\d{4})\s*-\s*(\w+\s+\d{4}|Present)/i.exec(periodText);
    if (fullDateMatch) {
      const startDate = new Date(fullDateMatch[1]);
      const endDate = fullDateMatch[2].toLowerCase() === 'present' 
        ? new Date() 
        : new Date(fullDateMatch[2]);
        
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        return { startDate, endDate, approximateYears: null };
      }
    }
    
    // Year to year format (e.g., "2019-2022")
    const yearRangeMatch = /(\d{4})\s*-\s*(\d{4}|[Pp]resent)/i.exec(periodText);
    if (yearRangeMatch) {
      const startYear = parseInt(yearRangeMatch[1], 10);
      const endStr = yearRangeMatch[2].toLowerCase();
      
      if (!isNaN(startYear)) {
        const startDate = new Date(startYear, 0, 1); // January 1st of start year
        
        let endDate;
        if (endStr === 'present') {
          endDate = new Date();
        } else {
          const endYear = parseInt(endStr, 10);
          if (!isNaN(endYear)) {
            endDate = new Date(endYear, 11, 31); // December 31st of end year
          }
        }
        
        if (endDate) {
          return { startDate, endDate, approximateYears: null };
        }
      }
    }
    
    // For a single year like "2023"
    const singleYearMatch = /^\s*(\d{4})\s*$/i.exec(periodText);
    if (singleYearMatch) {
      const year = parseInt(singleYearMatch[1], 10);
      if (!isNaN(year)) {
        const startDate = new Date(year, 0, 1);  // January 1st
        const endDate = new Date(year, 11, 31);  // December 31st
        return { startDate, endDate, approximateYears: null };
      }
    }
    
    return { startDate: null, endDate: null, approximateYears: null };
  } catch (error) {
    console.error(`Error parsing period dates: ${periodText}`, error);
    return { startDate: null, endDate: null, approximateYears: null };
  }
}
/**
 * Helper to parse a date from string in various formats
 * @param {string} dateStr - Date string to parse
 * @returns {Date|null} Parsed date or null if invalid
 */
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  try {
    // Try standard date parsing first
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) return date;
    
    // For text month formats like "January 2023"
    const monthYearMatch = /([A-Za-z]+)\s+(\d{4})/.exec(dateStr);
    if (monthYearMatch) {
      const monthName = monthYearMatch[1];
      const year = parseInt(monthYearMatch[2], 10);
      
      const months = ["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"];
      
      const monthIndex = months.findIndex(m => 
        m.toLowerCase() === monthName.toLowerCase() || 
        m.substring(0, 3).toLowerCase() === monthName.toLowerCase()
      );
      
      if (monthIndex !== -1 && !isNaN(year)) {
        return new Date(year, monthIndex, 1);
      }
    }
    
    // For year-only formats like "2023"
    const yearMatch = /^\d{4}$/.exec(dateStr);
    if (yearMatch) {
      return new Date(parseInt(dateStr, 10), 0, 1);
    }
    
    // Failed to parse
    console.warn(`Unparseable date format: ${dateStr}`);
    return null;
  } catch (error) {
    console.error(`Error parsing date: ${dateStr}`, error);
    return null;
  }
}

// Register Handlebars helpers
Handlebars.registerHelper('formatUSDate', formatUSDate);
Handlebars.registerHelper('sortByDate', sortByDate);
Handlebars.registerHelper('calculateGradeLevel', calculateGradeLevel);
Handlebars.registerHelper('calculateTotalYears', calculateTotalYears);
Handlebars.registerHelper('formatSalary', formatSalary);
