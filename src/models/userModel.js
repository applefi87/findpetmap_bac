
import mongoose from 'mongoose'
import DatabaseError from "../infrastructure/errors/DatabaseError.js"

const schema = new mongoose.Schema({
  account: {
    type: String,
    required: [true, '缺少帳號欄位'],
    minLength: [6, '帳號必須 6 個字以上'],
    maxLength: [30, '帳號必須 30 個字以下'],
    unique: true,
    match: [/^[A-Za-z0-9]+$/, '帳號格式錯誤']
  },
  nickname: {
    type: String,
    required: [true, '缺少暱稱欄位'],
    minLength: [3, '必須 3 個字以上'],
    maxLength: [30, '必須 30 個字以下'],
    unique: true
  },
  // securityData: { // **********************系統操作，使用者無權限****************************
  role: {
    type: String,
    required: [true, '缺少身分欄位'],
    enum: ["1"], //1.一般用戶 2管理員
  },
  tokens: {
    type: [String],
    default: []
  },
  password: {
    type: String,
    required: true
  },
  safety: {
    // 登入失敗的起算時間
    firstTryAt: {
      type: Date, default: Date.now()
    },
    //管理登入失敗次數，3為單位 第3次時，多延長一段寄信時間
    totalTryCount: {
      type: Number, default: 0
    },
    //依照登入失敗，制定好下次可寄信的時間為何
    nextTryAvailableAt: {
      type: Date, required: true
    },
    // 更改密碼專用
    changePassword: {
      totalTryCount: {
        type: Number, default: 0
      },
    }
  },
  // profileImage: {
  //   type: String,
  //   maxlength: [50, 'profileImage Url longer than 50!'],
  // },
  info: {
    // gender: {
    //   type: String,
    // },
    name: {
      type: String,
    },
    phone: {
      type: String
    },
    lineId: {
      type: String
    },
    others: {
      type: String
    }
  },
}, { versionKey: false })

export default mongoose.model('User', schema).on('index', err => {
  if (err) throw new DatabaseError(err)
});