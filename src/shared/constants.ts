export const ATS_ISSUES = {
  COMPLEX_FORMATTING: {
    score: -3,
    message: 'Complex formatting may prevent proper parsing',
    fix: 'Use simple formatting with clear headings and bullet points',
  },
  UNUSUAL_HEADINGS: {
    score: -2,
    message: 'Non-standard section headings',
    fix: 'Use standard section headings (e.g., "Experience", "Education", "Skills")',
  },
  MISSING_DATES: {
    score: -8,
    message: 'Missing or unclear dates',
    fix: 'Ensure all experience includes clear start and end dates (MM/YYYY)',
  },
  GRAPHICS: {
    score: -3,
    message: 'Graphics or special characters detected',
    fix: 'Remove graphics and use standard characters only',
  },
  CONTACT_INFO: {
    score: -3,
    message: 'Contact information not clearly formatted',
    fix: 'Place contact information at the top in a clear format',
  },
};
