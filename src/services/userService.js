import userRepository from '../repositories/userRepository.js'

const findOneUser = async (user, selectString, option, isLean = false) => {
  return await userRepository.getUser(user, selectString, option, isLean = false)
}
const createUserSession = async (user, session) => {
  return await userRepository.createUser([user], { session })
}

const findUserById = async (id, selectString = undefined, option, isLean = false) => {
  return await userRepository.findUserById(id, selectString, option, isLean)
}

const updateUserByIdSession = async (id, update, session) => {
  return await userRepository.updateUserById(id, update, { session })
}


export default { createUserSession, findOneUser, findUserById, updateUserByIdSession }

// //***** */
// export const sendForgetPWDCode = async (req, res, next) => {
//   let isEmailNeedSave = false
//   let email
//   try {
//     // 把emailVal accountVal的內容搬來
//     const formatedEmail = validateAndFormatEmail(req.body.email)
//     await validateForgetEmail(req)
//     const email = await Email.findOne({ email: formatedEmail }).populate({
//       path: 'user',
//       select: "account"
//     })
//     if (!email || !email.user) {
//       throw new ValidationError({ message: { title: { key: 'emailNotRegisterd', params: { email: formatedEmail } } } });
//     }
//     //反正email 帳號 只要全部沒對上，就是查無此信箱帳號組合
//     if (email.user?.account !== req.body.account)
//       throw new ValidationError({ message: { title: 'emailAccountMismatch' } });
//     //
//     isEmailNeedSave = autoCleanEmailErrorTimes(email)
//     validateEmailErrTimes(email)
//     const createVerificationCode = randomString(10, 'medium')
//     const hashedVerificationCode = hash.sha256().update(createVerificationCode).digest('hex')
//     const batchId = randomString(3, 'low')
//     await sendMailJs(formatedEmail, getForgetPWDCodeMailTitleByLang(req.body.lang), getForgetPWDCodeMailContentByLang(req.body.lang, batchId, createVerificationCode))
//     //
//     email.verificationCode = hashedVerificationCode
//     email.errTimes++
//     email.times = 0
//     email.date = Date.now()
//     email.forgetPWD = true
//     await email.save()
//     isEmailNeedSave = false

//     // console.log(`識別碼:${identifier} 【${createCode}】 `);
//     res.status(200).send({ success: true, message: { title: { key: 'forgotPasswordEmailSent', params: { batchId, email: formatedEmail } } }, data: { batchId } })
//   } catch (error) {
//     if (isEmailNeedSave) {
//       try {
//         await email.save()
//       } catch (error) {
//         console.log(error);
//       }
//     }
//     if (error instanceof BaseError) {
//       return next(error)
//     } else {
//       return next(new DatabaseError('forgotPasswordEmailFailure', error));
//     }
//   }
// }
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


