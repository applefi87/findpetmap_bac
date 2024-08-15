// 這裡都是可接受沒值，所以引用者要另外判斷

import anValidator from 'an-validator';
import articleConfigs from "../../infrastructure/configs/articleConfigs.js"
import { cityCodeList, cityCodeToAreaList } from "../../infrastructure/configs/cityConfigs.js"

import ValidationObjectError from '../../infrastructure/errors/ValidationObjectError.js';

const { rules, validateByRules } = anValidator;

export const validatePetType = (petType) => {
  if (checkNoValue(petType)) { return }
  if (!articleConfigs.petType.includes(petType)) {
    throw new ValidationObjectError(`petTypeInvalid`);
  }
};

export const validateColor = (petType, color) => {
  if (checkNoValue(color)) { return }
  validatePetType(petType)
  if (petType === '貓' && articleConfigs.catColorEnum.includes(color)) {
    return
  } else if (petType === '狗' && articleConfigs.dogColorEnum.includes(color)) {
    return
  }
  throw new ValidationObjectError(`colorInvalid`);
};

export const validateCoordinates = (coordinates) => {
  if (Array.isArray(coordinates) && coordinates.length === 2) {
    const [longitude, latitude] = coordinates;
    if (typeof longitude === 'number' && typeof latitude === 'number') {
      if (longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90) {
        return
      }
    }
  }
  throw new ValidationObjectError('coordinateInvalid');
};

export const validateLocation = (location) => {
  if (checkNoValue(location)) { return }
  if (location && typeof location === "object") {
    const { type, coordinates } = location;
    if (type === 'Point') {
      return validateCoordinates(coordinates);
    }
  }
  throw new ValidationObjectError('locationInvalid');
};

export const validateLostDate = (lostDate) => {
  if (checkNoValue(lostDate)) { return }
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
  if (checkNoValue(lostCityCode)) { return }
  if (!cityCodeList.includes(lostCityCode)) {
    throw new ValidationObjectError(`lostCityCodeInvalid`);
  }
};

export const validateLostDistrict = (lostCityCode, lostDistrict) => {
  if (lostCityCode) {
    validateLostCityCode(lostCityCode)
    if (lostDistrict) {
      if (!cityCodeToAreaList[lostCityCode].includes(lostDistrict)) {
        throw new ValidationObjectError('lostDistrictInvalid');
      }
    }
  } else {
    if (lostDistrict) { throw new ValidationObjectError('lostDistrictInvalid'); }
  }
};

export const validateHasReward = (hasReward) => {
  if (checkNoValue(hasReward)) { return }
  if (typeof hasReward !== 'boolean') {
    throw new ValidationObjectError('hasRewardInvalid');
  }
};

export const validateRewardAmount = (hasReward, rewardAmount) => {
  if (!hasReward) {
    if (rewardAmount == 0) {
      return
    }
  } else if (rewardAmount && typeof rewardAmount === 'number' && rewardAmount > 0) {
    return
  }
  throw new ValidationObjectError('rewardAmountInvalid');
};

export const validateSearchRewardAmount = (hasReward, rewardAmount) => {
  if (!hasReward) {
    if (!rewardAmount || rewardAmount == 0) {
      return
    }
  } else if (checkNoValue(rewardAmount)) {
    // 只差在查詢可以沒rewardAmount
    return
  } else
    if (typeof rewardAmount === 'number' && rewardAmount > 0) {
      return
    }
  throw new ValidationObjectError('rewardAmountInvalid');
};

export const validateHasMicrochip = (hasMicrochip) => {
  if (checkNoValue(hasMicrochip)) { return }
  if (typeof hasMicrochip !== 'boolean') {
    throw new ValidationObjectError('hasMicrochipInvalid');
  }
};

const articleContentLengthMin = articleConfigs.content.minLength
const articleContentLengthMax = articleConfigs.content.maxLength

export async function validateContent(content) {
  if (checkNoValue(content)) { return }
  const contentValidateResult = validateByRules(content, rules.createLengthBetweenRule(articleContentLengthMin, articleContentLengthMax))
  if (!contentValidateResult.success) throw new ValidationObjectError("articleContentBetween", { min: articleContentLengthMin, max: articleContentLengthMax });
}

// 這個都是可接受沒有
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

function checkNoValue(value) {
  return (value === null || value === undefined)
}