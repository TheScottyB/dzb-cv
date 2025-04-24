import { ProfileData } from '../types/profile-types.js';
/**
 * Specialized parser for Dawn's markdown CV format
 */
export declare class MarkdownProfileParser {
    private content;
    private lines;
    private sectionMap;
    constructor(markdownContent: string);
    /**
     * Main parse method - converts markdown to structured ProfileData
     */
    parse(): ProfileData;
    /**
     * Map all sections in the document to their line ranges
     */
    private mapSections;
    /**
     * Get lines within a specific section
     */
    private getSectionLines;
    /**
     * Parse skills from the SUMMARY OF SKILLS section
     */
    private parseSkills;
    /**
     * Helper to extract skills from text
     */
    private extractSkillsFromText;
    /**
     * Parse basic information (name, contact, etc.)
     */
    private parseBasicInfo;
    /**
     * Parse work experience entries
     */
    private parseWorkExperience;
    /**
     * Parse education entries
     */
    private parseEducation;
    /**
     * Helper to add an education entry from parsed data
     */
    private addEducationEntry;
    /**
     * Parse certifications and licenses
     */
    private parseCertifications;
    /**
     * Parse volunteer experience as projects
     */
    private parseVolunteerExperience;
    /**
     * Helper to add a project entry from parsed data
     */
    private addProjectEntry;
    /**
     * Parse a date string into a Date object
     */
    private parseDate;
}
export declare function createProfileFromMarkdown(markdownContent: string): ProfileData;
