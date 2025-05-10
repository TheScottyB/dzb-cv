import fs from 'fs';
import path from 'path';

/**
 * Global teardown that runs after all tests
 * to clean up test artifacts and reset state
 */
async function globalTeardown() {
  console.log('Running global teardown...');

  // Clean up downloaded PDF files
  const testResultsDir = path.join(__dirname, '../test-results');
  cleanDirectory(testResultsDir);

  // Other cleanup tasks can be added here
  // For example:
  // - Reset any test databases
  // - Clear test storage
  // - Reset environment variables

  console.log('Global teardown complete!');
}

/**
 * Utility to clean a directory without deleting the directory itself
 */
function cleanDirectory(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Directory does not exist: ${dirPath}`);
    return;
  }

  try {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        cleanDirectory(filePath);
        fs.rmdirSync(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    }

    console.log(`Cleaned directory: ${dirPath}`);
  } catch (error) {
    console.error(`Error cleaning directory ${dirPath}:`, error);
  }
}

export default globalTeardown;
