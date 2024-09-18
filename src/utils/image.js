import sharp from "sharp";
import ValidationObjectError from '../infrastructure/errors/ValidationObjectError.js'
import UnknownError from '../infrastructure/errors/UnknownError.js'
import imageConfigs from '../infrastructure/configs/imageConfigs.js'

const previewQuality = imageConfigs.previewImage.quality
const previewWidth = imageConfigs.previewImage.width
const previewHeight = imageConfigs.previewImage.height
const normalQuality = imageConfigs.normalImage.quality
const normalWidth = imageConfigs.normalImage.width
const normalHeight = imageConfigs.normalImage.height

export async function processImage(buffer, format, isPreview = false) {
  try {
    if (['tiff', 'svg+xml'].includes(format)) {
      format = 'jpeg';
    }

    const allowedFormats = ['jpeg', 'png', 'webp'];
    if (!allowedFormats.includes(format)) {
      throw new ValidationObjectError("InvalidImageFormat", { format: "jpg,png,webp" });
    }

    const quality = isPreview ? previewQuality : normalQuality;
    const width = isPreview ? previewWidth : normalWidth;
    const height = isPreview ? previewHeight : normalHeight;

    return getSharpInstance(buffer, 'webp', quality, width, height).toBuffer();
  } catch (error) {
    throw new UnknownError(error, "src/utils/image.js");
  }
}

export function getSharpInstance(buffer = null, format = 'webp', quality = previewQuality, width = previewWidth, height = previewHeight) {
  if (buffer === null) {
    return sharp().toFormat(format, { quality })
      .resize({ width, height, fit: 'inside', withoutEnlargement: true });
  } else {
    return sharp(buffer).toFormat(format, { quality })
      .resize({ width, height, fit: 'inside', withoutEnlargement: true })
  }
}