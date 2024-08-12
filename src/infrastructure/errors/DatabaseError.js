import CustomError from './CustomError.js';
import ErrorError from './ErrorError.js';

class DatabaseError extends CustomError {
    /**
     * Creates a new DatabaseError instance.
     * 這裡不應該被觸發,因為所有mongoose相關的資料格式限制應該要在controller檢查完
     * 
     * @param {Error|null} mongooseError - The original error object, for error chaining.
     * @param {any} data - Additional data related to the error.
     */
    constructor(mongooseError = null, data = null) {
        try {
            // mongoose 的 model 相關異常會用array裝，map出需要的
            if (mongooseError?.errors && Object.values(mongooseError.errors)) {
                super(1100, null, null, "DatabaseError");
                this.logData = Object.values(mongooseError.errors).map(error => `【${error.path}】${error.message}:${error.value}.`)
            } else {
                // 因為有用option session, session 是少數無法被json.stringify的，會炸出問題，所以暴力移除但留紀錄
                if (data.session) { data.session = "session" }
                if (data.option?.session) { data.option.session = "session" }
                // 這樣的方式，避免mongoose異常的trace都卡在mongoose資料夾內沒參考意義
                super(1100, null, data, "DatabaseError");
                this.logData = mongooseError?.message
            }
        } catch (error) {
            return new ErrorError(error, mongooseError, data)
        }
    }
}

export default DatabaseError;