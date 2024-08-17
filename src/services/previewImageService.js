import { trusted } from 'mongoose'
import { processImage } from '../utils/image.js';
import previewImageRepository from '../repositories/previewImageRepository.js'

async function createPreviewImageSession(imageObj, session) {
  return await previewImageRepository.createPreviewImage([imageObj], { session })
}

async function deletePreviewImageByArticleIdSession(strArticleId, session) {
  return await previewImageRepository.updateManyPreviewImage({ resource: strArticleId }, { isDelete: true }, { session })
}


export async function handlePreviewImage(strArticleId, previewFullPath, session) {
  //預覽圖只有一張，所以把舊的改成刪除
  await deletePreviewImageByArticleIdSession(strArticleId, session);
  const newPreviewImage = {
    fullPath: previewFullPath,
    resource: strArticleId
  };
  await createPreviewImageSession(newPreviewImage, session);
}

async function findPreviewImageIgnoreDeleteByfullPath(strFullPath, selectString = "isDelete", isLean = false) {
  return await imageRepository.findOnePreviewImage({ fullPath: strFullPath }, selectString, isLean)
}


export default { createPreviewImageSession, deletePreviewImageByArticleIdSession, handlePreviewImage, findPreviewImageIgnoreDeleteByfullPath }