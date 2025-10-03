const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const ErrorResponse = require('./errorResponse');
const logger = require('./logger');

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();

/**
 * Upload a file to S3
 * @param {Object} file - File object from multer
 * @param {string} folder - Folder path in S3 bucket (e.g., 'profile-pictures', 'documents')
 * @param {Array} allowedMimeTypes - Array of allowed MIME types
 * @returns {Promise<Object>} - Upload result with file details
 */
const uploadToS3 = async (file, folder = 'uploads', allowedMimeTypes = []) => {
  try {
    // Check if file exists
    if (!file) {
      throw new ErrorResponse('No file provided', 400);
    }

    // Validate file type if allowedMimeTypes is provided
    if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(file.mimetype)) {
      throw new ErrorResponse(
        `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
        400
      );
    }

    // Generate a unique file key
    const fileExt = path.extname(file.originalname).toLowerCase();
    const fileKey = `${folder}/${uuidv4()}${fileExt}`;

    // Set up S3 upload parameters
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
      Body: fs.createReadStream(file.path),
      ContentType: file.mimetype,
      ACL: 'public-read', // Set appropriate ACL based on your requirements
      Metadata: {
        originalName: file.originalname,
        uploadedBy: 'api', // You can set this to the user ID if available
        uploadDate: new Date().toISOString()
      }
    };

    // Upload file to S3
    const uploadResult = await s3.upload(params).promise();

    // Clean up the temporary file
    await fs.promises.unlink(file.path);

    // Return file details
    return {
      success: true,
      file: {
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
        key: fileKey,
        url: uploadResult.Location,
        bucket: uploadResult.Bucket,
        etag: uploadResult.ETag
      }
    };
  } catch (error) {
    // Clean up the temporary file in case of error
    if (file && file.path) {
      try {
        await fs.promises.unlink(file.path);
      } catch (cleanupError) {
        logger.error('Error cleaning up temp file:', cleanupError);
      }
    }

    logger.error('Error uploading file to S3:', error);
    throw new ErrorResponse(
      error.message || 'Error uploading file',
      error.statusCode || 500
    );
  }
};

/**
 * Delete a file from S3
 * @param {string} fileKey - The file key in S3
 * @returns {Promise<Object>} - Deletion result
 */
const deleteFromS3 = async (fileKey) => {
  try {
    if (!fileKey) {
      throw new ErrorResponse('No file key provided', 400);
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey
    };

    await s3.deleteObject(params).promise();

    return {
      success: true,
      message: 'File deleted successfully',
      fileKey
    };
  } catch (error) {
    logger.error('Error deleting file from S3:', error);
    throw new ErrorResponse(
      error.message || 'Error deleting file',
      error.statusCode || 500
    );
  }
};

/**
 * Generate a pre-signed URL for file upload
 * @param {string} fileName - Original file name
 * @param {string} fileType - MIME type of the file
 * @param {string} folder - Folder path in S3 bucket
 * @param {number} expiresIn - URL expiration time in seconds (default: 300)
 * @returns {Promise<Object>} - Pre-signed URL and file details
 */
const getPresignedUrl = async (fileName, fileType, folder = 'uploads', expiresIn = 300) => {
  try {
    if (!fileName || !fileType) {
      throw new ErrorResponse('File name and type are required', 400);
    }

    const fileExt = path.extname(fileName).toLowerCase();
    const fileKey = `${folder}/${uuidv4()}${fileExt}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
      Expires: expiresIn,
      ContentType: fileType,
      ACL: 'public-read',
      Metadata: {
        originalName: fileName,
        uploadedBy: 'presigned-url',
        uploadDate: new Date().toISOString()
      }
    };

    const url = await s3.getSignedUrlPromise('putObject', params);

    return {
      success: true,
      uploadUrl: url,
      fileKey,
      fileUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileKey}`,
      expiresIn: Math.floor(Date.now() / 1000) + expiresIn
    };
  } catch (error) {
    logger.error('Error generating pre-signed URL:', error);
    throw new ErrorResponse(
      error.message || 'Error generating upload URL',
      error.statusCode || 500
    );
  }
};

/**
 * Get file metadata from S3
 * @param {string} fileKey - The file key in S3
 * @returns {Promise<Object>} - File metadata
 */
const getFileMetadata = async (fileKey) => {
  try {
    if (!fileKey) {
      throw new ErrorResponse('No file key provided', 400);
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey
    };

    const headData = await s3.headObject(params).promise();

    return {
      success: true,
      metadata: {
        key: fileKey,
        contentType: headData.ContentType,
        contentLength: headData.ContentLength,
        lastModified: headData.LastModified,
        etag: headData.ETag,
        metadata: headData.Metadata
      }
    };
  } catch (error) {
    if (error.code === 'NotFound') {
      throw new ErrorResponse('File not found', 404);
    }
    
    logger.error('Error getting file metadata:', error);
    throw new ErrorResponse(
      error.message || 'Error retrieving file metadata',
      error.statusCode || 500
    );
  }
};

module.exports = {
  uploadToS3,
  deleteFromS3,
  getPresignedUrl,
  getFileMetadata
};
