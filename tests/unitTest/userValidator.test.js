import { expect } from 'chai';
import * as userValidator from '../../src/utils/validator/userValidator.js';
import ValidationError from '../../src/infrastructure/errors/ValidationError.js';
import userConfigs from '../../src/infrastructure/configs/userConfigs.js';

// Assuming you have the userConfigs setup as in the provided code
const userNameLengthMin = userConfigs.name.minLength;
const userNameLengthMax = userConfigs.name.maxLength;
const userPhoneLengthMin = userConfigs.phone.minLength;
const userPhoneLengthMax = userConfigs.phone.maxLength;
const userLineIdLengthMin = userConfigs.lineId.minLength;
const userLineIdLengthMax = userConfigs.lineId.maxLength;

describe('User Validator', () => {

  describe('validateName', () => {
    it('should not throw an error for a valid name', () => {
      const validName = 'John Doe';
      expect(() => userValidator.validateName(validName)).to.not.throw();
    });

    it('should throw an error for an invalid name (too short)', () => {
      const invalidName = 'A'.repeat(userNameLengthMin - 1);
      expect(() => userValidator.validateName(invalidName)).to.throw(ValidationError)
        .and.to.satisfy((error) => {
          return error.validationResult.message.title === 'userNameBetween';
        });
    });

    it('should throw an error for an invalid name (too long)', () => {
      const invalidName = 'A'.repeat(userNameLengthMax + 1);
      expect(() => userValidator.validateName(invalidName)).to.throw(ValidationError)
        .and.to.satisfy((error) => {
          return error.validationResult.message.title === 'userNameBetween';
        });
    });

    it('should not throw an error if name is undefined or null', () => {
      expect(() => userValidator.validateName(undefined)).to.not.throw();
      expect(() => userValidator.validateName(null)).to.not.throw();
    });
  });

  describe('validatePhone', () => {
    it('should not throw an error for a valid phone number', () => {
      const validPhone = '1234567890';
      expect(() => userValidator.validatePhone(validPhone)).to.not.throw();
    });

    it('should throw an error for an invalid phone number (too short)', () => {
      const invalidPhone = '1'.repeat(userPhoneLengthMin - 1);
      expect(() => userValidator.validatePhone(invalidPhone)).to.throw(ValidationError)
        .and.to.satisfy((error) => {
          return error.validationResult.message.title === 'userPhoneBetween';
        });
    });

    it('should throw an error for an invalid phone number (too long)', () => {
      const invalidPhone = '1'.repeat(userPhoneLengthMax + 1);
      expect(() => userValidator.validatePhone(invalidPhone)).to.throw(ValidationError)
        .and.to.satisfy((error) => {
          return error.validationResult.message.title === 'userPhoneBetween';
        });
    });

    it('should not throw an error if phone is undefined or null', () => {
      expect(() => userValidator.validatePhone(undefined)).to.not.throw();
      expect(() => userValidator.validatePhone(null)).to.not.throw();
    });
  });

  describe('validateLineId', () => {
    it('should not throw an error for a valid Line ID', () => {
      const validLineId = 'line1234';
      expect(() => userValidator.validateLineId(validLineId)).to.not.throw();
    });

    it('should throw an error for an invalid Line ID (too short)', () => {
      const invalidLineId = 'A'.repeat(userLineIdLengthMin - 1);
      expect(() => userValidator.validateLineId(invalidLineId)).to.throw(ValidationError)
        .and.to.satisfy((error) => {
          return error.validationResult.message.title === 'userLineIdBetween';
        });
    });

    it('should throw an error for an invalid Line ID (too long)', () => {
      const invalidLineId = 'A'.repeat(userLineIdLengthMax + 1);
      expect(() => userValidator.validateLineId(invalidLineId)).to.throw(ValidationError)
        .and.to.satisfy((error) => {
          return error.validationResult.message.title === 'userLineIdBetween';
        });
    });

    it('should not throw an error if Line ID is undefined or null', () => {
      expect(() => userValidator.validateLineId(undefined)).to.not.throw();
      expect(() => userValidator.validateLineId(null)).to.not.throw();
    });
  });
});
