export const dawnTemplate = {
  // Core competencies we know Dawn has
  coreStrengths: {
    healthcareAdmin: [
      'Patient Intake & Triage',
      'Scheduling',
      'HIPAA Compliance',
      'Insurance Verification',
      'Medical Records Management',
      'Multi-line Phone Systems',
      'Patient Flow Management',
      'Farm Tax Certification',
      'Revenue Cycle Operations',
    ],
    supervision: [
      'Team Leadership',
      'Training & Onboarding',
      'Process Improvement',
      'Performance Evaluation',
      'Staff Development',
      'Policy Implementation',
      'Mentorship & Coaching',
      'Cross-functional Coordination',
      'Operational Oversight',
    ],
    customerService: [
      'Client Relationship Management',
      'Conflict Resolution',
      'High-Volume Customer Interactions',
      'Stakeholder Communication',
      'Customer Satisfaction',
      'Professional Communication',
      'Multi-line Phone Systems',
      'Appointment Scheduling',
      'Customer Education',
    ],
    realEstate: [
      'Property Management',
      'Client Relations',
      'Market Analysis',
      'Transaction Coordination',
      'Team Leadership',
      'Business Development',
      'Customer Service Excellence',
      'Stakeholder Management',
      'Professional Communication',
    ],
    systems: [
      'Healthcare Scheduling Software',
      'Microsoft Office Suite',
      'Records Management Systems',
      'Multi-line Phone Systems',
      'Customer Service Platforms',
      'Real Estate CRM Systems',
      'EPIC Systems',
      'Revenue Cycle Management Tools',
    ],
  },

  // Experience patterns we know to look for
  experiencePatterns: {
    foxLake: {
      title: 'Front Desk / Veterinary Assistant',
      period: 'January 2023 - February 2024',
      keyDuties: [
        'Managed patient flow (60-80/day)',
        'Triage patients',
        'Process new patient paperwork',
        'Charting and filing',
        'Insurance verification',
        'Multi-location support',
        'Customer service and education',
        'Phone system management',
      ],
      relevance: {
        patientAccess: 'high',
        supervision: 'medium',
        systems: 'high',
        customerService: 'high',
      },
    },
    realEstate: {
      title: 'Real Estate Team Leader',
      period: '2015-2023',
      keyDuties: [
        'Led and mentored real estate team',
        'Developed training programs',
        'Managed client relationships',
        'Oversaw property transactions',
        'Implemented business strategies',
        'Coached team members',
        'Handled customer inquiries and concerns',
        'Managed high-volume client interactions',
        'Provided professional communication',
      ],
      relevance: {
        realEstate: 'high',
        supervision: 'high',
        systems: 'medium',
        customerService: 'high',
      },
    },
    vyllaAdmin: {
      title: 'Admin for Central & Eastern Coast AVPs',
      period: 'February 2024 - Present',
      keyDuties: [
        'Provide administrative support for 3 AVPs covering 14 states',
        'Manage agent support systems',
        'Coordinate onboarding and training',
        'Handle high-volume phone communications',
        'Implement retention initiatives',
        'Manage customer service operations',
        'Coordinate cross-functional activities',
      ],
      relevance: {
        supervision: 'high',
        customerService: 'high',
        systems: 'high',
        realEstate: 'medium',
      },
    },
    midwestSports: {
      title: 'Supervisor of Front Desk, Call Center, and MRI Scheduling',
      period: '1999-2002',
      keyDuties: [
        'Managed high-volume office operations',
        'Verified insurance',
        'Scheduled appointments',
        'Supervised staff',
        'Process improvement',
        'Cross-department coordination',
        'Customer service management',
        'Phone system operations',
      ],
      relevance: {
        patientAccess: 'high',
        supervision: 'high',
        systems: 'high',
        customerService: 'high',
      },
    },
    familyMedicine: {
      title: 'Secretary for Family Physicians',
      period: '1998-1999',
      keyDuties: [
        'Scheduling patient appointments',
        'Insurance reconciliation',
        'Chart analysis',
        'Referral processing',
        'Prescription management',
        'Patient communication',
        'Phone system management',
      ],
      relevance: {
        patientAccess: 'high',
        supervision: 'medium',
        systems: 'high',
        customerService: 'high',
      },
    },
  },

  // How to present her experience
  presentationRules: {
    summary: {
      leadWith: 'healthcare and customer service experience',
      emphasize: [
        'supervision',
        'patient access',
        'customer service',
        'systems knowledge',
        'real estate leadership',
      ],
      years: 'over 40 years',
    },
    experience: {
      order: ['recent', 'relevant', 'supervisory', 'customer-facing'],
      maxEntries: 4,
      focusOn: [
        'achievements',
        'responsibilities',
        'customer service',
        'systems used',
        'leadership impact',
      ],
    },
    skills: {
      prioritize: [
        'healthcare systems',
        'customer service',
        'supervision',
        'patient access',
        'real estate operations',
      ],
      groupBy: [
        'technical',
        'administrative',
        'leadership',
        'customer service',
        'industry-specific',
      ],
    },
  },

  // Job-specific mappings
  jobMappings: {
    patientAccessSupervisor: {
      keyRequirements: [
        'supervision',
        'patient access',
        'healthcare systems',
        'insurance verification',
        'scheduling',
        'compliance',
        'customer service',
        'phone systems',
        'farm tax certification',
      ],
      experienceWeight: {
        foxLake: 0.3,
        midwestSports: 0.4,
        familyMedicine: 0.3,
      },
    },
    realEstate: {
      keyRequirements: [
        'real estate operations',
        'team leadership',
        'client relations',
        'business development',
        'training',
        'mentorship',
        'customer service',
        'professional communication',
      ],
      experienceWeight: {
        realEstate: 0.5,
        vyllaAdmin: 0.3,
        midwestSports: 0.2,
      },
    },
  },

  // Cover letter generation rules
  coverLetterRules: {
    structure: {
      header: {
        name: true,
        address: true,
        contact: true,
        date: true,
      },
      salutation: 'Dear Hiring Manager,',
      paragraphs: {
        count: 5,
        focus: [
          'introduction',
          'currentRole',
          'experience',
          'transferableSkills',
          'companyAlignment',
        ],
      },
      closing: 'Sincerely,',
      signature: true,
    },
    contentMapping: {
      introduction: {
        position: 'Patient Access Supervisor',
        company: 'Mercyhealth',
        location: 'Crystal Lake Hospital',
        experience: '15+ years',
        fields: ['healthcare administration', 'team leadership', 'revenue cycle operations'],
      },
      currentRole: {
        title: 'Front Desk/Veterinary Assistant',
        company: 'Fox Lake Animal Hospital',
        keyMetrics: {
          patientFlow: '60-80 patients daily',
          systems: ['triage protocols', 'scheduling systems'],
        },
        alignment: [
          'patient flow management',
          'clinical staff coordination',
          'healthcare regulations compliance',
        ],
      },
      experience: {
        supervision: {
          activities: [
            'conducting performance reviews',
            'providing coaching',
            'implementing training programs',
          ],
        },
        systems: {
          focus: ['accuracy', 'efficiency'],
          standards: ['HIPAA', 'CMS'],
        },
        coordination: {
          scope: 'cross-departmental',
          focus: ['patient care', 'workflow optimization'],
        },
        financial: {
          activities: ['insurance verification', 'claims processing', 'maximizing reimbursement'],
        },
        process: {
          focus: ['workflow efficiency', 'continuous improvement'],
        },
      },
      transferableSkills: {
        leadership: {
          teamSize: '4 professionals',
          scope: 'Illinois & Wisconsin',
          activities: [
            'training program development',
            'performance management',
            'policy implementation',
          ],
        },
      },
      companyAlignment: {
        mission: 'excellence in patient care',
        values: [
          'high standards in healthcare operations',
          'efficient workflows',
          'regulatory compliance',
        ],
        confidence: 'ideal candidate based on healthcare administration and team leadership',
      },
    },
    tone: {
      style: 'professional',
      confidence: 'high',
      specificity: 'healthcare-focused',
      personalization: 'company-specific',
    },
  },

  // Simple CV generation prompt
  cvPrompt: {
    basic: 'Generate a professional CV for [Name] with the following sections:',
    sections: [
      'Contact Information (name, address, email, phone)',
      'Professional Summary (2-3 sentences highlighting key experience)',
      'Core Qualifications (bullet points of key skills)',
      'Professional Experience (most recent first, with dates)',
      'Education & Certifications',
      'Technical Skills',
      'Professional Affiliations',
      'Volunteer Experience',
    ],
    format: {
      style: 'professional',
      length: '1-2 pages',
      focus: 'healthcare administration and leadership',
    },
    defaultValues: {
      name: 'Dawn Zurick Beilfuss',
      contact: {
        address: '15810 IL Rt. 173 #2F, Harvard, IL 60033',
        email: 'DZ4100@gmail.com',
        phone: '847.287.1148',
      },
      summary:
        'Over 15 years of experience in healthcare administration, team leadership, and revenue cycle operations.',
      experience: [
        {
          title: 'Front Desk/Veterinary Assistant',
          company: 'Fox Lake Animal Hospital',
          period: '2023-2024',
          highlights: [
            'Managed 60-80 patients daily',
            'Implemented triage protocols',
            'Handled scheduling systems',
          ],
        },
        {
          title: 'Licensed Managing Broker',
          company: 'Vylla',
          period: '2022-2023',
          highlights: [
            'Led team of 4 professionals',
            'Developed training programs',
            'Implemented performance management',
          ],
        },
      ],
      education: [
        'High School Diploma',
        'Certified Pharmacy Technician',
        'Real Estate License',
        'Notary Public',
      ],
      skills: [
        'Healthcare Systems',
        'Office Software',
        'Communication Systems',
        'Customer Service Platforms',
        'Financial Systems',
      ],
      affiliations: [
        'Illinois Realtors Association',
        'National Association of Realtors',
        'McHenry County Association of Realtors',
      ],
      volunteer: ['Home of the Sparrow', 'Habitat for Humanity'],
    },
  },

  // Simple command prompts
  commands: {
    makeCV: {
      basic: 'Generate a professional CV',
      helper:
        "I'll help you create a CV. Just tell me if you want to use the default template or customize any sections.",
      default: true,
      output: {
        path: 'job-postings/[jobId]/cv.md',
        formats: ['markdown', 'html', 'pdf'],
      },
    },
    makeCover: {
      basic: 'Generate a cover letter',
      helper:
        "I'll help you create a cover letter. Just tell me the job title and company, or I can use the default template.",
      default: true,
      output: {
        path: 'job-postings/[jobId]/cover-letter.md',
        formats: ['markdown', 'html', 'pdf'],
      },
    },
    help: {
      basic: 'Show available commands',
      response:
        "You can use:\n- 'make CV' to generate a CV\n- 'make cover' to generate a cover letter\n- 'help' to see this message",
    },
  },
};
