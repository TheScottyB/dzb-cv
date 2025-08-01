# Release Notes - DZB CV v1.1.0

## 🚀 Single-Page PDF Generation Feature

**Released:** August 1, 2025  
**Version:** 1.1.0

### 🎯 Overview

We're excited to introduce **single-page PDF generation** - a powerful new feature that enables you to create compact, optimized CVs perfect for today's fast-paced recruitment environment.

### ✨ What's New

#### 📄 Single-Page PDF Generation

**New CLI Flag:** `--single-page`

Generate professional CVs that fit perfectly on a single page with intelligent content optimization:

```bash
# Generate single-page federal CV
dzb-cv generate --single-page federal --format pdf --output ./output

# Generate single-page private sector CV  
dzb-cv generate --single-page private --format pdf --output ./output

# Generate single-page state CV
dzb-cv generate --single-page state --format pdf --output ./output
```

#### 🎨 Smart Layout Optimization

- **Optimized Font Sizing**: Intelligent font scaling for maximum readability
- **Dense Spacing**: Reduced margins and line spacing for content maximization  
- **Content Prioritization**: Automatically highlights most relevant information
- **Professional Formatting**: Maintains visual appeal despite compact layout

#### 📊 When to Use Single-Page Format

**Perfect for:**
- 👶 Entry-level positions (0-5 years experience)
- 🔄 Career changers
- ⚡ Quick screening processes
- 🎯 Roles requiring concise presentation
- 📱 Digital-first applications

**Stick with two-page for:**
- 🏛️ Federal government positions
- 🎓 Academic or research roles  
- 👨‍💼 Senior executive positions
- 📚 Comprehensive experience showcase

### 🔧 Technical Enhancements

#### Enhanced PDF Generators
- **pdf-lib Generator**: New single-page layout algorithms
- **Puppeteer Generator**: Optimized viewport and rendering for compact format
- **Intelligent Content Fitting**: Automatic text scaling and layout adjustment

#### Comprehensive Testing
- **382 new test cases** ensuring reliability
- **Cross-browser compatibility** testing
- **Content optimization validation**
- **Error handling and fallback mechanisms**

#### Type Safety Improvements
- New TypeScript interfaces for single-page options
- Enhanced PDF configuration types
- Improved type checking for layout parameters

### 📖 Updated Documentation

- **Usage Guidelines**: When to choose single-page vs two-page format
- **CLI Reference**: Complete `--single-page` flag documentation  
- **Best Practices**: Sector-specific recommendations
- **Examples**: Real-world usage scenarios

### 🔗 Package Updates

- **@dzb-cv/pdf** (1.0.0 → 1.1.0): New single-page generation capabilities
- **@dzb-cv/core** (1.0.0 → 1.1.0): Enhanced PDF service integration
- **@dzb-cv/cli** (1.0.0 → 1.1.0): New `--single-page` command support
- **@dzb-cv/types** (1.0.0 → 1.0.1): Additional PDF configuration types

### 🚀 Getting Started

#### Upgrade Instructions

```bash
# Pull latest changes
git pull origin main

# Install dependencies and rebuild
pnpm install
pnpm run build

# Test the new feature
dzb-cv generate --single-page private --format pdf --output ./test
```

#### First Time Users

```bash
# Clone and setup
git clone https://github.com/TheScottyB/dzb-cv.git
cd dzb-cv
./setup-dzb-cv.sh

# Generate your first single-page CV
cv create --name "Your Name" --email "your@email.com"
dzb-cv generate --single-page private --format pdf --output ./output
```

### 🐛 Bug Fixes & Improvements

- Enhanced error handling for PDF generation failures
- Improved memory usage during large document processing
- Better cross-platform compatibility for PDF rendering
- Resolved edge cases in content optimization algorithms

### 🔮 Coming Next

- Web-based CV editor interface
- Additional templates and themes
- HTML and Markdown export formats
- Advanced customization options

### 💬 Feedback & Support

We'd love to hear how the single-page feature works for you! 

- 🐛 **Report Issues**: [GitHub Issues](https://github.com/TheScottyB/dzb-cv/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/TheScottyB/dzb-cv/discussions)
- 📧 **Contact**: Open an issue for support

---

**Happy CV building!** 🎉

*The DZB CV Team*
