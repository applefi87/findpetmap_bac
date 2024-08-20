// import Mongoose from 'mongoose';
import { trusted } from 'mongoose';
// import Article from '../models/articleModel.js';
import articleRepository from '../repositories/articleRepository.js'
// import { sanitizeArticle, sanitizeArticleList } from '../utils/sanitizePrivacy.js'
import { generateGetArticleListPipeline } from '../utils/aggregationHelpers.js'

async function createArticleSession(articleObj, session) {
  return await articleRepository.createArticle([articleObj], { session })
}

// async function getArticleList(reqBody, skip, limit, strUserId) {
//   const { petType, color, location, lostDate, lostCityCode, lostDistrict, hasReward, rewardAmount, hasMicrochip } = reqBody
//   // 部分可以被直接檢查後比對的參數
//   const filter = { petType, color, lostCityCode, lostDistrict, hasReward, hasMicrochip }
//   // 部分要被加工比對的參數
//   if (lostDate) {
//     filter.lostDate = trusted({ $gte: new Date(lostDate) })
//   }
//   if (rewardAmount) {
//     filter.rewardAmount = trusted({ $gte: rewardAmount })
//   }
//   // Remove keys with undefined values
//   for (let key in filter) {
//     if (filter[key] === undefined) {
//       delete filter[key];
//     }
//   }

//   const articleListPipeline = generateGetArticleListPipeline(location.coordinates[0], location.coordinates[1], filter, skip, limit)
//   // console.log(articleListPipeline[0]['$geoNear'].near, articleListPipeline[0]['$geoNear'].query);
//   const articleList = await articleRepository.aggregate(articleListPipeline);
//   if (!(articleList?.length > 0)) { return [] }
//   return articleList
// }
async function getArticleList(bottomLeft, topRight, skip, limit, userId) {
  const filter = { /* Any additional filters */ };

  // Generate the aggregation pipeline
  const pipeline = generateGetArticleListPipeline(bottomLeft, topRight, filter, skip, limit);

  const articleList = await articleRepository.aggregate(pipeline);
  return articleList;
}


const getArticleById = async (id, selectString = undefined, isLean = false) => {
  return await articleRepository.getArticleById(id, selectString, isLean)
}


async function updateArticleSession(id, articleObj, session) {
  return await articleRepository.findByIdAndUpdate(id, articleObj, { session })
}

export default { createArticleSession, getArticleList, updateArticleSession, getArticleById }