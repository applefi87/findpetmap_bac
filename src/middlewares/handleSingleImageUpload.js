import multer from 'multer';
import UnknownError from '../infrastructure/errors/UnknownError.js';
import ValidationObjectError from '../infrastructure/errors/ValidationObjectError.js';

// Multer storage configuration (you can customize this)
const storage = multer.memoryStorage();

// Multer middleware to handle single image upload
const uploadSingleImage = multer({
  storage,
  limits: { files: 1 }
}).single('image');

const handleSingleImageUpload = (req, res, next) => {
  console.log("handleSingleImageUpload");
  uploadSingleImage(req, res, function (err) {
    console.log("uploadSingleImage");
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_COUNT') {
        throw new ValidationObjectError('uploadOnlyOneImage')
      } else {
        throw new UnknownError(err, "handleSingleImageUpload middleware error")
      }
    } else {
      next();
    }
  });
  console.log("after uploadSingleImage");
};

export default handleSingleImageUpload;
