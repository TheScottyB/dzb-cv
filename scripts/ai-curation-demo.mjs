#!/usr/bin/env node

/**
 * AI Content Curation Demo
 * 
 * This is a simple demonstration showing how the AI curation system
 * would integrate with the existing CV generation workflow.
 */

console.log('🤖 AI Content Curation System Demo');
console.log('=====================================\n');

// Mock the AI curation functionality
const mockCurator = {
  async analyzeContent(cvData) {
    console.log('🔍 Analyzing CV content...');
    console.log(`   • Found ${cvData.experience.length} experience items`);
    console.log(`   • Found ${cvData.skills.length} skills`);
    console.log(`   • Found ${cvData.education.length} education items`);
    
    return {
      contentItems: [
        ...cvData.experience.map((exp, i) => ({
          id: `exp-${i}`,
          type: 'experience',
          content: `${exp.position} at ${exp.company}`,
          priority: 'high',
          relevanceScore: 0.9
        })),
        ...cvData.skills.map((skill, i) => ({
          id: `skill-${i}`,
          type: 'skill',
          content: skill,
          priority: 'medium',
          relevanceScore: 0.7
        }))
      ]
    };
  },

  async scoreForJob(analysis, jobDescription) {
    console.log('📊 Scoring content against job requirements...');
    console.log(`   • Job sector: ${jobDescription.sector}`);
    console.log(`   • Key requirements: ${jobDescription.requirements.slice(0, 3).join(', ')}`);
    
    const scores = analysis.contentItems.map(item => ({
      contentId: item.id,
      totalScore: item.relevanceScore,
      components: {
        keywordMatch: 0.8,
        skillAlignment: 0.7,
        experienceRelevance: 0.9
      }
    }));
    
    return { scores };
  },

  async curate(cvData, jobDescription, options) {
    console.log('🎯 Performing intelligent content curation...');
    console.log(`   • Target length: ${options.targetLength}`);
    console.log(`   • Max experience items: ${options.maxExperienceItems}`);
    
    // Simulate content selection
    const selectedExperience = cvData.experience.slice(0, options.maxExperienceItems);
    const selectedSkills = cvData.skills.slice(0, options.maxSkillItems);
    
    return {
      selectedContent: [
        ...selectedExperience.map((exp, i) => ({
          id: `exp-${i}`,
          include: true,
          priority: 'high',
          content: `${exp.position} at ${exp.company}`,
          modifications: {
            shortened: `Led ${exp.responsibilities[0]}`
          }
        })),
        ...selectedSkills.map((skill, i) => ({
          id: `skill-${i}`,
          include: true,
          priority: 'medium',
          content: skill
        }))
      ],
      summary: {
        totalContentItems: cvData.experience.length + cvData.skills.length + cvData.education.length,
        selectedItems: selectedExperience.length + selectedSkills.length + 1, // +1 for education
        estimatedLength: 35,
        strategyUsed: 'tech-focused-single-page',
        sectionsIncluded: {
          experience: true,
          skills: true,
          education: true,
          certifications: options.includeCertifications
        }
      }
    };
  }
};

// Sample data for demo
const sampleCV = {
  personalInfo: {
    name: { full: 'Jane Developer' },
    contact: { email: 'jane@example.com' }
  },
  experience: [
    {
      position: 'Senior Software Engineer',
      company: 'TechCorp',
      startDate: '2020',
      endDate: 'Present',
      responsibilities: ['Led microservices architecture', 'Mentored team members']
    },
    {
      position: 'Software Engineer',
      company: 'StartupXYZ',
      startDate: '2018',
      endDate: '2020',
      responsibilities: ['Developed React applications', 'Built REST APIs']
    },
    {
      position: 'Junior Developer',
      company: 'WebCorp',
      startDate: '2016',
      endDate: '2018',
      responsibilities: ['Maintained legacy systems', 'Fixed bugs']
    }
  ],
  education: [
    {
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      institution: 'Tech University',
      graduationDate: '2016'
    }
  ],
  skills: [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
    'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis',
    'GraphQL', 'Jest', 'CI/CD'
  ],
  certifications: ['AWS Solutions Architect', 'CKA']
};

const jobDescription = {
  title: 'Senior Full-Stack Developer',
  sector: 'tech',
  requirements: [
    '5+ years experience',
    'React expertise',
    'Node.js proficiency',
    'AWS experience',
    'Leadership skills'
  ]
};

const curationOptions = {
  targetLength: 'single-page',
  maxExperienceItems: 2,
  maxSkillItems: 8,
  includeCertifications: true
};

async function runDemo() {
  try {
    console.log('📋 Starting AI curation process...\n');
    
    // Step 1: Analyze content
    const analysis = await mockCurator.analyzeContent(sampleCV);
    console.log('✅ Content analysis complete\n');
    
    // Step 2: Score against job
    const scoring = await mockCurator.scoreForJob(analysis, jobDescription);
    const avgScore = scoring.scores.reduce((sum, s) => sum + s.totalScore, 0) / scoring.scores.length;
    console.log(`✅ Job alignment scoring complete (avg: ${avgScore.toFixed(2)})\n`);
    
    // Step 3: Curate content
    const curation = await mockCurator.curate(sampleCV, jobDescription, curationOptions);
    console.log('✅ Content curation complete\n');
    
    // Display results
    console.log('📊 Curation Results:');
    console.log('===================');
    console.log(`Original CV items: ${curation.summary.totalContentItems}`);
    console.log(`Selected items: ${curation.summary.selectedItems}`);
    console.log(`Estimated length: ${curation.summary.estimatedLength} lines`);
    console.log(`Strategy: ${curation.summary.strategyUsed}`);
    
    console.log('\n🔥 Selected High-Priority Content:');
    const highPriority = curation.selectedContent.filter(c => c.priority === 'high');
    highPriority.forEach(item => {
      console.log(`   • ${item.content}`);
      if (item.modifications?.shortened) {
        console.log(`     → Optimized: ${item.modifications.shortened}`);
      }
    });
    
    console.log('\n💡 AI Curation Benefits:');
    console.log('   ✓ Automatically prioritizes most relevant experience');
    console.log('   ✓ Ensures single-page constraint is met');
    console.log('   ✓ Optimizes content for job requirements');
    console.log('   ✓ Maintains professional formatting');
    console.log('   ✓ Sector-specific optimization');
    
    console.log('\n🚀 Integration Points:');
    console.log('   • CLI: cv generate --ai-optimize --job-description "..."');
    console.log('   • CLI: cv ai-generate --job-url "https://..."');
    console.log('   • API: Intelligent content selection before PDF generation');
    console.log('   • Web: Real-time job-CV matching and optimization');
    
    console.log('\n🎉 Demo completed successfully!');
    console.log('The AI curation system is ready for integration.');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

runDemo();
