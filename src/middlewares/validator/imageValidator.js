import mongoose from 'mongoose'
// import { trusted } from 'mongoose'
import anValidator from 'an-validator';

import articleConfigs from '../../infrastructure/configs/articleConfigs.js'
import imageConfigs from '../../infrastructure/configs/imageConfigs.js'

import imageService from '../../services/imageService.js';

import * as articleValidator from "../../utils/validator/articleValidator.js"

// import commentService from '../../services/commentService.js';
// import { extractThumbnailUrl, getPlainTextPreview } from '../../infrastructure/utils/htmlTool.js';
import ValidationError from '../../infrastructure/errors/ValidationError.js'
import ValidationObjectError from '../../infrastructure/errors/ValidationObjectError.js'

//email在驗證碼就檢查完，所以這邊不用再檢查了

const articleImageMaxAmount = imageConfigs.articleImage.maxAmount

export const validateArticleImageCountAndNoIsPreview = async (req, res, next) => {
  console.log("validateArticleImageCountAndNoIsPreview");
  const { isPreview } = req.body;
  const strArticleId = req.params.id
  const imageList = await imageService.findImageListByArticleId(strArticleId, "isPreview", true)
  if (imageList.length >= articleImageMaxAmount) {
    throw new ValidationObjectError({ key: "tooManyImages", data: { max: articleImageMaxAmount } });
  }
  const hasPreview = imageList.some(image => image.isPreview === true);
  // 因為預覽最多一個，預設前端第一張傳來的照片為預覽圖，但更新文章時，可能會現有兩張不預覽，新加的改預覽，所以要判斷是否有預覽
  // 重點就是 image 未刪除的，不可有已經預覽的，否則視為非預覽圖
  // 最糟情況就是有意外，所以用戶每張都是預覽，導致資料庫產生3次預覽圖最後只留一張，但算了
  req.isPreview = imageList.length === 0 ? true : ((!hasPreview && isPreview) || false)
  console.log("validateArticleImageCountAndNoIsPreview end", req.isPreview);
  next()
};