import mongoose from 'mongoose';
import { trusted } from 'mongoose'
import Image from '../models/imageModel.js'
import PreviewImage from '../models/previewImageModel.js'
import imageService from '../services/imageService.js'
import articleService from '../services/articleService.js'
import previewImageService from '../services/previewImageService.js'
import s3Service from '../services/s3Service.js'
import generateFullPath from '../utils/string/generateDateFileName.js'
// // import User from '../models/user.js';
// // import ArticleImageList from '../models/articleImageList.js';
// // import { DatabaseError } from '../errors.js';
// // import { deleteImageFromImgur } from '../services/image.js'
// import imageConfigs from '../infrastructure/configs/imageConfigs.js'
import ResponseHandler from '../middlewares/ResponseHandler.js';
// import ValidateObjectError from '../infrastructure/errors/ValidationObjectError.js'
import { processImage } from '../utils/image.js';
// import { filterUniqueStringArray } from '../infrastructure/utils/stringTool.js'

export async function saveImage(req, res, next) {
  const strArticleId = req.params.id
  const newImageObj = {
    fullPath: "",
    resource: strArticleId
  }
  // 因為要用session + unique index, 所以用這順序可以一直試到不會有重複的並繼續session,不然失敗要記得關閉session
  //只有超大流量極少數會這樣
  let isSuccessCreatedImage = false
  let session;
  let preFullPath;
  let originalFullPath;
  let previewFullPath;
  let newImage
  // 先跑存進資料庫，因為最常是檔案類型有問題
  try {
    let errTimes = 0
    while (!isSuccessCreatedImage) {
      try {
        preFullPath = generateFullPath('webp');
        // **完整圖**
        originalFullPath = "original/" + preFullPath;
        newImageObj.fullPath = originalFullPath;
        newImageObj.isPreview = req.isPreview;
        //直接透過創建來避免unique的問題
        session = await mongoose.startSession();
        session.startTransaction();
        [newImage] = await imageService.createImageSession(newImageObj, session);
        // **預覽圖**
        if (req.isPreview) {
          previewFullPath = `preview/${preFullPath}`;
          await previewImageService.handlePreviewImage(strArticleId, newImage._id.toString(), previewFullPath, session)
          await articleService.setArticlePreviewImageFullPath(strArticleId, previewFullPath, session)
        }
        // 反正有問題會直接報錯，不會跑到這
        isSuccessCreatedImage = newImage
      } catch (error) {
        errTimes++
        if (session?.inTransaction()) {
          await session.abortTransaction();
          await session.endSession();
        }
        if (errTimes > 10) { throw error }
      }
    }
    // **上方都是記錄進資料庫，成功檔案才存進S3)**
    const { buffer, mimetype } = req.file;
    const format = mimetype.split('/')[1];
    const originalImageBuffer = await processImage(buffer, format);
    await s3Service.uploadImage(originalFullPath, originalImageBuffer);
    if (req.isPreview) {
      const previewImageBuffer = await processImage(buffer, format, true);
      await s3Service.uploadImage(previewFullPath, previewImageBuffer);
    }
    ResponseHandler.successObject(res, "", undefined, 201);
    await session.commitTransaction();
  } catch (error) {
    // 因為如果 while  那段有問題，就不能再跑 abort
    if (session?.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    // 因為如果 while  那段有問題，就不能再跑 end
    if (session && !session.hasEnded) {
      await session.endSession();
    }
  }
}


export async function clearOldDeletedImages(req, res, next) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const stringOneWeekAgo = oneWeekAgo.toLocaleDateString();
    // Find images to delete
    const imagesToDelete = await Image.find({
      isDelete: true,
      updatedAt: trusted({ $lte: stringOneWeekAgo }) // Ensure it's passed as a Date
    }).session(session);
    // Find preview images to delete
    const previewImagesToDelete = await PreviewImage.find({
      isDelete: true,
      updatedAt: trusted({ $lte: stringOneWeekAgo }), // Ensure it's passed as a Date
    }).session(session);

    // If no images to delete, respond accordingly
    if (imagesToDelete.length === 0 && previewImagesToDelete.length === 0) {
      await session.commitTransaction();
      session.endSession();
      return res.status(200).json({ message: 'No images to delete.' });
    }

    // Delete images
    await deleteImages(imagesToDelete, Image, session);
    await deleteImages(previewImagesToDelete, PreviewImage, session);

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ message: 'Old deleted images have been cleaned up.' });
  } catch (error) {
    // Rollback transaction if any error occurs
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    console.error('Error during image cleanup:', error);
    return res.status(500).json({ error: 'An error occurred while cleaning up images.' });
  }
}
// Helper function to delete images
const deleteImages = async (images, Model, session) => {
  // Process deletions in parallel
  const deletePromises = images.map(async (image) => {
    // Delete image from S3
    const s3DeleteResult = await s3Service.deleteImage(image.fullPath);
    if (!s3DeleteResult) {
      throw new Error(`Failed to delete image from S3: ${image.fullPath}`);
    }
    console.log(`Deleted image from S3: ${image.fullPath}`);
    // Remove the image record from the database
    await Model.deleteOne({ _id: image._id }).session(session);
  });

  // Wait for all deletions to complete
  await Promise.all(deletePromises);
};
// export function refreshDraftImageList(type) {
//   return async function (req, res, next) {
//     let target = await getOrCreateSomeDraft(type, req)
//     const session = await mongoose.startSession();
//     try {
//       session.startTransaction();
//       const { imageList } = req.body
//       if (!imageList || !Array.isArray(imageList)) {
//         throw new ValidateObjectError("validation.invalidType")
//       }
//       // 前端應該加工過，但防止意外
//       const uniqueImageList = filterUniqueStringArray(imageList)
//       const finalImageList = await imageService.getFinalImageListAndUpdateImage(uniqueImageList, target.imageList, session)
//       target.imageList = finalImageList
//       await target.save({ session })
//       await session.commitTransaction();
//       ResponseHandler.successObject(res, "", undefined, 201);
//     } catch (error) {
//       await session.abortTransaction();
//       throw error;
//     } finally {
//       session.endSession();
//     }
//   }
// }

