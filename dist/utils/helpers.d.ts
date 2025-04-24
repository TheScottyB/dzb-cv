import Handlebars from "handlebars";
import type { CVData } from "../types/cv-types.js";
export interface Experience {
    startDate?: string | null;
    endDate?: string;
    period?: string;
    position?: string;
    role?: string;
    employer?: string;
    organization?: string;
    duties?: string[];
    achievements?: string[];
    address?: string;
    industry?: string;
    isLeadership?: boolean;
    isTransformational?: boolean;
    source?: string;
    startDateObj?: Date;
    [key: string]: any;
}
export interface PeriodDates {
    startDate: Date | null;
    endDate: Date | null;
    approximateYears: number | null;
}
/** Load a Handlebars template from a file path */
export declare function loadTemplate(templatePath: string): Promise<Handlebars.TemplateDelegate>;
/** Load CV data from a JSON file */
export declare function loadCVData(dataPath: string): Promise<CVData>;
export declare function registerHelpers(): void;
/** Parse a date string into a JS Date object, supporting Present, MM/YYYY, Month YYYY, YYYY, and textual periods */
export declare function parseDate(dateStr: string): Date | null;
/** Extracts a start date in ISO format (YYYY-MM-DD) from a period text string, e.g. "Jan 2020 - Mar 2023" or "2018-Present" */
export declare function parseTextualPeriod(periodText: string): string | null;
export declare function parseTextualPeriodForTotalYears(periodText: string): PeriodDates;
/**
 * Formats a date into the standard MM/YYYY format with zero-padded month for federal resume standards.
 *
 * @param {string|Date} dateStr - The date to format, can be:
 *   - A Date object
 *   - "Present" or "Ongoing" (case-insensitive) to indicate current position
 *   - MM/YYYY format (e.g., "1/2024" or "01/2024") - will ensure month is zero-padded
 *   - Month YYYY format (e.g., "January 2024" or "Jan 2024")
 *   - ISO date format (e.g., "2024-01-15")
 *   - Year only (e.g., "2024") - will default to January (01/YYYY)
 *
 * @returns {string} Formatted date string in "MM/YYYY" format with zero-padded month,
 *                   or "Present" for ongoing positions, or empty string for empty/undefined input
 *
 * @example
 * // Returns "01/2024"
 * formatUSDate("January 2024")
 * formatUSDate("Jan 2024")
 * formatUSDate("1/2024")
 * formatUSDate(new Date(2024, 0, 15))
 *
 * // Returns "Present"
 * formatUSDate("Present")
 * formatUSDate("present")
 * formatUSDate("Ongoing")
 *
 * // Error handling
 * formatUSDate("")  // Returns ""
 * formatUSDate(undefined)  // Returns ""
 * formatUSDate(null)  // Returns ""
 *
 * // Invalid dates fall back to using the current date in test environments
 * // or return the original string in production
 */
export declare function formatUSDate(dateStr: string | Date): string;
/**
 * Formats a date range using the federal standard format with en-dash (–) for resume/CV display.
 * Consistently formats date ranges either as "MM/YYYY – Present" for ongoing positions
 * or "MM/YYYY – MM/YYYY" for completed positions.
 *
 * @param {string|Date} start - The start date, accepted in any format supported by formatUSDate():
 *   - A Date object
 *   - MM/YYYY format (e.g., "01/2024")
 *   - Month YYYY format (e.g., "January 2024" or "Jan 2024")
 *   - ISO date format (e.g., "2024-01-15")
 *
 * @param {string|Date} end - The end date (or undefined/null/"Present" for ongoing positions):
 *   - A Date object (if current date or within ~45 days, treated as "Present")
 *   - "Present" or "Ongoing" (case-insensitive)
 *   - Any date format supported by formatUSDate()
 *   - undefined/null/empty string (treated as "Present")
 *
 * @returns {string} Formatted date range: "MM/YYYY – Present" or "MM/YYYY – MM/YYYY"
 *                   with proper en-dash (–) character, or empty string if start date is invalid
 *
 * @example
 * // Returns "01/2022 – Present"
 * formatFederalDateRange("January 2022", "Present")
 * formatFederalDateRange("01/2022", null)
 * formatFederalDateRange("Jan 2022", "")
 * formatFederalDateRange("1/2022", "ongoing")
 * formatFederalDateRange(new Date(2022, 0, 1), new Date()) // Current date treated as Present
 *
 * // Returns "01/2022 – 12/2023"
 * formatFederalDateRange("January 2022", "December 2023")
 * formatFederalDateRange("Jan 2022", "Dec 2023")
 * formatFederalDateRange("1/2022", "12/2023")
 *
 * // Error handling
 * formatFederalDateRange("", "12/2023")  // Returns ""
 * formatFederalDateRange(undefined, "12/2023")  // Returns ""
 */
