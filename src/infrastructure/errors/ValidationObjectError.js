import CustomError from './CustomError.js';
import ValidationError from './ValidationError.js';
import ErrorError from './ErrorError.js';

class ValidationObjectError extends CustomError {
    /**
     * sometimes need basic validate direct use text as i18n key, without validator.
     * 
     * @param {Error|null} originalError - The original error object, for error chaining.
     * @param {any} data - Additional data related to the error.
     */
    // Example
    // ValidationObjectError( 'verificationCodeExpired' )
    // ValidationObjectError({ key: 'verificationCodeExpired' }, { duration: 5 ,email:"eeee"})
    constructor(validationTitle = "", data = undefined, code = 422) {
        //validationObject as  { title: "occupiedEmail" } or  { title: {key: "occupiedEmail" , params: "xxxx@gmail.com"} } 
        try {
            return new ValidationError({ success: false, message: { title: validationTitle } }, undefined, data, code)
        } catch (error) {
            return new ErrorError(error, data, validationTitle)
        }
    }
}

export default ValidationObjectError;
