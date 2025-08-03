// Simple test of Chrome PDF generation
import { spawn } from 'child_process';
import { writeFileSync, existsSync } from 'fs';

// Test HTML content
const testHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Test CV</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 0.75in; 
            line-height: 1.4; 
            color: #2c3e50; 
        }
        h1 { color: #2c3e50; margin-bottom: 0.3em; }
        h2 { color: #34495e; border-bottom: 1px solid #3498db; }
        .contact { margin-bottom: 1em; color: #7f8c8d; }
    </style>
</head>
<body>
    <h1>John Doe</h1>
    <div class="contact">john.doe@email.com | (555) 123-4567</div>
    
    <h2>Experience</h2>
    <div>
        <strong>Software Developer</strong><br>
        Tech Company Inc.<br>
        2020 - Present<br>
        Developed web applications using modern technologies.
    </div>
    
    <h2>Education</h2>
    <div>
        <strong>Bachelor of Science in Computer Science</strong><br>
        University Name<br>
        2020
    </div>
    
    <h2>Skills</h2>
    <div>JavaScript, TypeScript, React, Node.js</div>
</body>
</html>
`;

async function testChromeDetection() {
    console.log('🔍 Testing Chrome detection...');
    
    const chromePaths = [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Chromium.app/Contents/MacOS/Chromium'
    ];
    
    for (const chromePath of chromePaths) {
        if (existsSync(chromePath)) {
            console.log(`✅ Chrome found: ${chromePath}`);
            return chromePath;
        }
    }
    
    console.log('❌ Chrome not found');
    return null;
}

async function testChromePDF() {
    console.log('🚀 Testing Chrome PDF generation...');
    
    const chromePath = await testChromeDetection();
    if (!chromePath) {
        console.log('❌ Cannot test PDF generation - Chrome not found');
        return;
    }
    
    // Write test HTML file
    const htmlPath = '/tmp/test-cv.html';
    const pdfPath = '/tmp/test-cv.pdf';
    
    console.log('📝 Writing test HTML file...');
    writeFileSync(htmlPath, testHTML);
    
    // Build Chrome command
    const chromeArgs = [
        '--headless',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--print-to-pdf=' + pdfPath,
        '--print-to-pdf-no-header',
        '--virtual-time-budget=5000',
        '--window-size=1920,1080',
        '--force-device-scale-factor=0.88',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        'file://' + htmlPath
    ];
    
    console.log('🎯 Running Chrome command...');
    console.log(`${chromePath} ${chromeArgs.join(' ')}`);
    
    return new Promise((resolve, reject) => {
        const process = spawn(chromePath, chromeArgs, {
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
                if (existsSync(pdfPath)) {
                    console.log('✅ PDF generated successfully!');
                    console.log(`📄 Output: ${pdfPath}`);
                    resolve(pdfPath);
                } else {
                    console.log('❌ PDF generation failed - no output file');
                    reject(new Error('No PDF output file created'));
                }
            } else {
                console.log(`❌ Chrome process exited with code ${code}`);
                if (stderr) console.log('stderr:', stderr);
                if (stdout) console.log('stdout:', stdout);
                reject(new Error(`Chrome process failed with code ${code}`));
            }
        });
        
        process.on('error', (error) => {
            clearTimeout(timeout);
            console.log('❌ Failed to start Chrome process:', error.message);
            reject(error);
        });
    });
}

// Run the test
testChromePDF()
    .then((pdfPath) => {
        console.log('🎉 Chrome PDF test completed successfully!');
        console.log(`📋 Generated PDF: ${pdfPath}`);
    })
    .catch((error) => {
        console.log('💥 Chrome PDF test failed:', error.message);
        process.exit(1);
    });