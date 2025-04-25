import { analyzeJobPosting } from './job-analyzer.js';
import { getMockJobHtml } from './mock-job-data.js';
import { JSDOM as _JSDOM } from 'jsdom';

// Mock fetch function
global.fetch = async (url) => {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    let mockHtml = null;
    
    if (domain.includes('linkedin.com')) {
        mockHtml = getMockJobHtml('linkedin');
    } else if (domain.includes('indeed.com')) {
        mockHtml = getMockJobHtml('indeed');
    }
    
    if (mockHtml) {
        return {
            ok: true,
            text: async () => mockHtml
        };
    }
    
    throw new Error(`Mock data not found for ${url}`);
};

// Test URLs for different job sites
const testUrls = [
    'https://www.linkedin.com/jobs/view/mock-job-1',
    'https://www.indeed.com/jobs/mock-job-2'
];

async function runTests() {
    console.log('Starting job analyzer tests with mock data...\n');
    
    for (const url of testUrls) {
        try {
            console.log(`Testing URL: ${url}`);
            const result = await analyzeJobPosting(url, { testMode: true });
            
            // Basic validation
            console.log('\nBasic validation:');
            console.log('- Title:', result.title);
            console.log('- Company:', result.company);
            console.log('- Location:', result.location);
            console.log('- Job Site:', result.source.site);
            
            // Section validation
            console.log('\nSection validation:');
            console.log('- Responsibilities:', result.responsibilities.length);
            console.log('- Qualifications:', result.qualifications.length);
            console.log('- Key Terms:', Object.keys(result.keyTerms).length);
            
            // Content validation
            console.log('\nContent validation:');
            if (url.includes('linkedin.com')) {
                validateLinkedInJob(result);
            } else if (url.includes('indeed.com')) {
                validateIndeedJob(result);
            }
            
            // File validation
            console.log('\nFile validation:');
            console.log('- HTML saved:', result.metadata.files.html);
            console.log('- XML saved:', result.metadata.files.xml);
            console.log('- JSON files saved:', Object.values(result.metadata.files));
            
            // Performance metrics
            console.log('\nPerformance metrics:');
            console.log('- Processing time:', result.metadata.processingTime, 'ms');
            
            console.log('\nTest completed successfully!\n');
        } catch (error) {
            console.error(`\nTest failed for ${url}:`);
            console.error('- Error type:', error.type);
            console.error('- Error message:', error.message);
            if (error.details) {
                console.error('- Error details:', error.details);
            }
            console.log('\n');
        }
    }
    
    console.log('All tests completed!');
}

function validateLinkedInJob(result) {
    const expectedValues = {
        title: 'Senior Software Engineer',
        company: 'Test Company',
        location: 'San Francisco, CA',
        responsibilities: [
            'Lead technical projects from conception to deployment',
            'Write clean, maintainable code',
            'Mentor junior developers'
        ],
        skills: [
            'javascript',
            'typescript',
            'react',
            'node.js',
            'aws'
        ]
    };
    
    console.log('LinkedIn specific validation:');
    console.log('- Title match:', result.title === expectedValues.title);
    console.log('- Company match:', result.company === expectedValues.company);
    console.log('- Location match:', result.location === expectedValues.location);
    console.log('- Has all responsibilities:', expectedValues.responsibilities.every(r => 
        result.responsibilities.includes(r)));
    console.log('- Has all skills:', expectedValues.skills.every(s => 
        result.keyTerms.programming?.includes(s)));
}

function validateIndeedJob(result) {
    const expectedValues = {
        title: 'Full Stack Developer',
        company: 'Test Corp',
        location: 'Remote',
        responsibilities: [
            'Develop full-stack web applications',
            'Work with cross-functional teams',
            'Optimize application performance'
        ],
        requirements: [
            '3+ years of full-stack development experience',
            'Strong knowledge of JavaScript and Python'
        ]
    };
    
    console.log('Indeed specific validation:');
    console.log('- Title match:', result.title === expectedValues.title);
    console.log('- Company match:', result.company === expectedValues.company);
    console.log('- Location match:', result.location === expectedValues.location);
    console.log('- Has all responsibilities:', expectedValues.responsibilities.every(r => 
        result.responsibilities.includes(r)));
    console.log('- Has all requirements:', expectedValues.requirements.every(r => 
        result.qualifications.includes(r)));
}

// Run the tests
runTests().catch(console.error); 