import mongoose from 'mongoose';
import ResponseHandler from '../middlewares/ResponseHandler.js';
// import Board from '../models/board.js';
// import ArticleImageList from '../models/articleImageList.js';
// import Draft from '../models/draft.js';

import ValidateObjectError from '../infrastructure/errors/ValidationObjectError.js'

import imageService from '../services/imageService.js'
import previewImageService from '../services/previewImageService.js'
import articleService from '../services/articleService.js'
import { processImage } from '../utils/image.js';

// import { initializeDraftAndSave } from '../services/draft.js'
// import { deleteRedundantImages } from '../services/image.js'

import { splitImageList, extractUniqueImageUrlsFromContent } from '../infrastructure/utils/htmlTool.js';

export async function createArticle(req, res) {
  const { petType, color, content, location, lostDate, lostCityCode, lostDistrict, hasReward, rewardAmount, hasMicrochip } = req.body;
  const newArticleData = {
    user: req.user._id,
    petType,
    color,
    content,
    location,
    lostDate,
    lostCityCode,
    lostDistrict,
    hasReward,
    rewardAmount,
    hasMicrochip
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const [newArticle] = await articleService.createArticleSession(newArticleData, session);
    ResponseHandler.successObject(res, "articleCreated", newArticle, 201);
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}

export async function updateArticle(req, res) {
  const { id: strArticleId } = req.params;
  const { petType, color, content, location, lostDate, lostCityCode, lostDistrict, hasReward, rewardAmount, hasMicrochip } = req.body;
  const updateData = {
    user: req.user._id,
    petType,
    color,
    content,
    location,
    lostDate,
    lostCityCode,
    lostDistrict,
    hasReward,
    rewardAmount,
    hasMicrochip
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const updatedArticle = await articleService.updateArticleSession(strArticleId, updateData, session);
    const keepImageIdList = req.updateImageList.map(image => image.id);
    await imageService.deleteImageListByExceptIdListSession(keepImageIdList, false, session);
    if (req.updateImageList.length > 0) {
      // 假設進來的req.updateImageList 有2張圖 
      // 1.全無預覽(跳過) : 跳過，就讓預覽圖保留反正後續步驟會把它改掉，沒改掉也不影響
      // 2.不動(一個有預覽) : 偵測原本isPreview=true的圖片，又是isPreview=true=>不動
      // 3.增加預覽(沒有): 標準流程，建立預覽圖後更新
      // 4.重回預覽(原本有，但目前預覽圖是刪除狀態): 應該要建預覽圖，但是查詢該圖片fullPath已經有了(抓id)，所以把該resource所有預覽圖改isDelete=true & 對應id的改isDelete=false 就可以還原
     
      // 1.
      const previewImage = req.updateImageList.find(image => image.isPreview);
      if (previewImage) {
        const originalImage = await imageService.findImageByIdSession(previewImage.id, "isPreview", true);
        // 意外情況，用戶說有圖片但沒有，也不報錯持接跳過
        if (originalImage) {
          // 2. 
          if (!originalImage.isPreview) {
            const previewFullPath = originalImage.fullPath.replace("original/", "preview/");
            const previewImage = await previewImageService.findPreviewImageIgnoreDeleteByfullPath(previewFullPath)
            // 4.
            if (previewImage) {
              previewImage.isDelete = false
              await previewImage.save();
              await imageService.updateImageSession(previewImage.id, { isPreview: false }, session)
            } else {
              // 3.
              await previewImageService.handlePreviewImage(strArticleId, previewFullPath, session)
              const previewImageBuffer = await processImage(buffer, format, true);
              await s3Service.uploadImage(previewFullPath, previewImageBuffer);
            }
          }
        }
      }
      await imageService.bulkUpdateImageListByIdSetPreview(req.updateImageList, session)
    }
    ResponseHandler.successObject(res, "articleUpdated", updatedArticle, 200);
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}

export const deleteArticle = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const article = req.resource
    if (!article.isDelete) {
      article.isDelete = true
      await article.save({ session });
    }
    ResponseHandler.successObject(res, "articleDeleted");
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}

export const getArticleDetail = async (req, res, next) => {
  const strArticleId = req.params.id
  const formatedArticleListWithBoard = await articleService.getArticleById(
    strArticleId,
    null,
    true)
  if (!!formatedArticleListWithBoard) {
    ResponseHandler.successObject(res, "", { article: formatedArticleListWithBoard });
  } else {
    throw new ValidateObjectError("noArticle");
  }
};

export const searchArticleList = async (req, res, next) => {
  const skip = req.body.skip
  const limit = req.body.limit
  const validatedSkip = (typeof skip === "number" && skip >= 0) ? skip : 0
  const validatedLimit = limit < 50 && limit > 5 ? limit : 20

  const formatedArticleListWithBoard = await articleService.getArticleList(req.body, validatedSkip, validatedLimit, req.user?._id.toString())
  ResponseHandler.successObject(res, "", { articleList: formatedArticleListWithBoard });
};