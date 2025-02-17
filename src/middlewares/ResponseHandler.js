import { readFileSync } from 'fs';
import CustomError from '../infrastructure/errors/CustomError.js';
import UnknownError from '../infrastructure/errors/UnknownError.js';
import ValidationError from '../infrastructure/errors/ValidationError.js';
import CloudWatchLogger from '../utils/CloudWatchLogger.js';
const errorCodeTable = JSON.parse(
  readFileSync(new URL('../../configs/generated/errors/errorCodeTable.json', import.meta.url), 'utf-8')
);
// const levelList = ["emergency", "error","notice","log","dev"];
const needLog = ["emergency", "error"];

class ResponseHandler {
  static success(res, data, statusCode = 200, messageCode = 200) {
    try {
      return res.status(statusCode).json({
        code: messageCode,
        success: true,
        message: res.__(messageCode.toString()),
        data: data
      });
    } catch (error) {
      CloudWatchLogger.logMessage(0, "emergency", error.stack, "backend_ResponseHandler.success_Error!!");
    }
  }
  static successObject(res, msg, data = undefined, httpCode = 200) {
    try {
      const message = msg.key ? res.__(msg.key, msg.params) : res.__(msg)
      return res.status(httpCode).json({
        code: 200,
        success: true,
        message,
        data
      });
    } catch (error) {
      CloudWatchLogger.logMessage(0, "emergency", error.stack, "backend_ResponseHandler.success_Error!!");
    }
  }

  static errorHandler(err, req, res, next) {
    try {
      if (!err) {
        err = new UnknownError(err);
      } else if (!(err instanceof CustomError)) {
        err = new UnknownError(err);
      }
      const isValidationError = err instanceof ValidationError
      let transformedError
      let responseJson
      if (isValidationError) {
        // ValidationError 特別: 
        // 統一使用an-validator
        // 格式如下
        // err.validationResult = { success: false, message: { title: message } }
        // message= `validation.lengthMatch`
        // 有時需要輸入參數供i18n用(ex: 值必須介於{min}~{max}之間)，會放在data裡
        // message= { key: `validation.lengthMatch`, params: { length:3 } }; 
        //
        const errMsg = err.validationResult.message.title
        const message = errMsg.key ? res.__(errMsg.key, errMsg.params) : res.__(errMsg)
        responseJson = {
          code: err.code,
          success: false,
          message: err.validationTarget ? (res.__(err.validationTarget) + ":" + message) : message,
          data: err.data
        }
        return res.status(err.code).json(responseJson);
      } else {
        transformedError = errorCodeTable[err.code] || { level: "emergency", HTTPCode: 500, frontCode: '600' };
        if (needLog.includes(transformedError.level) || transformedError.logExtra) {
          CloudWatchLogger.logMessage(err.code, transformedError.level, err.getOriginalErrorStack(), err.data, err.logData).catch(console.error);
        }
        responseJson = {
          code: transformedError.frontCode,
          success: false,
          message: res.__(transformedError.frontCode.toString()),
          data: err.data
        }
        return res.status(transformedError.HTTPCode).json(responseJson);
      }

    } catch (error) {
      console.log("!!!!!!!!!!!!非test可測試區域異常!!!!!!!!!!!!!!");
      console.log(error);
      CloudWatchLogger.logMessage(0, "emergency", error.stack, "backend_ResponseHandler.errorHandler_Error!!");
      return res.status(500).json({
        code: 1040,
        success: false,
        message: res.__("500"),
        data: null
      });
    }
  }
}

export default ResponseHandler;
