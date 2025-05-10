/**
 * @deprecated Import directly from @dzb-cv/core/types instead
 * This file is maintained for backward compatibility and will be removed in a future version
 */

export {
  CVData,
  PersonalInfo,
  Experience,
  Education,
  Skill,
  Project,
  Publication,
  Award,
  Volunteer,
  Language,
  Certification,
  Reference,
  Name,
  Address,
  SocialLink,
  PDFGenerationOptions,
  CVGenerationOptions,
  ProfileVersion,
  Profile,
  TemplateOptions,
  CVTemplate,
  ATSImprovement,
} from '@dzb-cv/core/types';

/**
 * @deprecated Use types from @dzb-cv/core/types instead
 */
export interface CVTypeConfiguration {
  requirements?: string[];
  format?: string;
  emphasizedExperience?: string[];
  additionalDetails?: Record<string, unknown>;
  highlights?: string[];
}
