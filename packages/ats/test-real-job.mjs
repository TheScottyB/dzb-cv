// Test ATS scoring with real job posting data
import { ScoringEngine } from './dist/scoring/index.js';
import { readFileSync } from 'fs';

// Load real job data
const jobData = JSON.parse(readFileSync('/Users/scottybe/Development/tools/Workspace/dzb-cv/job-postings/careers.mercyhealthsystem.org-mercyhealth-medical-lab-scientist-39454/source/job-data.json', 'utf8'));

// Create a medical lab scientist CV profile
const medicalLabCV = {
  personalInfo: {
    name: {
      full: "Sarah Medical Tech",
      first: "Sarah", 
      last: "Tech"
    },
    contact: {
      email: "sarah.tech@email.com",
      phone: "(555) 123-4567"
    },
    professionalTitle: "Medical Laboratory Scientist"
  },
  experience: [
    {
      position: "Medical Laboratory Scientist",
      employer: "Regional Medical Center",
      startDate: "2019-01-01",
      endDate: null,
      responsibilities: [
        "Perform waived, moderate and high complexity lab tests in hematology, urinalysis, chemistry and blood bank",
        "Analyze test results for validity and accuracy prior to release",
        "Perform quality control and proficiency testing procedures",
        "Maintain laboratory instrumentation and perform calibration",
        "Participate in method evaluation and implementation"
      ],
      employmentType: "full-time"
    },
    {
      position: "Medical Laboratory Technician",
      employer: "Community Hospital",
      startDate: "2017-06-01",
      endDate: "2018-12-31",
      responsibilities: [
        "Collected and processed patient samples",
        "Performed clinical laboratory procedures",
        "Documented quality control activities",
        "Operated automated laboratory equipment"
      ],
      employmentType: "full-time"
    }
  ],
  education: [
    {
      degree: "Bachelor of Science in Medical Technology",
      institution: "University of Healthcare",
      graduationDate: "2017",
      field: "Medical Technology"
    }
  ],
  skills: [
    { name: "CLIA", proficiency: "advanced" },
    { name: "Hematology", proficiency: "expert" },
    { name: "Clinical Chemistry", proficiency: "expert" },
    { name: "Blood Banking", proficiency: "advanced" },
    { name: "Microbiology", proficiency: "advanced" },
    { name: "Quality Control", proficiency: "expert" },
    { name: "Laboratory Instrumentation", proficiency: "advanced" },
    { name: "Patient Care", proficiency: "intermediate" },
    { name: "Medical Records", proficiency: "intermediate" }
  ]
};

// Create a mismatched profile (software engineer) 
const mismatchedCV = {
  personalInfo: {
    name: {
      full: "John Developer",
      first: "John",
      last: "Developer" 
    },
    contact: {
      email: "john.dev@email.com",
      phone: "(555) 987-6543"
    },
    professionalTitle: "Software Engineer"
  },
  experience: [
    {
      position: "Senior Software Engineer",
      employer: "Tech Company", 
      startDate: "2020-01-01",
      endDate: null,
      responsibilities: [
        "Developed web applications using React and Node.js",
        "Built REST APIs and microservices",
        "Implemented CI/CD pipelines"
      ],
      employmentType: "full-time"
    }
  ],
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      institution: "Tech University",
      graduationDate: "2019",
      field: "Computer Science"
    }
  ],
  skills: [
    { name: "JavaScript", proficiency: "expert" },
    { name: "React", proficiency: "advanced" },
    { name: "Node.js", proficiency: "advanced" },
    { name: "AWS", proficiency: "intermediate" }
  ]
};

async function testRealJobMatching() {
  console.log('🏥 Testing Real Job Matching - Medical Lab Scientist Position');
  console.log('===========================================================');

  try {
    const scorer = new ScoringEngine({
      keywordWeight: 0.3,
      experienceWeight: 0.3,
      educationWeight: 0.2,  
      skillsWeight: 0.2
    });

    // Test 1: Perfect match candidate
    console.log('\n📊 Test 1: Medical Lab Scientist (Good Match)');
    const matchScore = scorer.score(medicalLabCV, jobData);
    
    console.log(`✅ Overall Score: ${(matchScore.overall * 100).toFixed(1)}%`);
    console.log('\nDetailed Breakdown:');
    console.log(`   • Keywords: ${(matchScore.keywords.score * 100).toFixed(1)}%`);
    console.log(`     - Top matches: ${matchScore.keywords.matches.slice(0, 10).join(', ')}`);
    console.log(`   • Experience: ${(matchScore.experience.score * 100).toFixed(1)}%`);
    console.log(`     - ${matchScore.experience.matches.join(', ')}`);
    console.log(`   • Education: ${(matchScore.education.score * 100).toFixed(1)}%`);
    console.log(`     - Matches: ${matchScore.education.matches.join(', ')}`);
    console.log(`   • Skills: ${(matchScore.skills.score * 100).toFixed(1)}%`);
    console.log(`     - Healthcare skills found: ${matchScore.skills.matches.join(', ')}`);

    // Test 2: Mismatched candidate
    console.log('\n📊 Test 2: Software Engineer (Poor Match)');
    const mismatchScore = scorer.score(mismatchedCV, jobData);
    
    console.log(`❌ Overall Score: ${(mismatchScore.overall * 100).toFixed(1)}%`);
    console.log('\nDetailed Breakdown:');
    console.log(`   • Keywords: ${(mismatchScore.keywords.score * 100).toFixed(1)}%`);
    console.log(`   • Experience: ${(mismatchScore.experience.score * 100).toFixed(1)}%`);
    console.log(`   • Education: ${(mismatchScore.education.score * 100).toFixed(1)}%`);
    console.log(`   • Skills: ${(mismatchScore.skills.score * 100).toFixed(1)}%`);

    // Analysis summary
    console.log('\n🔍 Job Matching Analysis Summary');
    console.log(`📈 Match Differential: ${((matchScore.overall - mismatchScore.overall) * 100).toFixed(1)}%`);
    console.log(`🎯 System correctly identifies: ${matchScore.overall > mismatchScore.overall ? 'GOOD match vs POOR match' : 'NEEDS TUNING'}`);
    
    if (matchScore.overall > 0.6) {
      console.log(`✅ Qualified candidate (${(matchScore.overall * 100).toFixed(1)}% > 60%)`);
    } else {
      console.log(`⚠️ Candidate may need review (${(matchScore.overall * 100).toFixed(1)}% < 60%)`);
    }

    // Job-specific insights
    console.log('\n🏥 Job-Specific Insights:');
    console.log(`📋 Job Title: ${jobData.title}`);
    console.log(`🏢 Company: ${jobData.company}`);
    console.log(`💰 Sign-on Bonus: $${jobData.salary.signOnBonus?.toLocaleString() || 'N/A'}`);
    console.log(`📍 Location: ${jobData.location}`);
    console.log(`⏰ Schedule: ${jobData.salary.hours || 'Not specified'}`);

    const topKeywords = Object.entries(jobData.keyTerms)
      .filter(([key, terms]) => terms.length > 0)
      .map(([category, terms]) => `${category}: ${terms.slice(0, 3).join(', ')}`)
      .join(' • ');
    console.log(`🏷️ Key Terms: ${topKeywords}`);

    console.log('\n🎉 Real Job Matching Test Complete!');

  } catch (error) {
    console.error('❌ Real Job Matching Test Failed:', error.message);
    console.error(error.stack);
  }
}

testRealJobMatching();