import ValidationObjectError from '../infrastructure/errors/ValidationObjectError.js';
import UnknownError from '../infrastructure/errors/UnknownError.js';
// import hash from 'hash.js'


// export function validateEmailSentDuration(nextAvailableAt) {
export function validateWaitDuration(nextAvailableAt) {
  const remainingTimeInMs = (nextAvailableAt.getTime() - Date.now());
  if (remainingTimeInMs <= 0) {
    return;
  }
  const remainingTimeInSeconds = remainingTimeInMs / 1000
  let msgTitle
  if (remainingTimeInSeconds < 60) {
    msgTitle = {
      key: `waitSecondBeforeRetry`,
      params: { second: remainingTimeInSeconds.toFixed(0) }
    };
  } else if (remainingTimeInSeconds < 3600) {
    msgTitle = {
      key: `waitMinuteBeforeRetry`,
      params: { minute: (remainingTimeInSeconds / 60).toFixed(1) }
    };
  } else {
    msgTitle = {
      key: `waitHourBeforeRetry`,
      params: { hour: (remainingTimeInSeconds / 3600).toFixed(1) }
    };
  }
  throw new ValidationObjectError(msgTitle);
}
const dayInMilliseconds = 24 * 60 * 60 * 1000
export function getNextSendAvailableAt(totalTryCount, firstTryAt, retryDelays, baseWaitTimeMilliscond) {
  const now = Date.now();
  const firstSentAtAfter1DayInMillisecond = (firstTryAt ? firstTryAt.getTime() : now) + dayInMilliseconds
  const tryCount = totalTryCount;
  let waitTime = baseWaitTimeMilliscond;
  if (tryCount >= 3 && tryCount % 3 === 0) {
    waitTime = retryDelays[tryCount] || 86400000;
  }
  const calculatedWaitTime = now + waitTime;
  // Return the minimum of firstSentAtInMilliseconds and calculatedWaitTime
  return new Date(Math.min(firstSentAtAfter1DayInMillisecond, calculatedWaitTime));
}
// export function validateEmailErrTimes(email) {
//   try {
//     //要的是距離上次寄信隔多久，所以用date
//     const elapsedSeconds = Math.ceil((Date.now() - email.date.getTime()) / 1000);
//     let msgTitle;
//     for (let i = errorStages.length - 1; i >= 0; i--) {
//       const stage = errorStages[i];
//       const waitTime = stage.waitTime;
//       const limit = error_limit * stage.limitMultiplier;
//       const remainingTime = waitTime - elapsedSeconds;
//       if (email.errTimes >= limit &&remainingTime > 0) {
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
//       throw new RateLimitError({ message: { title: msgTitle } });
//     }
//   } catch (error) {
//     throw error;
//   }
// }


// export async function checkForgotPasswordErrors(emailData, req) {
//   try {
//     let needSave = false
//     if (emailData.times > 5) {
//       errorMsg = { title: 'tooManyVerificationErrors', duration: 3 }
//     } else if (calculateElapsedMinutes(emailData.date.getTime()) > 60) {
//       errorMsg = { title: 'verificationCodeExpired', duration: 3 }
//     } else if (emailData.verificationCode !== hash.sha256().update(req.body.verificationCode).digest('hex')) {
//       email.times++
//       errorMsg = { title: { key: 'verificationCodeError', params: { errLimit: 5 } }, duration: 3 }
//     }
//     if (errorMsg) {
//       if (needSave) await saveEmail(emailData)
//       throw new ValidationError({ message: errorMsg })
//     }
//   } catch (error) {
//     throw error
//   }
// }

// function calculateElapsedMinutes(startTime, endTime) {
//   const elapsedMilliseconds = endTime - startTime;
//   const elapsedMinutes = elapsedMilliseconds / 1000 / 60;
//   return Math.round(elapsedMinutes);
// }