import CustomError from './CustomError.js';

class PageNotFoundError extends CustomError {
    /**
     * Creates a new PageNotFoundError instance.
     * 
     * @param {number} code - An application-specific error code, default to 404.
     * @param {Error|null} originalError - The original error object, for error chaining.
     * @param {any} data - Additional data related to the error.
     */
    constructor(data = undefined) {
        super(404, null, data, "PageNotFoundError");
        this.stack = undefined  //No need to record this.
    }
}

export default PageNotFoundError;
