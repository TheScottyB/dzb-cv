import { readdir, readFile, writeFile, stat, mkdir } from 'fs/promises';
import { join, extname, basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
// Base directory paths
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..', '..');
const assetsDir = join(rootDir, 'assets');
const documentsDir = join(assetsDir, 'documents');
const imagesDir = join(assetsDir, 'images');
const videoDir = join(assetsDir, 'Dawn_Video_Resume');
/**
 * Asset types supported by the system
 */
export var AssetType;
(function (AssetType) {
  AssetType['DOCUMENT'] = 'document';
  AssetType['IMAGE'] = 'image';
  AssetType['VIDEO'] = 'video';
  AssetType['OTHER'] = 'other';
})(AssetType || (AssetType = {}));
/**
 * Asset format (file extension)
 */
export var AssetFormat;
(function (AssetFormat) {
  // Documents
  AssetFormat['PDF'] = 'pdf';
  AssetFormat['DOCX'] = 'docx';
  AssetFormat['MD'] = 'md';
  // Images
  AssetFormat['JPEG'] = 'jpeg';
  AssetFormat['JPG'] = 'jpg';
  AssetFormat['PNG'] = 'png';
  // Videos
  AssetFormat['MP4'] = 'mp4';
  AssetFormat['AVI'] = 'avi';
  // Other
  AssetFormat['OTHER'] = 'other';
})(AssetFormat || (AssetFormat = {}));
/**
 * Determines the asset type based on file extension
 *
 * @param extension File extension (without the dot)
 * @returns Asset type enum value
 */
export function getAssetTypeFromExtension(extension) {
  const ext = extension.toLowerCase();
  const documentExts = ['pdf', 'doc', 'docx', 'txt', 'md', 'rtf'];
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp'];
  const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'];
  if (documentExts.includes(ext)) return AssetType.DOCUMENT;
  if (imageExts.includes(ext)) return AssetType.IMAGE;
  if (videoExts.includes(ext)) return AssetType.VIDEO;
  return AssetType.OTHER;
}
/**
 * Determines the asset format based on file extension
 *
 * @param extension File extension (without the dot)
 * @returns Asset format enum value
 */
export function getAssetFormatFromExtension(extension) {
  const ext = extension.toLowerCase();
  switch (ext) {
    case 'pdf':
      return AssetFormat.PDF;
    case 'docx':
      return AssetFormat.DOCX;
    case 'md':
      return AssetFormat.MD;
    case 'jpeg':
      return AssetFormat.JPEG;
    case 'jpg':
      return AssetFormat.JPG;
    case 'png':
      return AssetFormat.PNG;
    case 'mp4':
      return AssetFormat.MP4;
    case 'avi':
      return AssetFormat.AVI;
    default:
      return AssetFormat.OTHER;
  }
}
/**
 * Validates that the basic asset directory structure exists
 *
 * @returns Object with validation status and any missing directories
 */
export async function validateAssetStructure() {
  try {
    const missingDirs = [];
    // Check if directories exist
    for (const dir of [assetsDir, documentsDir, imagesDir, videoDir]) {
      try {
        await stat(dir);
      } catch (error) {
        missingDirs.push(dir);
      }
    }
    if (missingDirs.length > 0) {
      return {
        valid: false,
        missingDirs,
        message: `Missing directories: ${missingDirs.join(', ')}`,
      };
    }
    return {
      valid: true,
      missingDirs: [],
      message: 'All required asset directories exist',
    };
  } catch (error) {
    console.error('Error validating asset structure:', error);
    return {
      valid: false,
      missingDirs: [],
      message: `Error validating asset structure: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
/**
 * Creates any missing directories in the asset structure
 *
 * @returns Object with operation status
 */
export async function ensureAssetStructure() {
  try {
    const { valid, missingDirs } = await validateAssetStructure();
    if (valid) {
      return {
        success: true,
        createdDirs: [],
        message: 'All required asset directories already exist',
      };
    }
    const createdDirs = [];
    // Create missing directories
    for (const dir of missingDirs) {
      try {
        await mkdir(dir, { recursive: true });
        createdDirs.push(dir);
      } catch (error) {
        return {
          success: false,
          createdDirs,
          message: `Error creating directory ${dir}: ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    }
    return {
      success: true,
      createdDirs,
      message: `Created directories: ${createdDirs.join(', ')}`,
    };
  } catch (error) {
    console.error('Error ensuring asset structure:', error);
    return {
      success: false,
      createdDirs: [],
      message: `Error ensuring asset structure: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
/**
 * Scans a directory recursively and returns all file paths
 *
 * @param directory Directory to scan
 * @returns Array of file paths
 */
async function scanDirectory(directory) {
  try {
    const files = [];
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(directory, entry.name);
      if (entry.isDirectory()) {
        // Skip .git, node_modules, and other irrelevant directories
        if (['node_modules', '.git', '.vscode', 'dist'].includes(entry.name)) {
          continue;
        }
        const subDirectoryFiles = await scanDirectory(fullPath);
        files.push(...subDirectoryFiles);
      } else {
        files.push(fullPath);
      }
    }
    return files;
  } catch (error) {
    console.error(`Error scanning directory ${directory}:`, error);
    throw new Error(
      `Error scanning directory: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
/**
 * Creates a metadata object for a single asset file
 *
 * @param filePath Path to the asset file
 * @returns Asset metadata
 */
export async function createAssetMetadata(filePath) {
  try {
    const fileStats = await stat(filePath);
    const fileExt = extname(filePath).slice(1); // Remove the dot
    const fileName = basename(filePath);
    const type = getAssetTypeFromExtension(fileExt);
    const format = getAssetFormatFromExtension(fileExt);
    // Basic metadata
    const metadata = {
      id: `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: fileName,
      path: filePath,
      type,
      format,
      sizeInBytes: fileStats.size,
      lastModified: new Date(fileStats.mtime),
      createdAt: new Date(fileStats.birthtime),
    };
    // Add additional metadata based on asset type
    if (type === AssetType.IMAGE) {
      try {
        const dimensions = await getImageDimensions(filePath);
        if (dimensions) {
          metadata.dimensions = dimensions;
        }
      } catch (error) {
        console.warn(`Could not get dimensions for image ${fileName}:`, error);
      }
    } else if (type === AssetType.VIDEO) {
      // Video duration could be added here if needed
      // Would require a tool like ffmpeg to extract video metadata
    }
    return metadata;
  } catch (error) {
    console.error(`Error creating metadata for ${filePath}:`, error);
    throw new Error(
      `Error creating asset metadata: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
/**
 * Gets image dimensions using ImageMagick
 *
 * @param imagePath Path to the image file
 * @returns Image dimensions or null if they could not be determined
 */
export async function getImageDimensions(imagePath) {
  try {
    // Using magick (per rules) instead of convert for ImageMagick v7
    const { stdout } = await execAsync(`magick identify -format "%w %h" "${imagePath}"`);
    const [width, height] = stdout.trim().split(' ').map(Number);
    if (isNaN(width) || isNaN(height)) {
      return null;
    }
    return { width, height };
  } catch (error) {
    console.error(`Error getting image dimensions for ${imagePath}:`, error);
    return null;
  }
}
/**
 * Creates a complete catalog of all assets
 *
 * @returns Asset catalog with all metadata
 */
export async function createAssetCatalog() {
  try {
    // Ensure asset structure exists
    await ensureAssetStructure();
    // Scan all asset directories
    const documentFiles = await scanDirectory(documentsDir);
    const imageFiles = await scanDirectory(imagesDir);
    const videoFiles = await scanDirectory(videoDir);
    // Create metadata for each file
    const documentMetadata = await Promise.all(
      documentFiles.map((file) => createAssetMetadata(file))
    );
    const imageMetadata = await Promise.all(imageFiles.map((file) => createAssetMetadata(file)));
    const videoMetadata = await Promise.all(videoFiles.map((file) => createAssetMetadata(file)));
    // Combine all metadata
    const allAssets = [...documentMetadata, ...imageMetadata, ...videoMetadata];
    // Group assets by type
    const assetsByType = {
      [AssetType.DOCUMENT]: documentMetadata,
      [AssetType.IMAGE]: imageMetadata,
      [AssetType.VIDEO]: videoMetadata,
      [AssetType.OTHER]: allAssets.filter((asset) => asset.type === AssetType.OTHER),
    };
    return {
      lastUpdated: new Date(),
      totalAssets: allAssets.length,
      assets: allAssets,
      assetsByType,
    };
  } catch (error) {
    console.error('Error creating asset catalog:', error);
    throw new Error(
      `Error creating asset catalog: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
/**
 * Saves the asset catalog to a JSON file
 *
 * @param catalog Asset catalog to save
 * @param outputPath Path to save the catalog to, defaults to generated/asset-catalog.json
 * @returns Path to the saved catalog file
 */
export async function saveAssetCatalog(
  catalog,
  outputPath = join(assetsDir, 'asset-catalog.json')
) {
  try {
    await writeFile(outputPath, JSON.stringify(catalog, null, 2), 'utf-8');
    return outputPath;
  } catch (error) {
    console.error('Error saving asset catalog:', error);
    throw new Error(
      `Error saving asset catalog: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
/**
 * Loads an asset catalog from a JSON file
 *
 * @param catalogPath Path to the catalog file, defaults to assets/asset-catalog.json
 * @returns Loaded asset catalog
 */
export async function loadAssetCatalog(catalogPath = join(assetsDir, 'asset-catalog.json')) {
  try {
    const rawData = await readFile(catalogPath, 'utf-8');
    const catalog = JSON.parse(rawData);
    // Convert date strings back to Date objects
    catalog.lastUpdated = new Date(catalog.lastUpdated);
    for (const asset of catalog.assets) {
      asset.lastModified = new Date(asset.lastModified);
      asset.createdAt = new Date(asset.createdAt);
    }
    return catalog;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // If catalog doesn't exist, create a new one
      console.log('Asset catalog not found, creating a new one...');
      const newCatalog = await createAssetCatalog();
      await saveAssetCatalog(newCatalog, catalogPath);
      return newCatalog;
    }
    console.error('Error loading asset catalog:', error);
    throw new Error(
      `Error loading asset catalog: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
/**
 * Resizes an image using ImageMagick
 *
 * @param inputPath Path to the input image
 * @param outputPath Path to save the resized image
 * @param width Desired width
 * @param height Desired height (optional, will maintain aspect ratio if not provided)
 * @returns Path to the resized image
 */
export async function resizeImage(inputPath, outputPath, width, height) {
  try {
    const resizeParam = height ? `${width}x${height}` : `${width}`;
    // Using magick instead of convert (ImageMagick v7)
    await execAsync(`magick "${inputPath}" -resize ${resizeParam} "${outputPath}"`);
    console.log(`Image resized to ${resizeParam} and saved to ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`Error resizing image ${inputPath}:`, error);
    throw new Error(
      `Error resizing image: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
/**
 * Converts an image to a different format using ImageMagick
 *
 * @param inputPath Path to the input image
 * @param outputPath Path to save the converted image (extension determines format)
 * @param quality Optional quality parameter (1-100, for JPEG/PNG)
 * @returns Path to the converted image
 */
export async function convertImageFormat(inputPath, outputPath, quality) {
  try {
    let command = `magick "${inputPath}"`;
    // Add quality parameter if specified
    if (quality !== undefined && quality >= 1 && quality <= 100) {
      command += ` -quality ${quality}`;
    }
    command += ` "${outputPath}"`;
    await execAsync(command);
    console.log(`Image converted and saved to ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`Error converting image ${inputPath}:`, error);
    throw new Error(
      `Error converting image: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
/**
 * Optimizes an image for web use (reduces size while maintaining quality)
 *
 * @param inputPath Path to the input image
 * @param outputPath Path to save the optimized image
 * @param quality Quality setting (1-100)
 * @returns Path to the optimized image and size reduction percentage
 */
export async function optimizeImage(inputPath, outputPath, quality = 85) {
  try {
    // Get original file size
    const originalStats = await stat(inputPath);
    const originalSize = originalStats.size;
    // Apply optimization
    // Strip metadata and optimize for web
    await execAsync(
      `magick "${inputPath}" -strip -interlace Plane -quality ${quality} "${outputPath}"`
    );
    // Get new file size
    const newStats = await stat(outputPath);
    const newSize = newStats.size;
    // Calculate reduction percentage
    const reductionPercentage = ((originalSize - newSize) / originalSize) * 100;
    console.log(
      `Image optimized and saved to ${outputPath} (reduced by ${reductionPercentage.toFixed(2)}%)`
    );
    return {
      path: outputPath,
      reductionPercentage,
    };
  } catch (error) {
    console.error(`Error optimizing image ${inputPath}:`, error);
    throw new Error(
      `Error optimizing image: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
/**
 * Applies a watermark to an image
 *
 * @param inputPath Path to the input image
 * @param watermarkText Text to use as watermark
 * @param outputPath Path to save the watermarked image
 * @param options Watermark options (position, transparency, etc.)
 * @returns Path to the watermarked image
 */
export async function addWatermark(inputPath, watermarkText, outputPath, options = {}) {
  try {
    const { position = 'southeast', fontSize = 24, transparency = 50, color = 'white' } = options;
    // Convert transparency to alpha value for ImageMagick (0-1)
    const alpha = 1 - transparency / 100;
    // Build command with proper positioning
    await execAsync(
      `magick "${inputPath}" -gravity ${position} -pointsize ${fontSize} ` +
        `-fill "${color}" -draw "text 10,10 '${watermarkText}'" "${outputPath}"`
    );
    console.log(`Watermark added to image and saved to ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`Error adding watermark to image ${inputPath}:`, error);
    throw new Error(
      `Error adding watermark: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
/**
 * Validates if a file exists and has the expected extension
 *
 * @param filePath Path to the file to validate
 * @param allowedExtensions List of allowed extensions (without dot)
 * @returns Validation result with status and message
 */
export async function validateFile(filePath, allowedExtensions) {
  try {
    // Check if file exists
    await stat(filePath);
    // If no extension restrictions, just check existence
    if (!allowedExtensions || allowedExtensions.length === 0) {
      return { valid: true, message: 'File exists' };
    }
    // Check extension
    const extension = extname(filePath).slice(1).toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return {
        valid: false,
        message: `Invalid file extension: ${extension}. Allowed: ${allowedExtensions.join(', ')}`,
      };
    }
    return { valid: true, message: 'File exists with valid extension' };
  } catch (error) {
    return {
      valid: false,
      message: `File validation error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
/**
 * Finds all files with specific extensions in a directory
 *
 * @param directory Directory to search in
 * @param extensions File extensions to look for (without dot)
 * @param recursive Whether to search recursively
 * @returns Array of matching file paths
 */
export async function findFilesByExtension(directory, extensions, recursive = true) {
  try {
    const files = [];
    const entries = await readdir(directory, { withFileTypes: true });
    const lowerExtensions = extensions.map((ext) => ext.toLowerCase());
    for (const entry of entries) {
      const fullPath = join(directory, entry.name);
      if (entry.isDirectory() && recursive) {
        // Skip system and hidden directories
        if (entry.name.startsWith('.') || ['node_modules', 'dist'].includes(entry.name)) {
          continue;
        }
        const subFiles = await findFilesByExtension(fullPath, extensions, recursive);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        const ext = extname(entry.name).slice(1).toLowerCase();
        if (lowerExtensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
    return files;
  } catch (error) {
    console.error(`Error finding files in ${directory}:`, error);
    throw new Error(
      `Error finding files: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
/**
 * Gets basic info about a document file
 *
 * @param filePath Path to the document
 * @returns Document information
 */
export async function getDocumentInfo(filePath) {
  try {
    const stats = await stat(filePath);
    const name = basename(filePath);
    const extension = extname(filePath).slice(1).toLowerCase();
    const sizeInBytes = stats.size;
    // Format size for human readability
    let sizeFormatted = '';
    if (sizeInBytes < 1024) {
      sizeFormatted = `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      sizeFormatted = `${(sizeInBytes / 1024).toFixed(2)} KB`;
    } else {
      sizeFormatted = `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return {
      path: filePath,
      name,
      extension,
      sizeInBytes,
      sizeFormatted,
      lastModified: new Date(stats.mtime),
    };
  } catch (error) {
    console.error(`Error getting document info for ${filePath}:`, error);
    throw new Error(
      `Error getting document info: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
/**
 * Updates the asset catalog by checking for new files, removed files, and changes
 *
 * @returns Updated asset catalog
 */
export async function updateAssetCatalog() {
  try {
    // First, try to load existing catalog
    let existingCatalog = null;
    try {
      existingCatalog = await loadAssetCatalog();
      console.log(`Loaded existing catalog with ${existingCatalog.assets.length} assets`);
    } catch (error) {
      console.log('No existing catalog found or error loading it - creating new one');
      existingCatalog = null;
    }
    // Create a new catalog
    const newCatalog = await createAssetCatalog();
    // If no existing catalog, just return the new one
    if (!existingCatalog) {
      await saveAssetCatalog(newCatalog);
      return newCatalog;
    }
    // Compare catalogs to see what's changed
    const existingPaths = new Set(existingCatalog.assets.map((asset) => asset.path));
    const newPaths = new Set(newCatalog.assets.map((asset) => asset.path));
    const addedFiles = newCatalog.assets.filter((asset) => !existingPaths.has(asset.path));
    const removedFiles = existingCatalog.assets.filter((asset) => !newPaths.has(asset.path));
    console.log(`Found ${addedFiles.length} new files and ${removedFiles.length} removed files`);
    // Save the updated catalog
    await saveAssetCatalog(newCatalog);
    return newCatalog;
  } catch (error) {
    console.error('Error updating asset catalog:', error);
    throw new Error(
      `Error updating asset catalog: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
//# sourceMappingURL=asset-manager.js.map
