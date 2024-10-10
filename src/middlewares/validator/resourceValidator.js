import mongoose from 'mongoose'
import { trusted } from 'mongoose'

import * as articleValidator from "../../utils/validator/articleValidator.js"
import ValidationError from '../../infrastructure/errors/ValidationError.js'
import ValidationObjectError from '../../infrastructure/errors/ValidationObjectError.js'


function validAllFieldsPresent(fields) {
  for (const key in fields) {
    // 因為有些選項是 false 依樣是有填
    if (fields[key] === null || fields[key] === undefined) {
      throw new ValidationObjectError(`${key}Invalid`);
    }
  }
}

export const validateCreateArticle = (req, res, next) => {
  basicValidateArticle(req)
  next()
};

function basicValidateArticle(req) {
  const { petType, color, content, title, gender, age, breed, size, location, lostDate, lostCityCode, lostDistrict, hasReward, rewardAmount, hasMicrochip } = req.body;

  // 只有 rewardAmount 非必填
  const mustInputFields = { petType, color, content, title, gender, age, breed, size, location, lostDate, lostCityCode, lostDistrict, hasReward, hasMicrochip };
  validAllFieldsPresent(mustInputFields)

  articleValidator.validatePetType(petType)
  articleValidator.validateColor(petType, color)
  articleValidator.validateLocation(location)
  articleValidator.validateLostDate(lostDate);
  articleValidator.validateLostCityCode(lostCityCode);
  articleValidator.validateLostDistrict(lostCityCode, lostDistrict);

  articleValidator.validateGender(gender)
  articleValidator.validateAge(age)
  articleValidator.validateBreed(petType, breed)
  articleValidator.validateSize(size)

  articleValidator.validateTitle(title)
  articleValidator.validateContent(content)

  articleValidator.validateHasReward(hasReward)
  articleValidator.validateRewardAmount(hasReward, rewardAmount);
  articleValidator.validateHasMicrochip(hasMicrochip);
}

export const validateUpdateArticle = (req, res, next) => {
  basicValidateArticle(req)
  articleValidator.validUpdateImageList(req);
  next()
};

export const validateSearchArticleList = async (req, res, next) => {
  const { bottomLeft, topRight, filter } = req.body;
  const { skip, limit, petType, color, gender, age, breed, size, lostDate, lostCityCode, lostDistrict, hasReward, rewardAmount, hasMicrochip } = filter

  const mustInputFields = { bottomLeft, topRight };
  validAllFieldsPresent(mustInputFields);
  articleValidator.validateRegionDistance(bottomLeft, topRight)
  articleValidator.validateSearchSkip(skip)
  articleValidator.validateSearchLimit(limit)
  // 只有 rewardAmount 非必填
  // 查詢這幾項必填
  // const mustInputFields = { petType, color, location };
  // validAllFieldsPresent(mustInputFields);

  articleValidator.validatePetType(petType)
  articleValidator.validateColor(petType, color)
  articleValidator.validateGender(gender)
  articleValidator.validateAge(age)
  articleValidator.validateBreed(petType, breed)
  articleValidator.validateSize(size)
  // articleValidator.validateLocation(location)
  articleValidator.validateLostDate(lostDate);
  articleValidator.validateLostCityCode(lostCityCode);
  articleValidator.validateLostDistrict(lostCityCode, lostDistrict);

  articleValidator.validateHasReward(hasReward)
  // 查詢這部分邏輯不同
  articleValidator.validateSearchRewardAmount(hasReward, rewardAmount);
  articleValidator.validateHasMicrochip(hasMicrochip);
  req.filter = Object.fromEntries(
    Object.entries({ petType, color, gender, age, breed, size, lostDate, lostCityCode, lostDistrict, hasReward, rewardAmount, hasMicrochip })
      .filter(([key, value]) => value !== undefined)
  );
  if (req.filter.rewardAmount) { req.filter.rewardAmount = trusted({ $gte: req.filter.rewardAmount }) }
  if (req.filter.lostDate) { req.filter.lostDate = trusted({ $gte: new Date(lostDate) }) }
  next()
};

export const validateGetArticleDetail = async (req, res, next) => {
  const strArticleId = req.params.id
  if (!mongoose.Types.ObjectId.isValid(strArticleId)) throw new ValidationObjectError("noArticle");
  next()
};