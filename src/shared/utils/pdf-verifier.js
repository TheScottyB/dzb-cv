/**
 * PDF Verification Utility
 * Checks if generated PDFs contain proper content and structure
 */
import { promises as fs } from 'fs';
import { exec, execSync } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
/**
 * Compare PDF text content with source JSON data
 */
async function compareWithJSON(textContent, jsonData) {
    // Simulate JSON comparison by checking for some expected fields
    if (!textContent.includes(jsonData.name)) {
        throw new Error('Name does not match JSON data');
    }
    if (!textContent.includes(jsonData.email)) {
        throw new Error('Email does not match JSON data');
    }
    if (!textContent.includes(jsonData.phone)) {
        throw new Error('Phone number does not match JSON data');
    }
}
/**
 * Generate PNG from PDF for visual verification
 */
async function generatePNG(filePath) {
    const pngFilePath = filePath.replace(/\.pdf$/, '.png');
    try {
        execSync(`pdftoppm -png -singlefile "${filePath}" "${pngFilePath}"`);
    }
    catch (error) {
        throw new Error('Failed to generate PNG from PDF');
    }
    return pngFilePath;
}
/**
 * Verify a PDF file contains proper content
 */
export async function verifyPDF(filePath) {
    const result = {
        isValid: false,
        hasContent: false,
        pageCount: 0,
        contentLength: 0,
        issues: [],
        warnings: []
    };
    try {
        // Check if file exists
        const stats = await fs.stat(filePath);
        if (stats.size === 0) {
            result.issues.push('PDF file is empty (0 bytes)');
            return result;
        }
        // Try to extract text content using pdftotext (if available)
        try {
            const { stdout } = await execAsync(`pdftotext "${filePath}" -`);
            result.textContent = stdout;
            result.contentLength = stdout.trim().length;
            result.hasContent = result.contentLength > 50; // Minimum meaningful content
            if (result.contentLength === 0) {
                result.issues.push('PDF contains no extractable text');
            }
            else if (result.contentLength < 100) {
                result.warnings.push(`PDF contains very little text (${result.contentLength} characters)`);
            }
        }
        catch (error) {
            result.warnings.push('Could not extract text content (pdftotext not available)');
        }
        // Check page count using pdfinfo (if available)
        try {
            const { stdout } = await execAsync(`pdfinfo "${filePath}"`);
            const pageMatch = stdout.match(/Pages:\s+(\d+)/);
            if (pageMatch) {
                result.pageCount = parseInt(pageMatch[1], 10);
            }
        }
        catch (error) {
            result.warnings.push('Could not determine page count (pdfinfo not available)');
        }
        // Basic validation
        result.isValid = result.hasContent || result.pageCount > 0;
        // Content analysis
        if (result.textContent) {
            const text = result.textContent.toLowerCase();
            // Check for undefined content issues
            if (text.includes('undefined')) {
                result.issues.push('PDF contains "undefined" text - indicates data mapping issues');
            }
            // Check for placeholder content
            if (text.includes('company name') || text.includes('position')) {
                result.warnings.push('PDF may contain placeholder content instead of actual data');
            }
            // Check for expected CV sections
            const expectedSections = ['experience', 'education', 'skills'];
            const missingSections = expectedSections.filter(section => !text.includes(section));
            if (missingSections.length > 0) {
                result.warnings.push(`Missing expected sections: ${missingSections.join(', ')}`);
            }
        }
        // Compare PDF text with source JSON data
        const sampleJSON = {
            name: "John Doe",
            email: "john.doe@example.com",
            phone: "123-456-7890"
        };
        await compareWithJSON(result.textContent || '', sampleJSON);
        // Generate PNG for visual verification
        await generatePNG(filePath);
    }
    catch (error) {
        result.issues.push(`Error verifying PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
    return result;
}
/**
 * Print verification results in a human-readable format
 */
export function printVerificationResults(filePath, result) {
    console.log(`\n📄 PDF Verification: ${filePath}`);
    console.log(`   Valid: ${result.isValid ? '✅' : '❌'}`);
    console.log(`   Has Content: ${result.hasContent ? '✅' : '❌'}`);
    console.log(`   Page Count: ${result.pageCount}`);
    console.log(`   Content Length: ${result.contentLength} characters`);
    if (result.issues.length > 0) {
        console.log(`   🚨 Issues:`);
        result.issues.forEach(issue => console.log(`      - ${issue}`));
    }
    if (result.warnings.length > 0) {
        console.log(`   ⚠️  Warnings:`);
        result.warnings.forEach(warning => console.log(`      - ${warning}`));
    }
    if (result.textContent && result.contentLength > 0) {
        console.log(`   📝 Content Preview:`);
        console.log(`      ${result.textContent.substring(0, 200)}${result.textContent.length > 200 ? '...' : ''}`);
    }
}
/**
 * Verify multiple PDF files
 */
export async function verifyMultiplePDFs(filePaths) {
    const results = {};
    for (const filePath of filePaths) {
        results[filePath] = await verifyPDF(filePath);
    }
    return results;
}
//# sourceMappingURL=pdf-verifier.js.map