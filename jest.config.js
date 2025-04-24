/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js", "json", "node"],
  transform: {
    "^.+\\.ts$": ["ts-jest", {
      useESM: true
    }]
  },
  testMatch: ["**/__tests__/**/*.test.ts"],
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    // More specific module mappings
    "^@/(.*)$": "<rootDir>/src/$1",
    // Handle .js extensions in import paths for ESM
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  rootDir: ".",
  modulePaths: ["<rootDir>"],
  // Add setup files for jest globals
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"]
};
