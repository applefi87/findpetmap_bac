import sharp from "sharp";
import ValidationObjectError from '../infrastructure/errors/ValidationObjectError.js'
import UnknownError from '../infrastructure/errors/UnknownError.js'

export async function processImage(buffer, format, isPreview = false) {
  try {
    if (['tiff', 'svg+xml'].includes(format)) {
      format = 'jpeg';
    }
    const allowedFormats = ['jpeg', 'png', 'webp'];

    if (!allowedFormats.includes(format)) {
      throw new ValidationObjectError("InvalidImageFormat", { format: "jpg,png,webp" });
    }
    let result
    if (isPreview) {
      result = await sharp(buffer)
        .toFormat('webp', { quality: 80 })
        .resize({ width: 1080, height: 1080, fit: 'inside', withoutEnlargement: true })
        .toBuffer();
    } else {
      result = await sharp(buffer)
        .toFormat('webp', { quality: 60 })
        .resize({ width: 480, height: 480, fit: 'inside', withoutEnlargement: true })
        .toBuffer();
    }
    return result
  } catch (error) {
    throw new UnknownError(error, "src/utils/image.js")
  }
}
