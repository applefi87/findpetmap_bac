import imageService from '../services/imageService.js';
import articleRepository from '../repositories/articleRepository.js'
import { generateGetArticleListPipeline } from '../utils/aggregationHelpers.js'

async function createArticleSession(articleObj, session) {
  return await articleRepository.createArticle([articleObj], { session })
}

async function getArticleList(bottomLeft, topRight, filter, skip, limit, userId) {
  const pipeline = generateGetArticleListPipeline(bottomLeft, topRight, filter, skip, limit);
  const articleList = await articleRepository.aggregate(pipeline);
  return articleList;
}

const getArticleDetailById = async (id, selectString = undefined, isLean = false) => {
  const article = await articleRepository.getArticleById(id, selectString, isLean)
  if (!article) { return null }
  const images = await imageService.findImageListByArticleId(article._id, "id fullPath isPreview", true)
  article.images = images;
  return article;
}


const getArticleById = async (id, selectString = undefined, isLean = false) => {
  return await articleRepository.getArticleById(id, selectString, isLean)
}

const getUserArticle = async (userId, selectString = undefined, isLean = false) => {
  return await articleRepository.getUserArticle(userId, selectString, isLean)
}

async function updateArticleSession(id, articleObj, session) {
  return await articleRepository.findByIdAndUpdate(id, articleObj, { session })
}

async function setArticlePreviewImageFullPath(id, previewImageFullPath, session) {
  return await articleRepository.findByIdAndUpdate(id, { previewImageFullPath }, { session })
}

export default { createArticleSession, getArticleList, updateArticleSession, getArticleById, getUserArticle, getArticleDetailById, setArticlePreviewImageFullPath }