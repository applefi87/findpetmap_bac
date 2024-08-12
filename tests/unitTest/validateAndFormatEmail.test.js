import { expect } from 'chai';
import ValidationError from '../../src/infrastructure/errors/ValidationError.js';
import validateAndFormatEmail from '../../src/infrastructure/utils/validateAndFormatEmail.js';

describe('validateAndFormatEmail', function () {

  it('should throw ValidationError if dots before @', function () {
    const email = 'Test.Email@gmail.com';
    expect(() => validateAndFormatEmail(email)).to.throw(ValidationError);
  });

  it('should replace googlemail with gmail in the domain part', function () {
    const email = 'user@googlemail.com';
    const result = validateAndFormatEmail(email)
    expect(result).to.equal('user@gmail.com');
  });

  it('should return ValidationError if email is invalid', function () {
    const email = 'invalid-email';
    expect(() => validateAndFormatEmail(email)).to.throw(ValidationError);
  });

  it('should throw ValidationError if email validation fails', function () {
    const email = 'invalid-email';
    expect(() => validateAndFormatEmail(email)).to.throw(ValidationError);
  });

  it('should handle emails with special cases correctly', function () {
    const email = 'user@domain.com';
    const result = validateAndFormatEmail(email);
    expect(result).to.equal('user@domain.com');
  });

  it('should throw ValidationError if uppercase emails', function () {
    const email = 'USER@DOMAIN.COM';
    expect(() => validateAndFormatEmail(email)).to.throw(ValidationError);
  });

  it('should return ValidationError for email with invalid format after processing', function () {
    const email = 'user@.com';
    expect(() => validateAndFormatEmail(email)).to.throw(ValidationError);
  });
});