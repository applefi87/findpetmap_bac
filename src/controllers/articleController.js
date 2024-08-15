import mongoose from 'mongoose';
import ResponseHandler from '../middlewares/ResponseHandler.js';
// import Board from '../models/board.js';
// import ArticleImageList from '../models/articleImageList.js';
// import Draft from '../models/draft.js';

import ValidateObjectError from '../infrastructure/errors/ValidationObjectError.js'
import userService from '../services/userService.js'
import articleService from '../services/articleService.js'
// import imageService from '../services/imageService.js'

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
  const { id } = req.params;
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

    // Use findByIdAndUpdate with $set to update only the provided fields
    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, session }
    );

    if (!updatedArticle) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Article not found' });
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
  const strReqUserId = req.user?._id.toString()

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

// export async function updateArticleAndSaveImages(req, res) {
//   const targetArticle = req.resource
//   targetArticle.thumbnail = req.articleTextData.thumbnail
//   targetArticle.title = req.articleTextData.title;
//   targetArticle.content = req.articleTextData.content;
//   targetArticle.previewContent = req.articleTextData.previewContent;
//   //更新出文章圖片清單
//   const imageFullPathList = extractUniqueImageUrlsFromContent(targetArticle.content);
//   const session = await mongoose.startSession();
//   try {
//     session.startTransaction();
//     await targetArticle.save({ session });

//     //創文章後，要把草稿的圖片抓取並轉給 ArticleImageList 紀錄
//     //創文章，也是先建立文章在處理這部分，所以直接更新就好
//     //至於相關清除，放articleController處理
//     const strArticleId = targetArticle._id.toString()

//     let articleUpdateDraft = await articleUpdateDraftService.getArticleUpdateDraftByArticle(strArticleId, "imageList", true)
//     const haveArticleUpdateDraft = articleUpdateDraft
//     // 空的就是跑個流程，沒必要特地建
//     if (!haveArticleUpdateDraft) { articleUpdateDraft = { imageList: [] } }
//     const finalImageList = await imageService.getFinalImageListAndUpdateImage(imageFullPathList, articleUpdateDraft.imageList, session)
//     await articleImageListService.handleUpdateOneArticleImageListByArticle(strArticleId, finalImageList, session)
//     if (haveArticleUpdateDraft) {
//       await articleUpdateDraftService.deleteOneArticleUpdateDraftByArticle(strArticleId, session)
//     }
//     ResponseHandler.successObject(res, "articleUpdated", { title: req.articleTextData.title, content: req.articleTextData.content, previewContent: req.articleTextData.previewContent, thumbnail: req.articleTextData.thumbnail });
//     await session.commitTransaction();
//   } catch (error) {
//     await session.abortTransaction();
//     throw error;
//   } finally {
//     await session.endSession();
//   }

// }


// };

// // 首頁瀏覽最新文章，需要附帶版的資訊(類似dcard,也許之後會有透過文章id清單去抓取的功能)
// export const getArticleListWithBoard = async (req, res, next) => {
//   const skip = req.body.skip
//   const limit = req.body.limit
//   const validatedSkip = (typeof skip === "number" && skip >= 0) ? skip : 0
//   const validatedLimit = limit < 50 && limit > 5 ? limit : 20
//   const formatedArticleListWithBoard = await articleService.getFormatedArticleListWithBoard(req.interfaceLanguage, {}, req.body.lang, validatedSkip, validatedLimit, req.user?._id.toString())
//   ResponseHandler.successObject(res, "", { articleList: formatedArticleListWithBoard });
// };