import { jest } from '@jest/globals';
import { registerHelpers } from '../utils/helpers.js';
// Register Handlebars helpers before any tests run
registerHelpers();
// Make jest available globally for all tests
global.jest = jest;
console.log('Jest setup complete - Handlebars helpers registered');
// Jest setup file for TypeScript
// This file configures global test settings
// Make Jest globals available explicitly
import { describe, it, test, expect, beforeEach, afterEach } from '@jest/globals';
// Re-export Jest globals to make them available to tests
export { jest, describe, it, test, expect, beforeEach, afterEach };
// Any additional test setup can go here
//# sourceMappingURL=setup.js.map