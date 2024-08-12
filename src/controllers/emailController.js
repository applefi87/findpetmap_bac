import anValidator from 'an-validator';
import hash from 'hash.js'
import Email from '../models/emailModel.js'
import ResponseHandler from '../middlewares/ResponseHandler.js';
import emailService from '../services/emailService.js'
import sendEmailService from '../services/externalServices/sendEmailService.js';
import validateAndFormatEmail from '../infrastructure/utils/validateAndFormatEmail.js'
import randomStringGenerator from '../utils/RandomStringGenerator.js'
import emailConfigs from '../infrastructure/configs/emailConfigs.js'

import ValidationError from '../infrastructure/errors/ValidationError.js';
import ValidationObjectError from '../infrastructure/errors/ValidationObjectError.js';
// import { validateForgetEmail } from '../utils/validator/userValidator.js'
import { validateWaitDuration, getNextSendAvailableAt } from '../utils/waitTime.js'
import UnknownError from '../infrastructure/errors/UnknownError.js';

const { rules, validateByRules } = anValidator;
const dayInMilliseconds = 24 * 60 * 60 * 1000
// Base wait time is 60 seconds (in milliseconds)
const baseEmailWaitTimeMilliscond = 60 * 1000;
const retryDelays = {
  3: 3 * 60 * 1000,     // 3 minutes for 3rd
  6: 5 * 60 * 1000,     // 5 minutes for 6th
  9: 15 * 60 * 1000,    // 15 minutes for 9th
  12: 60 * 60 * 1000,   // 1 hour for 12th
  15: 24 * 60 * 60 * 1000 // 1 day for 15th
};
export const sendRegisterVerificationCode = async (req, res, next) => {
  try {
    let email
    // throw new ValidationObjectError({ key: "occupiedEmail", params: { email: "541534" } });
    const formatedEmail = validateAndFormatEmail(req.body.email)
    email = await emailService.getEmailByName(formatedEmail, "user firstSentAt totalSentCount nextSendAvailableAt")
    //已經註冊過，就不可用 (搬出來省下方效能)
    if (email?.user) throw new ValidationObjectError({ key: "occupiedEmail", params: { email: formatedEmail } });
    // //****** */
    // throw new ValidationObjectError("should not here");
    const batchId = randomStringGenerator.generate(3, 'low')
    const type = "register"
    const verificationCodeLength = emailConfigs[`${type}VerificationCode`].codeRandomLength
    const verificationCodeMode = emailConfigs[`${type}VerificationCode`].codeRandomMode
    if (email) {
      await handleSendExistEmail("register", email, formatedEmail, batchId, res, verificationCodeLength, verificationCodeMode)
    } else {
      let verificationCode = randomStringGenerator.generate(verificationCodeLength, verificationCodeMode)
      let hashedVerificationCode = hash.sha256().update(verificationCode).digest('hex')
      const now = Date.now()
      await sendEmailService.sendMail(formatedEmail, getMailTitleInI18n("register", res), getMailContentInI18n("register", res, batchId, verificationCode))
      await Email.create({ email: formatedEmail, verificationCode: hashedVerificationCode, nextSendAvailableAt: now + baseEmailWaitTimeMilliscond, firstSentAt: now, codeValidAt: now + dayInMilliseconds })
    }
    ResponseHandler.successObject(res, { key: "verificationEmailSent", params: { email: formatedEmail, batchId } }, { email: formatedEmail, batchId });
  } catch (error) {
    throw error;
  }
}

