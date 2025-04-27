import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';

function runCommand(command: string): string {
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    console.error(`Error running command: ${command}`, error);
    return '';
  }
}

function categorizeDep(dep: string): string {
  if (dep.includes('test') || dep.includes('vitest') || dep.includes('jest')) {
    return 'Testing';
  } else if (dep.includes('type') || dep.includes('typescript') || dep.includes('ts-')) {
    return 'TypeScript';
  } else if (dep.includes('lint') || dep.includes('prettier')) {
    return 'Linting/Formatting';
  } else if (dep.includes('pdf') || dep.includes('puppeteer')) {
    return 'PDF Generation';
  } else if (dep.includes('markdown') || dep.includes('marked')) {
    return 'Markdown Processing';
  } else if (dep.includes('build') || dep.includes('webpack') || dep.includes('vite')) {
    return 'Build Tools';
  } else {
    return 'Other';
  }
}

export function auditDependencies(): string {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  const { dependencies = {}, devDependencies = {} } = packageJson;

  let output = '# Dependency Audit Report\n\n';

  // Count dependencies by category
  const categoryCounts: Record<string, number> = {
    Testing: 0,
    TypeScript: 0,
    'Linting/Formatting': 0,
    'PDF Generation': 0,
    'Markdown Processing': 0,
    'Build Tools': 0,
    Other: 0,
  };

  Object.keys(dependencies).forEach((dep) => {
    const category = categorizeDep(dep);
    categoryCounts[category]++;
  });

  Object.keys(devDependencies).forEach((dep) => {
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
  const pdfLibraries = [...Object.keys(dependencies), ...Object.keys(devDependencies)].filter(
    (dep) => dep.includes('pdf') || dep.includes('puppeteer'),
  );

  if (pdfLibraries.length > 1) {
    output += '#### PDF Generation/Processing\n\n';
    output += '| Library | Type |\n';
    output += '|---------|------|\n';

    pdfLibraries.forEach((lib) => {
      const type = dependencies[lib] ? 'dependency' : 'devDependency';
      output += `| ${lib} | ${type} |\n`;
    });
    output += '\n';
  }

  const markdownLibraries = [...Object.keys(dependencies), ...Object.keys(devDependencies)].filter(
    (dep) => dep.includes('markdown') || dep.includes('marked') || dep.includes('remark'),
  );

  if (markdownLibraries.length > 1) {
    output += '#### Markdown Processing\n\n';
    output += '| Library | Type |\n';
    output += '|---------|------|\n';

    markdownLibraries.forEach((lib) => {
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
