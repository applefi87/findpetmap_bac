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
      expect(() => articleValidator.validatePetType(invalidPetType)).to.throw(ValidationError)
        .and.to.satisfy((error) => {
          return error.validationResult.message.title === 'petTypeInvalid';
        });
    });

    it('should not throw an error if petType is undefined or null', () => {
      expect(() => articleValidator.validatePetType(undefined)).to.not.throw();
      expect(() => articleValidator.validatePetType(null)).to.not.throw();
    });
  });

  describe('validateColor', () => {
    it('should not throw an error for valid color for cat', () => {
      const petType = '貓';
      const validColor = '橘';
      expect(() => articleValidator.validateColor(petType, validColor)).to.not.throw();
    });

    it('should not throw an error for valid color for dog', () => {
      const petType = '狗';
      const validColor = '黑';
      expect(() => articleValidator.validateColor(petType, validColor)).to.not.throw();
    });

    it('should throw an error for invalid color for pet type', () => {
      const petType = '貓';
      const invalidColor = '藍';
      expect(() => articleValidator.validateColor(petType, invalidColor)).to.throw(ValidationError)
        .and.to.satisfy((error) => {
          return error.validationResult.message.title === 'colorInvalid';
        });
    });

    it('should throw an error for valid color but invalid pet type', () => {
      const petType = '兔子';
      const color = '黑';
      expect(() => articleValidator.validateColor(petType, color)).to.throw(ValidationError)
        .and.to.satisfy((error) => {
          return error.validationResult.message.title === 'petTypeInvalid';
        });
    });

    it('should not throw an error if color is undefined or null', () => {
      const petType = '貓';
      expect(() => articleValidator.validateColor(petType, undefined)).to.not.throw();
      expect(() => articleValidator.validateColor(petType, null)).to.not.throw();
    });
  });

  describe('validateCoordinates', () => {
    it('should not throw an error for valid coordinates', () => {
      const validCoordinates = [121.5, 25.05];
      expect(() => articleValidator.validateCoordinates(validCoordinates)).to.not.throw();
    });

    it('should throw an error for invalid coordinates format', () => {
      const invalidCoordinates = ['invalid', 'invalid'];
      expect(() => articleValidator.validateCoordinates(invalidCoordinates)).to.throw(ValidationError)
        .and.to.satisfy((error) => {
          return error.validationResult.message.title === 'coordinateInvalid';
        });
    });

    it('should throw an error for coordinates out of range', () => {
      const outOfRangeCoordinates = [200, 100];
      expect(() => articleValidator.validateCoordinates(outOfRangeCoordinates)).to.throw(ValidationError)
        .and.to.satisfy((error) => {
          return error.validationResult.message.title === 'coordinateInvalid';
        });
    });
  });

  describe('validateLocation', () => {
    it('should not throw an error for valid location', () => {
      const validLocation = { type: 'Point', coordinates: [121.5, 25.05] };
      expect(() => articleValidator.validateLocation(validLocation)).to.not.throw();
    });

    it('should throw an error for invalid location format', () => {
      const invalidLocation = { type: 'Point', coordinates: ['invalid', 'invalid'] };
      expect(() => articleValidator.validateLocation(invalidLocation)).to.throw(ValidationError)
        .and.to.satisfy((error) => {
          return error.validationResult.message.title === 'coordinateInvalid';
        });
    });

    it('should throw an error if location type is not Point', () => {
      const invalidLocation = { type: 'LineString', coordinates: [121.5, 25.05] };
      expect(() => articleValidator.validateLocation(invalidLocation)).to.throw(ValidationError)
        .and.to.satisfy((error) => {
          return error.validationResult.message.title === 'locationInvalid';
        });
    });

    it('should not throw an error if location is undefined or null', () => {
      expect(() => articleValidator.validateLocation(undefined)).to.not.throw();
      expect(() => articleValidator.validateLocation(null)).to.not.throw();
    });
  });

  describe('validateLostDate', () => {
    it('should not throw an error for valid lost date', () => {
      const validLostDate = '2024-02-21';
      expect(() => articleValidator.validateLostDate(validLostDate)).to.not.throw();
    });

    it('should throw an error for invalid lost date', () => {
      const invalidLostDate = 'invalid-date';
      expect(() => articleValidator.validateLostDate(invalidLostDate)).to.throw(ValidationError)
        .and.to.satisfy((error) => {
          return error.validationResult.message.title === 'lostDateInvalid';
        });
    });

    it('should throw an error if lost date is in the future', () => {
      const futureDate = '3024-02-21';
      expect(() => articleValidator.validateLostDate(futureDate)).to.throw(ValidationError)
        .and.to.satisfy((error) => {
          return error.validationResult.message.title === 'lostDateInvalid';
        });
    });

    it('should not throw an error if lost date is undefined or null', () => {
      expect(() => articleValidator.validateLostDate(undefined)).to.not.throw();
      expect(() => articleValidator.validateLostDate(null)).to.not.throw();
    });
  });

  describe('validateLostCityCode', () => {
    it('should not throw an error for valid city code', () => {
      const validCityCode = 'A';
      expect(() => articleValidator.validateLostCityCode(validCityCode)).to.not.throw();
    });

    it('should throw an error for invalid city code', () => {
      const invalidCityCode = 'L';
      expect(() => articleValidator.validateLostCityCode(invalidCityCode)).to.throw(ValidationError)
        .and.to.satisfy((error) => {
          return error.validationResult.message.title === 'lostCityCodeInvalid';
        });
    });

    it('should not throw an error if lost city code is undefined or null', () => {
      expect(() => articleValidator.validateLostCityCode(undefined)).to.not.throw();
      expect(() => articleValidator.validateLostCityCode(null)).to.not.throw();
    });
  });

  describe('validateLostDistrict', () => {
    it('should not throw an error for valid district', () => {
      const validCityCode = 'A';
      const validDistrict = '內湖區';
      expect(() => articleValidator.validateLostDistrict(validCityCode, validDistrict)).to.not.throw();
    });

    it('should throw an error for invalid district in valid city code', () => {
      const validCityCode = 'A';
      const invalidDistrict = 'InvalidDistrict';
      expect(() => articleValidator.validateLostDistrict(validCityCode, invalidDistrict)).to.throw(ValidationError)
        .and.to.satisfy((error) => {
          return error.validationResult.message.title === 'lostDistrictInvalid';
        });
    });

    it('should throw an error if district is provided but city code is invalid', () => {
      const invalidCityCode = 'L';
      const district = '內湖區';
      expect(() => articleValidator.validateLostDistrict(invalidCityCode, district)).to.throw(ValidationError)
        .and.to.satisfy((error) => {
          return error.validationResult.message.title === 'lostCityCodeInvalid';
        });
    });

    it('should not throw an error if both city code and district are undefined or null', () => {
      expect(() => articleValidator.validateLostDistrict(undefined, undefined)).to.not.throw();
      expect(() => articleValidator.validateLostDistrict(null, null)).to.not.throw();
    });
  });

  describe('validateHasReward', () => {
    it('should not throw an error for valid boolean hasReward', () => {
      expect(() => articleValidator.validateHasReward(true)).to.not.throw();
      expect(() => articleValidator.validateHasReward(false)).to.not.throw();
    });

    it('should throw an error for non-boolean hasReward', () => {
      expect(() => articleValidator.validateHasReward('true')).to.throw(ValidationError)
        .and.to.satisfy((error) => {
          return error.validationResult.message.title === 'hasRewardInvalid';
        });
    });

    it('should not throw an error if hasReward is undefined or null', () => {
      expect(() => articleValidator.validateHasReward(undefined)).to.not.throw();
      expect(() => articleValidator.validateHasReward(null)).to.not.throw();
    });
  });

  describe('validateRewardAmount', () => {
    it('should not throw an error for valid reward amount when hasReward is true', () => {
      const hasReward = true;
      const rewardAmount = 1000;
      expect(() => articleValidator.validateRewardAmount(hasReward, rewardAmount)).to.not.throw();
    });

    it('should throw an error for invalid reward amount when hasReward is true', () => {
      const hasReward = true;
      const invalidRewardAmount = 'invalid-reward';
      expect(() => articleValidator.validateRewardAmount(hasReward, invalidRewardAmount)).to.throw(ValidationError)
        .and.to.satisfy((error) => {
          return error.validationResult.message.title === 'rewardAmountInvalid';
        });
    });

    it('should not throw an error for empty reward amount when hasReward is false', () => {
      const hasReward = false;
      expect(() => articleValidator.validateRewardAmount(hasReward, '')).to.not.throw();
    });

    it('should throw an error if reward amount is not provided when hasReward is true', () => {
      const hasReward = true;
      expect(() => articleValidator.validateRewardAmount(hasReward, undefined)).to.throw(ValidationError)
        .and.to.satisfy((error) => {
          return error.validationResult.message.title === 'rewardAmountInvalid';
        });
    });
  });

  describe('validateHasMicrochip', () => {
    it('should not throw an error for valid boolean hasMicrochip', () => {
      expect(() => articleValidator.validateHasMicrochip(true)).to.not.throw();
      expect(() => articleValidator.validateHasMicrochip(false)).to.not.throw();
    });

    it('should throw an error for non-boolean hasMicrochip', () => {
      expect(() => articleValidator.validateHasMicrochip('true')).to.throw(ValidationError)
        .and.to.satisfy((error) => {
          return error.validationResult.message.title === 'hasMicrochipInvalid';
        });
    });

    it('should not throw an error if hasMicrochip is undefined or null', () => {
      expect(() => articleValidator.validateHasMicrochip(undefined)).to.not.throw();
      expect(() => articleValidator.validateHasMicrochip(null)).to.not.throw();
    });
  });

  describe('validUpdateImageList', () => {
    it('should not throw an error for valid updateImageList', () => {
      const req = {
        body: {
          updateImageList: [
            { id: '60ddc71d3b7f4e3a2c8d9a72', isPreview: true },
            { id: '60ddc71d3b7f4e3a2c8d9a73', isPreview: false }
          ]
        }
      };
      expect(() => articleValidator.validUpdateImageList(req)).to.not.throw();
      expect(req.updateImageList).to.deep.equal([
        { id: '60ddc71d3b7f4e3a2c8d9a72', isPreview: true },
        { id: '60ddc71d3b7f4e3a2c8d9a73', isPreview: false }
      ]);
    });

    it('should throw an error if updateImageList is not an array', () => {
      const req = {
        body: {
          updateImageList: 'not-an-array'
        }
      };

      expect(() => articleValidator.validUpdateImageList(req)).to.throw(ValidationError)
        .and.to.satisfy((error) => {
          return error.validationResult.message.title === "validation.invalidType";
        });
    });

    it('should throw an error if any id in updateImageList is invalid', () => {
      const req = {
        body: {
          updateImageList: [
            { id: 'invalid-id', isPreview: true }
          ]
        }
      };

      expect(() => articleValidator.validUpdateImageList(req)).to.throw(ValidationError)
        .and.to.satisfy((error) => {
          return error.validationResult.message.title === "validation.invalidType";
        });
    });

    it('should ensure only one image is set as isPreview', () => {
      const req = {
        body: {
          updateImageList: [
            { id: '60ddc71d3b7f4e3a2c8d9a72', isPreview: true },
            { id: '60ddc71d3b7f4e3a2c8d9a73', isPreview: true }
          ]
        }
      };

      expect(() => articleValidator.validUpdateImageList(req)).to.not.throw();
      expect(req.updateImageList).to.deep.equal([
        { id: '60ddc71d3b7f4e3a2c8d9a72', isPreview: true },
        { id: '60ddc71d3b7f4e3a2c8d9a73', isPreview: false }
      ]);
    });

    it('should handle an empty updateImageList array', () => {
      const req = {
        body: {
          updateImageList: []
        }
      };

      expect(() => articleValidator.validUpdateImageList(req)).to.not.throw();
      expect(req.updateImageList).to.deep.equal([]);
    });

    it('should handle updateImageList with no isPreview images', () => {
      const req = {
        body: {
          updateImageList: [
            { id: '60ddc71d3b7f4e3a2c8d9a72', isPreview: false },
            { id: '60ddc71d3b7f4e3a2c8d9a73', isPreview: false }
          ]
        }
      };

      expect(() => articleValidator.validUpdateImageList(req)).to.not.throw();
      expect(req.updateImageList).to.deep.equal([
        { id: '60ddc71d3b7f4e3a2c8d9a72', isPreview: false },
        { id: '60ddc71d3b7f4e3a2c8d9a73', isPreview: false }
      ]);
    });
  });
});