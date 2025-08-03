# Fork Setup Guide for Dawn Zurick-Beilfuss

This guide will help Dawn set up her personal fork of the AI-Powered CV Generation System.

## 🍴 Step 1: Fork the Repository

1. **Navigate to the main repository**: https://github.com/TheScottyB/dzb-cv
2. **Click the "Fork" button** in the top-right corner
3. **Choose your GitHub account** as the destination
4. **Create the fork** - this will create `https://github.com/DawnEKG/dzb-cv` (or similar)

## 🛠️ Step 2: Clone Your Fork Locally

```bash
# Clone your fork (replace with your actual GitHub username)
git clone https://github.com/DawnEKG/dzb-cv.git
cd dzb-cv

# Add the original repository as upstream (for future updates)
git remote add upstream https://github.com/TheScottyB/dzb-cv.git

# Verify remotes
git remote -v
```

## 📝 Step 3: Personalize Your Fork

### Update Repository Information

1. **Update the README.md** to reflect that this is Dawn's personal CV system
2. **Modify package.json** files to use your information
3. **Update the base CV data** with your current information

### Key Files to Customize:

```bash
# Update main README
echo "# Dawn's AI-Powered CV System

This is Dawn Zurick-Beilfuss's personal fork of the AI-powered CV generation system.

Based on the original system by Scott Beilfuss: https://github.com/TheScottyB/dzb-cv

## Quick Start for Dawn

\`\`\`bash
# Generate your latest EKG-focused CV
pnpm run generate:ekg-cv

# Update your base information
pnpm run update:profile
\`\`\`

" > README.md
```

## 🔧 Step 4: Set Up Your Environment

```bash
# Install dependencies
pnpm install

# Build the system
pnpm build

# Test everything works
pnpm test
cd packages/ats && npm test
```

## 🎯 Step 5: Configure for Your Use

### Update Base Information
Create or update your personal CV data in `src/data/dawn-base-info.json`:

```json
{
  "personalInfo": {
    "name": {
      "first": "Dawn",
      "last": "Zurick-Beilfuss",
      "full": "Dawn Zurick-Beilfuss"
    },
    "contact": {
      "email": "your-email@example.com",
      "phone": "your-phone",
      "location": "Your Location"
    },
    "professionalTitle": "Certified EKG Technician"
  }
}
```

### Set Up AI Services
1. **Get your own API keys** for:
   - OpenAI (for GPT-4o/GPT-4o-mini)
   - Any other AI services you want to use

2. **Create `.env` file**:
```bash
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_claude_key_here  # Optional
```

## 🚀 Step 6: Generate Your CV

```bash
# Generate your EKG-focused CV
node scripts/generate-cv.js --profile dawn --template healthcare --focus ekg

# Generate for a specific job posting
node scripts/generate-cv.js --profile dawn --job path/to/job-posting.txt

# Generate with custom output location
node scripts/generate-cv.js --profile dawn --focus ekg --output output/my-latest-cv.md

# See all options
node scripts/generate-cv.js --help
```

## 🔄 Step 7: Keep Your Fork Updated

When Scott makes improvements to the original system:

```bash
# Fetch updates from the original repository
git fetch upstream

# Switch to your main branch
git checkout main

# Merge updates from the original
git merge upstream/main

# Push updates to your fork
git push origin main
```

## 📊 Step 8: Quality Assurance

Always test your generated CVs:

```bash
# Check CV quality score (should be 70+)
node scripts/evaluate-cv-quality.js your-generated-cv.md

# Run ATS analysis
node scripts/ats-analysis.js your-generated-cv.md job-posting.txt
```

## 🎨 Step 9: Customize for Your Needs

### Add Your Own Templates
- Create healthcare-specific templates in `packages/templates/`
- Customize colors, fonts, and layouts for your professional brand

### Extend AI Agents
- Modify prompts in `src/agents/` to better match your communication style
- Add healthcare-specific knowledge and terminology

### Create Your Workflows
- Add custom scripts for your most common CV generation needs
- Set up shortcuts for quick updates when you get new certifications

## 🔒 Step 10: Security & Privacy

1. **Never commit API keys** - they should only be in your local `.env` file
2. **Review generated CVs** before sharing to ensure no personal data leaks
3. **Keep your fork private** if it contains sensitive information
4. **Use separate API keys** from the original project

## 🆘 Getting Help

- **Technical Issues**: Create issues in your fork or the original repository
- **Updates from Original**: Pull from upstream regularly
- **New Features**: Consider contributing back to the original repository

## 🎉 Success!

You now have your own personal AI-powered CV generation system! 

### Quick Commands for Daily Use:

```bash
# Update your profile info
pnpm run update:profile

# Generate latest CV
pnpm run generate:latest

# Check quality
pnpm run check:quality

# Deploy new version
pnpm run deploy
```

---

**Next Steps:**
1. Generate your first CV using the system
2. Test the quality evaluation
3. Customize the templates to match your professional brand
4. Set up any automation you need for regular updates

**Remember:** This is your personal system now - customize it to work exactly how you need for your career goals!