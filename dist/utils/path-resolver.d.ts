/**
 * Resolves a path relative to the project's data directory
 * @param relPath Relative path within the data directory
 * @returns Absolute path to the requested resource
 */
export declare function resolveDataPath(relPath: string): string;
/**
 * Resolves an output path relative to the project's output directory
 * @param relPath Relative path within the output directory
 * @returns Absolute path to the output location
 */
export declare function resolveOutputPath(relPath: string): string;
/**
 * Ensures that all required project directories exist
 */
export declare function ensureProjectDirectories(): Promise<void>;
