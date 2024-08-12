import multer from 'multer';
import UnknownError from '../infrastructure/errors/UnknownError.js';
import ValidationObjectError from '../infrastructure/errors/ValidationObjectError.js';

// Multer storage configuration (you can customize this)
const storage = multer.memoryStorage();

// Multer middleware to handle single image upload
const uploadSingleImage = multer({
  storage,
  limits: { files: 1 } // Limit to 1 file
}).single('image');

const handleSingleImageUpload = (req, res, next) => {
  uploadSingleImage(req, res, function (err) {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_COUNT') {
        next(new ValidationObjectError('uploadOnlyOneImage'));
      } else {
        next(new UnknownError(err, "handleSingleImageUpload middleware error"));
      }
    } else {
      next();
    }
  });
};

export default handleSingleImageUpload;
