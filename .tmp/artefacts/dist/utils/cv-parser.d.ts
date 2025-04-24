import { ProfileData } from '../types/profile-types.js';
/**
 * Parses markdown content of a CV and converts it to structured ProfileData
 * This function delegates to the specialized markdown parser for Dawn's CV format.
 *
 * @param markdownContent The markdown content of the CV
 * @returns Structured ProfileData object
 */
export declare function parseCvMarkdown(markdownContent: string): ProfileData;
