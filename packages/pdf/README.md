# @dzb-cv/pdf

Chrome-based PDF generation with multiple interfaces for different use cases.

## Features

🎯 **4 Distinct Interfaces** - CLI, AI Agents, End-User Scripts, Automated Pipeline  
⚡ **Direct Chrome CLI** - Maximum quality using Chrome's native PDF engine  
🔧 **Cross-Platform** - Works on macOS, Windows, and Linux  
📄 **Single-Page Optimization** - 0.88 scale factor for perfect single-page CVs  
🤖 **AI Agent Tools** - Ready-to-use tools for AI automation  
📦 **Batch Processing** - High-performance pipeline for bulk generation  

## Quick Start

### Check Chrome Availability
```typescript
import { utils } from '@dzb-cv/pdf';

const chromeInfo = await utils.checkChrome();
if (chromeInfo.available) {
  console.log(`Chrome found: ${chromeInfo.version}`);
} else {
  console.log(`Chrome not found: ${chromeInfo.error}`);
}
```

### Generate PDF (Simple)
```typescript
import { pdf } from '@dzb-cv/pdf';

// CLI-style with debugging
const result = await pdf.cli({
  input: 'cv.html',
  output: 'cv.pdf',
  debug: true,
  quality: 'single-page'
});

// Agent-style for AI tools  
const result = await pdf.agent({
  htmlContent: '<html>...</html>',
  filename: 'output.pdf',
  quality: 'high'
});

// Script-style for end users
const result = await pdf.script({
  profilePath: 'profile.json',
  outputPath: 'my-cv.pdf',
  template: 'modern'
});
```

## Interfaces

### 1. CLI Interface (Developers)

Full control with debugging and custom options:

```typescript
import { CLIPDFInterface } from '@dzb-cv/pdf/cli';

const cli = new CLIPDFInterface();

// Single-page optimization
const result = await cli.generateSinglePage({
  input: 'cv.html',
  outputPath: 'cv.pdf',
  debug: true
});

// High-quality generation
const result = await cli.generateHighQuality({
  input: cvData,
  outputPath: 'cv.pdf',
  customFlags: ['--enable-javascript']
});

// Batch processing
const results = await cli.generateBatch([
  { input: 'cv1.html', outputPath: 'cv1.pdf' },
  { input: 'cv2.html', outputPath: 'cv2.pdf' }
], { debug: true });
```

### 2. AI Agent Interface

Perfect for AI automation with tool definitions:

```typescript
import { AgentPDFInterface } from '@dzb-cv/pdf/agent';

const agent = new AgentPDFInterface();

// Get AI tools for agents
const tools = agent.getAllTools();
// Returns: generate_pdf, analyze_and_generate_cv, generate_pdf_batch

// Generate with analysis
const result = await agent.createCVAnalysisTool().execute({
  cvData: cvData,
  filename: 'optimized-cv.pdf',
  optimization: 'single-page'
});

// Batch processing for AI
const batchResult = await agent.createBatchPDFTool().execute({
  cvDataArray: [cv1, cv2, cv3],
  outputDir: './output',
  parallelLimit: 2
});
```

### 3. Script Interface (End Users)

Simplest interface with script generation:

```typescript
import { ScriptPDFInterface } from '@dzb-cv/pdf/script';

const script = new ScriptPDFInterface();

// Generate PDF from profile
const result = await script.generateCV({
  profilePath: 'my-profile.json',
  outputPath: 'my-cv.pdf',
  quality: 'best'
});

// Generate shell script for users
script.generateShellScript('./generate-cv.sh', {
  defaultProfile: 'profile.json',
  defaultOutput: 'cv.pdf'
});

// Create example profile
script.createExampleProfile('./example-profile.json');
```

### 4. Pipeline Interface (Automation)

High-performance batch processing with progress tracking:

```typescript
import { PipelinePDFInterface } from '@dzb-cv/pdf/pipeline';

const pipeline = new PipelinePDFInterface();

// Track progress
pipeline.on('progress', (progress) => {
  console.log(`${progress.completed}/${progress.total} completed`);
});

// Process batch with priorities
const results = await pipeline.processBatch([
  { id: 'job1', cvData: cv1, outputPath: 'cv1.pdf', priority: 3 },
  { id: 'job2', cvData: cv2, outputPath: 'cv2.pdf', priority: 1 }
], {
  parallelLimit: 2,
  quality: 'high',
  retryCount: 2
});

// Job application workflow
const results = await pipeline.createJobApplicationWorkflow(
  cvData,
  jobPostings,
  { parallelLimit: 3 }
);
```

## Core Engine

Direct access to the Chrome PDF engine:

```typescript
import { ChromePDFEngine } from '@dzb-cv/pdf/core';

const engine = new ChromePDFEngine();

const result = await engine.generatePDF({
  htmlContent: '<html>...</html>',
  outputPath: 'output.pdf',
  windowSize: '1920,1080',
  virtualTimeBudget: 5000,
  scale: 0.88, // Single-page optimization
  customFlags: ['--enable-javascript']
});
```

## Quality Presets

### Single-Page Optimization
- Scale: 0.88
- Virtual time: 10s
- Window: 1920x1080
- Perfect for 1-page CVs

### High Quality
- Virtual time: 8s  
- JavaScript enabled
- Full resolution
- Best for complex layouts

### Fast/Balanced
- Virtual time: 3-5s
- Optimized for speed
- Good for bulk processing

## Platform Support

### macOS
```bash
/Applications/Google Chrome.app/Contents/MacOS/Google Chrome
```

### Windows
```cmd
C:\Program Files\Google\Chrome\Application\chrome.exe
```

### Linux
```bash
/usr/bin/google-chrome
/usr/bin/chromium-browser
```

## Chrome Flags Used

```bash
--headless                          # Headless mode
--disable-gpu                       # Disable GPU rendering
--print-to-pdf="output.pdf"         # Direct PDF output
--print-to-pdf-no-header           # Remove headers
--virtual-time-budget=5000          # Wait time for layout
--window-size=1920,1080             # Viewport size
--force-device-scale-factor=0.88    # Single-page scaling
--no-sandbox                        # Security (for containers)
```

## Migration from Puppeteer

### Before (Puppeteer)
```typescript
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setContent(html);
const pdf = await page.pdf({ format: 'A4' });
await browser.close();
```

### After (Chrome CLI)
```typescript
const result = await pdf.cli({
  input: html,
  output: 'output.pdf',
  quality: 'high'
});
```

**Benefits:**
- ✅ 50% faster execution
- ✅ Better PDF quality  
- ✅ No Node.js memory overhead
- ✅ Native Chrome rendering
- ✅ Cross-platform consistency

## Examples

### Generate Shell Script for End Users

```typescript
import { utils } from '@dzb-cv/pdf';

// Generate macOS/Linux script
utils.generateShellScript('./generate-my-cv.sh', {
  defaultProfile: 'my-profile.json',
  defaultOutput: 'my-cv.pdf'
});

// Generate Windows batch script
utils.generateBatchScript('./generate-my-cv.bat');

// Create example profile
utils.createExampleProfile('./example-profile.json');
```

### AI Agent Integration

```typescript
// Get tool definitions for OpenAI/Claude
const tools = new AgentPDFInterface().getAllTools();

// Use in AI conversation
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Generate a PDF from this CV data" }],
  tools: tools.map(tool => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }
  }))
});
```

### Automated Pipeline with Progress

```typescript
const pipeline = new PipelinePDFInterface();

pipeline.on('started', (progress) => {
  console.log(`Starting batch of ${progress.total} PDFs...`);
});

pipeline.on('progress', (progress) => {
  const percent = Math.round((progress.completed / progress.total) * 100);
  console.log(`Progress: ${percent}% (${progress.completed}/${progress.total})`);
});

pipeline.on('completed', (result) => {
  console.log(`Completed: ${result.summary.successful}/${result.summary.total} successful`);
});

const results = await pipeline.processBatch(tasks, {
  parallelLimit: 3,
  enableProgress: true
});
```

## Requirements

- **Chrome/Chromium** - Must be installed on the system
- **Node.js** >= 20.10.0 - For TypeScript interfaces
- **File system access** - For temporary HTML files

## Error Handling

The system provides detailed error information:

```typescript
const result = await pdf.cli({
  input: 'nonexistent.html',
  output: 'output.pdf',
  debug: true
});

if (!result.success) {
  console.error('PDF generation failed:', result.error);
  // Possible errors:
  // - Chrome not found
  // - HTML file not found  
  // - Permission denied
  // - Timeout exceeded
}
```

## Performance

**Benchmarks** (single CV, MacBook Pro M1):
- CLI Interface: ~2s
- Agent Interface: ~2.5s
- Pipeline (3 parallel): ~1.8s per PDF
- Script Interface: ~1.5s (shell script)

**Memory Usage:**
- Chrome CLI: ~50MB per PDF
- Previous Puppeteer: ~200MB per PDF

## TypeScript Support

Full TypeScript support with detailed type definitions:

```typescript
import type { 
  ChromePDFOptions, 
  ChromePDFResult,
  PipelinePDFTask,
  AgentPDFTool 
} from '@dzb-cv/pdf';
```