# CI/CD Integration for AI Quality Assurance

## Overview

This document provides comprehensive guidance for integrating the AI CV quality assurance system into your CI/CD pipeline. The system includes automated quality evaluation, AI distillation testing, and A/B testing frameworks.

## Quick Start

### Using npm Scripts (Recommended)

```bash
# Quick quality check
pnpm run ai:quality-check

# Full AI testing pipeline
pnpm run ai:full-test

# Comprehensive benchmarking
pnpm run ai:benchmark
```

### Direct Script Usage

```bash
# Evaluate CV quality
node scripts/evaluate-cv-quality.js path/to/cv.md --export results.json

# Test AI distillation
node scripts/test-ai-distillation.js path/to/cv.md

# Run A/B tests
node scripts/simple-ab-test.js path/to/cv.md --export ab-results.json
```

## GitHub Actions Integration

### Basic Quality Check Workflow

Create `.github/workflows/ai-quality-check.yml`:

```yaml
name: AI Quality Assurance

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  ai-quality-check:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'pnpm'
        
    - name: Setup pnpm
      uses: pnpm/action-setup@v3
      with:
        version: '10'
        
    - name: Install dependencies
      run: pnpm install
      
    - name: Build project
      run: pnpm run build
      
    - name: Run AI Quality Check
      run: pnpm run ai:quality-check
      
    - name: Check quality threshold
      run: |
        PASSED=$(jq -r '.passed' quality-check.json)
        SCORE=$(jq -r '.metrics.overallScore' quality-check.json)
        
        echo "Quality Score: $SCORE/100"
        echo "Quality Check Passed: $PASSED"
        
        if [ "$PASSED" = "false" ]; then
          echo "❌ Quality check failed - Score below threshold"
          exit 1
        else
          echo "✅ Quality check passed"
        fi
        
    - name: Upload quality results
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: ai-quality-results
        path: quality-check.json
```

### Comprehensive AI Testing Workflow

Create `.github/workflows/ai-comprehensive-test.yml`:

```yaml
name: Comprehensive AI Testing

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:

jobs:
  comprehensive-ai-test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        test-type: [quality-evaluation, distillation-test, ab-testing]
        
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'pnpm'
        
    - name: Setup pnpm
      uses: pnpm/action-setup@v3
      with:
        version: '10'
        
    - name: Install dependencies
      run: pnpm install
      
    - name: Build project
      run: pnpm run build
      
    - name: Run Quality Evaluation
      if: matrix.test-type == 'quality-evaluation'
      run: |
        pnpm run ai:evaluate cv-versions/dawn-ekg-technician-cv.md \
          --keywords "healthcare,EKG,technician,patient care" \
          --export quality-evaluation-results.json
          
    - name: Run AI Distillation Test
      if: matrix.test-type == 'distillation-test'
      run: |
        pnpm run ai:test cv-versions/dawn-ekg-technician-cv.md
        
    - name: Run A/B Testing
      if: matrix.test-type == 'ab-testing'
      run: |
        pnpm run ai:ab-test cv-versions/dawn-ekg-technician-cv.md \
          --keywords "healthcare,EKG,technician,patient care" \
          --export ab-testing-results.json
          
    - name: Upload test results
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: ${{ matrix.test-type }}-results
        path: |
          *.json
          scripts/test-optimized-cv.md
          scripts/ai-distillation-test-results.json
```

### Pull Request Quality Gate

Create `.github/workflows/pr-quality-gate.yml`:

