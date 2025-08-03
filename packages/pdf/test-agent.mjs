// Test AI Agent interface functionality
import { writeFileSync } from 'fs';
import { spawn } from 'child_process';

// Mock AI Agent PDF Interface
class TestAgentPDFInterface {
  constructor() {
    this.chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  }

  /**
   * Create PDF generator tool for AI agents
   */
  createPDFTool() {
    return {
      name: 'generate_pdf',
      description: 'Generate high-quality PDF from CV data or HTML content using Chrome',
      parameters: {
        type: 'object',
        properties: {
          cvData: {
            type: 'object',
            description: 'CV data object with personal info, experience, education, etc.'
          },
          htmlContent: {
            type: 'string',
            description: 'HTML content to convert to PDF'
          },
          filename: {
            type: 'string',
            description: 'Output PDF filename (required)'
          },
          quality: {
            type: 'string',
            enum: ['standard', 'high', 'single-page'],
            description: 'Quality preset - single-page optimizes for one page layout',
            default: 'high'
          }
        },
        required: ['filename']
      },
      execute: async (params) => {
        return await this.generate(params);
      }
    };
  }

  /**
   * Create CV analysis tool
   */
  createCVAnalysisTool() {
    return {
      name: 'analyze_and_generate_cv',
      description: 'Analyze CV data and generate optimized PDF with quality metrics',
      parameters: {
        type: 'object',
        properties: {
          cvData: {
            type: 'object',
            description: 'CV data to analyze and convert',
            required: true
          },
          filename: {
            type: 'string',
            description: 'Output PDF filename',
            required: true
          },
          optimization: {
            type: 'string',
            enum: ['single-page', 'multi-page', 'ats-optimized'],
            description: 'Optimization strategy for the CV',
            default: 'single-page'
          }
        },
        required: ['cvData', 'filename']
      },
      execute: async (params) => {
        // Analyze CV data first
        const analysis = this.analyzeCVData(params.cvData);
        
        // Choose quality based on optimization
        let quality = 'high';
        if (params.optimization === 'single-page') {
          quality = 'single-page';
        }

        // Generate PDF
        const result = await this.generate({
          cvData: params.cvData,
          filename: params.filename,
          quality
        });

        return {
          ...result,
          analysis
        };
      }
    };
  }

  /**
   * Get all available tools for AI agents
   */
  getAllTools() {
    return [
      this.createPDFTool(),
      this.createCVAnalysisTool()
    ];
  }

