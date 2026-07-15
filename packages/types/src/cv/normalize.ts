import type { CVData, Experience, Education, Certification } from './base.js';

/**
 * Normalizes a CVData object by resolving deprecated alias fields
 * to their canonical equivalents. Non-destructive: returns a new object
 * and only fills in canonical fields if they are missing and an alias
 * has a value.
 */
export function normalizeCVData(cv: CVData): CVData {
  const contact = { ...cv.personalInfo.contact };
  if (!contact.address && contact.location) {
    contact.address = contact.location;
  }

  const personalInfo = {
    ...cv.personalInfo,
    contact,
  };
  if (!personalInfo.professionalTitle && personalInfo.title) {
    personalInfo.professionalTitle = personalInfo.title;
  }

  const experience: Experience[] = cv.experience.map(exp => {
    const normalized = { ...exp };
    if (!normalized.position && normalized.title) {
      normalized.position = normalized.title;
    }
    if (!normalized.employer && normalized.company) {
      normalized.employer = normalized.company;
    }
    if (!normalized.employmentType && normalized.employment_type) {
      const et = normalized.employment_type;
      if (et === 'full-time' || et === 'part-time' || et === 'contract' || et === 'internship') {
        normalized.employmentType = et;
      }
    }
    if (!normalized.gradeLevel && normalized.grade_level) {
      normalized.gradeLevel = normalized.grade_level;
    }
    return normalized;
  });

  const education: Education[] = cv.education.map(edu => {
    const normalized = { ...edu };
    if (!normalized.graduationDate) {
      if (edu.year) {
        normalized.graduationDate = edu.year;
      } else if (edu.completionDate) {
        normalized.graduationDate = edu.completionDate;
      }
    }
    return normalized;
  });

  const certifications: Certification[] | undefined = cv.certifications?.map(cert => {
    const normalized = { ...cert };
    if (!normalized.issuer && normalized.institution) {
      normalized.issuer = normalized.institution;
    }
    if (!normalized.date && normalized.year) {
      normalized.date = normalized.year;
    }
    if (!normalized.expirationDate && normalized.expiryDate) {
      normalized.expirationDate = normalized.expiryDate;
    }
    return normalized;
  });

  const result: CVData = {
    ...cv,
    personalInfo,
    experience,
    education,
  };
  if (certifications) {
    result.certifications = certifications;
  }
  return result;
}
