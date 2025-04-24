// Previous imports...

const ATS_ISSUES = {
  COMPLEX_FORMATTING: {
    score: -5,  // Reduced impact since some formatting is necessary
    message: 'Complex formatting may prevent proper parsing',
    fix: 'Use simple formatting with clear headings and bullet points'
  },
  UNUSUAL_HEADINGS: {
    score: -2,  // Reduced since headings can be flexible
    message: 'Non-standard section headings',
    fix: 'Use standard section headings (e.g., "Experience", "Education", "Skills")'
  },
  MISSING_DATES: {
    score: -8,  // High impact but not critical
    message: 'Missing or unclear dates',
    fix: 'Ensure all experience includes clear start and end dates (MM/YYYY)'
  },
  GRAPHICS: {
    score: -5,  // Moderate impact
    message: 'Graphics or special characters detected',
    fix: 'Remove graphics and use standard characters only'
  },
  CONTACT_INFO: {
    score: -5,  // Important but not critical
    message: 'Contact information not clearly formatted',
    fix: 'Place contact information at the top in a clear format'
  }
};

// Rest of the file remains the same...
