import mongoose from 'mongoose';
const imageSchema = new mongoose.Schema({
  //路徑+檔名
  fullPath: {
    type: String,
    required: true,
    maxlength: [80, 'fileName longer than 50!'],
  },
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true,
  },
  // resourceType: {
  //   type: String,
  //   required: true,
  //   enum: ['Article'],
  //   default: 'Article'
  // },
  image: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image',
    required: true,
  },
  isDelete: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    required: true
  }
}, { versionKey: false });


// 供建立時確保唯一
imageSchema.index({ fullPath: 1 }, { unique: true })
//一般抓取文章清單/給排程定期掃過久要被刪除的圖片(不過一天才一次) ,可以共用
imageSchema.index({ isDelete: 1, resource: 1 })

export default mongoose.model('PreviewImage', imageSchema);