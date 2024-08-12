import { trusted } from 'mongoose'
import Image from '../models/imageModel.js'
import DatabaseError from '../infrastructure/errors/DatabaseError.js';

async function createImage(image, options) {
  try {
    return await Image.create(image, options)
  } catch (error) {
    throw new DatabaseError(error, image)
  }
}

async function updateImagesByOids(oids, updateObj, options = {}) {
  return await updateImages(
    { _id: trusted({ $in: oids }) },
    updateObj,
    options)
}

async function updateImagesByFullPaths(fullPaths, updateObj, options = {}) {
  return await updateImages(
    { fullPath: trusted({ $in: fullPaths }) },
    updateObj,
    options)
}

async function updateImages(filter, updateObj, options = {}) {
  try {
    return await Image.updateMany(
      filter, // Condition to match documents with given IDs
      updateObj, // Update operation
      options // Additional options for the update operation
    );
  } catch (error) {
    throw new DatabaseError(error, { ids: oids, updateObj });
  }
}

async function findImages(filter, selectionString = undefined, isLean = false) {
  try {
    return await Image.find(filter, selectionString).lean(isLean);
  } catch (error) {
    throw new DatabaseError(error, filter);
  }
}

// async function updateManyImages(matchRule, updateData, options) {
//   try {
//     const result = await Image.updateMany(matchRule, updateData, options);
//     return result;
//   } catch (error) {
//     throw new DatabaseError(error, { matchRule, updateData, options });
//   }
// }

export default { createImage, updateImagesByOids, updateImagesByFullPaths, findImages }