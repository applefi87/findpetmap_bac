import mongoose from 'mongoose';
import imageService from '../services/imageService.js'
import draftService from '../services/draftService.js'
import articleUpdateDraftService from '../services/articleUpdateDraftService.js'
import s3Service from '../services/s3Service.js'
import generateFullPath from '../utils/string/generateDateFileName.js'
// import Draft from '../models/draftModel.js';
// import TempImageList from '../models/tempImageList.js';
// import User from '../models/user.js';
// import ArticleImageList from '../models/articleImageList.js';
// import { DatabaseError } from '../errors.js';
// import { deleteImageFromImgur } from '../services/image.js'
import imageConfigs from '../infrastructure/configs/imageConfigs.js'
import ResponseHandler from '../middlewares/ResponseHandler.js';
import ValidateObjectError from '../infrastructure/errors/ValidationObjectError.js'
import { processImage } from '../utils/image.js';
import { filterUniqueStringArray } from '../infrastructure/utils/stringTool.js'

export function saveImageIntoSomeDraft(type) {
  return async function (req, res, next) {
    let target = await getOrCreateSomeDraft(type, req)
    validImageListAmount(target)
    const newImage = {
      path: "",
      fileName: "",
      resourceUsageCount: 1
    }
    // 因為要用session + unique index, 所以用這順序可以一直試到不會有重複的並繼續session,不然失敗要記得關閉session
    //只有超大流量極少數會這樣
    let createdImage = false
    let session;
    let fullPath;
    const { buffer, mimetype } = req.file;
    const format = mimetype.split('/')[1];
    const processedBuffer = await processImage(buffer, format);
    try {
      let errTimes = 0
      while (!createdImage) {
        try {
          fullPath = generateFullPath(format);
          newImage.fullPath = fullPath;
          //直接透過創建來避免unique的問題
          session = await mongoose.startSession();
          session.startTransaction();
          const [images] = await imageService.createImageSession(newImage, session);
          createdImage = images
        } catch (error) {
          errTimes++
          await session.abortTransaction();
          await session.endSession();
          if (errTimes > 10) { throw error }
        }
      }
      const imageUrl = await s3Service.uploadImage(fullPath, processedBuffer, mimetype);
      target.imageList.push({ id: createdImage._id.toString(), fullPath: fullPath })
      await target.save({ session })
      ResponseHandler.successObject(res, "", imageUrl, 201);
      await session.commitTransaction();
    } catch (error) {
      // 因為如果 while  那段有問題，就不能在跑 abort
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      // 因為如果 while  那段有問題，就不能在跑 end
      if (!session.hasEnded) {
        await session.endSession();
      }
    }
  }
}

export function refreshDraftImageList(type) {
  return async function (req, res, next) {
    let target = await getOrCreateSomeDraft(type, req)
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const { imageList } = req.body
      if (!imageList || !Array.isArray(imageList)) {
        throw new ValidateObjectError("validation.invalidType")
      }
      // 前端應該加工過，但防止意外
      const uniqueImageList = filterUniqueStringArray(imageList)
      const finalImageList = await imageService.getFinalImageListAndUpdateImage(uniqueImageList, target.imageList, session)
      target.imageList = finalImageList
      await target.save({ session })
      await session.commitTransaction();
      ResponseHandler.successObject(res, "", undefined, 201);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

async function getOrCreateSomeDraft(type, req) {
  let target
  switch (type) {
    case "Draft":
      target = await draftService.getOrCreateDraftByUser(req.user._id.toString(), "imageList")
      break;
    case "ArticleUpdateDraft":
      target = await articleUpdateDraftService.getOrCreateArticleUpdateDraftByArticle(req.params.id, "imageList")
      break;
    default:
      throw new ValidateObjectError("invalid saveImageIntoArticleUpdateDraft(type)")
    // break;
  }
  return target
}

function validImageListAmount(target) {
  const articleImageMaxAmount = imageConfigs.articleImage.maxAmount
  if (target.imageList?.length >= articleImageMaxAmount) {
    // 如果他發文上傳49張圖片，後面刪除最後的48張(後端不會知道)，導致文章清單超長
    // 觸發他打個清理 imageList 的 api, 前端回傳目前文章有的本站圖片fullPath (超過50前端檔)，然後讓後端移除其時沒用到的,就可繼續上傳
    // (可能要類似 api 觸發清洗,透過特殊的辨識httpcode)
    throw new ValidateObjectError({ key: 'ImageMaxAmount' }, { max: articleImageMaxAmount }, 451)
  }
}

// // 之後這存取articleImageList會變成編輯時用到
// export async function saveImageUrlIntoTempImageList(req, res, next) {
//   try {
//     const image = new Image({ url: req.imageObj.link, deleteHash: req.imageObj.deletehash, entityType: 'Article' });
//     const tempImageList = await TempImageList.findOne({ user: req.user._id });
//     tempImageList.imageList.push(image._id)
//     if (tempImageList.imageList.length > 100) {
//       tempImageList.imageList = tempImageList.imageList.slice(-80);
//     }
//     await image.save();
//     await tempImageList.save()
//     res.status(200).json({ success: true, imageUrl: req.imageObj.link });
//   } catch (error) {
//     next(new DatabaseError('uploadingImageFailed', error))
//   }
// }

// export async function saveImageUrlIntoUser(req, res, next) {
//   const session = await mongoose.startSession();
//   try {
//     let oldImageOid = req.user.profileImage?.id
//     session.startTransaction();
//     const image = new Image({ url: req.imageObj.link, deleteHash: req.imageObj.deletehash, entityType: 'User' });
//     req.user.profileImage = {
//       url: image.url,
//       id: image._id
//     }
//     await image.save({ session });
//     await req.user.save({ session })
//     if (oldImageOid) {
//       const oldImage = await Image.findByIdAndDelete(oldImageOid)
//       await session.commitTransaction();
//       await deleteImageFromImgur(oldImage.deleteHash)
//     } else {
//       await session.commitTransaction();
//     }
//     res.status(200).json({ success: true, imageUrl: req.imageObj.link });
//   } catch (err) {
//     await session.abortTransaction();
//     next(new DatabaseError('uploadingImageFailed', err))
//   } finally {
//     session.endSession();
//   }
// }