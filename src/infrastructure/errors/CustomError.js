class CustomError extends Error {
    /**
     * Creates a new CustomError instance.
     * 
     * @param {number} code - An application-specific error code.
     * @param {Error|null} originalError - The original error object, for error chaining.
     * @param {any} data - Additional data related to the error.
     */
    constructor(code = 0, originalError = null, data = undefined, name = "CustomError") {
        super();
        Error.captureStackTrace(this);
        this.name = name;
        this.code = code;
        this.originalError = originalError;
        this.data = data;
    }

    /**
     * Gets the trace of the original error, if it exists.
     * 
     * @returns {string|null} The trace of the original error.
     */
    getOriginalErrorStack() {
        //這順序，考量大部分都是直接丟CustomError，所以優化效率放第一
        return !this.originalError ? this.stack :
            (this.originalError instanceof CustomError ? this.originalError.getOriginalErrorStack() : this.originalError.stack)
    }
}

export default CustomError;
