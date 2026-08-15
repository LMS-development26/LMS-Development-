const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() + '-' + Math.round(Math.random() * 1E9);

    const ext = path.extname(file.originalname);

    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + ext
    );
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Only JPG, JPEG, PNG, GIF, WebP, MP4, MOV, AVI, and WebM files are allowed.'
      )
    );
  }
};

// Configure multer
const upload = multer({
  storage: storage,

  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },

  fileFilter: fileFilter
});

// Export configured multer instances
module.exports = {
  upload,
  singleImage: upload.single('file'),
  singleVideo: upload.single('file'),
  multipleFiles: upload.array('files', 10)
};