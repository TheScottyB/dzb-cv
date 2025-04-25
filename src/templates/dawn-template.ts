export const dawnTemplate = {
  // Core competencies we know Dawn has
  coreStrengths: {
    healthcareAdmin: [
      "Patient Intake & Triage",
      "Scheduling",
      "HIPAA Compliance",
      "Insurance Verification",
      "Medical Records Management",
      "Multi-line Phone Systems",
      "Patient Flow Management"
    ],
    supervision: [
      "Team Leadership",
      "Training & Onboarding",
      "Process Improvement",
      "Performance Evaluation",
      "Staff Development",
      "Policy Implementation",
      "Mentorship & Coaching"
    ],
    realEstate: [
      "Property Management",
      "Client Relations",
      "Market Analysis",
      "Transaction Coordination",
      "Team Leadership",
      "Business Development"
    ],
    systems: [
      "Healthcare Scheduling Software",
      "Microsoft Office Suite",
      "Records Management Systems",
      "Multi-line Phone Systems",
      "Customer Service Platforms",
      "Real Estate CRM Systems"
    ]
  },

  // Experience patterns we know to look for
  experiencePatterns: {
    foxLake: {
      title: "Front Desk / Veterinary Assistant",
      period: "January 2023 - February 2024",
      keyDuties: [
        "Managed patient flow (60-80/day)",
        "Triage patients",
        "Process new patient paperwork",
        "Charting and filing",
        "Insurance verification",
        "Multi-location support"
      ],
      relevance: {
        patientAccess: "high",
        supervision: "medium",
        systems: "high"
      }
    },
    realEstate: {
      title: "Real Estate Team Leader",
      period: "2015-2023",
      keyDuties: [
        "Led and mentored real estate team",
        "Developed training programs",
        "Managed client relationships",
        "Oversaw property transactions",
        "Implemented business strategies",
        "Coached team members"
      ],
      relevance: {
        realEstate: "high",
        supervision: "high",
        systems: "medium"
      }
    },
    scienceFan: {
      title: "Science Fan Experience",
      period: "2002-2015",
      keyDuties: [
        "Team leadership and coordination",
        "Event planning and management",
        "Community engagement",
        "Content development",
        "Volunteer coordination",
        "Project management"
      ],
      relevance: {
        supervision: "high",
        systems: "medium",
        realEstate: "low"
      }
    },
    midwestSports: {
      title: "Supervisor of Front Desk, Call Center, and MRI Scheduling",
      period: "1999-2002",
      keyDuties: [
        "Managed high-volume office operations",
        "Verified insurance",
        "Scheduled appointments",
        "Supervised staff",
        "Process improvement",
        "Cross-department coordination"
      ],
      relevance: {
        patientAccess: "high",
        supervision: "high",
        systems: "high"
      }
    },
    familyMedicine: {
      title: "Secretary for Family Physicians",
      period: "1998-1999",
      keyDuties: [
        "Scheduling patient appointments",
        "Insurance reconciliation",
        "Chart analysis",
        "Referral processing",
        "Prescription management"
      ],
      relevance: {
        patientAccess: "high",
        supervision: "medium",
        systems: "high"
      }
    }
  },

  // How to present her experience
  presentationRules: {
    summary: {
      leadWith: "healthcare experience",
      emphasize: ["supervision", "patient access", "systems knowledge", "real estate leadership"],
      years: "over 40 years"
    },
    experience: {
      order: ["recent", "relevant", "supervisory"],
      maxEntries: 4,
      focusOn: ["achievements", "responsibilities", "systems used", "leadership impact"]
    },
    skills: {
      prioritize: ["healthcare systems", "supervision", "patient access", "real estate operations"],
      groupBy: ["technical", "administrative", "leadership", "industry-specific"]
    }
  },

  // Job-specific mappings
  jobMappings: {
    patientAccessSupervisor: {
      keyRequirements: [
        "supervision",
        "patient access",
        "healthcare systems",
        "insurance verification",
        "scheduling",
        "compliance"
      ],
      experienceWeight: {
        foxLake: 0.3,
        midwestSports: 0.4,
        familyMedicine: 0.3
      }
    },
    realEstate: {
      keyRequirements: [
        "real estate operations",
        "team leadership",
        "client relations",
        "business development",
        "training",
        "mentorship"
      ],
      experienceWeight: {
        realEstate: 0.5,
        scienceFan: 0.3,
        midwestSports: 0.2
      }
    }
  }
}; 