import mongoose from 'mongoose';
import Article from '../models/articleModel.js'
import DatabaseError from '../infrastructure/errors/DatabaseError.js';

// const getArticleById = async (user, selectString = undefined) => {
//   return await Article.findById(req.params.id, selectString).where("isDelete").equals(false).populate({ path: "user", select: "nickname score profileImage.url badges" }).populate({ path: "board", select: "name" }).lean();
// }
async function aggregate(pipeline) {
  try {
    return await Article.aggregate(pipeline)
  } catch (error) {
    throw new DatabaseError(error, pipeline)
  }
}

async function createArticle(article, options) {
  try {
    return await Article.create(article, options)
  } catch (error) {
    throw new DatabaseError(error, article)
  }
}

async function findByIdAndUpdate(id, updateData, options) {
  try {
    return await Article.findByIdAndUpdate(id, updateData, { ...options, new: true })
  } catch (error) {
    throw new DatabaseError(error, { id, updateData, options })
  }
}

const getUserArticle = async (userId, selectString = undefined, isLean = false) => {
  try {
    if (!userId) { return [] }
    return await Article.find({ user: userId }, selectString).lean(isLean)
  } catch (error) {
    throw new DatabaseError(error, userId)
  }
}

const getArticleById = async (id, selectString = undefined, isLean = false) => {
  try {
    return await getArticle({ _id: id }, selectString, {}, isLean)
  } catch (error) {
    throw new DatabaseError(error, id)
  }
}

const getArticle = async (findBy, selectString = undefined, option = {}, isLean = false) => {
  try {
    return await Article.findOne(findBy, selectString, option).populate({
      path: 'user',
      select: 'nickname info',
    }).lean(isLean)
  } catch (error) {
    throw new DatabaseError(error, findBy)
  }
}



export default { aggregate, createArticle, findByIdAndUpdate, getArticleById, getUserArticle }