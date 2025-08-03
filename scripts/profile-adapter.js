/**
 * Profile Data Adapter
 * Converts between different base-info.json formats for compatibility
 */

// Convert root base-info.json format to standardized format
export function adaptRootBaseInfo(rootData) {
  const adapted = {
    personalInfo: {
      name: {
        first: rootData.personalInfo.name.full.split(' ')[0] || 'Dawn',
        last: rootData.personalInfo.name.full.split(' ').slice(1).join(' ') || 'Zurick-Beilfuss',
        full: rootData.personalInfo.name.full
      },
      contact: {
        email: rootData.personalInfo.contact.email,
        phone: rootData.personalInfo.contact.phone,
        location: rootData.personalInfo.contact.address || 'Harvard, IL'
      },
      professionalTitle: 'Certified EKG Technician',
      summary: rootData.professionalSummary
    },
    certifications: [],
    skills: [],
    experience: [],
    education: []
  };

  // Convert education/certifications
  if (rootData.education) {
    rootData.education.forEach(edu => {
      if (edu.certification) {
        adapted.certifications.push({
          name: edu.certification,
          issuer: edu.institution,
          date: edu.year,
          status: edu.status || 'Active'
        });
        
        // Also add as education
        adapted.education.push({
          degree: edu.certification,
          institution: edu.institution,
          year: edu.year,
          field: 'Healthcare'
        });
      }
    });
  }

  // Convert experience from root data if available
  if (rootData.experience) {
    adapted.experience = rootData.experience;
  } else {
    // Add default experience based on professional summary
    adapted.experience = [
      {
        position: 'Veterinary Assistant',
        employer: 'Fox Lake Animal Hospital',
        startDate: '2023-01',
        endDate: '2024-02',
        responsibilities: [
          'Managed 60-80 patients daily',
          'Medical triage and emergency response',
          'Documentation and payment processing'
        ]
      },
      {
        position: 'Real Estate Professional',
        employer: 'Various Agencies',
        startDate: '2006-01',
        endDate: '2023-01',
        responsibilities: [
          'Client relationship management',
          'Contract negotiation and problem-solving',
          'Market analysis and customer service'
        ]
      }
    ];
  }

  // Add skills based on professional summary and certifications
  adapted.skills = [
    { name: 'EKG Testing', level: 'Expert', category: 'Medical' },
    { name: 'Cardiac Monitoring', level: 'Expert', category: 'Medical' },
    { name: '12-Lead EKG Interpretation', level: 'Proficient', category: 'Medical' },
    { name: 'Patient Care', level: 'Advanced', category: 'Healthcare' },
    { name: 'Medical Terminology', level: 'Proficient', category: 'Healthcare' },
    { name: 'HIPAA Compliance', level: 'Proficient', category: 'Healthcare' },
    { name: 'Healthcare Operations', level: 'Advanced', category: 'Healthcare' },
    { name: 'Insurance Verification', level: 'Advanced', category: 'Healthcare' },
    { name: 'Medical Records Management', level: 'Advanced', category: 'Healthcare' },
    { name: 'Customer Service', level: 'Expert', category: 'Soft Skills' },
    { name: 'Communication', level: 'Expert', category: 'Soft Skills' },
    { name: 'Problem Solving', level: 'Advanced', category: 'Soft Skills' },
    { name: 'Negotiation', level: 'Advanced', category: 'Soft Skills' }
  ];

  return adapted;
}

// Helper function to detect which format is being used
export function detectProfileFormat(profileData) {
  if (profileData.professionalSummary && profileData.personalInfo?.name?.full) {
    return 'root-format';
  } else if (profileData.personalInfo?.name?.first && profileData.skills && Array.isArray(profileData.skills)) {
    return 'standard-format';
  }
  return 'unknown-format';
}

// Main adapter function
export function adaptProfile(profileData) {
  const format = detectProfileFormat(profileData);
  
  switch (format) {
    case 'root-format':
      return adaptRootBaseInfo(profileData);
    case 'standard-format':
      return profileData; // Already in correct format
    default:
      console.warn('⚠️  Unknown profile format, using as-is');
      return profileData;
  }
}