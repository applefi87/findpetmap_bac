import passport from 'passport'
import jsonwebtoken from 'jsonwebtoken'
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

export const jwt = (sqlSelect) => {
  return (req, res, next) => {
    console.log("jwt");
    req.sqlSelect = sqlSelect ? sqlSelect + " tokens" : "_id nickname account score info tokens role"
    passport.authenticate('jwt', { session: false }, (err, data, info) => {
      if (err || !data) {
        //這有點混用: 1.第三格只要驗證失敗，就會產生jsonwebtoken.JsonWebTokenError
        //但其他情況可以放別的判斷
        //目前邏輯: info === true 代表是回傳前端token過期，要請重打extend(大多數情況)
        if (info === true) {
          // 如果是登出/續約，正常運作
          if (req.originalUrl !== '/user/extend' && req.originalUrl !== '/user/logout') {
            return res.status(426).send(426)
          }
          //驗證失敗，不需要前端再打一次extend再被失敗(其實是少數)，所以先佔用401讓前端一收到就立刻登出
          //前端會自己加工產生訊息
        } else if (info instanceof jsonwebtoken.JsonWebTokenError || !(err instanceof Error)) {
          return res.status(401).send(401)
        } else {
          //來這應該是系統異常錯誤，雖一樣無法下一步，但會被系統log
          return next(err)
        }
      }
      req.user = data.user
      req.jwtSignature = data.jwtSignature
      console.log("auth passed");
      next()
    })(req, res, next)
  }
}

// 直接取出token的id 後續controller能以他的id去查詢資料 
export const onlyGetIdFromJWT = (req, res, next) => {
  passport.authenticate('onlyGetIdFromJWT', { session: false }, (err, id, info) => {
    if (id) {
      req._id = id.toString()
    }
    next()
  })(req, res, next)
}