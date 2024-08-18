import { trusted ,sanitizeFilter} from 'mongoose'
import imageRepository from '../repositories/imageRepository.js'

async function findImageListByArticleId(strArticleId, selectString = undefined, isLean = false) {
  return await imageRepository.findImageList({ resource: strArticleId, isDelete: false }, selectString, isLean)
}

async function findImageByIdSession(strImageId, selectString = undefined, isLean = false) {
  return await imageRepository.findOneImage({ _id: strImageId, isDelete: false }, selectString, isLean)
}

async function createImageSession(imageObj, session) {
  return await imageRepository.createImage([imageObj], { session })
}

async function deleteImageListByExceptIdListSession(strExceptOidArray, session) {
  return await imageRepository.updateManyImage({ _id: trusted({ $nin: strExceptOidArray }) }, { isDelete: true }, { session })
}

async function bulkUpdateImageListByIdSetPreview(updateImageList, session) {
  const updates = updateImageList.map(image => ({
    updateOne: {
      filter: { _id: image.id },
      update: { $set: { isPreview: image.isPreview } }
    }
  }));
  await imageRepository.bulkWriteImage(updates, { session });
}


export default {
  findImageListByArticleId, findImageByIdSession, createImageSession, deleteImageListByExceptIdListSession, bulkUpdateImageListByIdSetPreview
}