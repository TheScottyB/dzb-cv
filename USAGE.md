# DZB-CV Usage Guide

A comprehensive guide to using the DZB-CV system for creating professional CVs and resumes.

## Table of Contents

- [Getting Started](#getting-started)
- [Installation](#installation)
- [CLI Usage](#cli-usage)
- [Common Workflows](#common-workflows)
- [AI-Powered CV Generation](#ai-powered-cv-generation)
- [Quality Assurance Testing](#quality-assurance-testing)
- [Advanced Usage](#advanced-usage)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## Getting Started

DZB-CV is a TypeScript-based CV management system that allows you to create professional CVs with customizable templates and PDF export capabilities.

### Prerequisites

Before you begin, ensure you have:

- **Node.js** >= 20.10.0
- **pnpm** >= 10.9.0
- **Git** (for cloning the repository)

Check your versions:
```bash
node --version    # Should be >= 20.10.0
pnpm --version    # Should be >= 10.9.0
```

## Installation

### 🚀 Method 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/TheScottyB/dzb-cv.git
cd dzb-cv

# Run the automated setup script
./setup-dzb-cv.sh
```

The script will automatically:
- ✅ Check system requirements
- ✅ Install dependencies  
- ✅ Build all packages
- ✅ Test CLI functionality
- ✅ Optionally link CLI globally

### ⚡ Method 2: Quick Setup

```bash
# Clone and quick setup (no global linking)
git clone https://github.com/TheScottyB/dzb-cv.git
cd dzb-cv
pnpm run setup:quick
```

### 🔧 Method 3: Manual Setup

```bash
# Clone the repository
git clone https://github.com/TheScottyB/dzb-cv.git
cd dzb-cv

# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Link CLI globally (optional)
pnpm run link-cli
```

### Verify Installation

```bash
# Test the CLI
node packages/cli/dist/index.js --help

# Or if globally linked
cv --help
```

You should see:
```
Usage: cv [options] [command]

CV management tool

Options:
  -V, --version     output the version number
  -h, --help        display help for command

Commands:
  create [options]  Create a new CV
  help [command]    display help for command
```

## CLI Usage

### Available Commands

The current CLI supports the following commands:

#### `cv create` - Create a New CV

Creates a new CV with basic personal information and generates a PDF output.

**Syntax:**
```bash
cv create --name "Full Name" --email "email@example.com" [--output filename.pdf]
```

**Required Options:**
- `--name, -n <name>`: Full name for the CV
- `--email, -e <email>`: Email address

**Optional Options:**
- `--output, -o <file>`: Output PDF filename (default: generated automatically)

**Examples:**
```bash
# Basic CV creation
cv create --name "John Doe" --email "john.doe@email.com"

# With custom output filename
cv create --name "Jane Smith" --email "jane@company.com" --output "jane-smith-cv.pdf"

# Using short flags
cv create -n "Alex Johnson" -e "alex@email.com" -o "alex-cv.pdf"
```

#### `--single-page` Flag for CLI Create

The CLI `create` command supports a `--single-page` flag for optimized single-page PDF generation.

**Syntax:**
```bash
cv create --name <name> --email <email> [--single-page] [--output <file>]
```

**Optional Flags:**
- `--single-page`: Optimize PDF for single-page layout with improved scaling
- `--output <file>`: Custom output filename

**Examples:**
```bash
# Generate single-page CV with optimized scaling
cv create --name "John Doe" --email "john@example.com" --single-page

# Single-page CV with custom filename
cv create --name "Jane Smith" --email "jane@company.com" --single-page --output "jane-optimized-cv.pdf"

# Standard CV (multi-page capable)
cv create --name "John Doe" --email "john@example.com"
```

**Note**: For sector-specific templates and advanced generation features, use the AI generator or simple scripts described below.

### Command Help

Get help for any command:

```bash
# General help
cv --help
dzb-cv --help

# Help for specific command
cv create --help
dzb-cv generate --help

# Version information
cv --version
dzb-cv --version
```

## Common Workflows

### Workflow 1: First-Time Setup and CV Creation

```bash
# 1. Clone and run automated setup
git clone https://github.com/TheScottyB/dzb-cv.git
cd dzb-cv
./setup-dzb-cv.sh

# 2. Create your CV (if CLI was linked globally)
cv create \
  --name "Your Full Name" \
  --email "your.email@example.com" \
  --output "my-professional-cv.pdf"

# Or use direct path if not globally linked
node packages/cli/dist/index.js create \
  --name "Your Full Name" \
  --email "your.email@example.com" \
  --output "my-professional-cv.pdf"
```

### Workflow 2: Development and Testing

```bash
# 1. Make changes to the code
# ... edit files ...

# 2. Rebuild the project
pnpm run build

# 3. Test your changes
pnpm test

# 4. Test the CLI with your changes
node packages/cli/dist/index.js create --name "Test User" --email "test@example.com"
```

## AI-Powered CV Generation (v2.0)

The AI-powered CV generation system uses advanced GPT-4o technology to create professional, single-page CVs with intelligent content optimization.

### 🚀 Key Features v2.0

- **Zero Orphaned Headers**: Complete elimination of headers without content
- **Professional Quality**: 72/100 average quality score (vs. 26/100 baseline)
- **Perfect Length Compliance**: 100% adherence to single-page constraints
- **Strategic Content Framework**: AI performs content audit and relevance scoring
- **Quality Validation**: Post-generation analysis prevents unprofessional output

### AI Testing Commands (Quick Reference)

```bash
# Quick quality check
pnpm run ai:quality-check

# Full AI pipeline test
pnpm run ai:full-test

# Comprehensive benchmarking
pnpm run ai:benchmark

# Custom CV evaluation
pnpm run ai:evaluate path/to/your-cv.md --keywords "keyword1,keyword2" --export results.json

# Test AI distillation on your CV
pnpm run ai:test path/to/your-cv.md

# Run A/B testing
pnpm run ai:ab-test path/to/your-cv.md --keywords "keyword1,keyword2"
```

### Understanding AI Quality Metrics

The AI system evaluates CVs across 5 key dimensions:

#### 1. 📈 Relevance Score (0-100)
- **What it measures**: Keyword alignment and section completeness
- **Good score**: 70+ indicates strong relevance to target keywords
- **Example**: Healthcare CV with "EKG", "patient care" keywords = higher relevance

#### 2. 📝 Information Density (0-100+)
- **What it measures**: Meaningful content per character
- **Good score**: 60-100 indicates efficient use of space
- **Note**: Scores >100 indicate very dense, well-structured content

#### 3. 📖 Readability Score (0-100)
- **What it measures**: Sentence structure and formatting quality
- **Good score**: 70+ indicates professional readability
- **Factors**: Sentence length (8-20 words ideal), bullet point usage

#### 4. 📏 Length Compliance (0-100)
- **What it measures**: Adherence to single-page constraints
- **Good score**: 80+ indicates good fit for single-page format
- **Target**: 100 = perfect single-page compliance

#### 5. 🚫 Orphaned Headers (count)
- **What it measures**: Headers without meaningful content
- **Good score**: 0 (zero orphaned headers)
- **Critical**: Any orphaned header makes CV unprofessional

### AI Workflow Examples

#### Example 1: Basic Quality Check

```bash
# Evaluate your CV quality
pnpm run ai:evaluate cv-versions/your-cv.md --keywords "software,developer,python"
```

**Sample Output:**
```
📊 CV Quality Evaluation Results
================================

📈 Relevance Score:      85/100  # Excellent keyword alignment
📝 Information Density:  90/100  # Well-structured content
📖 Readability Score:    75/100  # Good readability
📏 Length Compliance:    95/100  # Great single-page fit
🚫 Orphaned Headers:     0       # Perfect - no orphaned headers

⭐ Overall Score:        82/100

✅ Excellent - CV meets high quality standards
```

#### Example 2: Complete AI Distillation Test

```bash
# Test complete AI pipeline with before/after comparison
pnpm run ai:test cv-versions/your-cv.md
```

**Sample Output:**
```
📈 Improvement Analysis:
========================
📈 Relevance Score:      +5 points
📝 Information Density:  -10 points  # Optimized for conciseness
📖 Readability Score:    +25 points  # Much more readable
📏 Length Compliance:    +40 points  # Now fits single page
🚫 Orphaned Headers:     -2 headers  # Eliminated problematic headers
⭐ Overall Score:        +35 points

✅ Test PASSED: AI distillation shows significant improvement
```

#### Example 3: A/B Testing Different Configurations

```bash
# Compare AI performance across different settings
pnpm run ai:ab-test cv-versions/your-cv.md --keywords "healthcare,management"
```

**Sample Output:**
```
🏆 Best Configuration:
   Name: GPT-4o Precise
   Model: gpt-4o
   Temperature: 0.1
   Score: 78/100        # Excellent quality
   Orphaned Headers: 0  # Perfect

💡 Recommendations:
   • Use GPT-4o model for 28.5 point improvement over baseline
   • Optimal temperature setting: 0.1 (Score: 78)
   • 3/4 configurations eliminated orphaned headers
```

### Interpreting Quality Results

#### Excellent Results (80-100 points)
```
⭐ Overall Score: 85/100
✅ Excellent - CV meets high quality standards
```
- **Action**: CV is ready for professional use
- **Next steps**: Minor polish if desired

#### Good Results (70-79 points)
```
⭐ Overall Score: 75/100
✨ Good - CV quality is acceptable with minor improvements needed
```
- **Action**: Review recommendations and apply suggested improvements
- **Focus**: Address any remaining orphaned headers or length issues

#### Fair Results (50-69 points)
```
⭐ Overall Score: 60/100
⚠️  Fair - CV needs significant improvements
```
- **Action**: Major revision needed
- **Focus**: Improve readability, fix orphaned headers, reduce length

#### Poor Results (Below 50 points)
```
⭐ Overall Score: 35/100
❌ Poor - CV requires major revisions
```
- **Action**: Complete restructuring recommended
- **Focus**: Use AI distillation to fix fundamental issues

### Advanced AI Usage

#### Custom Keyword Targeting

```bash
# Target specific industry keywords
pnpm run ai:evaluate your-cv.md --keywords "machine learning,tensorflow,python,data science"

# Healthcare-specific evaluation
pnpm run ai:evaluate your-cv.md --keywords "patient care,clinical,medical,healthcare"

# Management-focused assessment
pnpm run ai:evaluate your-cv.md --keywords "leadership,strategy,team management,operations"
```

#### Custom Length Constraints

```bash
# Stricter single-page requirements
pnpm run ai:evaluate your-cv.md --max-lines 40 --max-chars 3000

# More lenient constraints
pnpm run ai:evaluate your-cv.md --max-lines 60 --max-chars 5000
```

#### Batch Quality Assessment

```bash
#!/bin/bash
# Evaluate multiple CVs

for cv in cv-versions/*.md; do
  echo "Evaluating $cv..."
  pnpm run ai:evaluate "$cv" --export "results-$(basename "$cv" .md).json"
done
```

### AI Troubleshooting

#### Common Issues

1. **Low Relevance Score**
   ```bash
   # Check keyword alignment
   pnpm run ai:evaluate your-cv.md --keywords "your,target,keywords"
   ```
   - **Solution**: Include more relevant keywords in your CV content

2. **Orphaned Headers Detected**
   ```
   ⚠️ Orphaned header detected: "## SKILLS"
   ```
   - **Solution**: Add content under headers or remove empty sections

3. **Poor Length Compliance**
   ```
   📏 Length Compliance: 45/100  # Too long for single page
   ```
   - **Solution**: Use AI distillation to condense content
   ```bash
   pnpm run ai:test your-cv.md  # AI will optimize length
   ```

4. **Low Readability Score**
   ```
   📖 Readability Score: 40/100  # Poor sentence structure
   ```
   - **Solution**: Add bullet points, shorter sentences, better formatting

#### Debug Mode

```bash
# Enable verbose debugging
DEBUG=true pnpm run ai:evaluate your-cv.md

# Detailed AI pipeline logging
VERBOSE=true pnpm run ai:test your-cv.md
```

### Environment Configuration

#### OpenAI API Key (Optional)

The system works without an API key using fallback simulation, but you can use real OpenAI for production:

```bash
# Set OpenAI API key for production use
export OPENAI_API_KEY="your-api-key-here"

# Run with real AI processing
pnpm run ai:test your-cv.md
```

#### Quality Thresholds

```bash
# Customize quality thresholds
export AI_QUALITY_THRESHOLD_OVERALL=75
export AI_QUALITY_THRESHOLD_ORPHANED_HEADERS=0

# Run with custom thresholds
pnpm run ai:quality-check
```

## Quality Assurance Testing

Comprehensive testing framework for ensuring AI-generated CVs meet professional standards.

### Quick Testing Commands

```bash
# Essential quality checks
pnpm run ai:quality-check          # Basic quality assessment
pnpm run ai:full-test              # Complete pipeline test
pnpm run ai:benchmark              # Comprehensive benchmarking

# Individual test components
pnpm run ai:evaluate path/to/cv.md # Quality evaluation only
pnpm run ai:test path/to/cv.md      # AI distillation test only
pnpm run ai:ab-test path/to/cv.md   # A/B testing only
```

### Testing Workflow

#### 1. Development Testing

```bash
# Quick check during development
pnpm run ai:evaluate your-cv.md

# If score < 70, run AI optimization
if [ $(jq -r '.metrics.overallScore' quality-check.json) -lt 70 ]; then
  echo "Running AI optimization..."
  pnpm run ai:test your-cv.md
fi
```

#### 2. Pre-commit Testing

```bash
# Comprehensive quality validation before committing
pnpm run ai:full-test

# Check if quality meets standards
if [ $(jq -r '.passed' quality-check.json) = "false" ]; then
  echo "Quality check failed - please review and fix issues"
  exit 1
fi
```

#### 3. Continuous Integration

```bash
# CI/CD pipeline quality gate
pnpm run ai:quality-check
QUALITY_PASSED=$(jq -r '.passed' quality-check.json)
if [ "$QUALITY_PASSED" = "false" ]; then
  echo "CI Quality gate failed"
  exit 1
fi
```

### Understanding Test Results

#### Quality Check Output

```json
{
  "timestamp": "2025-08-02T20:00:00.000Z",
  "metrics": {
    "relevanceScore": 85,
    "informationDensity": 90,
    "readabilityScore": 75,
    "lengthCompliance": 95,
    "orphanedHeaders": 0,
    "overallScore": 82
  },
  "passed": true,
  "recommendations": []
}
```

#### Test Results Interpretation

- **passed: true** → Quality meets standards (≥70 overall score)
- **passed: false** → Quality below standards (need improvements)
- **recommendations** → Specific areas for improvement

### Custom Testing

#### Industry-Specific Testing

```bash
# Healthcare CV testing
pnpm run ai:evaluate healthcare-cv.md \
  --keywords "patient care,clinical,medical,healthcare,EKG" \
  --export healthcare-results.json

# Technology CV testing
pnpm run ai:evaluate tech-cv.md \
  --keywords "software,programming,development,agile,python" \
  --export tech-results.json

# Executive CV testing
pnpm run ai:evaluate executive-cv.md \
  --keywords "leadership,strategy,management,operations,growth" \
  --export executive-results.json
```

#### Batch Testing

```bash
#!/bin/bash
# Test all CVs in a directory

for cv_file in cv-versions/*.md; do
  filename=$(basename "$cv_file" .md)
  echo "Testing $filename..."
  
  pnpm run ai:evaluate "$cv_file" --export "results-$filename.json"
  
  # Check if quality meets standards
  SCORE=$(jq -r '.metrics.overallScore' "results-$filename.json")
  PASSED=$(jq -r '.passed' "results-$filename.json")
  
  echo "$filename: Score $SCORE/100, Passed: $PASSED"
done
```

### Quality Gates

#### Basic Quality Gate

```bash
#!/bin/bash
# quality-gate.sh - Basic quality validation

pnpm run ai:quality-check

SCORE=$(jq -r '.metrics.overallScore' quality-check.json)
ORPHANED=$(jq -r '.metrics.orphanedHeaders' quality-check.json)
PASSED=$(jq -r '.passed' quality-check.json)

echo "Quality Score: $SCORE/100"
echo "Orphaned Headers: $ORPHANED"
echo "Quality Gate: $PASSED"

if [ "$PASSED" = "false" ]; then
  echo "❌ Quality gate failed"
  jq -r '.recommendations[]' quality-check.json
  exit 1
else
  echo "✅ Quality gate passed"
  exit 0
fi
```

#### Advanced Quality Gate

```bash
#!/bin/bash
# advanced-quality-gate.sh - Multi-tier quality validation

# Run comprehensive testing
pnpm run ai:full-test
pnpm run ai:benchmark

# Extract metrics
SCORE=$(jq -r '.metrics.overallScore' quality-check.json)
ORPHANED=$(jq -r '.metrics.orphanedHeaders' quality-check.json)
READABILITY=$(jq -r '.metrics.readabilityScore' quality-check.json)
LENGTH=$(jq -r '.metrics.lengthCompliance' quality-check.json)

# Define quality tiers
if [ $SCORE -ge 85 ] && [ $ORPHANED -eq 0 ]; then
  echo "🏆 EXCELLENT: Ready for professional use"
  exit 0
elif [ $SCORE -ge 70 ] && [ $ORPHANED -eq 0 ]; then
  echo "✅ GOOD: Acceptable quality with minor improvements"
  exit 0
elif [ $SCORE -ge 50 ]; then
  echo "⚠️  FAIR: Significant improvements needed"
  echo "Recommendations:"
  jq -r '.recommendations[]' quality-check.json
  exit 1
else
  echo "❌ POOR: Major revisions required"
  echo "Consider using AI distillation: pnpm run ai:test your-cv.md"
  exit 1
fi
```

### Performance Monitoring

#### Track Quality Over Time

```bash
#!/bin/bash
# quality-tracking.sh - Monitor quality improvements

timestamp=$(date +"%Y%m%d_%H%M%S")
results_dir="quality-history"
mkdir -p "$results_dir"

# Run quality check
pnpm run ai:quality-check
cp quality-check.json "$results_dir/quality-$timestamp.json"

# Generate trend report
echo "Quality Score History:"
for file in "$results_dir"/quality-*.json; do
  timestamp=$(basename "$file" .json | cut -d'-' -f2)
  score=$(jq -r '.metrics.overallScore' "$file")
  echo "$timestamp: $score/100"
done | sort
```

### Integration with Development Workflow

#### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit - Quality check before commits

echo "Running AI quality checks..."

if pnpm run ai:quality-check; then
  echo "✅ Quality checks passed"
  exit 0
else
  echo "❌ Quality checks failed"
  echo "Run 'pnpm run ai:test path/to/cv.md' to fix issues"
  exit 1
fi
```

#### GitHub Actions Integration

See the [CI/CD Integration Guide](docs/ci-cd-integration.md) for complete GitHub Actions, GitLab CI, Jenkins, and Azure DevOps examples.

### Workflow 3: Managing Global CLI Access

```bash
# Link CLI globally (if not done during setup)
pnpm run link-cli

# Use the CLI from anywhere
cv create --name "John Doe" --email "john@example.com"

# Unlink CLI if needed
pnpm run unlink-cli

# Rebuild and test after changes
pnpm run build
cv --help
```

## Advanced Usage

### Using Different Node Environments

```bash
# Using specific Node version with nvm
nvm use 20.10.0
node packages/cli/dist/index.js create --name "Test" --email "test@example.com"

# Using npx for one-off execution
npx --node-options="--max-old-space-size=4096" node packages/cli/dist/index.js create --name "Test" --email "test@example.com"
```

### Development Commands

```bash
# Run tests across all packages
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Type checking
pnpm run typecheck

# Linting
pnpm run lint
pnpm run lint:fix

# Clean build artifacts
pnpm run clean
```

### Package-Specific Development

```bash
# Work on a specific package
cd packages/core
pnpm run build
pnpm test

# Build only specific packages
pnpm --filter @dzb-cv/core run build
pnpm --filter @dzb-cv/pdf run build
```

## Examples

### Example 1: Basic Personal CV

```bash
cv create \
  --name "Sarah Johnson" \
  --email "sarah.johnson@email.com" \
  --output "sarah-johnson-cv.pdf"
```

### Example 2: Professional CV with Corporate Email

```bash
cv create \
  --name "Michael Chen" \
  --email "michael.chen@company.com" \
  --output "michael-chen-professional-cv.pdf"
```

### Example 3: Academic CV

```bash
cv create \
  --name "Dr. Emily Rodriguez" \
  --email "e.rodriguez@university.edu" \
  --output "emily-rodriguez-academic-cv.pdf"
```

### Example 4: Batch Processing (Multiple CVs)

```bash
#!/bin/bash
# Create multiple CVs with different configurations

cv create --name "Alice Smith" --email "alice@company.com" --output "alice-cv.pdf"
cv create --name "Bob Wilson" --email "bob@startup.io" --output "bob-cv.pdf"
cv create --name "Carol Davis" --email "carol@nonprofit.org" --output "carol-cv.pdf"
```

## Integration Examples

### Using in Scripts

```bash
#!/bin/bash
# automated-cv-generation.sh

# Check if DZB-CV is available
if ! command -v cv &> /dev/null; then
    echo "DZB-CV CLI not found. Please install and link it."
    exit 1
fi

# Generate CV
echo "Generating CV..."
cv create \
  --name "$FULL_NAME" \
  --email "$EMAIL_ADDRESS" \
  --output "generated-cv-$(date +%Y%m%d).pdf"

echo "CV generated successfully!"
```

### Integration with CI/CD

```yaml
# .github/workflows/cv-generation.yml
name: Generate CV
on:
  push:
    branches: [main]

jobs:
  generate-cv:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20.10.0'
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm run build
      - run: node packages/cli/dist/index.js create --name "Auto Generated" --email "auto@example.com"
```

## Troubleshooting

### Common Issues and Solutions

#### Issue: "Command not found: cv"

**Solution:**
```bash
# Make sure you've linked the CLI
cd packages/cli && npm link

# Or use the full path
node packages/cli/dist/index.js create --help
```

#### Issue: "Module not found" errors

**Solution:**
```bash
# Rebuild all packages
pnpm run clean
pnpm install
pnpm run build
```

#### Issue: TypeScript compilation errors

**Solution:**
```bash
# Check TypeScript version
pnpm list typescript

# Run type checking
pnpm run typecheck

# Rebuild with verbose output
pnpm run build --verbose
```

#### Issue: PDF generation fails

**Solution:**
```bash
# Check if all dependencies are installed
pnpm install

# Verify PDF package build
cd packages/pdf
pnpm run build
pnpm test
```

#### Issue: Permission denied when linking CLI

**Solution:**
```bash
# Use sudo if necessary (macOS/Linux)
sudo npm link

# Or change npm prefix (recommended)
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### Debug Mode

Enable verbose logging for troubleshooting:

```bash
# Set debug environment
export DEBUG=dzb-cv:*

# Run with debug output
cv create --name "Debug Test" --email "debug@example.com"
```

### Getting Help

1. **Check the documentation**: Review this guide and the README.md
2. **Run help commands**: Use `cv --help` and `cv create --help`
3. **Check the logs**: Look for error messages in the console output
4. **Verify installation**: Ensure all dependencies are installed and packages are built
5. **Create an issue**: If problems persist, create an issue on GitHub with:
   - Your operating system and version
   - Node.js and pnpm versions
   - Complete error message
   - Steps to reproduce the issue

## Next Steps

- **Customize Templates**: Explore the `packages/templates/` directory to customize CV layouts
- **Extend Functionality**: Add new commands to the CLI in `packages/cli/src/commands/`
- **API Integration**: Use the core packages programmatically in your applications
- **Web Interface**: Consider building a web frontend using the existing packages

For more advanced usage and development information, see:
- [Technical Documentation](docs/technical/README.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [API Reference](docs/reference/Reference.md)
