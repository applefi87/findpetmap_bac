// import Mongoose from 'mongoose';
import { trusted } from 'mongoose';
// import Article from '../models/articleModel.js';
import articleRepository from '../repositories/articleRepository.js'
// import { sanitizeArticle, sanitizeArticleList } from '../utils/sanitizePrivacy.js'
import { articleListPipeline } from '../utils/aggregationHelpers.js'

async function createArticleSession(articleObj, session) {
  return await articleRepository.createArticle([articleObj], { session })
}

async function getArticleList(reqBody, skip, limit, strUserId) {
  const { petType, color, location, lostDate, lostCityCode, lostDistrict, hasReward, rewardAmount, hasMicrochip } = reqBody
  // if some key not defined will not queery
  const filter = { petType, color, lostCityCode, lostDistrict, hasReward, rewardAmount, hasMicrochip }
  if (lostDate) {
    filter.lostDate = trusted({ $gt: lostDate })
  }

  const articleList = await articleRepository.aggregate(articleListPipeline(location.coordinates[0], location.coordinates[1], filter, skip, limit));
  if (!(articleList?.length > 0)) { return [] }
  return articleList
}

export default { createArticleSession, getArticleList }