// function validImageListAmount(target) {
//   const articleImageMaxAmount = imageConfigs.articleImage.maxAmount
//   if (target.imageList?.length >= articleImageMaxAmount) {
//     // 如果他發文上傳49張圖片，後面刪除最後的48張(後端不會知道)，導致文章清單超長
//     // 觸發他打個清理 imageList 的 api, 前端回傳目前文章有的本站圖片fullPath (超過50前端檔)，然後讓後端移除其時沒用到的,就可繼續上傳
//     // (可能要類似 api 觸發清洗,透過特殊的辨識httpcode)
//     throw new ValidateObjectError({ key: 'ImageMaxAmount' }, { max: articleImageMaxAmount }, 451)
//   }
// }

// // // 之後這存取articleImageList會變成編輯時用到
// // export async function saveImageUrlIntoTempImageList(req, res, next) {
// //   try {
// //     const image = new Image({ url: req.imageObj.link, deleteHash: req.imageObj.deletehash, entityType: 'Article' });
// //     const tempImageList = await TempImageList.findOne({ user: req.user._id });
// //     tempImageList.imageList.push(image._id)
// //     if (tempImageList.imageList.length > 100) {
// //       tempImageList.imageList = tempImageList.imageList.slice(-80);
// //     }
// //     await image.save();
// //     await tempImageList.save()
// //     res.status(200).json({ success: true, imageUrl: req.imageObj.link });
// //   } catch (error) {
// //     next(new DatabaseError('uploadingImageFailed', error))
// //   }
// // }

// // export async function saveImageUrlIntoUser(req, res, next) {
// //   const session = await mongoose.startSession();
// //   try {
// //     let oldImageOid = req.user.profileImage?.id
// //     session.startTransaction();
// //     const image = new Image({ url: req.imageObj.link, deleteHash: req.imageObj.deletehash, entityType: 'User' });
// //     req.user.profileImage = {
// //       url: image.url,
// //       id: image._id
// //     }
// //     await image.save({ session });
// //     await req.user.save({ session })
// //     if (oldImageOid) {
// //       const oldImage = await Image.findByIdAndDelete(oldImageOid)
// //       await session.commitTransaction();
// //       await deleteImageFromImgur(oldImage.deleteHash)
// //     } else {
// //       await session.commitTransaction();
// //     }
// //     res.status(200).json({ success: true, imageUrl: req.imageObj.link });
// //   } catch (err) {
// //     await session.abortTransaction();
// //     next(new DatabaseError('uploadingImageFailed', err))
// //   } finally {
// //     session.endSession();
// //   }
// // }