import { trusted } from 'mongoose'
import PreviewImage from '../models/previewImageModel.js'
import DatabaseError from '../infrastructure/errors/DatabaseError.js';

async function createPreviewImage(image, options) {
  try {
    return await PreviewImage.create(image, options)
  } catch (error) {
    throw new DatabaseError(error, image)
  }
}

async function updateManyPreviewImage(filter, updateObject = {}, options = {}) {
  try {
    return await PreviewImage.updateMany(filter, updateObject, options)
  } catch (error) {
    throw new DatabaseError(error, { filter, updateObject, options })
  }
}

async function findOnePreviewImage(filter, selectionString = undefined, isLean = false) {
  try {
    return await PreviewImage.findOne(filter, selectionString).lean(isLean);
  } catch (error) {
    throw new DatabaseError(error, filter);
  }
}

export default { createPreviewImage, updateManyPreviewImage,findOnePreviewImage }