import { expect } from 'chai';
import sinon from 'sinon';
import * as articleValidator from '../../src/utils/validator/articleValidator.js';
import ValidationError from '../../src/infrastructure/errors/ValidationError.js';

describe('Article Validator', () => {
  describe('validatePetType', () => {
    it('should not throw an error for valid pet type', () => {
      const validPetType = '貓';
      expect(() => articleValidator.validatePetType(validPetType)).to.not.throw();
    });

    it('should throw an error for invalid pet type', () => {
      const invalidPetType = '兔子';
      expect(() => articleValidator.validatePetType(invalidPetType)).to.throw(ValidationError, 'petTypeInvalid');
    });

    it('should not throw an error if petType is undefined or null', () => {
      expect(() => articleValidator.validatePetType(undefined)).to.not.throw();
      expect(() => articleValidator.validatePetType(null)).to.not.throw();
    });
  });

  // describe('validateColor', () => {
  //   it('should not throw an error for valid color for cat', () => {
  //     const petType = '貓';
  //     const validColor = '橘';
  //     expect(() => articleValidator.validateColor(petType, validColor)).to.not.throw();
  //   });

  //   it('should not throw an error for valid color for dog', () => {
  //     const petType = '狗';
  //     const validColor = '黑';
  //     expect(() => articleValidator.validateColor(petType, validColor)).to.not.throw();
  //   });

  //   it('should throw an error for invalid color for pet type', () => {
  //     const petType = '貓';
  //     const invalidColor = '藍';
  //     expect(() => articleValidator.validateColor(petType, invalidColor)).to.throw(ValidationError, 'colorInvalid');
  //   });

  //   it('should throw an error for valid color but invalid pet type', () => {
  //     const petType = '兔子';
  //     const color = '黑';
  //     expect(() => articleValidator.validateColor(petType, color)).to.throw(ValidationError, 'petTypeInvalid');
  //   });

  //   it('should not throw an error if color is undefined or null', () => {
  //     const petType = '貓';
  //     expect(() => articleValidator.validateColor(petType, undefined)).to.not.throw();
  //     expect(() => articleValidator.validateColor(petType, null)).to.not.throw();
  //   });
  // });

  // describe('validateCoordinates', () => {
  //   it('should not throw an error for valid coordinates', () => {
  //     const validCoordinates = [121.5, 25.05];
  //     expect(() => articleValidator.validateCoordinates(validCoordinates)).to.not.throw();
  //   });

  //   it('should throw an error for invalid coordinates format', () => {
  //     const invalidCoordinates = ['invalid', 'invalid'];
  //     expect(() => articleValidator.validateCoordinates(invalidCoordinates)).to.throw(ValidationError, 'coordinateInvalid');
  //   });

  //   it('should throw an error for coordinates out of range', () => {
  //     const outOfRangeCoordinates = [200, 100];
  //     expect(() => articleValidator.validateCoordinates(outOfRangeCoordinates)).to.throw(ValidationError, 'coordinateInvalid');
  //   });
  // });

  // describe('validateLocation', () => {
  //   it('should not throw an error for valid location', () => {
  //     const validLocation = { type: 'Point', coordinates: [121.5, 25.05] };
  //     expect(() => articleValidator.validateLocation(validLocation)).to.not.throw();
  //   });

  //   it('should throw an error for invalid location format', () => {
  //     const invalidLocation = { type: 'Point', coordinates: ['invalid', 'invalid'] };
  //     expect(() => articleValidator.validateLocation(invalidLocation)).to.throw(ValidationError, 'locationInvalid');
  //   });

  //   it('should throw an error if location type is not Point', () => {
  //     const invalidLocation = { type: 'LineString', coordinates: [121.5, 25.05] };
  //     expect(() => articleValidator.validateLocation(invalidLocation)).to.throw(ValidationError, 'locationInvalid');
  //   });

  //   it('should not throw an error if location is undefined or null', () => {
  //     expect(() => articleValidator.validateLocation(undefined)).to.not.throw();
  //     expect(() => articleValidator.validateLocation(null)).to.not.throw();
  //   });
  // });

  // describe('validateLostDate', () => {
  //   it('should not throw an error for valid lost date', () => {
  //     const validLostDate = '2024-02-21';
  //     expect(() => articleValidator.validateLostDate(validLostDate)).to.not.throw();
  //   });

  //   it('should throw an error for invalid lost date', () => {
  //     const invalidLostDate = 'invalid-date';
  //     expect(() => articleValidator.validateLostDate(invalidLostDate)).to.throw(ValidationError, 'lostDateInvalid');
  //   });

  //   it('should throw an error if lost date is in the future', () => {
  //     const futureDate = '3024-02-21';
  //     expect(() => articleValidator.validateLostDate(futureDate)).to.throw(ValidationError, 'lostDateInvalid');
  //   });

  //   it('should not throw an error if lost date is undefined or null', () => {
  //     expect(() => articleValidator.validateLostDate(undefined)).to.not.throw();
  //     expect(() => articleValidator.validateLostDate(null)).to.not.throw();
  //   });
  // });

  // describe('validateLostCityCode', () => {
  //   it('should not throw an error for valid city code', () => {
  //     const validCityCode = 'A';
  //     expect(() => articleValidator.validateLostCityCode(validCityCode)).to.not.throw();
  //   });

  //   it('should throw an error for invalid city code', () => {
  //     const invalidCityCode = 'Z';
  //     expect(() => articleValidator.validateLostCityCode(invalidCityCode)).to.throw(ValidationError, 'lostCityCodeInvalid');
  //   });

  //   it('should not throw an error if lost city code is undefined or null', () => {
  //     expect(() => articleValidator.validateLostCityCode(undefined)).to.not.throw();
  //     expect(() => articleValidator.validateLostCityCode(null)).to.not.throw();
  //   });
  // });

  // describe('validateLostDistrict', () => {
  //   it('should not throw an error for valid district', () => {
  //     const validCityCode = 'A';
  //     const validDistrict = '內湖區';
  //     expect(() => articleValidator.validateLostDistrict(validCityCode, validDistrict)).to.not.throw();
  //   });

  //   it('should throw an error for invalid district in valid city code', () => {
  //     const validCityCode = 'A';
  //     const invalidDistrict = 'InvalidDistrict';
  //     expect(() => articleValidator.validateLostDistrict(validCityCode, invalidDistrict)).to.throw(ValidationError, 'lostDistrictInvalid');
  //   });

  //   it('should throw an error if district is provided but city code is invalid', () => {
  //     const invalidCityCode = 'Z';
  //     const district = '內湖區';
  //     expect(() => articleValidator.validateLostDistrict(invalidCityCode, district)).to.throw(ValidationError, 'lostCityCodeInvalid');
  //   });

  //   it('should not throw an error if both city code and district are undefined or null', () => {
  //     expect(() => articleValidator.validateLostDistrict(undefined, undefined)).to.not.throw();
  //     expect(() => articleValidator.validateLostDistrict(null, null)).to.not.throw();
  //   });
  // });

  // describe('validateHasReward', () => {
  //   it('should not throw an error for valid boolean hasReward', () => {
  //     expect(() => articleValidator.validateHasReward(true)).to.not.throw();
  //     expect(() => articleValidator.validateHasReward(false)).to.not.throw();
  //   });

  //   it('should throw an error for non-boolean hasReward', () => {
  //     expect(() => articleValidator.validateHasReward('true')).to.throw(ValidationError, 'hasRewardInvalid');
  //   });

  //   it('should not throw an error if hasReward is undefined or null', () => {
  //     expect(() => articleValidator.validateHasReward(undefined)).to.not.throw();
  //     expect(() => articleValidator.validateHasReward(null)).to.not.throw();
  //   });
  // });

  // describe('validateRewardAmount', () => {
  //   it('should not throw an error for valid reward amount when hasReward is true', () => {
  //     const hasReward = true;
  //     const rewardAmount = 5000;
  //     expect(() => articleValidator.validateRewardAmount(hasReward, rewardAmount)).to.not.throw();
  //   });

  //   it('should throw an error for invalid reward amount when hasReward is true', () => {
  //     const hasReward = true;
  //     const invalidRewardAmount = -5000;
  //     expect(() => articleValidator.validateRewardAmount(hasReward, invalidRewardAmount)).to.throw(ValidationError, 'rewardAmountInvalid');
  //   });

  //   it('should not throw an error for reward amount 0 when hasReward is false', () => {
  //     const hasReward = false;
  //     const rewardAmount = 0;
  //     expect(() => articleValidator.validateRewardAmount(hasReward, rewardAmount)).to.not.throw();
  //   });

  //   it('should throw an error if reward amount is not provided when hasReward is true', () => {
  //     const hasReward = true;
  //     expect(() => articleValidator.validateRewardAmount(hasReward, undefined)).to.throw(ValidationError, 'rewardAmountInvalid');
  //   });
  // });

  // describe('validateHasMicrochip', () => {
  //   it('should not throw an error for valid boolean hasMicrochip', () => {
  //     expect(() => articleValidator.validateHasMicrochip(true)).to.not.throw();
  //     expect(() => articleValidator.validateHasMicrochip(false)).to.not.throw();
  //   });

  //   it('should throw an error for non-boolean hasMicrochip', () => {
  //     expect(() => articleValidator.validateHasMicrochip('true')).to.throw(ValidationError, 'hasMicrochipInvalid');
  //   });

  //   it('should not throw an error if hasMicrochip is undefined or null', () => {
  //     expect(() => articleValidator.validateHasMicrochip(undefined)).to.not.throw();
  //     expect(() => articleValidator.validateHasMicrochip(null)).to.not.throw();
  //   });
  // });

  // describe('validateMicrochipNumber', () => {
  //   it('should not throw an error for valid microchip number when hasMicrochip is true', () => {
  //     const hasMicrochip = true;
  //     const validMicrochipNumber = '123456789012345';
  //     expect(() => articleValidator.validateMicrochipNumber(hasMicrochip, validMicrochipNumber)).to.not.throw();
  //   });

  //   it('should throw an error for invalid microchip number when hasMicrochip is true', () => {
  //     const hasMicrochip = true;
  //     const invalidMicrochipNumber = '123';
  //     expect(() => articleValidator.validateMicrochipNumber(hasMicrochip, invalidMicrochipNumber)).to.throw(ValidationError, 'microchipNumberInvalid');
  //   });

  //   it('should not throw an error if microchip number is undefined or null when hasMicrochip is false', () => {
  //     const hasMicrochip = false;
  //     expect(() => articleValidator.validateMicrochipNumber(hasMicrochip, undefined)).to.not.throw();
  //     expect(() => articleValidator.validateMicrochipNumber(hasMicrochip, null)).to.not.throw();
  //   });

  //   it('should throw an error if microchip number is not provided when hasMicrochip is true', () => {
  //     const hasMicrochip = true;
  //     expect(() => articleValidator.validateMicrochipNumber(hasMicrochip, undefined)).to.throw(ValidationError, 'microchipNumberInvalid');
  //   });
  // });

  // describe('validateContactName', () => {
  //   it('should not throw an error for valid contact name', () => {
  //     const validContactName = 'John Doe';
  //     expect(() => articleValidator.validateContactName(validContactName)).to.not.throw();
  //   });

  //   it('should throw an error for invalid contact name format', () => {
  //     const invalidContactName = 'J@hnDoe';
  //     expect(() => articleValidator.validateContactName(invalidContactName)).to.throw(ValidationError, 'contactNameInvalid');
  //   });

  //   it('should throw an error for contact name that is too long', () => {
  //     const longContactName = 'A'.repeat(51);
  //     expect(() => articleValidator.validateContactName(longContactName)).to.throw(ValidationError, 'contactNameInvalid');
  //   });

  //   it('should not throw an error if contact name is undefined or null', () => {
  //     expect(() => articleValidator.validateContactName(undefined)).to.not.throw();
  //     expect(() => articleValidator.validateContactName(null)).to.not.throw();
  //   });
  // });

  // describe('validateContactNumber', () => {
  //   it('should not throw an error for valid contact number', () => {
  //     const validContactNumber = '0912345678';
  //     expect(() => articleValidator.validateContactNumber(validContactNumber)).to.not.throw();
  //   });

  //   it('should throw an error for invalid contact number format', () => {
  //     const invalidContactNumber = '0912-345678';
  //     expect(() => articleValidator.validateContactNumber(invalidContactNumber)).to.throw(ValidationError, 'contactNumberInvalid');
  //   });

  //   it('should throw an error for contact number that is too long', () => {
  //     const longContactNumber = '091234567890';
  //     expect(() => articleValidator.validateContactNumber(longContactNumber)).to.throw(ValidationError, 'contactNumberInvalid');
  //   });

  //   it('should not throw an error if contact number is undefined or null', () => {
  //     expect(() => articleValidator.validateContactNumber(undefined)).to.not.throw();
  //     expect(() => articleValidator.validateContactNumber(null)).to.not.throw();
  //   });
  // });

  // describe('validateLineId', () => {
  //   it('should not throw an error for valid Line ID', () => {
  //     const validLineId = 'john_doe123';
  //     expect(() => articleValidator.validateLineId(validLineId)).to.not.throw();
  //   });

  //   it('should throw an error for invalid Line ID format', () => {
  //     const invalidLineId = 'john doe!';
  //     expect(() => articleValidator.validateLineId(invalidLineId)).to.throw(ValidationError, 'lineIdInvalid');
  //   });

  //   it('should throw an error for Line ID that is too long', () => {
  //     const longLineId = 'a'.repeat(51);
  //     expect(() => articleValidator.validateLineId(longLineId)).to.throw(ValidationError, 'lineIdInvalid');
  //   });

  //   it('should not throw an error if Line ID is undefined or null', () => {
  //     expect(() => articleValidator.validateLineId(undefined)).to.not.throw();
  //     expect(() => articleValidator.validateLineId(null)).to.not.throw();
  //   });
  // });

  // describe('validateContactEmail', () => {
  //   it('should not throw an error for valid email', () => {
  //     const validEmail = 'test@example.com';
  //     expect(() => articleValidator.validateContactEmail(validEmail)).to.not.throw();
  //   });

  //   it('should throw an error for invalid email format', () => {
  //     const invalidEmail = 'test@example';
  //     expect(() => articleValidator.validateContactEmail(invalidEmail)).to.throw(ValidationError, 'contactEmailInvalid');
  //   });

  //   it('should not throw an error if email is undefined or null', () => {
  //     expect(() => articleValidator.validateContactEmail(undefined)).to.not.throw();
  //     expect(() => articleValidator.validateContactEmail(null)).to.not.throw();
  //   });
  // });

  // describe('validateContactSocialMediaLink', () => {
  //   it('should not throw an error for valid social media link', () => {
  //     const validLink = 'https://www.facebook.com/johndoe';
  //     expect(() => articleValidator.validateContactSocialMediaLink(validLink)).to.not.throw();
  //   });

  //   it('should throw an error for invalid social media link format', () => {
  //     const invalidLink = 'invalid-url';
  //     expect(() => articleValidator.validateContactSocialMediaLink(invalidLink)).to.throw(ValidationError, 'contactSocialMediaLinkInvalid');
  //   });

  //   it('should not throw an error if social media link is undefined or null', () => {
  //     expect(() => articleValidator.validateContactSocialMediaLink(undefined)).to.not.throw();
  //     expect(() => articleValidator.validateContactSocialMediaLink(null)).to.not.throw();
  //   });
  // });
});
