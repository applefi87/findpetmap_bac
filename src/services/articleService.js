import Mongoose from 'mongoose';
import Article from '../models/articleModel.js';
import articleRepository from '../repositories/articleRepository.js'
// import { sanitizeArticle, sanitizeArticleList } from '../utils/sanitizePrivacy.js'
// import { articleListWithBoardPipeline } from '../utils/aggregationHelpers.js'

async function createArticleSession(articleObj, session) {
  return await articleRepository.createArticle([articleObj], { session })
}

export default { createArticleSession }