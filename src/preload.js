import 'dotenv/config' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import mongoose from 'mongoose'

// 初始化
mongoose.set('strictQuery', true);
mongoose.set('sanitizeFilter', true)
mongoose.connect(process.env.mongoDB_atlas_URL, { autoIndex: true })