```yaml
name: PR Quality Gate

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  quality-gate:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js and pnpm
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'pnpm'
        
    - name: Setup pnpm
      uses: pnpm/action-setup@v3
      with:
        version: '10'
        
    - name: Install dependencies
      run: pnpm install
      
    - name: Build project
      run: pnpm run build
      
    - name: Run full AI test suite
      run: pnpm run ai:full-test
      
    - name: Generate quality report
      run: |
        echo "## 🤖 AI Quality Assurance Report" >> pr-comment.md
        echo "" >> pr-comment.md
        
        # Extract metrics from quality-check.json
        OVERALL_SCORE=$(jq -r '.metrics.overallScore' quality-check.json)
        ORPHANED_HEADERS=$(jq -r '.metrics.orphanedHeaders' quality-check.json)
        PASSED=$(jq -r '.passed' quality-check.json)
        
        echo "### Quality Metrics" >> pr-comment.md
        echo "- **Overall Score:** $OVERALL_SCORE/100" >> pr-comment.md
        echo "- **Orphaned Headers:** $ORPHANED_HEADERS" >> pr-comment.md
        echo "- **Quality Check:** $([ "$PASSED" = "true" ] && echo "✅ Passed" || echo "❌ Failed")" >> pr-comment.md
        echo "" >> pr-comment.md
        
        # Add recommendations if any
        if [ -f quality-check.json ]; then
          echo "### Recommendations" >> pr-comment.md
          jq -r '.recommendations[]' quality-check.json | sed 's/^/- /' >> pr-comment.md
        fi
        
    - name: Comment PR
      uses: actions/github-script@v7
      with:
        script: |
          const fs = require('fs');
          const comment = fs.readFileSync('pr-comment.md', 'utf8');
          
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: comment
          });
          
    - name: Check quality gate
      run: |
        PASSED=$(jq -r '.passed' quality-check.json)
        if [ "$PASSED" = "false" ]; then
          echo "❌ Quality gate failed"
          exit 1
        fi
```

## GitLab CI Integration

Create `.gitlab-ci.yml`:

```yaml
stages:
  - build
  - test
  - quality-check

variables:
  NODE_VERSION: "20"
  PNPM_VERSION: "10"

before_script:
  - npm install -g pnpm@$PNPM_VERSION
  - pnpm install
  - pnpm run build

build:
  stage: build
  script:
    - pnpm run build
  artifacts:
    paths:
      - packages/*/dist/
    expire_in: 1 hour

test:
  stage: test
  script:
    - pnpm test
    - pnpm run test:coverage
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'

ai-quality-check:
  stage: quality-check
  script:
    - pnpm run ai:quality-check
    - |
      PASSED=$(jq -r '.passed' quality-check.json)
      SCORE=$(jq -r '.metrics.overallScore' quality-check.json)
      
      echo "AI Quality Score: $SCORE/100"
      echo "Quality Check: $PASSED"
      
      if [ "$PASSED" = "false" ]; then
        echo "Quality check failed"
        exit 1
      fi
  artifacts:
    reports:
      junit: quality-check.json
    paths:
      - quality-check.json
    expire_in: 1 week

ai-comprehensive-test:
  stage: quality-check
  rules:
    - if: $CI_PIPELINE_SOURCE == "schedule"
    - if: $CI_COMMIT_BRANCH == "main"
  script:
    - pnpm run ai:full-test
    - pnpm run ai:benchmark
  artifacts:
    paths:
      - "*.json"
      - "scripts/test-optimized-cv.md"
    expire_in: 1 week
```

## Jenkins Pipeline

Create `Jenkinsfile`:

```groovy
pipeline {
    agent any
    
    tools {
        nodejs '20'
    }
    
    environment {
        PNPM_VERSION = '10'
    }
    
    stages {
        stage('Setup') {
            steps {
                sh 'npm install -g pnpm@${PNPM_VERSION}'
                sh 'pnpm install'
                sh 'pnpm run build'
            }
        }
        
        stage('Traditional Tests') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        sh 'pnpm test'
                    }
                }
                
                stage('Type Check') {
                    steps {
                        sh 'pnpm run typecheck'
                    }
                }
                
                stage('Lint') {
                    steps {
                        sh 'pnpm run lint'
                    }
                }
            }
        }
        
        stage('AI Quality Assurance') {
            parallel {
                stage('Quality Evaluation') {
                    steps {
                        sh 'pnpm run ai:quality-check'
                        script {
                            def qualityResults = readJSON file: 'quality-check.json'
                            def score = qualityResults.metrics.overallScore
                            def passed = qualityResults.passed
                            
                            echo "AI Quality Score: ${score}/100"
                            echo "Quality Check Passed: ${passed}"
                            
                            if (!passed) {
                                error("Quality check failed with score: ${score}/100")
                            }
                        }
                    }
                }
                
                stage('AI Distillation Test') {
                    steps {
                        sh 'pnpm run ai:test cv-versions/dawn-ekg-technician-cv.md'
                    }
                }
            }
        }
        
        stage('Comprehensive Testing') {
            when {
                anyOf {
                    branch 'main'
                    triggeredBy 'TimerTrigger'
                }
            }
            steps {
                sh 'pnpm run ai:benchmark'
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: '*.json, scripts/test-optimized-cv.md', fingerprint: true
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: '.',
                reportFiles: 'quality-check.json',
                reportName: 'AI Quality Report'
            ])
        }
        
        failure {
            emailext (
                subject: "AI Quality Check Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "The AI quality check failed. Please review the quality metrics and fix any issues.",
                to: "${env.CHANGE_AUTHOR_EMAIL}, dev-team@company.com"
            )
        }
    }
}
```

