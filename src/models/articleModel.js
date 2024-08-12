import mongoose from 'mongoose';
import { languageValues } from "../infrastructure/configs/languageOptions.js"
import { privacyEnumKeys, privacyEnumMap } from "../infrastructure/configs/privacyOptions.js"
import articleConfigs from "../infrastructure/configs/articleConfigs.js"

import DatabaseError from "../infrastructure/errors/DatabaseError.js"

const schema = new mongoose.Schema({
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '缺少創建者']
  },
  lang: {
    type: String,
    required: true,
    default: 'zh-TW',
    enum: languageValues
  },
  privacy: {
    type: Number,
    default: privacyEnumMap["匿名"],
    enum: privacyEnumKeys
  },
  title: {
    type: String,
    required: [true, '必填標題'],
    minLength: [articleConfigs.title.minLength, `必須 ${articleConfigs.title.minLength} 個字以上`],
    maxLength: [articleConfigs.title.maxLength, `必須 ${articleConfigs.title.maxLength} 個字以下`],
  },
  content: {
    type: String,
    required: [true, '必填內容'],
    minLength: [articleConfigs.content.minLength, `必須 ${articleConfigs.content.minLength} 個字以上`],
    maxLength: [articleConfigs.content.maxLength, `必須 ${articleConfigs.content.maxLength} 個字以下`],
  },
  //預覽相關資料(系統加工)
  previewContent: {
    type: String,
    // required: [true, '必填內容'],
    // 目前先跳過，反正差，頂多不好看
    // minLength: [articleConfigs.previewContent.minLength, `必須 ${articleConfigs.previewContent.minLength} 個字以上`],
    // maxLength: [articleConfigs.previewContent.maxLength, `必須 ${articleConfigs.previewContent.maxLength} 個字以下`],
  },
  thumbnail: {
    type: String,
    maxLength: [articleConfigs.thumbnail.maxLength, `必須 ${articleConfigs.thumbnail.maxLength} 個字以下`],
  },
  rating: {
    count: {
      type: Number,
      default: 0,
    },
    detail: { type: [Number], default: [0, 0, 0, 0, 0, 0] }
  },
  commentCount: {
    type: Number,
    default: 0,
  },
  isDelete: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { versionKey: false });

schema.index({ isDelete: 1, board: 1 })
export default mongoose.model('Article', schema).on('index', err => {
  if (err) throw new DatabaseError(err)
});