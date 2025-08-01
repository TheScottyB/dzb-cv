---
path: docs/user-guide/troubleshooting.md
type: user
category: guide
maintainer: system
last_updated: 2024-03-27
related_files:
  - docs/user-guide/getting-started.md
  - docs/user-guide/advanced-usage.md
---

# Troubleshooting Guide

## Common Issues

### Installation Issues

1. **Command Not Found**
   - **Issue**: `cv` command is not recognized
   - **Solution**: Link the CLI globally using automated script:
     ```bash
     pnpm run link-cli
     ```
   - **Alternative**: Use full path:
     ```bash
     node packages/cli/dist/index.js
     ```
   - **Or**: Use npm script shortcut:
     ```bash
     pnpm run cv --help
     ```

2. **Dependencies Error**
   - **Issue**: Error during `pnpm install`
   - **Automated Solution**: Use the setup script:
     ```bash
     ./setup-dzb-cv.sh
     ```
   - **Manual Solution**: Clear cache and retry:
     ```bash
     pnpm store prune
     pnpm install
     pnpm run build
     ```

### Generation Issues

1. **Template Errors**
   - **Issue**: CV generation fails with template error
   - **Solution**: Check Handlebars syntax in template files
   - **Common Problems**:
     - Missing closing tags
     - Invalid variable names
     - Incorrect helper usage

2. **Missing Information**
   - **Issue**: Generation fails due to missing data
   - **Solution**: Ensure all required fields exist in `base-info.json`
   - **Validation**: Check CLI functionality:
     ```bash
     pnpm run cv --help
     ```

3. **PDF Generation**
   - **Issue**: PDF generation fails
   - **Solution**: 
     1. Rebuild the project:
        ```bash
        pnpm build
        ```
     2. Check PDF dependencies:
        ```bash
        pnpm install @pdf-lib/fontkit
        ```

### Profile Management

1. **Import Failures**
   - **Issue**: Profile import fails
   - **Solutions**:
     - Check file format (must be .md or .json)
     - Validate file content
     - Ensure correct file permissions

2. **Export Issues**
   - **Issue**: Export fails or creates empty files
   - **Solutions**:
     - Check output directory permissions
     - Verify profile exists
     - Try different export format

## Error Messages

### Common Error Messages

1. **"Invalid template format"**
   - **Cause**: Template syntax error
   - **Check**: 
     - Template file syntax
     - Variable names
     - Helper functions

2. **"Profile validation failed"**
   - **Cause**: Missing or invalid data
   - **Check**:
     - Required fields
     - Data format
     - Field types

3. **"Unable to analyze job posting"**
   - **Cause**: Job URL access issues
   - **Check**:
     - URL validity
     - Internet connection
     - Site accessibility

## Debugging

### Debug Mode
Enable verbose output for more information:
```bash
# If CLI is globally linked
cv create --name "Debug Test" --email "debug@example.com"

# Or use direct path
node packages/cli/dist/index.js create --name "Debug Test" --email "debug@example.com"

# Enable debug logging
DEBUG=dzb-cv:* cv create --name "Debug Test" --email "debug@example.com"
```

### Log Files
Check log files in:
- `logs/error.log` - Error messages
- `logs/debug.log` - Debug information
- `logs/access.log` - Command execution history

### Configuration
Verify configuration files:
1. `.env` - Environment variables
2. `config.json` - Application settings
3. `templates/config.json` - Template settings

## Getting Help

### Support Resources
1. Check the [documentation](../README.md)
2. Search [known issues](../../CONTRIBUTING.md)
3. Contact support team

### Reporting Issues
When reporting issues, include:
1. Command used
2. Error message
3. Log files
4. System information 