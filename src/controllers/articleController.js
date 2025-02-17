import mongoose from 'mongoose';
import ResponseHandler from '../middlewares/ResponseHandler.js';

import { extendRegion } from '../utils/geo/region.js';
// import Board from '../models/board.js';
// import ArticleImageList from '../models/articleImageList.js';
// import Draft from '../models/draft.js';

import ValidateObjectError from '../infrastructure/errors/ValidationObjectError.js'

import imageService from '../services/imageService.js'
import previewImageService from '../services/previewImageService.js'
import articleService from '../services/articleService.js'
import s3Service from '../services/s3Service.js'
import articleConfigs from '../infrastructure/configs/articleConfigs.js';

export async function createArticle(req, res) {
  const { petType, color, content, title, gender, age, breed, size, location, lostDate, lostCityCode, lostDistrict, hasReward, rewardAmount, hasMicrochip } = req.body;
  const newArticleData = {
    user: req.user._id,
    petType,
    color,
    title,
    content,
    gender,
    age,
    breed,
    size,
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
    ResponseHandler.successObject(res, "articleCreated", newArticle, 200);
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
  const { petType, color, content, title, gender, age, breed, size, location, lostDate, lostCityCode, lostDistrict, hasReward, rewardAmount, hasMicrochip } = req.body;
  const updateData = {
    user: req.user._id,
    petType,
    color,
    title,
    content,
    gender,
    age,
    breed,
    size,
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
    await imageService.deleteArticleImagesByExceptIdsSession(keepImageIdList, strArticleId, session);
    if (req.updateImageList.length > 0) {
      // 預設情況: 本來就要有建立的圖片2張+有預覽圖1張
      // 大邏輯: 預覽圖，只有在增加後才會把舊的改刪除(確保不會沒圖)
      // 所以有不同的因應情形: 
      // 1.沒有續用圖: 把舊的全改isDelete，而預覽圖不能被刪除，反正後續步驟會把它改掉，沒改掉也不影響
      // 2.不動預覽狀態，可能一張沒續用(一個有預覽) : 那一張被改刪除&&預覽圖不能被刪除
      // 3.增加預覽(沒有): 兩張有一張新改成預覽圖，所以除了圖片欄位改，舊預覽要刪除+建新預覽
      // 4.重回預覽(原本有，但目前預覽圖是刪除狀態): 該預計預覽的路徑已經有了(取得id)，所以把該resource所有預覽圖刪除&對應id的不可為刪除
      // 1.
      const isPreviewImage = req.updateImageList.find(image => image.isPreview);
      if (isPreviewImage) {

        const newIsPreviewImage = await imageService.findImageByIdSession(isPreviewImage.id, "isPreview fullPath", true);
        // 意外情況，用戶說有圖片id但沒有，不用報錯直接跳過
        if (newIsPreviewImage) {
          const previewFullPath = newIsPreviewImage.fullPath.replace("original/", "preview/");
          // 原本就是預覽圖，不用做任何事
          if (newIsPreviewImage.isPreview) { ; }
          // 2. 
          else {
            const previewImage = await previewImageService.findPreviewImageIgnoreDeleteByfullPath(previewFullPath)
            // 4.
            if (previewImage) {
              await previewImageService.deletePreviewImageByArticleIdSession(strArticleId, session)
              previewImage.isDelete = false
              await previewImage.save();
            } else {
              // 3.
              await previewImageService.handlePreviewImage(strArticleId, isPreviewImage.id, previewFullPath, session)
              await s3Service.processAndUploadImage(newIsPreviewImage.fullPath, previewFullPath);
            }
          }
          await articleService.setArticlePreviewImageFullPath(strArticleId, previewFullPath, session)
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
  const article = await articleService.getArticleDetailById(
    strArticleId,
    null,
    true)
  formatArticleWithIsSelf(article, req._id)
  if (!!article) {
    ResponseHandler.successObject(res, "", { article: article });
  } else {
    throw new ValidateObjectError("noArticle");
  }
};

const formatArticleWithIsSelf = (articleDocument, userId) => {
  if (articleDocument && userId) {
    if (articleDocument.user._id.toString() === userId) {
      articleDocument.isSelf = true
    }
  }
}

// export const searchArticleList = async (req, res, next) => {
//   const skip = req.body.skip
//   const limit = req.body.limit
//   const validatedSkip = (typeof skip === "number" && skip >= 0) ? skip : 0
//   const validatedLimit = limit < 50 && limit > 5 ? limit : 20

//   const formatedArticleListWithBoard = await articleService.getArticleList(req.body, validatedSkip, validatedLimit, req.user?._id.toString())
//   ResponseHandler.successObject(res, "", { articleList: formatedArticleListWithBoard });
// };
export const searchArticleList = async (req, res, next) => {
  try {
    const formatedFilter = req.filter || {}
    const { bottomLeft, topRight, skip = 0, limit = articleConfigs.search.limit } = req.body;
    const { adjustedBottomLeft, adjustedTopRight } = extendRegion(bottomLeft, topRight);

    const articles = await articleService.getArticleList(adjustedBottomLeft, adjustedTopRight, formatedFilter, skip, limit, req.user?._id.toString());

    return ResponseHandler.successObject(res, "", { articles: articles, region: { bottomLeft: adjustedBottomLeft, topRight: adjustedTopRight } });
  } catch (error) {
    next(error);
  }
};

export const searchMyArticle = async (req, res, next) => {
  try {
    return ResponseHandler.successObject(res, "", await articleService.getUserArticle(req.user?._id.toString()));
  } catch (error) {
    next(error);
  }
};