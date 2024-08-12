import mongoose from 'mongoose'
import DatabaseError from "../infrastructure/errors/DatabaseError.js"

const schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    minLength: [10, '必須 10 個字以上'],
    maxLength: [40, '必須 40 個字以下'],
  },
  //After register then will have this, so use this to check if email is occupied
  user: {
    type: mongoose.ObjectId,
    ref: 'User'
  },
  //
  verificationCode: {
    type: String, required: true 
  },
  // ***Send email related***
  //寄信次數累計的開始時間，滿一天清空累計
  firstSentAt: {
    type: Date, default: Date.now()
  },
  //管理寄信次數，3為單位 第3次時，多延長一段寄信時間
  totalSentCount: {
    type: Number, default: 1
  },
  //依照寄信次數，制定好下次可寄信的時間為何
  nextSendAvailableAt: {
    type: Date, required: true, default: Date.now()
  },


  //***判斷驗證碼有效性***
  // 驗證碼錯3次就要求重寄
  verifyFailTimes: {
    type: Number, default: 0
  },
  // code有效日是建立日的隔24小時內，隔過久就失效
  codeValidAt: {
    type: Date, required: true, default: Date.now()
  }
  //之後加，判斷不同目標(產生忘記密碼驗證碼就enum在這，以免直接打其他驗證碼就能被視為通過，雖然目前看來是沒啥風險?)
}, { versionKey: false })

// const Email = mongoose.model('Email', schema);
// Email.collection.dropIndexes((err, result) => {
//   if (err) {
//     console.error('Error dropping indexes:', err);
//   } else {
//     console.log('Indexes dropped:', result);
//   }

//   // Recreate indexes
//   Email.syncIndexes((err, result) => {
//     if (err) {
//       console.error('Error syncing indexes:', err);
//     } else {
//       console.log('Indexes synced:', result);
//     }
//   });
// });

export default mongoose.model('Email', schema).on('index', err => {
  if (err) throw new DatabaseError(err)
});
