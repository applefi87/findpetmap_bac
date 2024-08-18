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

    const quality = isPreview ? 80 : 60;
    const width = isPreview ? 1080 : 480;
    const height = isPreview ? 1080 : 480;

    const result = await getSharpInstance(buffer, 'webp', quality, width, height).toBuffer();
    return result;
  } catch (error) {
    throw new UnknownError(error, "src/utils/image.js");
  }
}

export function getSharpInstance(buffer = null, format = 'webp', quality = 60, width = 480, height = 480) {
  if (buffer === null) {
    return sharp().toFormat(format, { quality })
      .resize({ width, height, fit: 'inside', withoutEnlargement: true });
  } else {
    return sharp(buffer).toFormat(format, { quality })
      .resize({ width, height, fit: 'inside', withoutEnlargement: true })
  }
}