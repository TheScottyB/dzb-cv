import { createProfileFromMarkdown } from '../.tmp/artefacts/utils/markdown-profile-parser.js';
/**
 * Parses markdown content of a CV and converts it to structured ProfileData
 * This function delegates to the specialized markdown parser for Dawn's CV format.
 *
 * @param markdownContent The markdown content of the CV
 * @returns Structured ProfileData object
 */
export function parseCvMarkdown(markdownContent) {
  return createProfileFromMarkdown(markdownContent);
}
//# sourceMappingURL=cv-parser.js.map
