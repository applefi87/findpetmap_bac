import mongoose from 'mongoose';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import ResponseHandler from '../middlewares/ResponseHandler.js';
import randomStringGenerator from '../utils/RandomStringGenerator.js'

import sendEmailService from '../services/externalServices/sendEmailService.js';
import emailService from '../services/emailService.js'
import userService from '../services/userService.js'
import { pickJwtSignature } from '../utils/formatters/stringFormatter.js'
import {  validateUserChangePWD } from '../utils/validator/userValidator.js'

const jwtExpirationConfig = { expiresIn: '12000 minutes' }
// const jwtExpirationConfig = { expiresIn: '5 seconds' }
// Base wait time is 60 seconds (in milliseconds)
const baseTryWaitTimeMilliscond = 5 * 1000;
const retryDelays = {
  3: 3 * 60 * 1000,     // 3 minutes for 3rd
  6: 5 * 60 * 1000,     // 5 minutes for 6th
  9: 15 * 60 * 1000,    // 15 minutes for 9th
  12: 60 * 60 * 1000,   // 1 hour for 12th
  15: 24 * 60 * 60 * 1000 // 1 day for 15th
};
// const jwtExpirationConfig = { expiresIn: '10 seconds' }
//***************************************************************** */
export const register = async (req, res, next) => {
  const session = await mongoose.startSession();
  const { password, account, nickname, info } = req.body
  const { name, phone, lineId, others } = (info || {})

  try {
    session.startTransaction();
    const now = Date.now()
    const newUser = {
      account: account,
      nickname: nickname,
      role: "1",
      password: bcrypt.hashSync(password, 8),
      info: {
        name: name,
        phone: phone,
        lineId: lineId,
        others: others
      },
      safety: { nextTryAvailableAt: now + baseTryWaitTimeMilliscond }
    };
    const [result] = await userService.createUserSession(newUser, session);
    //前面有驗證過email，所以確定存在
    await emailService.updateEmailHasUser(req.email, result._id, session);
    // await Draft.create([{ user: result._id }], { session })
    // await UserBadge.create([{ user: result._id }], { session })
    // await TempImageList.create([{ user: result._id }], { session })
    await session.commitTransaction();
    ResponseHandler.successObject(res, { key: 'registerSuccess' }, result);
  } catch (error) {
    await session.abortTransaction();
    throw error
  } finally {
    await session.endSession();
  }
};
//***************************************************************** */
export const login = async (req, res, next) => {
  // console.log("login");
  req.user.safety.totalTryCount = 0
  const newJWT = await updateUserJWT(req);
  // const notifications = await Notification.find({ receiver: req.user._id })
  //   .sort({ createdAt: 'desc' })
  //   .limit(20)
  ResponseHandler.successObject(res, 'loginSuccess', {
    token: newJWT,
    _id: req.user._id,
    nickname: req.user.nickname,
    role: req.user.role,
    // score: req.user.record.score,
    // badges: req.user.badges,
    // profileImageUrl: req.user.profileImage?.url,
    // interfaceLanguage: req.user.info.interfaceLanguage,
    // publishLanguages: req.user.info.publishLanguages,
    // searchLanguages: req.user.info.searchLanguages,
    // notifications
  });
};
//***************************************************************** */
export const extend = async (req, res, next) => {
  ResponseHandler.successObject(res, "", { token: await updateUserJWT(req) });
}
/**
 * Updates the JWT for a user and saves it in the database.
 * @param {object} req - The request object.
 * @returns {string} The updated JWT.
 * @throws {Error} If there is an error updating the JWT.
 */
async function updateUserJWT(req) {
  // console.log("updateJWT");
  const oldJwtSignature = req.jwtSignature
  if (oldJwtSignature) {
    const oldTokenIdx = req.user.tokens.indexOf(oldJwtSignature)
    if (oldTokenIdx !== -1) {
      req.user.tokens.splice(oldTokenIdx, 1)
    }
  }
  const token = jwt.sign({ _id: req.user._id, role: req.user.role }, process.env.SECRET, jwtExpirationConfig);
  const jwtSignature = pickJwtSignature(token);
  req.user.tokens.push(jwtSignature);
  //最後處理，這樣被推到後面的如果登入，前面能先往前救
  if (req.user.tokens.length > 6) {
    req.user.tokens = req.user.tokens.slice(2);
  }
  // console.log(req.user.tokens);
  await req.user.save();
  return token;
};
//***************************************************************** */
export const getMyInfo = async (req, res, next) => {
  ResponseHandler.successObject(res, '', req.user.info);
};
//***************************************************************** */
export const logout = async (req, res, next) => {
  req.user.tokens = req.user.tokens.filter(token => token !== req.jwtSignature)
  await req.user.save()
  ResponseHandler.successObject(res, 'logoutSuccess');
}
//***************************************************************** */
export const changePWD = async (req, res, next) => {
  // console.log('incontroller changePWD');
  await validateUserChangePWD(req);
  const user = await userService.findUserById(req.user._id, ['securityData.password', 'securityData.tokens', 'securityData.safety.times', 'securityData.safety.errTimes', 'securityData.safety.errDate'])
  user.password = bcrypt.hashSync(req.body.newPWD, 10);
  // 所有設備都該登出
  user.tokens = [];
  await user.save();
  ResponseHandler.successObject(res, 'changePWDSuccessfully');
}


//***************************************************************** */
export const resetPWD = async (req, res) => {
  const newRandomPWD = randomStringGenerator.generate(10, "medium")
  //需要加上臨時密碼
  const user = await userService.findOneUser(req.email.user, ['password', 'account'])
  user.password = bcrypt.hashSync(newRandomPWD, 10)
  user.tokens = []
  await sendEmailService.sendMail(req.formatedEmail, getResetPWDMainTitleInI18n(res), getResetPWDMainContentInI18n(res, newRandomPWD))
  await user.save()
  // console.log('密碼重設成功' + createCode);
  ResponseHandler.successObject(res, 'changePWDSuccessfully', { account: user.account });
}

function getResetPWDMainTitleInI18n(res) {
  return res.__(`mail.resetPWDTitle`)
}
function getResetPWDMainContentInI18n(res, newPWD) {
  return res.__(`mail.resetPWDContent`, { newPWD })
}
//***************************************************************** */
