import passport from 'passport'
import passportJWT from 'passport-jwt'
import passportLocal from 'passport-local'
import bcrypt from 'bcrypt'
import ValidationObjectError from '../infrastructure/errors/ValidationObjectError.js';

import { pickJwtSignature } from '../utils/formatters/stringFormatter.js'
import { validateWaitDuration, getNextSendAvailableAt } from '../utils/waitTime.js'
import userService from '../services/userService.js';

const LocalStrategy = passportLocal.Strategy
const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt

const baseTryWaitTimeMilliscond = 5 * 1000
const retryDelays = {
  3: 1 * 60 * 1000,     // 1 minutes for 3rd
  6: 3 * 60 * 1000,     // 3 minutes for 6th
  9: 5 * 60 * 1000,    // 5 minutes for 9th
  12: 15 * 60 * 1000,   // 15 minutes for 12th
  15: 1 * 60 * 60 * 1000, // 1 hours for 15th
  18: 6 * 60 * 60 * 1000, // 1 hours for 18th
  21: 24 * 60 * 60 * 1000, // 1 hours for 21th
};

passport.use('login', new LocalStrategy({
  usernameField: 'account',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, account, password, done) => {
  try {
    // 因為req.body.role 是0 所以要用undefined判斷
    let user = await userService.findOneUser({ account, role: (req.body.role || "1") }, req.sqlSelect)
    if (!user) {
      return done(new ValidationObjectError('accountNotExist'), false)
    }
    processUserLoginErrorTimes(user)
    validateWaitDuration(user.safety.nextTryAvailableAt)
    // 驗證密碼
    if (!bcrypt.compareSync(password, user.password)) {
      user.safety.nextTryAvailableAt = getNextSendAvailableAt(user.safety.totalTryCount, user.safety.firstTryAt, retryDelays, baseTryWaitTimeMilliscond)
      user.safety.totalTryCount++
      await user.save()
      return done(new ValidationObjectError('incorrectPassword'), false)
    }
    return done(null, user)
  } catch (error) {
    return done(error, false)
  }
}))
function processUserLoginErrorTimes(userObj) {
  const elapsedSeconds = Math.ceil((Date.now() - userObj.safety.firstTryAt.getTime()) / 1000);
  const elapsedMinutes = Math.ceil(elapsedSeconds / 60);
  const day_in_minutes = 60 * 24;
  // 關鍵步驟前，確認是否錯誤累計時間已隔24hr可清除/次數過多(不合格回傳錯誤訊息)
  // 如果錯誤時間累積超過一天，錯誤次數重算
  // Check if error count needs to be reset
  if (elapsedMinutes > day_in_minutes) {
    userObj.safety.totalTryCount = 0;
    userObj.safety.firstTryAt = Date.now();
    return true
  }
}

passport.use('jwt', new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET,
  passReqToCallback: true,
  ignoreExpiration: true
}, async (req, payload, done) => {
  try {
    // console.log("in passport jwt");
    const expired = payload.exp * 1000 < Date.now()
    if (expired) {
      if (req.originalUrl !== '/user/extend' && req.originalUrl !== '/user/logout') {
        return done(null, null, true)
      }
    }
    const token = req.headers.authorization.split(' ')[1]
    const jwtSignature = pickJwtSignature(token)
    const user = await userService.findUserById(payload._id, req.sqlSelect)
    if (!user) {
      return done(new ValidationObjectError('userNotExist'))
    }
    if (user.tokens.indexOf(jwtSignature) === -1) {
      console.log("not find jwt");
      return done(true, null)
    }
    // console.log("passport passd.");
    return done(null, { user, jwtSignature: jwtSignature })
  } catch (error) {
    return done(error)
  }
}))

passport.use('onlyGetIdFromJWT', new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET,
  passReqToCallback: true,
  ignoreExpiration: true
}, async (req, payload, done) => {
  //不驗證過期 畢竟那都是可用來取新的，所以即使過期也應該有效
  // const expired = payload.exp * 1000 < Date.now()
  // if (expired) {
  //   return done(null, false, { message: '不採用ID' })
  // }
  return done(null, payload._id)
}))
