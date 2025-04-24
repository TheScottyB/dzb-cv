/**
 * Asset types supported by the system
 */
export declare enum AssetType {
    DOCUMENT = "document",
    IMAGE = "image",
    VIDEO = "video",
    OTHER = "other"
}
/**
 * Asset format (file extension)
 */
export declare enum AssetFormat {
    PDF = "pdf",
    DOCX = "docx",
    MD = "md",
    JPEG = "jpeg",
    JPG = "jpg",
    PNG = "png",
    MP4 = "mp4",
    AVI = "avi",
    OTHER = "other"
}
/**
 * Metadata for a single asset file
 */
export interface AssetMetadata {
    id: string;
    name: string;
    path: string;
    type: AssetType;
    format: AssetFormat;
    sizeInBytes: number;
    lastModified: Date;
    createdAt: Date;
    dimensions?: {
        width: number;
        height: number;
    };
    duration?: number;
    description?: string;
    tags?: string[];
}
/**
 * Complete asset catalog containing all asset metadata
 */
export interface AssetCatalog {
    lastUpdated: Date;
    totalAssets: number;
    assets: AssetMetadata[];
    assetsByType: {
        [key in AssetType]: AssetMetadata[];
    };
}
/**
 * Determines the asset type based on file extension
 *
 * @param extension File extension (without the dot)
 * @returns Asset type enum value
 */
export declare function getAssetTypeFromExtension(extension: string): AssetType;
/**
 * Determines the asset format based on file extension
 *
 * @param extension File extension (without the dot)
 * @returns Asset format enum value
 */
export declare function getAssetFormatFromExtension(extension: string): AssetFormat;
/**
 * Validates that the basic asset directory structure exists
 *
 * @returns Object with validation status and any missing directories
 */
export declare function validateAssetStructure(): Promise<{
    valid: boolean;
    missingDirs: string[];
    message: string;
}>;
/**
 * Creates any missing directories in the asset structure
 *
 * @returns Object with operation status
 */
export declare function ensureAssetStructure(): Promise<{
    success: boolean;
    createdDirs: string[];
    message: string;
}>;
/**
 * Creates a metadata object for a single asset file
 *
 * @param filePath Path to the asset file
 * @returns Asset metadata
 */
export declare function createAssetMetadata(filePath: string): Promise<AssetMetadata>;
/**
 * Gets image dimensions using ImageMagick
 *
 * @param imagePath Path to the image file
 * @returns Image dimensions or null if they could not be determined
 */
export declare function getImageDimensions(imagePath: string): Promise<{
    width: number;
    height: number;
} | null>;
/**
 * Creates a complete catalog of all assets
 *
 * @returns Asset catalog with all metadata
 */
export declare function createAssetCatalog(): Promise<AssetCatalog>;
/**
 * Saves the asset catalog to a JSON file
 *
 * @param catalog Asset catalog to save
 * @param outputPath Path to save the catalog to, defaults to assets/asset-catalog.json
 * @returns Path to the saved catalog file
 */
export declare function saveAssetCatalog(catalog: AssetCatalog, outputPath?: string): Promise<string>;
/**
 * Loads an asset catalog from a JSON file
 *
 * @param catalogPath Path to the catalog file, defaults to assets/asset-catalog.json
 * @returns Loaded asset catalog
 */
export declare function loadAssetCatalog(catalogPath?: string): Promise<AssetCatalog>;
/**
 * Resizes an image using ImageMagick
 *
 * @param inputPath Path to the input image
 * @param outputPath Path to save the resized image
 * @param width Desired width
 * @param height Desired height (optional, will maintain aspect ratio if not provided)
 * @returns Path to the resized image
 */
export declare function resizeImage(inputPath: string, outputPath: string, width: number, height?: number): Promise<string>;
/**
 * Converts an image to a different format using ImageMagick
 *
 * @param inputPath Path to the input image
 * @param outputPath Path to save the converted image (extension determines format)
 * @param quality Optional quality parameter (1-100, for JPEG/PNG)
 * @returns Path to the converted image
 */
export declare function convertImageFormat(inputPath: string, outputPath: string, quality?: number): Promise<string>;
/**
 * Optimizes an image for web use (reduces size while maintaining quality)
 *
 * @param inputPath Path to the input image
 * @param outputPath Path to save the optimized image
 * @param quality Quality setting (1-100)
 * @returns Path to the optimized image and size reduction percentage
 */
export declare function optimizeImage(inputPath: string, outputPath: string, quality?: number): Promise<{
    path: string;
    reductionPercentage: number;
}>;
/**
 * Applies a watermark to an image
 *
 * @param inputPath Path to the input image
 * @param watermarkText Text to use as watermark
 * @param outputPath Path to save the watermarked image
 * @param options Watermark options (position, transparency, etc.)
 * @returns Path to the watermarked image
 */
export declare function addWatermark(inputPath: string, watermarkText: string, outputPath: string, options?: {
    position?: 'center' | 'northwest' | 'northeast' | 'southwest' | 'southeast';
    fontSize?: number;
    transparency?: number;
    color?: string;
}): Promise<string>;
/**
 * Validates if a file exists and has the expected extension
 *
 * @param filePath Path to the file to validate
 * @param allowedExtensions List of allowed extensions (without dot)
 * @returns Validation result with status and message
 */
export declare function validateFile(filePath: string, allowedExtensions?: string[]): Promise<{
    valid: boolean;
    message: string;
}>;
/**
 * Finds all files with specific extensions in a directory
 *
 * @param directory Directory to search in
 * @param extensions File extensions to look for (without dot)
 * @param recursive Whether to search recursively
 * @returns Array of matching file paths
 */
export declare function findFilesByExtension(directory: string, extensions: string[], recursive?: boolean): Promise<string[]>;
/**
 * Gets basic info about a document file
 *
 * @param filePath Path to the document
 * @returns Document information
 */
export declare function getDocumentInfo(filePath: string): Promise<{
    path: string;
    name: string;
    extension: string;
    sizeInBytes: number;
    sizeFormatted: string;
    lastModified: Date;
}>;
/**
 * Updates the asset catalog by checking for new files, removed files, and changes
 *
 * @returns Updated asset catalog
 */
export declare function updateAssetCatalog(): Promise<AssetCatalog>;
