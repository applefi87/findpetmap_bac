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

export const searchArticleList = async (req, res, next) => {
  const skip = req.body.skip
  const limit = req.body.limit
  const validatedSkip = (typeof skip === "number" && skip >= 0) ? skip : 0
  const validatedLimit = limit < 50 && limit > 5 ? limit : 20

  const formatedArticleListWithBoard = await articleService.getArticleList(req.body, validatedSkip, validatedLimit, req.user?._id.toString())
  ResponseHandler.successObject(res, "", { articleList: formatedArticleListWithBoard });
};