async function handleSendExistEmail(type, emailDocument, strFormatedEmail, batchId, res, codeRandomLength = 8, codeRandomMode = "medium") {
  // 不可亂改type文字，因為要跟i18n 的產生標題、內文對應,不然記得同步改
  switch (type) {
    case "register":
      break;
    case "forgetPWD":
      break;
    default:
      throw new UnknownError("handleSendExistEmail have unknown type as:'" + type + "'.")
  }


  autoResetEmailSentRecord(emailDocument)
  validateWaitDuration(emailDocument.nextSendAvailableAt, 60)
  let verificationCode = randomStringGenerator.generate(codeRandomLength, codeRandomMode)
  let hashedVerificationCode = hash.sha256().update(verificationCode).digest('hex')
  const title = getMailTitleInI18n(type, res)
  const content = getMailContentInI18n(type, res, batchId, verificationCode)
  //放這順序是因為create/save沒啥好出錯
  await sendEmailService.sendMail(strFormatedEmail, title, content)
  //每次成功寄信就加一筆警告次數，避免亂狂寄信
  emailDocument.totalSentCount++
  emailDocument.nextSendAvailableAt = getNextSendAvailableAt(emailDocument.totalSentCount, emailDocument.firstSentAt, retryDelays, baseEmailWaitTimeMilliscond)
  emailDocument.verificationCode = hashedVerificationCode
  emailDocument.verifyFailTimes = 0
  emailDocument.codeValidAt = Date.now() + dayInMilliseconds
  console.log(verificationCode);
  await emailDocument.save()
}

function getMailTitleInI18n(type, res) {
  return res.__(`mail.${type}Title`)
}
function getMailContentInI18n(type, res, batchId, verificationCode) {
  console.log(verificationCode);
  return res.__(`mail.${type}Content`, { batchId, verificationCode })
}

function autoResetEmailSentRecord(emailObj) {
  const elapsedInSeconds = Math.ceil((Date.now() - emailObj.firstSentAt.getTime()) / 1000);
  const elapsedInMinutes = Math.ceil(elapsedInSeconds / 60);
  const dayInMinutes = 60 * 24;
  // 關鍵步驟前，確認是否錯誤累計時間已隔24hr可清除/次數過多(不合格回傳錯誤訊息)
  // 如果錯誤時間累積超過一天，錯誤次數重算
  // Check if error count needs to be reset
  if (elapsedInMinutes > dayInMinutes) {
    emailObj.totalSentCount = 0;
    emailObj.firstSentAt = Date.now();
    return true
  }
}

export const verifyVerificationCode = (type, isMiddleWare) => {
  return async (req, res, next) => {
    const verificationCodeLength = emailConfigs[`${type}VerificationCode`].codeRandomLength
    const verificationCodeMode = emailConfigs[`${type}VerificationCode`].codeRandomMode
    // 不可亂改type文字，因為要跟i18n 的產生標題、內文對應,不然記得同步改
    switch (type) {
      case "register":
        break;
      case "forgetPWD":
        break;
      default:
        throw new UnknownError("handleSendExistEmail have unknown type as:'" + type + "'.")
    }
    let email
    const verificationCode = req.body.verificationCode?.toString()
    validateVerificationCode(verificationCode, verificationCodeLength, verificationCodeMode)
    const formatedEmail = validateAndFormatEmail(req.body.email)
    email = await emailService.getEmailByName(formatedEmail, "user verificationCode verifyFailTimes codeValidAt")
    // 防亂驗證信箱
    if (!email) {
      throw new ValidationObjectError('sendEmailFirst')
    }
    // 取的email document後的基本檢查
    switch (type) {
      case "register":
        if (email.user) {
          throw new ValidationObjectError({ key: 'occupiedEmail', params: { email: formatedEmail } })
        }
        break;
      case "forgetPWD":
        if (!email.user) {
          // 有點非法，類似隨便對一個email 直接當作要改密碼，但根本沒用戶。 跟沒此email用一樣的
          throw new ValidationObjectError('sendEmailFirst')
        }
        break;
    }
    //
    await isCheckEmailVerificationCodeValid(email, verificationCode)
    if (isMiddleWare) {
      req.email = email
      next()
    } else {
      ResponseHandler.successObject(res, { key: 'verificationSuccess', params: { email: formatedEmail } }, { text: formatedEmail });
    }
  }
}

function validateVerificationCode(verificationCode, length, mode) {
  const validateCodeResult = validateByRules(verificationCode, rules.createRules(mode, false, length))
  if (!validateCodeResult.success) {
    throw new ValidationError(validateCodeResult, "verificationCode")
  }
}

