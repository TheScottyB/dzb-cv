// @ts-check

/** @typedef {import('../src/shared/types/types').ConfigOptions} ConfigOptions */

/**
 * Process configuration options
 * @param {ConfigOptions} options
 * @returns {Promise<void>}
 */
export async function processConfig(options) {
  if (!options.headless) {
    console.log('Running in non-headless mode');
  }
  
  if (options.waitTime) {
    console.log(`Waiting ${options.waitTime}ms before scraping`);
  }
  
  // Process other options...
}

/**
 * Validate configuration
 * @param {ConfigOptions} options
 * @returns {boolean}
 */
export function validateConfig(options) {
  return options.url !== undefined;
} 