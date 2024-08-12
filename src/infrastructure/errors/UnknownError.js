import CustomError from './CustomError.js';

class UnknownError extends CustomError {
    /**
     * Creates a new UnknownError instance.
     * 
     * @param {Error|null} originalError - The original error object, for error chaining.
     * @param {any} data - Additional data related to the error.
     */
    constructor(originalError = null, data = undefined) {
        super(1000, originalError, data, "UnknownError");
    }
}

export default UnknownError;
