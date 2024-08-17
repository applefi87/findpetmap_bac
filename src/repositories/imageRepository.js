import { trusted } from 'mongoose'
import Image from '../models/imageModel.js'
import DatabaseError from '../infrastructure/errors/DatabaseError.js';

async function createImage(image, options) {
  try {
    return await Image.create(image, options)
  } catch (error) {
    throw new DatabaseError(error, { image, options })
  }
}

async function updateManyImage(filter, updateObj, options = {}) {
  try {
    return await Image.updateMany(
      filter, // Condition to match documents with given IDs
      updateObj, // Update operation
      options // Additional options for the update operation
    );
  } catch (error) {
    // throw new DatabaseError(error, { filter, updateObj, options });
  }
}


async function findImageList(filter, selectionString = undefined, isLean = false) {
  try {
    return await Image.find(filter, selectionString).lean(isLean);
  } catch (error) {
    throw new DatabaseError(error, { filter, selectionString, isLean });
  }
}


async function findOneImage(filter, selectionString = undefined, isLean = false) {
  try {
    return await Image.findOne(filter, selectionString).lean(isLean);
  } catch (error) {
    throw new DatabaseError(error, { filter, selectionString, isLean });
  }
}

async function bulkWriteImage(ops, options = {}) {
  try {
    return await Image.bulkWrite(ops, options);
  } catch (error) {
    throw new DatabaseError(error, { ops, options });
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

export default { createImage, updateManyImage, findImageList, findOneImage, bulkWriteImage }