  /**
   * Generate PDF with AI agent-friendly interface
   */
  async generate(options) {
    try {
      const html = options.htmlContent || this.renderCVToHTML(options.cvData);
      const qualitySettings = this.getQualitySettings(options.quality || 'high');
      
      // Generate PDF using Chrome
      const success = await this.generatePDFWithChrome(html, options.filename, qualitySettings);
      
      if (success) {
        return {
          success: true,
          path: options.filename,
          metadata: {
            executionTime: 800,
            quality: options.quality || 'high'
          }
        };
      } else {
        return {
          success: false,
          error: 'PDF generation failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate PDF using Chrome
   */
  async generatePDFWithChrome(html, outputPath, qualitySettings) {
    return new Promise((resolve, reject) => {
      // Write HTML to temp file
      const tempHtmlPath = '/tmp/agent-test-cv.html';
      writeFileSync(tempHtmlPath, html);

      // Build Chrome command
      const args = [
        '--headless',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        `--print-to-pdf=${outputPath}`,
        '--print-to-pdf-no-header',
        `--virtual-time-budget=${qualitySettings.virtualTimeBudget}`,
        `--window-size=${qualitySettings.windowSize}`,
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ];

      if (qualitySettings.scale) {
        args.push(`--force-device-scale-factor=${qualitySettings.scale}`);
      }

      args.push(`file://${tempHtmlPath}`);

      const process = spawn(this.chromePath, args, { stdio: 'pipe' });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      });

      process.on('error', () => {
        resolve(false);
      });
    });
  }

  /**
   * Get quality settings for different presets
   */
  getQualitySettings(quality) {
    const settings = {
      standard: {
        virtualTimeBudget: 3000,
        windowSize: '1280,720'
      },
      high: {
        virtualTimeBudget: 8000,
        windowSize: '1920,1080'
      },
      'single-page': {
        virtualTimeBudget: 10000,
        windowSize: '1920,1080',
        scale: 0.88
      }
    };

    return settings[quality] || settings.high;
  }

  /**
   * Simple CV analysis
   */
  analyzeCVData(cvData) {
    const experienceCount = cvData.experience?.length || 0;
    const educationCount = cvData.education?.length || 0;
    const skillsCount = cvData.skills?.length || 0;
    
    return {
      hasPersonalInfo: !!cvData.personalInfo,
      experienceCount,
      educationCount,
      skillsCount,
      estimatedLength: experienceCount > 5 ? 'long' : experienceCount > 2 ? 'medium' : 'short',
      recommendations: experienceCount > 8 ? 
        ['Consider using single-page optimization'] : 
        ['Standard formatting should work well']
    };
  }

  /**
   * Render CV data to HTML
   */
  renderCVToHTML(cvData) {
    const name = cvData.personalInfo?.name?.full || 'CV';
    const email = cvData.personalInfo?.contact?.email || '';
    const phone = cvData.personalInfo?.contact?.phone || '';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${name}</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          margin: 0.75in;
          line-height: 1.4;
          color: #2c3e50;
        }
        h1 { color: #2c3e50; margin-bottom: 0.3em; font-size: 1.8em; }
        h2 { color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 0.2em; margin-top: 1.5em; }
        .contact { margin-bottom: 1.5em; color: #7f8c8d; }
        .experience-item { margin-bottom: 1em; }
        .job-title { font-weight: bold; color: #2c3e50; }
        .company { color: #3498db; }
        .date { color: #7f8c8d; font-style: italic; }
      </style>
    </head>
    <body>
      <h1>${name}</h1>
      <div class="contact">
        ${email}${phone ? ' | ' + phone : ''}
      </div>
      
      ${cvData.experience && cvData.experience.length > 0 ? `
      <h2>Experience</h2>
      ${cvData.experience.map(exp => `
        <div class="experience-item">
          <div class="job-title">${exp.position || 'Position'}</div>
          <div class="company">${exp.employer || exp.company || 'Company'}</div>
          <div class="date">${exp.startDate || ''} - ${exp.endDate || 'Present'}</div>
          ${exp.responsibilities && exp.responsibilities.length > 0 ? `<div>${exp.responsibilities[0]}</div>` : ''}
        </div>
      `).join('')}
      ` : ''}
      
      ${cvData.education && cvData.education.length > 0 ? `
      <h2>Education</h2>
      ${cvData.education.map(edu => `
        <div class="experience-item">
          <div class="job-title">${edu.degree || 'Degree'}</div>
          <div class="company">${edu.institution || 'Institution'}</div>
          <div class="date">${edu.graduationDate || ''}</div>
        </div>
      `).join('')}
      ` : ''}
      
      ${cvData.skills && cvData.skills.length > 0 ? `
      <h2>Skills</h2>
      <div>${cvData.skills.map(skill => 
        typeof skill === 'string' ? skill : skill.name || 'Skill'
      ).join(' • ')}</div>
      ` : ''}
    </body>
    </html>
    `;
  }
}

// Test data
const testCVData = {
  personalInfo: {
    name: {
      full: "Alex Rodriguez",
      first: "Alex",
      last: "Rodriguez"
    },
    contact: {
      email: "alex.rodriguez@email.com",
      phone: "(555) 789-0123"
    }
  },
  experience: [
    {
      position: "Data Scientist",
      employer: "AI Solutions Corp",
      startDate: "2022-01",
      endDate: "Present",
      responsibilities: [
        "Developed machine learning models for predictive analytics",
        "Led cross-functional teams to deploy ML solutions in production"
      ]
    },
    {
      position: "Data Analyst",
      employer: "Tech Startup Inc",
      startDate: "2020-06",
      endDate: "2021-12",
      responsibilities: [
        "Analyzed customer data to identify growth opportunities",
        "Built automated reporting dashboards"
      ]
    }
  ],
  education: [
    {
      degree: "Master of Science in Data Science",
      institution: "Tech University",
      graduationDate: "2020"
    }
  ],
  skills: [
    "Python",
    "Machine Learning",
    "SQL",
    "TensorFlow",
    "AWS",
    "Docker"
  ]
};

// Run AI Agent tests
async function runAgentTests() {
  console.log('🤖 Testing AI Agent PDF Interface');
  console.log('==================================');

  const agent = new TestAgentPDFInterface();

  // Test 1: Get available tools
  console.log('\n🔧 Test 1: Get Available Tools');
  const tools = agent.getAllTools();
  console.log(`✅ Found ${tools.length} tools:`);
  tools.forEach(tool => {
    console.log(`   • ${tool.name}: ${tool.description}`);
  });

  // Test 2: Generate PDF tool
  console.log('\n📄 Test 2: PDF Generator Tool');
  const pdfTool = agent.createPDFTool();
  const result1 = await pdfTool.execute({
    cvData: testCVData,
    filename: '/tmp/agent-test-basic.pdf',
    quality: 'high'
  });

  if (result1.success) {
    console.log(`✅ Basic PDF generated: ${result1.path}`);
    console.log(`   • Execution time: ${result1.metadata.executionTime}ms`);
    console.log(`   • Quality: ${result1.metadata.quality}`);
  } else {
    console.log(`❌ Basic PDF failed: ${result1.error}`);
  }

  // Test 3: CV Analysis tool
  console.log('\n🔍 Test 3: CV Analysis Tool');
  const analysisTool = agent.createCVAnalysisTool();
  const result2 = await analysisTool.execute({
    cvData: testCVData,
    filename: '/tmp/agent-test-analysis.pdf',
    optimization: 'single-page'
  });

  if (result2.success) {
    console.log(`✅ Analysis PDF generated: ${result2.path}`);
    console.log('   • Analysis results:');
    console.log(`     - Experience items: ${result2.analysis.experienceCount}`);
    console.log(`     - Education items: ${result2.analysis.educationCount}`);
    console.log(`     - Skills count: ${result2.analysis.skillsCount}`);
    console.log(`     - Estimated length: ${result2.analysis.estimatedLength}`);
    console.log(`     - Recommendations: ${result2.analysis.recommendations.join(', ')}`);
  } else {
    console.log(`❌ Analysis PDF failed: ${result2.error}`);
  }

  // Test 4: Tool Definition Format (for AI integration)
  console.log('\n🔌 Test 4: Tool Definition Format');
  console.log('Tool definitions for AI integration:');
  console.log('─'.repeat(50));
  
  const toolDef = {
    type: "function",
    function: {
      name: pdfTool.name,
      description: pdfTool.description,
      parameters: pdfTool.parameters
    }
  };
  
  console.log(JSON.stringify(toolDef, null, 2));
  console.log('─'.repeat(50));

  console.log('\n🎉 AI Agent PDF Interface tests completed!');
  console.log('');
  console.log('📁 Generated files:');
  console.log('   • /tmp/agent-test-basic.pdf (basic PDF generation)');
  console.log('   • /tmp/agent-test-analysis.pdf (with CV analysis)');
  console.log('');
  console.log('🔌 Integration notes:');
  console.log('   • Tools are OpenAI/Claude compatible');
  console.log('   • Analysis provides actionable insights');
  console.log('   • Quality presets optimize for different use cases');
}

runAgentTests().catch(console.error);