// Test the simplified Chrome PDF interface
import { spawn } from 'child_process';
import { writeFileSync, existsSync } from 'fs';

// Simple Chrome PDF class (inline for testing)
class TestChromePDF {
  constructor() {
    this.chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  }

  async generatePDF(options) {
    const startTime = Date.now();

    try {
      console.log('🚀 Starting Chrome PDF generation...');

      // Write HTML to temp file
      const tempHtmlPath = '/tmp/dzb-cv-simple-test.html';
      writeFileSync(tempHtmlPath, options.html);

      // Build Chrome command
      const args = [
        '--headless',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        `--print-to-pdf=${options.outputPath}`,
        '--print-to-pdf-no-header',
        '--virtual-time-budget=5000',
        '--window-size=1920,1080',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ];

      if (options.singlePage) {
        args.push('--force-device-scale-factor=0.88');
      }

      args.push(`file://${tempHtmlPath}`);

      console.log('Chrome command:', this.chromePath, ...args);

      // Execute Chrome
      await this.executeChrome(args);

      // Check if PDF was created
      if (!existsSync(options.outputPath)) {
        throw new Error('PDF file was not created');
      }

      return {
        success: true,
        outputPath: options.outputPath,
        executionTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime
      };
    }
  }

  executeChrome(args) {
    return new Promise((resolve, reject) => {
      const process = spawn(this.chromePath, args, {
        stdio: 'pipe'
      });

      let stdout = '';
      let stderr = '';

      process.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      const timeout = setTimeout(() => {
        process.kill('SIGKILL');
        reject(new Error('Chrome PDF generation timed out'));
      }, 15000);

      process.on('close', (code) => {
        clearTimeout(timeout);

        if (code === 0) {
          console.log('✅ Chrome PDF generation completed');
          resolve();
        } else {
          console.log(`❌ Chrome exited with code ${code}`);
          if (stderr) console.log('stderr:', stderr);
          reject(new Error(`Chrome process failed with code ${code}: ${stderr}`));
        }
      });

      process.on('error', (error) => {
        clearTimeout(timeout);
        reject(new Error(`Failed to start Chrome: ${error.message}`));
      });
    });
  }
}

// Test HTML
const testHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Simple Chrome PDF Test</title>
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
    <h1>Jane Smith</h1>
    <div class="contact">jane.smith@email.com | (555) 987-6543</div>
    
    <h2>Professional Summary</h2>
    <p>Experienced software developer with expertise in modern web technologies and agile development practices.</p>
    
    <h2>Experience</h2>
    <div class="experience-item">
        <div class="job-title">Senior Software Developer</div>
        <div class="company">Tech Solutions Inc.</div>
        <div class="date">2021 - Present</div>
        <p>Lead development of web applications using React, TypeScript, and Node.js. Mentored junior developers and improved team productivity by 40%.</p>
    </div>
    
    <div class="experience-item">
        <div class="job-title">Software Developer</div>
        <div class="company">StartupCorp</div>
        <div class="date">2019 - 2021</div>
        <p>Built full-stack applications and implemented CI/CD pipelines. Reduced deployment time by 60%.</p>
    </div>
    
    <h2>Education</h2>
    <div class="experience-item">
        <div class="job-title">Master of Science in Computer Science</div>
        <div class="company">Tech University</div>
        <div class="date">2019</div>
    </div>
    
    <h2>Skills</h2>
    <div>JavaScript • TypeScript • React • Node.js • Python • AWS • Docker • Kubernetes</div>
</body>
</html>
`;

// Run tests
async function runTests() {
  const pdf = new TestChromePDF();

  console.log('🧪 Testing Chrome PDF Interface');
  console.log('================================');

  // Test 1: Regular PDF
  console.log('\n📄 Test 1: Regular PDF Generation');
  const result1 = await pdf.generatePDF({
    html: testHTML,
    outputPath: '/tmp/test-regular.pdf'
  });

  if (result1.success) {
    console.log(`✅ Regular PDF: ${result1.outputPath} (${result1.executionTime}ms)`);
  } else {
    console.log(`❌ Regular PDF failed: ${result1.error}`);
  }

  // Test 2: Single-page PDF
  console.log('\n📄 Test 2: Single-Page PDF Generation');
  const result2 = await pdf.generatePDF({
    html: testHTML,
    outputPath: '/tmp/test-single-page.pdf',
    singlePage: true
  });

  if (result2.success) {
    console.log(`✅ Single-page PDF: ${result2.outputPath} (${result2.executionTime}ms)`);
  } else {
    console.log(`❌ Single-page PDF failed: ${result2.error}`);
  }

  // Show file sizes
  console.log('\n📊 File Comparison:');
  if (existsSync('/tmp/test-regular.pdf')) {
    const { spawn } = await import('child_process');
    const { promisify } = await import('util');
    const exec = promisify(spawn);
    
    try {
      const ls1 = spawn('ls', ['-lh', '/tmp/test-regular.pdf']);
      const ls2 = spawn('ls', ['-lh', '/tmp/test-single-page.pdf']);
      
      ls1.stdout.on('data', (data) => {
        console.log('Regular:', data.toString().trim());
      });
      
      ls2.stdout.on('data', (data) => {
        console.log('Single-page:', data.toString().trim());
      });
    } catch (e) {
      // Ignore ls errors
    }
  }

  console.log('\n🎉 Chrome PDF Interface tests completed!');
}

runTests().catch(console.error);