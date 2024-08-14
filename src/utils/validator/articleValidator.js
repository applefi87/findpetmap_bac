import anValidator from 'an-validator';
import User from '../../models/userModel.js'
import validateAndFormatEmail from '../../infrastructure/utils/validateAndFormatEmail.js'
import articleConfigs from "../../infrastructure/configs/articleConfigs.js"
import { cityCodeList, cityCodeToAreaList } from "../../infrastructure/configs/cityConfigs.js"

import ValidationObjectError from '../../infrastructure/errors/ValidationObjectError.js';

const { rules, validateByRules } = anValidator;

export const validatePetType = (petType) => {
  if (!articleConfigs.petType.includes(petType)) {
    throw new ValidationObjectError(`Invalid pet type: ${petType}`);
  }
};

export const validateColor = (petType, color) => {
  validatePetType(petType)
  if (petType === '貓' && articleConfigs.catColorEnum.includes(color)) {
    return
  } else if (petType === '狗' && articleConfigs.dogColorEnum.includes(color)) {
    return
  }
  throw new ValidationObjectError(`colorInvalid`);
};

export const validateCoordinate = (coordinate) => {
  if (Array.isArray(coordinate) && coordinate.length === 2) {
    const [longitude, latitude] = coordinate;
    if (typeof longitude === 'number' && typeof latitude === 'number') {
      if (longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90) {
        return
      }
    }
  }
  throw new ValidationObjectError('coordinateInvalid');
};

export const validateLocation = (location) => {
  if (location && typeof location === "object") {
    const { type, coordinates } = location;
    if (type === 'Point') {
      return validateCoordinate(coordinates);
    }
  }
  throw new ValidationObjectError('locationInvalid');
};

export const validateNotRequiredInput = (reqBody) => {
  validateBooleanInputColumns(reqBody);
};

export const validateLostDate = (lostDate) => {
  if (lostDate) {
    const lostDateObj = new Date(lostDate);
    if (!isNaN(lostDateObj) && lostDateObj.toString() !== 'Invalid Date') {
      const currentDate = new Date();
      //一定是之前遺失的
      if (lostDateObj <= currentDate) {
        return
      }
    }
  }
  throw new ValidationObjectError('lostDateInvalid');
};

export const validateLostCityCode = (lostCityCode) => {
  if (!cityCodeList.includes(lostCityCode)) {
    throw new ValidationObjectError(`lostCityCodeInvalid`);
  }
};

export const validateLostDistrict = (lostCityCode, lostDistrict) => {
  validateLostCityCode(lostCityCode)
  if (lostDistrict) {
    if (cityCodeToAreaList[lostCityCode].includes(lostDistrict)) {
      return
    }
  }
  throw new ValidationObjectError('lostDistrictInvalid');
};

export const validateRewardAmount = (hasReward, rewardAmount) => {
  if (!hasReward && rewardAmount) throw new ValidationObjectError('rewardAmount');
  if (typeof rewardAmount !== 'number' || rewardAmount < 0) {
    throw new ValidationObjectError('rewardAmount');
  }
};

export const validateBooleanInputColumns = (reqBody) => {
  const keys = ['hasReward', 'hasMicrochip'];
  for (const key of keys) {
    if (reqBody[key] !== undefined && reqBody[key] !== null) {
      if (typeof reqBody[key] !== 'boolean') {
        throw new ValidationObjectError(`${key} 必須為布林值或 null`);
      }
    }
  }
};

const articleContentLengthMin = articleConfigs.content.minLength
const articleContentLengthMax = articleConfigs.content.maxLength

export async function validateContent(content) {
  const contentValidateResult = validateByRules(content, rules.createLengthBetweenRule(articleContentLengthMin, articleContentLengthMax))
  if (!contentValidateResult.success) throw new ValidationObjectError("articleContentBetween", { min: articleContentLengthMin, max: articleContentLengthMax });
}
// export async function validateRoleCreation(req) {
//   try {
//     const role = req.body.role;
//     if (!(role?.length > 0)) throw new ValidationError('User role is empty');
//     if (role != 'user') {
//       const success = await Group.findOne({ role, users: req.body.account });
//       if (!success) throw new ValidationError('not authorized to create this role');
//     }
//     return { success: true };
//   } catch (error) {
//     throw error;
//   }
// }