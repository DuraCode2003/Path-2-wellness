const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const mime = require('mime-types');
const ErrorResponse = require('./errorResponse');
const logger = require('./logger');

/**
 * Ensure a directory exists, create it if it doesn't
 * @param {string} dirPath - Path to the directory
 * @returns {Promise<void>}
 */
const ensureDirExists = async (dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    logger.error(`Error creating directory ${dirPath}:`, error);
    throw new ErrorResponse(`Failed to create directory: ${dirPath}`, 500);
  }
};

/**
 * Generate a unique filename with extension
 * @param {string} originalName - Original filename
 * @param {string} [prefix=''] - Optional prefix for the filename
 * @returns {string} Generated filename
 */
const generateUniqueFilename = (originalName, prefix = '') => {
  const ext = path.extname(originalName);
  const uniqueId = uuidv4();
  return `${prefix}${uniqueId}${ext}`.toLowerCase();
};

/**
 * Get file extension from mimetype
 * @param {string} mimetype - MIME type
 * @returns {string} File extension with dot (e.g., '.jpg')
 */
const getExtensionFromMimetype = (mimetype) => {
  const ext = mime.extension(mimetype);
  return ext ? `.${ext}` : '';
};

/**
 * Validate file size
 * @param {Object} file - File object with size property
 * @param {number} maxSize - Maximum allowed size in bytes
 * @returns {boolean} True if file size is valid
 */
const validateFileSize = (file, maxSize) => {
  return file.size <= maxSize;
};

/**
 * Validate file type against allowed MIME types
 * @param {Object} file - File object with mimetype property
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {boolean} True if file type is allowed
 */
const validateFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.mimetype);
};

/**
 * Save file to disk
 * @param {Object} file - File object with buffer and path
 * @param {string} destination - Destination directory
 * @param {string} [filename] - Custom filename (optional)
 * @returns {Promise<Object>} File info
 */
const saveFile = async (file, destination, filename = null) => {
  try {
    await ensureDirExists(destination);
    
    const fileExt = path.extname(file.originalname) || getExtensionFromMimetype(file.mimetype);
    const fileName = filename || `${uuidv4()}${fileExt}`.toLowerCase();
    const filePath = path.join(destination, fileName);
    
    await fs.writeFile(filePath, file.buffer);
    
    return {
      filename: fileName,
      path: filePath,
      size: file.size,
      mimetype: file.mimetype,
      originalname: file.originalname
    };
  } catch (error) {
    logger.error('Error saving file:', error);
    throw new ErrorResponse('Failed to save file', 500);
  }
};

/**
 * Delete file from disk
 * @param {string} filePath - Path to the file
 * @returns {Promise<boolean>} True if file was deleted
 */
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      logger.warn(`File not found: ${filePath}`);
      return false;
    }
    logger.error(`Error deleting file ${filePath}:`, error);
    throw new ErrorResponse('Failed to delete file', 500);
  }
};

/**
 * Read file as base64
 * @param {string} filePath - Path to the file
 * @returns {Promise<string>} Base64 encoded file content
 */
const readFileAsBase64 = async (filePath) => {
  try {
    const data = await fs.readFile(filePath);
    return data.toString('base64');
  } catch (error) {
    logger.error(`Error reading file ${filePath}:`, error);
    throw new ErrorResponse('Failed to read file', 500);
  }
};

/**
 * Get file stats
 * @param {string} filePath - Path to the file
 * @returns {Promise<Object>} File stats
 */
const getFileStats = async (filePath) => {
  try {
    return await fs.stat(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    logger.error(`Error getting file stats for ${filePath}:`, error);
    throw new ErrorResponse('Failed to get file stats', 500);
  }
};

/**
 * Check if file exists
 * @param {string} filePath - Path to the file
 * @returns {Promise<boolean>} True if file exists
 */
const fileExists = async (filePath) => {
  try {
    await fs.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get all files in a directory
 * @param {string} dirPath - Path to the directory
 * @returns {Promise<string[]>} Array of file paths
 */
const getFilesInDirectory = async (dirPath) => {
  try {
    await ensureDirExists(dirPath);
    const files = await fs.readdir(dirPath);
    return files.map(file => path.join(dirPath, file));
  } catch (error) {
    logger.error(`Error reading directory ${dirPath}:`, error);
    throw new ErrorResponse('Failed to read directory', 500);
  }
};

/**
 * Create a temporary file
 * @param {string} content - File content
 * @param {string} [extension='.tmp'] - File extension
 * @returns {Promise<{path: string, cleanup: Function}>} File path and cleanup function
 */
const createTempFile = async (content, extension = '.tmp') => {
  const tempDir = path.join(process.cwd(), 'temp');
  await ensureDirExists(tempDir);
  
  const tempFilePath = path.join(tempDir, `${uuidv4()}${extension}`);
  
  try {
    await fs.writeFile(tempFilePath, content);
    
    return {
      path: tempFilePath,
      cleanup: async () => {
        try {
          await deleteFile(tempFilePath);
        } catch (error) {
          logger.error(`Error cleaning up temp file ${tempFilePath}:`, error);
        }
      }
    };
  } catch (error) {
    logger.error('Error creating temp file:', error);
    throw new ErrorResponse('Failed to create temporary file', 500);
  }
};

/**
 * Get MIME type for a file
 * @param {string} filePath - Path to the file
 * @returns {string} MIME type
 */
const getMimeType = (filePath) => {
  return mime.lookup(filePath) || 'application/octet-stream';
};

module.exports = {
  ensureDirExists,
  generateUniqueFilename,
  getExtensionFromMimetype,
  validateFileSize,
  validateFileType,
  saveFile,
  deleteFile,
  readFileAsBase64,
  getFileStats,
  fileExists,
  getFilesInDirectory,
  createTempFile,
  getMimeType
};
