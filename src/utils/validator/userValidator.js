import anValidator from 'an-validator';
import bcrypt from 'bcrypt'
import ValidationError from '../../infrastructure/errors/ValidationError.js';
import ValidationObjectError from '../../infrastructure/errors/ValidationObjectError.js';
import userConfigs from '../../infrastructure/configs/userConfigs.js';

const { rules, validateByRules } = anValidator;


export const validateUserChangePWD = async (req) => {
  const passwordValidateResult = validateByRules(req.body.password, rules.createPasswordRules('basic', false));
  if (!passwordValidateResult.success) throw new ValidationError(passwordValidateResult, "password");
  const newPasswordValidateResult = validateByRules(req.body.newPWD, rules.createPasswordRules('basic', false));
  if (!newPasswordValidateResult.success) throw new ValidationError(newPasswordValidateResult, "newPWD");

  await validAndHandleChangePWDTotalTryCount(req)
  if (!bcrypt.compareSync(req.body.password, req.user.password)) {
    req.user.safety.changePassword.totalTryCount++
    await validAndHandleChangePWDTotalTryCount(req)
    await req.user.save();
    throw new ValidationObjectError({ key: "oldPWDError", params: { errLimit: 3 - req.user.safety.changePassword.totalTryCount } });
  }
};
// 滿三次直接登出跳出邏輯
async function validAndHandleChangePWDTotalTryCount(req) {
  if (req.user.safety.changePassword.totalTryCount >= 3) {
    // 讓該筆 token 失效
    req.user.tokens = req.user.tokens.filter(token => token !== req.jwtSignature)
    // 接受新 token 的登入次數(相反不讓登入時重設，因為A設備改密碼跟B設備一直登入不相關，不該上A一直放行)
    req.user.safety.changePassword.totalTryCount = 0
    await req.user.save()
    throw new ValidationObjectError("tooManyErrorTimes", { logout: true });
  }
}


const userNameLengthMin = userConfigs.name.minLength
const userNameLengthMax = userConfigs.name.maxLength

export function validateName(name) {
  if (checkNoValue(name)) { return }
  const nameValidateResult = validateByRules(name, rules.createLengthBetweenRule(userNameLengthMin, userNameLengthMax))
  if (!nameValidateResult.success) throw new ValidationObjectError("userNameBetween", { min: userNameLengthMin, max: userNameLengthMax });
}
const userPhoneLengthMin = userConfigs.phone.minLength
const userPhoneLengthMax = userConfigs.phone.maxLength
export function validatePhone(phone) {
  if (checkNoValue(phone)) { return }
  const phoneValidateResult = validateByRules(phone, rules.createLengthBetweenRule(userPhoneLengthMin, userPhoneLengthMax))
  if (!phoneValidateResult.success) throw new ValidationObjectError("userPhoneBetween", { min: userPhoneLengthMin, max: userPhoneLengthMax });
}
const userLineIdLengthMin = userConfigs.lineId.minLength
const userLineIdLengthMax = userConfigs.lineId.maxLength
export function validateLineId(lineId) {
  if (checkNoValue(lineId)) { return }
  const lineIdValidateResult = validateByRules(lineId, rules.createLengthBetweenRule(userLineIdLengthMin, userLineIdLengthMax))
  if (!lineIdValidateResult.success) throw new ValidationObjectError("userLineIdBetween", { min: userLineIdLengthMin, max: userLineIdLengthMax });
}

const userOthersLengthMin = userConfigs.others.minLength
const userOthersLengthMax = userConfigs.others.maxLength
export function validateOthers(others) {
  if (checkNoValue(others)) { return }
  const othersValidateResult = validateByRules(others, rules.createLengthBetweenRule(userOthersLengthMin, userOthersLengthMax))
  if (!othersValidateResult.success) throw new ValidationObjectError("userOthersBetween", { min: userOthersLengthMin, max: userOthersLengthMax });
}


function checkNoValue(value) {
  return (value === null || value === undefined)
}
// // //*** */
// const errorStages = [
//   { waitTime: 2, limitMultiplier: 1 },
//   { waitTime: 3 * 60, limitMultiplier: 1 },
//   { waitTime: 15 * 60, limitMultiplier: 2 },
//   { waitTime: 60 * 60, limitMultiplier: 3 },
//   { waitTime: 2 * 60 * 60, limitMultiplier: 4 },
//   { waitTime: 4 * 60 * 60, limitMultiplier: 5 },
//   { waitTime: 8 * 60 * 60, limitMultiplier: 6 },
//   { waitTime: 12 * 60 * 60, limitMultiplier: 7 },
//   { waitTime: 16 * 60 * 60, limitMultiplier: 8 },
//   { waitTime: 20 * 60 * 60, limitMultiplier: 9 }
// ];
// const error_limit = 5;
// //前面有autoCleanEmailErrorTimes 超過1天就會清除errTimes
// export function validateUserTryDuration(nextTryAvailableAt) {
//   //要的是距離上次嘗試失敗隔多久，所以用date
//   const remainingTimeInSeconds = Math.ceil((nextTryAvailableAt.getTime() - Date.now()) / 1000);

//   if (remainingTimeInSeconds > 0) {
//     let msgTitle;
//     let unit;
//     let remainingAmount;
//     // Determine the appropriate unit and value
//     if (remainingTimeInSeconds <= 0) {
//       return
//     } else if (remainingTimeInSeconds < 60) {
//       remainingAmount = remainingTimeInSeconds;
//       unit = 'Second';
//     } else if (remainingTimeInSeconds < 60 * 60) {
//       remainingAmount = (remainingTimeInSeconds / 60).toFixed(1);
//       unit = 'Minute';
//     } else {
//       remainingAmount = (remainingTimeInSeconds / (60 * 60)).toFixed(1);
//       unit = 'Hour';
//     }
//     // Set the message title
//     msgTitle = {
//       key: `wait${unit}BeforeRetry`,
//       params: { [unit.toLowerCase()]: remainingAmount }
//     };
//     if (msgTitle) {
//       throw new ValidationObjectError(msgTitle);
//     }
//   }
// }
// export function validateUserErrTimes(user) {
//   try {
//     //前面有autoCleanUserErrorTimes 超過1天就會清除errTimes
//     // 每次要間隔60秒
//     const elapsedSeconds = Math.ceil((Date.now() - user.securityData.safety.errDate.getTime()) / 1000);
//     let msgTitle;
//     //由下往上開始跑
//     for (let i = errorStages.length - 1; i >= 0; i--) {
//       const stage = errorStages[i];
//       const waitTime = stage.waitTime;
//       const limit = error_limit * stage.limitMultiplier;
//       const remainingTime = waitTime - elapsedSeconds;
//       if (user.securityData.safety.errTimes >= limit && remainingTime > 0) {
//         let unit;
//         let remainingUnit;
//         if (remainingTime < 60) {
//           remainingUnit = remainingTime;
//           unit = 'Second';
//         } else if (remainingTime < 60 * 60) {
//           remainingUnit = (remainingTime / 60).toFixed(1);
//           unit = 'Minute';
//         } else {
//           remainingUnit = (remainingTime / (60 * 60)).toFixed(1);
//           unit = 'Hour';
//         }
//         msgTitle = { key: `wait${unit}BeforeRetry`, params: { [unit.toLowerCase()]: remainingUnit } };
//         break;
//       }
//     }
//     if (msgTitle) {
//       throw new RateLimitError({ message: { title: msgTitle } })
//     }
//   } catch (error) {
//     throw error;
//   }
// }