async function isCheckEmailVerificationCodeValid(email, verificationCode) {
  if (email.codeValidAt.getTime() < Date.now()) {
    throw new ValidationObjectError('verificationCodeExpired')
  }
  if (email.verifyFailTimes >= 3) {
    throw new ValidationObjectError('tooManyVerificationErrors')
  }
  if (email.verificationCode !== hash.sha256().update(verificationCode).digest('hex')) {
    email.verifyFailTimes++
    await email.save()
    throw new ValidationObjectError({ key: 'verificationCodeError', params: { errLimit: 4 - email.verifyFailTimes } })
  }
  else return true
}

//***** */
export const sendForgetPWDCode = async (req, res, next) => {

  // 把emailVal accountVal的內容搬來
  const formatedEmail = validateAndFormatEmail(req.body.email)
  const accountValidateResult = validateByRules(req.body.account, rules.createAccountRules(8, 20))
  const batchId = randomStringGenerator.generate(3, 'low')
  if (!accountValidateResult.success) throw new ValidationError(accountValidateResult);

  const email = await Email.findOne({ email: formatedEmail }).populate({
    path: 'user',
    select: "account"
  })
  if (!email || !email.user) {
    throw new ValidationObjectError({ key: 'emailNotRegisterd', params: { email: formatedEmail } });
  }

  //反正email 帳號 只要全部沒對上，就是查無此信箱帳號組合
  if (email.user?.account !== req.body.account) {
    throw new ValidationObjectError('emailAccountMismatch');
  }
  // 如果成功，跟註冊用一樣的欄位確認次數( 反正要馬註冊/忘記密碼會用到)
  const type = "forgetPWD"
  const verificationCodeLength = emailConfigs[`${type}VerificationCode`].codeRandomLength
  const verificationCodeMode = emailConfigs[`${type}VerificationCode`].codeRandomMode
  await handleSendExistEmail("forgetPWD", email, formatedEmail, batchId, res, verificationCodeLength, verificationCodeMode)
  // console.log(`識別碼:${identifier} 【${createCode}】 `);
  ResponseHandler.successObject(res, { key: 'verificationEmailSent', params: { email: formatedEmail, batchId } }, { data: { batchId } });
}

// function getForgetPWDCodeMailTitleByLang(lang) {
//   switch (lang) {
//     case "zh-TW":
//       return 'KnowForum 忘記密碼-驗證碼'
//     default:
//       return 'KnowForum forget password verification code.'
//   }
// }
// function getForgetPWDCodeMailContentByLang(lang, batchId, createVerificationCode) {
//   switch (lang) {
//     case "zh-TW":
//       return `識別碼:${batchId} 【${createVerificationCode}】 10位英數(分大小寫)是你的臨時驗證碼，一天內有效 <br> 請至原頁面輸入驗證`
//     default:
//       return `Identifier: ${batchId} 【${createVerificationCode}】 is your temporary verification code, consisting of 10 alphanumeric characters (case-sensitive). It is valid for one day. Please go to the original page to enter the verification.`
//   }
// }

// //****
// export const checkForgetPWDVerificationCode = async (req, res, next) => {
//   let email
//   try {
//     // 基本不符合就不去資料庫抓，畢竟這不常用，犧牲一點運算是保護資料庫被搞爆
//     const verificationCode = req.body.verificationCode
//     validateVerificationCode(verificationCode, 10, 'standard')
//     const formatedEmail = validateAndFormatEmail(req.body.email)
//     email = await Email.findOne({ email: formatedEmail })
//     if (!email || !email.user || !email.forgetPWD) {
//       throw new ValidationError('sendEmailFirst')
//     }
//     await isCheckEmailVerificationCodeValid(email, verificationCode)
//     // 供等等抓users
//     req.user = email.user
//     req.formatedEmail = formatedEmail
//     email.forgetPWD = false
//     await email.save()
//     next()
//   } catch (error) {
//     if (error instanceof ValidationError) {
//       next(error)
//     } else {
//       next(new ServerError('verificationFailure', error));
//     }
//   }
// }