import mongoose from 'mongoose';
import ResponseHandler from '../middlewares/ResponseHandler.js';
import { calculateDistance } from '../infrastructure/utils/geoCalculationTool.js';
// import Board from '../models/board.js';
// import ArticleImageList from '../models/articleImageList.js';
// import Draft from '../models/draft.js';

import ValidateObjectError from '../infrastructure/errors/ValidationObjectError.js'

import imageService from '../services/imageService.js'
import previewImageService from '../services/previewImageService.js'
import articleService from '../services/articleService.js'
import s3Service from '../services/s3Service.js'
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
    await imageService.deleteImageListByExceptIdListSession(keepImageIdList, session);
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
        const originalImage = await imageService.findImageByIdSession(isPreviewImage.id, "isPreview fullPath", true);
        // 意外情況，用戶說有圖片但沒有，也不報錯持接跳過
        if (originalImage) {
          // 2. 
          if (!originalImage.isPreview) {
            const previewFullPath = originalImage.fullPath.replace("original/", "preview/");
            const previewImage = await previewImageService.findPreviewImageIgnoreDeleteByfullPath(previewFullPath)
            // 4.
            console.log("previewImage:", previewImage);
            if (previewImage) {
              await previewImageService.deletePreviewImageByArticleIdSession(strArticleId, session)
              previewImage.isDelete = false
              await previewImage.save();
            } else {
              // 3.
              await previewImageService.handlePreviewImage(strArticleId, isPreviewImage.id, previewFullPath, session)
              console.log(originalImage.fullPath, previewFullPath);
              const previewImageBuffer = await s3Service.processAndUploadImage(originalImage.fullPath, previewFullPath);
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
    const { bottomLeft, topRight, skip = 0, limit = 1000 } = req.body;
    // Validate Coordinates
    if (!bottomLeft || !topRight) {
      return res.status(400).json({ message: "Invalid coordinates provided" });
    }

    // Calculate width and height to ensure the region isn't too large (optional)
    const maxDistance = 50000; // 50 km, for example
    const bufferMultiplier = 1.5; // Add a buffer to the search area

    // Adjust bottomLeft and topRight to include a buffer
    const adjustedBottomLeft = {
      lat: bottomLeft.lat - (topRight.lat - bottomLeft.lat) * (bufferMultiplier - 1) / 2,
      lng: bottomLeft.lng - (topRight.lng - bottomLeft.lng) * (bufferMultiplier - 1) / 2,
    };

    const adjustedTopRight = {
      lat: topRight.lat + (topRight.lat - bottomLeft.lat) * (bufferMultiplier - 1) / 2,
      lng: topRight.lng + (topRight.lng - bottomLeft.lng) * (bufferMultiplier - 1) / 2,
    };

    // Rough estimation to check if the region is too large
    const estimatedDistance = calculateDistance(adjustedBottomLeft.lat, adjustedBottomLeft.lng, adjustedTopRight.lat, adjustedTopRight.lng);

    if (estimatedDistance > maxDistance) {
      return res.status(400).json({ message: "The requested area is too large." });
    }

    // Query the database using the adjusted coordinates
    const articles = await articleService.getArticleList(adjustedBottomLeft, adjustedTopRight, skip, limit, req.user?._id.toString());
    // If articles are found, send them back
    return res.json({ message: "success",success: true, data: { articles: articles, region: { bottomLeft: adjustedBottomLeft, topRight: adjustedTopRight } } })
  } catch (error) {
    next(error);
  }
};