import mongoose from 'mongoose';
const imageSchema = new mongoose.Schema({
  //ex: "article/""
  // path: {
  //   type: String,
  //   required: true,
  //   maxlength: [30, 'folder name longer than 30!'],
  // },
  // //要包含檔名 
  // fileName: {
  //   type: String,
  //   required: true,
  //   maxlength: [50, 'fileName longer than 50!'],
  // },
  //路徑+檔名
  fullPath: {
    type: String,
    required: true,
    maxlength: [80, 'fileName longer than 50!'],
  },
  //初次新增必定有被一張圖使用
  resourceUsageCount: {
    type: Number,
    default: 1,
  },
  // resourceList: [
  //   {
  //     _id: false,
  //     resource: {
  //       type: mongoose.Schema.Types.ObjectId,
  //       refPath: 'resourceType',
  //       required: true,
  //     },
  //     resourceType: {
  //       type: String,
  //       required: true,
  //       enum: ['Draft', 'Article'],
  //     }
  //   }
  // ],
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

imageSchema.index({
  'fullPath': 1
}, { unique: true })

export default mongoose.model('Image', imageSchema);