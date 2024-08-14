import mongoose from 'mongoose';
import { languageValues } from "../infrastructure/configs/languageOptions.js"
import * as articleValidator from "../utils/validator/articleValidator.js"
import articleConfigs from "../infrastructure/configs/articleConfigs.js"
import { cityCodeList } from "../infrastructure/configs/cityConfigs.js"

import DatabaseError from "../infrastructure/errors/DatabaseError.js"
// const catBreedEnum = ['波斯貓', '暹羅貓', '緬因貓', '孟加拉貓'];
// const dogBreedEnum = ['拉布拉多', '比格犬', '貴賓犬', '鬥牛犬'];

const catColorEnum = [
  // Solid Colors
  '黑', '白', '灰', '橘', '咖啡',
  // Mixed Colors
  '黑白', '灰白', '橘白',
  // Patterned Colors
  '玳瑁', '花斑', '虎斑'
];


const dogColorEnum = [
  // Solid Colors
  '黑', '白', '灰', '米黃', '棕', '咖啡',
  // Patterned Colors
  '斑點', '花斑', '虎斑'
];


const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    validator: function (value) {
      return value.length === 2 &&
        value[0] >= -180 && value[0] <= 180 &&  // Longitude range
        value[1] >= -90 && value[1] <= 90;      // Latitude range
    },
    message: 'Coordinates must be an array of two numbers: [longitude, latitude] within valid ranges.',
    required: true
  }
});

const schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '缺少創建者']
  },
  // state: {
  //   type: String,
  //   enum: ['協尋中', '已找到', '結束'],
  //   required: true,
  //   default: '協尋中'
  // },
  petType: {
    type: String,
    enum: articleConfigs.petType,
    required: true
  },
  // breed: {
  //   type: String,
  //   required: true,
  //   validate: {
  //     validator: function (value) {
  //       if (this.petType === '貓') {
  //         return catBreedEnum.includes(value);
  //       } else if (this.petType === '狗') {
  //         return dogBreedEnum.includes(value);
  //       }
  //       return false;
  //     },
  //     message: props => `${props.value} 不是所選寵物類型的有效品種`
  //   }
  // },
  color: {
    type: String,
    validate: {
      validator: function (value) {
        return articleValidator.validateColor(this.petType, value);
      },
      message: props => `${props.value} 不是所選寵物類型的有效品種`
    },
    required: true
  },
  hasReward: {
    type: Boolean,
    required: true,
    default: false
  },
  // 賞金
  rewardAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  hasMicrochip: {
    type: Boolean,
    required: true,
    default: false
  },
  lostDate: {
    type: Date,
    required: true
  },
  lostCityCode: {
    type: String,
    enum: cityCodeList,
    // required: true
  },
  lostDistrict: {
    type: String,
    required: true
  },
  location: {
    type: pointSchema,
    required: true,
    _id: false,
  },
  content: {
    type: String,
    required: [true, '必填內容'],
    minLength: [articleConfigs.content.minLength, `必須 ${articleConfigs.content.minLength} 個字以上`],
    maxLength: [articleConfigs.content.maxLength, `必須 ${articleConfigs.content.maxLength} 個字以下`],
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

schema.index({ isDelete: 1, location: '2dsphere', petType: 1, color: 1, })
export default mongoose.model('Article', schema).on('index', err => {
  if (err) throw new DatabaseError(err)
});