export declare function formatFederalDateRange(start?: string | Date, end?: string | Date): string;
/**
 * Sorts experiences by date in reverse chronological order (newest first)
 * @param {any} context - The current template context
 * @param {Handlebars.HelperOptions} options - Handlebars options object
 * @returns {string} Rendered template content with sorted experiences
 */
export declare function sortByDate(context: any, options: Handlebars.HelperOptions): string;
/**
 * Maps a position title to a federal GS grade level
 * @param {string} position - Job position or title
 * @returns {number} Estimated GS grade level (1-15)
 */
export declare function calculateGradeLevel(position: string): number;
/**
 * Calculates total years of professional experience from all work history
 * @param {any[]} experiences - Array of work experiences
 * @returns {number} Total years of professional experience
 */
export declare function calculateTotalYears(experiences: any[]): number;
/**
 * Formats a salary value into a standardized string for templates
 * @param {number|string} salary - The salary value to format
 * @returns {string} Formatted salary string
 */
export declare function formatSalary(salary: number | string): string;
/**
 * Provides a default value if the primary value is empty/undefined
 * @param {any} value - The primary value to check
 * @param {any} defaultValue - The fallback value if primary is empty
 * @returns {any} Either the primary value or the default
 */
export declare function defaultValue(value: any, defaultValue: any): any;
/**
 * Formats a salary value with added prefix
 * @param {any} value - The numeric value
 * @param {string} prefix - The prefix to add (e.g., "$", "£")
 * @returns {string} Formatted value with prefix
 */
export declare function formatWithPrefix(value: any, prefix?: string): string;
/**
 * Registers all Handlebars helpers for CV generation
 * Call this function once before rendering templates
 */
export declare function sectionHasContent(section: any): boolean;
/**
 * TEMPLATE IMPROVEMENT SUGGESTIONS:
 *
 * The following templates should be updated for consistent date formatting:
 *
 * 1. state-template.md:
 *    - Line 42: Uses "formatUSDate startDate" and "formatUSDate endDate" with "to" separator
 *      Consider changing to: "{{formatFederalDateRange startDate endDate}}" for consistency
 *    - Line 109: Uses "formatUSDate startDate" and "formatUSDate endDate" with "to" separator
 *      Consider changing to: "{{formatFederalDateRange startDate endDate}}" for consistency
 *    - Line 130: Uses "formatUSDate startDate" and "formatUSDate endDate" with "to" separator
 *      Consider changing to: "{{formatFederalDateRange startDate endDate}}" for consistency
 *
 * 2. private-template.md:
 *    - Line 39: Uses "formatUSDate startDate" and "formatUSDate endDate" with "to" separator
 *      Consider changing to: "{{formatFederalDateRange startDate endDate}}" for consistency
 *    - Line 91: Uses "formatUSDate startDate" and "formatUSDate endDate" with "to" separator
 *      Consider changing to: "{{formatFederalDateRange startDate endDate}}" for consistency
 *    - Line 110: Uses "formatUSDate startDate" and "formatUSDate endDate" inside parentheses
 *      Consider changing to: "({{formatFederalDateRange startDate endDate}})" for consistency
 *    - Line 118: Uses "formatUSDate startDate" and "formatUSDate endDate" with "to" separator
 *      Consider changing to: "{{formatFederalDateRange startDate endDate}}" for consistency
 *
 * These changes would improve:
 * 1. Consistent date range formatting across all templates
 * 2. Proper en-dash usage (instead of "to" or "-")
 * 3. Unified handling of empty/null end dates and "Present" values
 */
