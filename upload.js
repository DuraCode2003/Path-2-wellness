const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('./async');

// Ensure upload directory exists
const uploadDir = process.env.FILE_UPLOAD_PATH || 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
  
  // Check file extension
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  // Check mime type
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new ErrorResponse('File type not allowed', 400));
  }
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create a subdirectory based on file type
    let subDir = 'other';
    if (file.mimetype.startsWith('image/')) {
      subDir = 'images';
    } else if (file.mimetype === 'application/pdf') {
      subDir = 'documents';
    } else if (file.mimetype.startsWith('text/')) {
      subDir = 'text';
    }
    
    const dir = path.join(uploadDir, subDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Initialize upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_UPLOAD || 5) * 1024 * 1024 // 5MB default
  }
});

// Wrapper for handling file upload errors
const handleUpload = (fieldName, maxCount = 1) => {
  return (req, res, next) => {
    const uploadFn = upload.array(fieldName, maxCount);
    uploadFn(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ErrorResponse(`File too large. Maximum size is ${process.env.MAX_FILE_UPLOAD || 5}MB`, 400));
        } else if (err.code === 'LIMIT_FILE_COUNT') {
          return next(new ErrorResponse(`Maximum ${maxCount} files allowed`, 400));
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new ErrorResponse(`Unexpected field: ${err.field}`, 400));
        }
        return next(new ErrorResponse(err.message, 400));
      }
      next();
    });
  };
};

// Single file upload middleware
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const uploadFn = upload.single(fieldName);
    uploadFn(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ErrorResponse(`File too large. Maximum size is ${process.env.MAX_FILE_UPLOAD || 5}MB`, 400));
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(new ErrorResponse(`Unexpected field: ${err.field}`, 400));
        }
        return next(new ErrorResponse(err.message, 400));
      }
      next();
    });
  };
};

// Multiple files upload middleware
const uploadMultiple = (fieldName, maxCount = 5) => {
  return handleUpload(fieldName, maxCount);
};

// Middleware to handle file cleanup on error
const cleanupUploads = asyncHandler(async (req, res, next) => {
  // If there's an error response, clean up uploaded files
  if (res.locals.error) {
    if (req.files && req.files.length > 0) {
      await Promise.all(
        req.files.map(file => 
          fs.promises.unlink(file.path).catch(console.error)
        )
      );
    } else if (req.file) {
      await fs.promises.unlink(req.file.path).catch(console.error);
    }
  }
  next();
});

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  cleanupUploads
};
