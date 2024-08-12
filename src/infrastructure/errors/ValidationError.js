import CustomError from './CustomError.js';

class ValidationError extends CustomError {
    /**
     * 必須搭配an-validator 使用. Creates a new ValidationError instance.
     * 
     * @param {Error|null} originalError - The original error object, for error chaining.
     * @param {any} data - Additional data related to the error.
     */
    constructor(validationResult = "", validationTarget = undefined, data = undefined, code = 422) {
        super(code, null, data, "ValidationError");
        this.validationResult = validationResult
        this.validationTarget = validationTarget
    }
}

export default ValidationError;
