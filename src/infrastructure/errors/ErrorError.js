import CustomError from './CustomError.js';

class ErrorError extends CustomError {
    /**
     * Creates a new ErrorError instance.
     * 當error建立過程又有異常，就會產生這個，急需要處理以免之後異常紀錄
     * 
     * @param {Error|null} mongooseError - The original error object, for error chaining.
     * @param {any} data - Additional data related to the error.
     */
    constructor(originalError = null, logData = undefined , data = undefined) {
        try {
            super(1010, originalError, data, "ErrorError");
        } catch (err) {
            super(1101, err, data, "ErrorError");
            this.logData = logData||originalError
        }
    }
}

export default ErrorError;
