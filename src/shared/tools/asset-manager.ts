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
export enum AssetType {
  DOCUMENT = 'document',
  IMAGE = 'image',
  VIDEO = 'video',
  OTHER = 'other'
}

/**
 * Asset format (file extension)
 */
export enum AssetFormat {
  // Documents
  PDF = 'pdf',
  DOCX = 'docx',
  MD = 'md',
  // Images
  JPEG = 'jpeg',
  JPG = 'jpg',
  PNG = 'png',
  // Videos
  MP4 = 'mp4',
  AVI = 'avi',
  // Other
  OTHER = 'other'
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
  duration?: number; // for videos
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
export function getAssetTypeFromExtension(extension: string): AssetType {
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
export function getAssetFormatFromExtension(extension: string): AssetFormat {
  const ext = extension.toLowerCase();
  
  switch (ext) {
    case 'pdf': return AssetFormat.PDF;
    case 'docx': return AssetFormat.DOCX;
    case 'md': return AssetFormat.MD;
    case 'jpeg': return AssetFormat.JPEG;
    case 'jpg': return AssetFormat.JPG;
    case 'png': return AssetFormat.PNG;
    case 'mp4': return AssetFormat.MP4;
    case 'avi': return AssetFormat.AVI;
    default: return AssetFormat.OTHER;
  }
}

/**
 * Validates that the basic asset directory structure exists
 * 
 * @returns Object with validation status and any missing directories
 */
export async function validateAssetStructure(): Promise<{ 
  valid: boolean; 
  missingDirs: string[]; 
  message: string 
}> {
  try {
    const missingDirs: string[] = [];
    
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
        message: `Missing directories: ${missingDirs.join(', ')}`
      };
    }
    
    return {
      valid: true,
      missingDirs: [],
      message: 'All required asset directories exist'
    };
  } catch (error) {
    console.error('Error validating asset structure:', error);
    return {
      valid: false,
      missingDirs: [],
      message: `Error validating asset structure: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Creates any missing directories in the asset structure
 * 
 * @returns Object with operation status
 */
export async function ensureAssetStructure(): Promise<{ 
  success: boolean; 
  createdDirs: string[]; 
  message: string 
}> {
  try {
    const { valid, missingDirs } = await validateAssetStructure();
    
    if (valid) {
      return {
        success: true,
        createdDirs: [],
        message: 'All required asset directories already exist'
      };
    }
    
    const createdDirs: string[] = [];
    
    // Create missing directories
    for (const dir of missingDirs) {
      try {
        await mkdir(dir, { recursive: true });
        createdDirs.push(dir);
      } catch (error) {
        return {
          success: false,
          createdDirs,
          message: `Error creating directory ${dir}: ${error instanceof Error ? error.message : String(error)}`
        };
      }
    }
    
    return {
      success: true,
      createdDirs,
      message: `Created directories: ${createdDirs.join(', ')}`
    };
  } catch (error) {
    console.error('Error ensuring asset structure:', error);
    return {
      success: false,
      createdDirs: [],
      message: `Error ensuring asset structure: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Scans a directory recursively and returns all file paths
 * 
 * @param directory Directory to scan
 * @returns Array of file paths
 */
async function scanDirectory(directory: string): Promise<string[]> {
  try {
    const files: string[] = [];
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
    throw new Error(`Error scanning directory: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Creates a metadata object for a single asset file
 * 
 * @param filePath Path to the asset file
 * @returns Asset metadata
 */
export async function createAssetMetadata(filePath: string): Promise<AssetMetadata> {
  try {
    const fileStats = await stat(filePath);
    const fileExt = extname(filePath).slice(1); // Remove the dot
    const fileName = basename(filePath);
    
    const type = getAssetTypeFromExtension(fileExt);
    const format = getAssetFormatFromExtension(fileExt);
    
    // Basic metadata
    const metadata: AssetMetadata = {
      id: `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: fileName,
      path: filePath,
      type,
      format,
      sizeInBytes: fileStats.size,
      lastModified: new Date(fileStats.mtime),
      createdAt: new Date(fileStats.birthtime)
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
    throw new Error(`Error creating asset metadata: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Gets image dimensions using ImageMagick
 * 
 * @param imagePath Path to the image file
 * @returns Image dimensions or null if they could not be determined
 */
export async function getImageDimensions(imagePath: string): Promise<{ width: number; height: number } | null> {
  try {
    // Using magick (per rules) instead of convert for ImageMagick v7
    const { stdout } = await execAsync(`magick identify -format "%w %h" "${imagePath}"`);
    
    const dimensions = stdout.trim().split(' ').map(Number);
    const width = dimensions[0];
    const height = dimensions[1];
    
    if (width === undefined || height === undefined || isNaN(width) || isNaN(height)) {
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
export async function createAssetCatalog(): Promise<AssetCatalog> {
  try {
    // Ensure asset structure exists
    await ensureAssetStructure();
    
    // Scan all asset directories
    const documentFiles = await scanDirectory(documentsDir);
    const imageFiles = await scanDirectory(imagesDir);
    const videoFiles = await scanDirectory(videoDir);
    
    // Create metadata for each file
    const documentMetadata = await Promise.all(
      documentFiles.map(file => createAssetMetadata(file))
    );
    
    const imageMetadata = await Promise.all(
      imageFiles.map(file => createAssetMetadata(file))
    );
    
    const videoMetadata = await Promise.all(
      videoFiles.map(file => createAssetMetadata(file))
    );
    
    // Combine all metadata
    const allAssets = [...documentMetadata, ...imageMetadata, ...videoMetadata];
    
    // Group assets by type
    const assetsByType = {
      [AssetType.DOCUMENT]: documentMetadata,
      [AssetType.IMAGE]: imageMetadata,
      [AssetType.VIDEO]: videoMetadata,
      [AssetType.OTHER]: allAssets.filter(asset => asset.type === AssetType.OTHER)
    };
    
    return {
      lastUpdated: new Date(),
      totalAssets: allAssets.length,
      assets: allAssets,
      assetsByType
    };
  } catch (error) {
    console.error('Error creating asset catalog:', error);
    throw new Error(`Error creating asset catalog: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Saves the asset catalog to a JSON file
 * 
 * @param catalog Asset catalog to save
 * @param outputPath Path to save the catalog to, defaults to assets/asset-catalog.json
 * @returns Path to the saved catalog file
 */
export async function saveAssetCatalog(
  catalog: AssetCatalog, 
  outputPath = join(assetsDir, 'asset-catalog.json')
): Promise<string> {
  try {
    await writeFile(
      outputPath, 
      JSON.stringify(catalog, null, 2), 
      'utf-8'
    );
    
    return outputPath;
  } catch (error) {
    console.error('Error saving asset catalog:', error);
    throw new Error(`Error saving asset catalog: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Loads an asset catalog from a JSON file
 * 
 * @param catalogPath Path to the catalog file, defaults to assets/asset-catalog.json
 * @returns Loaded asset catalog
 */
export async function loadAssetCatalog(
  catalogPath = join(assetsDir, 'asset-catalog.json')
): Promise<AssetCatalog> {
  try {
    const rawData = await readFile(catalogPath, 'utf-8');
    const catalog = JSON.parse(rawData) as AssetCatalog;
    
    // Convert date strings back to Date objects
    catalog.lastUpdated = new Date(catalog.lastUpdated);
    
    for (const asset of catalog.assets) {
      asset.lastModified = new Date(asset.lastModified);
      asset.createdAt = new Date(asset.createdAt);
    }
    
    return catalog;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // If catalog doesn't exist, create a new one
      console.log('Asset catalog not found, creating a new one...');
      const newCatalog = await createAssetCatalog();
      await saveAssetCatalog(newCatalog, catalogPath);
      return newCatalog;
    }
    
    console.error('Error loading asset catalog:', error);
    throw new Error(`Error loading asset catalog: ${error instanceof Error ? error.message : String(error)}`);
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
export async function resizeImage(
  inputPath: string, 
  outputPath: string, 
  width: number, 
  height?: number
): Promise<string> {
  try {
    const resizeParam = height 
      ? `${width}x${height}` 
      : `${width}`;
    
    // Using magick instead of convert (ImageMagick v7)
    await execAsync(`magick "${inputPath}" -resize ${resizeParam} "${outputPath}"`);
    
    console.log(`Image resized to ${resizeParam} and saved to ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`Error resizing image ${inputPath}:`, error);
    throw new Error(`Error resizing image: ${error instanceof Error ? error.message : String(error)}`);
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
export async function convertImageFormat(
  inputPath: string,
  outputPath: string,
  quality?: number
): Promise<string> {
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
    throw new Error(`Error converting image: ${error instanceof Error ? error.message : String(error)}`);
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
export async function optimizeImage(
  inputPath: string,
  outputPath: string,
  quality = 85
): Promise<{ path: string; reductionPercentage: number }> {
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
      reductionPercentage
    };
  } catch (error) {
    console.error(`Error optimizing image ${inputPath}:`, error);
    throw new Error(`Error optimizing image: ${error instanceof Error ? error.message : String(error)}`);
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
export async function addWatermark(
  inputPath: string,
  watermarkText: string,
  outputPath: string,
  options: {
    position?: 'center' | 'northwest' | 'northeast' | 'southwest' | 'southeast';
    fontSize?: number;
    transparency?: number; // 0-100
    color?: string; // e.g., 'white', '#FFFFFF'
  } = {}
): Promise<string> {
  try {
    const {
      position = 'southeast',
      fontSize = 24,
      transparency = 50,
      color = 'white'
    } = options;

    const alpha = 1 - transparency / 100;
    const command = `magick "${inputPath}" -gravity ${position} -pointsize ${fontSize} -fill "${color}" -draw "alpha ${alpha} text 10,10 '${watermarkText}'" "${outputPath}"`;
    
    await execAsync(command);
    
    console.log(`Added watermark to ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`Error adding watermark to ${inputPath}:`, error);
    throw new Error(`Error adding watermark: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Validates if a file exists and has the expected extension
 * 
 * @param filePath Path to the file to validate
 * @param allowedExtensions List of allowed extensions (without dot)
 * @returns Validation result with status and message
 */
export async function validateFile(
  filePath: string,
  allowedExtensions?: string[]
): Promise<{ valid: boolean; message: string }> {
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
        message: `Invalid file extension: ${extension}. Allowed: ${allowedExtensions.join(', ')}`
      };
    }
    
    return { valid: true, message: 'File exists with valid extension' };
  } catch (error) {
    return {
      valid: false,
      message: `File validation error: ${error instanceof Error ? error.message : String(error)}`
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
export async function findFilesByExtension(
  directory: string,
  extensions: string[],
  recursive = true
): Promise<string[]> {
  try {
    const files: string[] = [];
    const entries = await readdir(directory, { withFileTypes: true });
    
    const lowerExtensions = extensions.map(ext => ext.toLowerCase());
    
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
    throw new Error(`Error finding files: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Gets basic info about a document file
 * 
 * @param filePath Path to the document
 * @returns Document information
 */
export async function getDocumentInfo(filePath: string): Promise<{
  path: string;
  name: string;
  extension: string;
  sizeInBytes: number;
  sizeFormatted: string;
  lastModified: Date;
}> {
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
      lastModified: new Date(stats.mtime)
    };
  } catch (error) {
    console.error(`Error getting document info for ${filePath}:`, error);
    throw new Error(`Error getting document info: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Updates the asset catalog by checking for new files, removed files, and changes
 * 
 * @returns Updated asset catalog
 */
export async function updateAssetCatalog(): Promise<AssetCatalog> {
  try {
    // First, try to load existing catalog
    let existingCatalog: AssetCatalog | null = null;
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
    const existingPaths = new Set(existingCatalog.assets.map(asset => asset.path));
    const newPaths = new Set(newCatalog.assets.map(asset => asset.path));
    
    const addedFiles = newCatalog.assets.filter(asset => !existingPaths.has(asset.path));
    const removedFiles = existingCatalog.assets.filter(asset => !newPaths.has(asset.path));
    
    console.log(`Found ${addedFiles.length} new files and ${removedFiles.length} removed files`);
    
    // Save the updated catalog
    await saveAssetCatalog(newCatalog);
    return newCatalog;
  } catch (error) {
    console.error('Error updating asset catalog:', error);
    throw new Error(`Error updating asset catalog: ${error instanceof Error ? error.message : String(error)}`);
  }
}

