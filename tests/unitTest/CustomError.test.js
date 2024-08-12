// CustomError.test.js
import { expect } from 'chai';
import CustomError from '../../src/infrastructure/errors/CustomError.js';

describe('CustomError', () => {
  it('should initialize with the correct properties', () => {
    const error = new CustomError(404, new Error("An error occurred"), { detail: "Details" }, "NotFoundError");
    expect(error.code).to.equal(404);
    expect(error.originalError.message).to.equal("An error occurred");
    expect(error.data.detail).to.equal("Details");
    expect(error.name).to.equal("NotFoundError");
  });

  it('should return correct original error stack', () => {
    const originalError = new Error("Original error");
    const error = new CustomError(500, originalError);
    expect(error.getOriginalErrorStack()).to.equal(originalError.stack);
  });
});
