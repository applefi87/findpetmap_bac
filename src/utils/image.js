import sharp from "sharp";
import ValidateObjectError from '../infrastructure/errors/ValidationObjectError.js'

export async function processImage(buffer, format) {
  try {
    if (['tiff', 'svg+xml'].includes(format)) {
      format = 'jpeg';
    }
    const allowedFormats = ['jpeg', 'png', 'gif', 'webp', 'svg+xml'];

    if (!allowedFormats.includes(format)) {
      throw new ValidateObjectError("Invalid image format");
    }

    const options = format === 'gif' ? {} : { quality: 80 };

    return sharp(buffer)
      .toFormat(format, options)
      .resize({ width: 1080, height: 1080, fit: 'inside', withoutEnlargement: true })
      .toBuffer();
  } catch (error) {
    throw new Error(`Error processing image: ${error.message}`);
  }
}
