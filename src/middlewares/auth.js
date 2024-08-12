import passport from 'passport'
import jsonwebtoken from 'jsonwebtoken'
import ValidationError from '../infrastructure/errors/ValidationError.js';
import CustomError from '../infrastructure/errors/CustomError.js';
//快取抓記憶體是否有存過
// import { createClient } from 'redis';
// const client = createClient();
// client.on('connect', () => console.log('Connected to Redis'));
// client.connect();

export const login = (sqlSelect) => {
  return (req, res, next) => {
    req.sqlSelect = sqlSelect ? sqlSelect : "_id nickname role password tokens"
    // Retrieve data from database
    passport.authenticate('login', { session: false }, (err, user, info) => {
      if (err || !user) {
        return next(err)
      }
      req.user = user
      next()
    })(req, res, next)
  }
}
// export const jwt = (sqlSelect) => {
//   return (req, res, next) => {
//     req.sqlSelect = sqlSelect ? sqlSelect + " tokens" : "_id nickname account score info tokens role"
//     passport.authenticate('jwt', { session: false }, (err, data, info) => {
//       if (err || !data) {
//         // console.log(err, info);
//         if (info instanceof jsonwebtoken.JsonWebTokenError) {
//           //這1用next而是res,因為方便控制401(自動觸發登出)
//           return res.status(401).send({ success: false, message: { title: 'loginVerificationError' } })
//         } else {
//           throw err
//         }
//       }
//       req.user = data.user
//       req.jwtSignature = data.jwtSignature
//       // console.log("auth passed");
//       next()
//     })(req, res, next)
//   }
// }
export const jwt = (sqlSelect) => {
  return (req, res, next) => {
    req.sqlSelect = sqlSelect ? sqlSelect + " tokens" : "_id nickname account score info tokens role"
    passport.authenticate('jwt', { session: false }, (err, data, info) => {
      if (err || !data) {
        //這有點混用: 1.第三格只要驗證失敗，就會產生jsonwebtoken.JsonWebTokenError
        //但其他情況可以放別的判斷
        //目前邏輯: info === true 代表是回傳前端token過期，要請重打extend(大多數情況)
        if (info === true) {
          //這不用next而是res,因為方便控制401(自動觸發登出)
          //確認這裡觸發正確更新token與無效token對應的流程，把正確更新token沒必要有文字的部分變乾淨(直接res不走customeError)
          return res.status(401).send(401)
        } else if (info instanceof jsonwebtoken.JsonWebTokenError || !(err instanceof Error)) {
          //驗證失敗，不需要前端再打一次extend再被失敗(其實是少數)，所以先佔用402讓前端一收到就立刻登出，但這是付款的，未來可能要改掉
          // !(err instanceof Error) 是避免 err 為null 導致next(被通過)
          return res.status(402).send(402)
        } else {
          //來這應該是系統異常錯誤，雖一樣無法下一步，但會被系統log
          return next(err)
        }
      }
      req.user = data.user
      req.jwtSignature = data.jwtSignature
      // console.log("auth passed");
      next()
    })(req, res, next)
  }
}

// if (req.headers.authorization) {
//     client.get(decoded.user.account, async (err, data) => {})
//     client.setEx(req.user.account, 3600, JSON.stringify({ user: req.user, jwtSignature: req.jwtSignature }));
//     next()
// }
// 直接取出token的id 後續controller能以他的id去查詢資料 
export const onlyGetIdFromJWT = (req, res, next) => {
  passport.authenticate('onlyGetIdFromJWT', { session: false }, (err, id, info) => {
    if (id) {
      req._id = id.toString()
    }
    next()
  })(req, res, next)
}