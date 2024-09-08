import sharp from "sharp";
import ValidationObjectError from '../infrastructure/errors/ValidationObjectError.js'
import UnknownError from '../infrastructure/errors/UnknownError.js'
import imageConfigs from '../infrastructure/configs/imageConfigs.js'

export async function processImage(buffer, format, isPreview = false) {
  try {
    if (['tiff', 'svg+xml'].includes(format)) {
      format = 'jpeg';
    }

    const allowedFormats = ['jpeg', 'png', 'webp'];
    if (!allowedFormats.includes(format)) {
      throw new ValidationObjectError("InvalidImageFormat", { format: "jpg,png,webp" });
    }

    const quality = isPreview ? imageConfigs.normalImage.quality : imageConfigs.previewImage.quality;
    const width = isPreview ? imageConfigs.normalImage.width : imageConfigs.previewImage.width;
    const height = isPreview ? imageConfigs.normalImage.height : imageConfigs.previewImage.height;

    return getSharpInstance(buffer, 'webp', quality, width, height).toBuffer();
  } catch (error) {
    throw new UnknownError(error, "src/utils/image.js");
  }
}

export function getSharpInstance(buffer = null, format = 'webp', quality = imageConfigs.previewImage.quality, width = imageConfigs.previewImage.width, height = previewImage.height) {
  if (buffer === null) {
    return sharp().toFormat(format, { quality })
      .resize({ width, height, fit: 'inside', withoutEnlargement: true });
  } else {
    return sharp(buffer).toFormat(format, { quality })
      .resize({ width, height, fit: 'inside', withoutEnlargement: true })
  }
}