## Azure DevOps Pipeline

Create `azure-pipelines.yml`:

```yaml
trigger:
  branches:
    include:
    - main
    - develop

pr:
  branches:
    include:
    - main

pool:
  vmImage: 'ubuntu-latest'

variables:
  nodeVersion: '20'
  pnpmVersion: '10'

stages:
- stage: Build
  displayName: 'Build Stage'
  jobs:
  - job: Build
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: $(nodeVersion)
      displayName: 'Install Node.js'
      
    - script: |
        npm install -g pnpm@$(pnpmVersion)
        pnpm install
        pnpm run build
      displayName: 'Install dependencies and build'

- stage: Test
  displayName: 'Test Stage'
  dependsOn: Build
  jobs:
  - job: TraditionalTests
    displayName: 'Traditional Tests'
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: $(nodeVersion)
        
    - script: |
        npm install -g pnpm@$(pnpmVersion)
        pnpm install
        pnpm run build
      displayName: 'Setup'
      
    - script: pnpm test
      displayName: 'Run unit tests'
      
    - script: pnpm run typecheck
      displayName: 'Type checking'

  - job: AIQualityAssurance
    displayName: 'AI Quality Assurance'
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: $(nodeVersion)
        
    - script: |
        npm install -g pnpm@$(pnpmVersion)
        pnpm install
        pnpm run build
      displayName: 'Setup'
      
    - script: pnpm run ai:quality-check
      displayName: 'AI Quality Check'
      
    - script: |
        PASSED=$(jq -r '.passed' quality-check.json)
        SCORE=$(jq -r '.metrics.overallScore' quality-check.json)
        
        echo "##vso[task.setVariable variable=qualityScore]$SCORE"
        echo "##vso[task.setVariable variable=qualityPassed]$PASSED"
        
        if [ "$PASSED" = "false" ]; then
          echo "##vso[task.logissue type=error]Quality check failed with score: $SCORE/100"
          exit 1
        fi
      displayName: 'Evaluate quality results'
      
    - task: PublishTestResults@2
      inputs:
        testResultsFormat: 'JUnit'
        testResultsFiles: 'quality-check.json'
      displayName: 'Publish quality results'
      
    - task: PublishBuildArtifacts@1
      inputs:
        pathToPublish: 'quality-check.json'
        artifactName: 'ai-quality-results'
      displayName: 'Archive quality results'
```

## Quality Thresholds Configuration

### Environment-Based Thresholds

```bash
# Development environment (more lenient)
export AI_QUALITY_THRESHOLD_OVERALL=60
export AI_QUALITY_THRESHOLD_RELEVANCE=50
export AI_QUALITY_THRESHOLD_READABILITY=50
export AI_QUALITY_THRESHOLD_LENGTH=70
export AI_QUALITY_THRESHOLD_ORPHANED_HEADERS=0

# Staging environment (stricter)
export AI_QUALITY_THRESHOLD_OVERALL=70
export AI_QUALITY_THRESHOLD_RELEVANCE=60
export AI_QUALITY_THRESHOLD_READABILITY=60
export AI_QUALITY_THRESHOLD_LENGTH=80
export AI_QUALITY_THRESHOLD_ORPHANED_HEADERS=0

# Production environment (strictest)
export AI_QUALITY_THRESHOLD_OVERALL=75
export AI_QUALITY_THRESHOLD_RELEVANCE=70
export AI_QUALITY_THRESHOLD_READABILITY=70
export AI_QUALITY_THRESHOLD_LENGTH=85
export AI_QUALITY_THRESHOLD_ORPHANED_HEADERS=0
```

### Custom Threshold Script

Create `scripts/check-quality-thresholds.js`:

