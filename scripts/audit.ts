    categoryCounts[category]++;
  });
  
  Object.keys(devDependencies).forEach(dep => {
    const category = categorizeDep(dep);
    categoryCounts[category]++;
  });
  
  // Generate dependency category summary
  output += '### Dependency Categories\n\n';
  output += '| Category | Count |\n';
  output += '|----------|-------|\n';
  
  Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1]) // Sort by count descending
    .forEach(([category, count]) => {
      output += `| ${category} | ${count} |\n`;
    });
  
  output += '\n### Potentially Duplicate Libraries\n\n';
  
  // Find potentially duplicate libraries (e.g., multiple PDF libraries)
  const pdfLibraries = [...Object.keys(dependencies), ...Object.keys(devDependencies)]
    .filter(dep => dep.includes('pdf') || dep.includes('puppeteer'));
  
  if (pdfLibraries.length > 1) {
    output += '#### PDF Generation/Processing\n\n';
    output += '| Library | Type |\n';
    output += '|---------|------|\n';
    
    pdfLibraries.forEach(lib => {
      const type = dependencies[lib] ? 'dependency' : 'devDependency';
      output += `| ${lib} | ${type} |\n`;
    });
    output += '\n';
  }
  
  const markdownLibraries = [...Object.keys(dependencies), ...Object.keys(devDependencies)]
    .filter(dep => dep.includes('markdown') || dep.includes('marked') || dep.includes('remark'));
  
  if (markdownLibraries.length > 1) {
    output += '#### Markdown Processing\n\n';
    output += '| Library | Type |\n';
    output += '|---------|------|\n';
    
    markdownLibraries.forEach(lib => {
      const type = dependencies[lib] ? 'dependency' : 'devDependency';
      output += `| ${lib} | ${type} |\n`;
    });
    output += '\n';
  }
  
  // Check for outdated dependencies
  output += '### Outdated Dependencies\n\n';
  output += '> Note: This is a list of dependencies that might have newer versions available.\n\n';
  
  try {
    const outdatedOutput = runCommand('pnpm outdated --format json');
    
    if (outdatedOutput && outdatedOutput.trim() !== '') {
      try {
        const outdatedDeps = JSON.parse(outdatedOutput);
        
        if (Object.keys(outdatedDeps).length > 0) {
          output += '| Package | Current | Latest | Type |\n';
          output += '|---------|---------|--------|------|\n';
          
          Object.entries(outdatedDeps).forEach(([pkg, info]: [string, any]) => {
            const current = info.current || 'unknown';
            const latest = info.latest || 'unknown';
            const type = info.type || 'unknown';
            
            output += `| ${pkg} | ${current} | ${latest} | ${type} |\n`;
          });
        } else {
          output += '> No outdated dependencies found.\n';
        }
      } catch (error) {
        output += '> Error parsing outdated dependencies output.\n';
      }
    } else {
      output += '> Could not check for outdated dependencies.\n';
    }
  } catch (error) {
    output += '> Error checking for outdated dependencies.\n';
  }
  
  return output;
}
