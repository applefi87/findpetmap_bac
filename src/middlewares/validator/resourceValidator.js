import mongoose from 'mongoose'
// import { trusted } from 'mongoose'
import anValidator from 'an-validator';

import articleConfigs from '../../infrastructure/configs/articleConfigs.js'

import articleService from '../../services/articleService.js';

import * as articleValidator from "../../utils/validator/articleValidator.js"

// import commentService from '../../services/commentService.js';
// import { extractThumbnailUrl, getPlainTextPreview } from '../../infrastructure/utils/htmlTool.js';
import ValidationError from '../../infrastructure/errors/ValidationError.js'
import ValidationObjectError from '../../infrastructure/errors/ValidationObjectError.js'
import { languageValues } from '../../infrastructure/configs/languageOptions.js'

// import { validAllLangKeysHasValue } from loikjuo'../utils/validator/validAllLangKeys.js'
//email在驗證碼就檢查完，所以這邊不用再檢查了
const { rules, validateByRules } = anValidator;
// const window = new JSDOM('').window;
// const DOMPurify = createDOMPurify(window);

function validAllFieldsPresent(fields) {
  for (const key in fields) {
    // 因為有些選項是 false 依樣是有填
    if (fields[key] === null || fields[key] === undefined) {
      throw new ValidationObjectError(`${key}Invalid`);
    }
  }
}

export const validateCreateArticle = async (req, res, next) => {
  const { petType, color, content, location, lostDate, lostCityCode, lostDistrict, hasReward, rewardAmount, hasMicrochip } = req.body;

  const mustInputFields = { petType, color, content, location, lostDate, lostCityCode, lostDistrict, hasReward, hasMicrochip };
  validAllFieldsPresent(mustInputFields);

  articleValidator.validatePetType(petType)
  articleValidator.validateColor(petType, color)
  articleValidator.validateLocation(location)
  articleValidator.validateLostDate(lostDate);
  articleValidator.validateLostCityCode(lostCityCode);
  articleValidator.validateLostDistrict(lostCityCode, lostDistrict);

  articleValidator.validateContent(content)

  articleValidator.validateHasReward(hasReward) 
  articleValidator.validateRewardAmount(hasReward, rewardAmount);
  articleValidator.validateHasMicrochip(hasMicrochip);
  next()
};

export const validateUpdateArticle = async (req, res, next) => {
  const { petType, color, content, location, lostDate, lostCityCode, lostDistrict, hasReward, rewardAmount, hasMicrochip } = req.body;

  const mustInputFields = { petType, color, content, location, lostDate, lostCityCode, lostDistrict, hasReward,hasMicrochip };
  validAllFieldsPresent(mustInputFields);

  articleValidator.validatePetType(petType)
  articleValidator.validateColor(petType, color)
  articleValidator.validateLocation(location)
  articleValidator.validateLostDate(lostDate);
  articleValidator.validateLostCityCode(lostCityCode);
  articleValidator.validateLostDistrict(lostCityCode, lostDistrict);

  articleValidator.validateContent(content)

  articleValidator.validateHasReward(hasReward) 
  articleValidator.validateRewardAmount(hasReward, rewardAmount);
  articleValidator.validateHasMicrochip(hasMicrochip);
  next()
};

export const validateSearchArticleList = async (req, res, next) => {
  const { petType, color, location, lostDate, lostCityCode, lostDistrict, hasReward, rewardAmount, hasMicrochip } = req.body;
  // 查詢這幾項必填
  const mustInputFields = { petType, color, location };
  validAllFieldsPresent(mustInputFields);

  articleValidator.validatePetType(petType)
  articleValidator.validateColor(petType, color)
  articleValidator.validateLocation(location)
  articleValidator.validateLostDate(lostDate);
  articleValidator.validateLostCityCode(lostCityCode);
  articleValidator.validateLostDistrict(lostCityCode, lostDistrict);

  articleValidator.validateHasReward(hasReward) 
  articleValidator.validateRewardAmount(hasReward, rewardAmount);
  articleValidator.validateHasMicrochip(hasMicrochip);
  next()
};

export const validateGetArticleDetail = async (req, res, next) => {
  const strArticleId = req.params.id
  if (!mongoose.Types.ObjectId.isValid(strArticleId)) throw new ValidationObjectError("noArticle");
  next()
};