```javascript
#!/usr/bin/env node

import fs from 'fs';

const args = process.argv.slice(2);
const resultsFile = args[0] || 'quality-check.json';

// Load environment-specific thresholds
const thresholds = {
  overallScore: parseInt(process.env.AI_QUALITY_THRESHOLD_OVERALL) || 70,
  relevanceScore: parseInt(process.env.AI_QUALITY_THRESHOLD_RELEVANCE) || 60,
  readabilityScore: parseInt(process.env.AI_QUALITY_THRESHOLD_READABILITY) || 60,
  lengthCompliance: parseInt(process.env.AI_QUALITY_THRESHOLD_LENGTH) || 80,
  orphanedHeaders: parseInt(process.env.AI_QUALITY_THRESHOLD_ORPHANED_HEADERS) || 0
};

try {
  const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
  const metrics = results.metrics;
  
  let passed = true;
  const failures = [];
  
  // Check each threshold
  Object.keys(thresholds).forEach(key => {
    const threshold = thresholds[key];
    const actual = metrics[key];
    
    if (key === 'orphanedHeaders') {
      if (actual > threshold) {
        passed = false;
        failures.push(`${key}: ${actual} (threshold: ≤${threshold})`);
      }
    } else {
      if (actual < threshold) {
        passed = false;
        failures.push(`${key}: ${actual} (threshold: ≥${threshold})`);
      }
    }
  });
  
  console.log(`Quality Assessment: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (!passed) {
    console.log('\nFailures:');
    failures.forEach(failure => console.log(`  - ${failure}`));
  }
  
  process.exit(passed ? 0 : 1);
  
} catch (error) {
  console.error('Error reading quality results:', error.message);
  process.exit(1);
}
```

## Monitoring and Alerting

### Slack Notifications

```bash
# Add to your CI pipeline
curl -X POST -H 'Content-type: application/json' \
  --data "{
    \"text\": \"AI Quality Check Results\",
    \"attachments\": [{
      \"color\": \"$([ "$PASSED" = "true" ] && echo "good" || echo "danger")\",
      \"fields\": [
        {\"title\": \"Score\", \"value\": \"$SCORE/100\", \"short\": true},
        {\"title\": \"Status\", \"value\": \"$([ "$PASSED" = "true" ] && echo "✅ Passed" || echo "❌ Failed")\", \"short\": true},
        {\"title\": \"Branch\", \"value\": \"$CI_BRANCH\", \"short\": true},
        {\"title\": \"Commit\", \"value\": \"$CI_COMMIT_SHA\", \"short\": true}
      ]
    }]
  }" \
  $SLACK_WEBHOOK_URL
```

### Email Notifications

```bash
# Quality check failed notification
if [ "$PASSED" = "false" ]; then
  echo "AI Quality Check Failed" | mail -s "Quality Alert: Score $SCORE/100" \
    -a "Content-Type: text/html" \
    dev-team@company.com < quality-report.html
fi
```

## Troubleshooting

### Common CI/CD Issues

1. **Script Permissions**
   ```bash
   chmod +x scripts/*.js
   ```

2. **Node.js Version Compatibility**
   ```yaml
   - uses: actions/setup-node@v4
     with:
       node-version: '20'  # Ensure Node 20+
   ```

3. **pnpm Cache Issues**
   ```bash
   pnpm store prune
   pnpm install --frozen-lockfile
   ```

4. **Memory Issues**
   ```yaml
   env:
     NODE_OPTIONS: --max-old-space-size=4096
   ```

### Quality Check Debugging

```bash
# Enable debug mode
DEBUG=true pnpm run ai:quality-check

# Verbose output
VERBOSE=true pnpm run ai:full-test

# Save intermediate results
pnpm run ai:evaluate path/to/cv.md --export debug-results.json
cat debug-results.json | jq '.'
```

## Performance Optimization

### Parallel Execution

```yaml
# GitHub Actions - parallel AI tests
strategy:
  matrix:
    test: [quality, distillation, ab-testing]
parallel:
  4  # Run up to 4 jobs in parallel
```

### Caching

```yaml
# Cache AI test results
- uses: actions/cache@v4
  with:
    path: |
      quality-check.json
      benchmark-results.json
    key: ai-quality-${{ hashFiles('cv-versions/**', 'scripts/**') }}
```

### Conditional Execution

```yaml
# Only run comprehensive tests on main branch
- name: Comprehensive AI Testing
  if: github.ref == 'refs/heads/main'
  run: pnpm run ai:benchmark
```

---

**Next Steps:**
1. Choose the CI/CD platform that matches your infrastructure
2. Customize quality thresholds based on your requirements
3. Set up monitoring and alerting
4. Test the pipeline with sample CVs
5. Gradually roll out to your entire CV generation workflow

For questions or support, refer to the [AI Distillation System Documentation](ai-distillation-improvements.md).
