import { expect } from 'chai';
import mongoose from 'mongoose'
import { trusted } from 'mongoose'
import request from 'supertest';
import sinon from 'sinon';
import bcrypt from 'bcrypt'

import { app } from '../testApp.js'; // Import from the setup file
import s3Service from '../../src/services/s3Service.js';
import User from '../../src/models/userModel.js';
import Image from '../../src/models/imageModel.js';
// import Article from '../../src/models/articleModel.js';

const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgEB/w7TXMIAAAAASUVORK5CYII=';
const fakeImageBuffer = Buffer.from(base64Image, 'base64');
const pwd = "testPASSWORD"
const exampleFullPath = 'mocked-image-fullPath.jpg'

// describe('Image Draft Tests', function () {
//   this.timeout(10000); // Increase timeout for the test suite
//   let uploadImageStub;
//   let token
//   before(async () => {

//     uploadImageStub = sinon.stub(s3Service, 'uploadImage').callsFake((fullPath, fileContent, contentType) => {
//       return Promise.resolve(fullPath);
//     });
//   });

//   after(async () => {
//     uploadImageStub.restore();
//   });

//   beforeEach(async () => {
//     const collections = await mongoose.connection.db?.collections();
//     if (collections) {
//       for (let collection of collections) {
//         await collection.deleteMany({});
//       }
//     }

//     // Create a test user
//     const user = new User({ account: 'testaccount', password: bcrypt.hashSync(pwd, 8), nickname: 'nnnname', role: '1', safety: { nextTryAvailableAt: Date.now() } });
//     await user.save();
//     // Log in to get JWT token
//     const res = await request(app)
//       .post('/user/login') // Adjust to your login route
//       .send({ account: 'testaccount', password: pwd });
//     token = res.body.data.token;
//   });

//   it('should upload an image and save to draft', async () => {
//     const res = await request(app)
//       .post('/image/upload/draft')
//       .set('Authorization', `Bearer ${token}`)
//       .attach('image', fakeImageBuffer, 'test-image.jpg');
//     expect(res.status).to.equal(201);
//     const newImage1 = await Image.findOne({}).lean()
//     // 應該是完整url , 但這省略
//     expect(res.body).to.have.property('data', newImage1.fullPath);
//   });

//   it('should refresh image list in draft', async () => {
//     // 模擬已經上傳圖片，重整圖片清單
//     const image = new Image({ fullPath: exampleFullPath });
//     await image.save();
//     const res = await request(app)
//       .post('/image/refreshImageList/draft')
//       .set('Authorization', `Bearer ${token}`)
//       .send({ imageList: [exampleFullPath] });
//     expect(res.status).to.equal(201);
//     const updatedImage = await Image.findOne({ fullPath: exampleFullPath }).lean()
//     expect(updatedImage.resourceUsageCount).to.equal(2);
//   });

//   it('模擬完整上傳圖片>建立draft>整理list', async () => {
//     let res = await request(app)
//       .post('/image/upload/draft')
//       .set('Authorization', `Bearer ${token}`)
//       .attach('image', fakeImageBuffer, 'test-image1.jpg');
//     expect(res.status).to.equal(201);
//     const newImage1 = await Image.findOne({}).lean()
//     // 應該是完整url , 但這省略
//     expect(res.body).to.have.property('data', newImage1.fullPath);
//     //
//     res = await request(app)
//       .post('/image/upload/draft')
//       .set('Authorization', `Bearer ${token}`)
//       .attach('image', fakeImageBuffer, 'test-image2.jpg');
//     expect(res.status).to.equal(201);
//     const newImage2 = await Image.findOne({ _id: trusted({ $ne: newImage1._id }) }).lean()
//     // 應該是完整url , 但這省略
//     expect(res.body).to.have.property('data', newImage2.fullPath);
//     expect(newImage2.resourceUsageCount).to.equal(1);
//     // 模擬已經上傳圖片，重整圖片清單

//     res = await request(app)
//       .post('/image/refreshImageList/draft')
//       .set('Authorization', `Bearer ${token}`)
//       // 應該被去重複
//       .send({ imageList: [newImage1.fullPath, newImage1.fullPath] });
//     expect(res.status).to.equal(201);
//     const updatedImage1 = await Image.findOne({ fullPath: newImage1.fullPath }).lean()
//     expect(updatedImage1.resourceUsageCount).to.equal(1);
//     const updatedImage2 = await Image.findOne({ fullPath: newImage2.fullPath }).lean()
//     expect(updatedImage2.resourceUsageCount).to.equal(0);
//   });
// });



// describe('Image ArticleUpdateDraft Tests', function () {
//   this.timeout(10000); // Increase timeout for the test suite
//   let fakeBoardId = "66b00e546825dddd54b0f745"
//   let uploadImageStub;
//   let token
//   let articleId
//   let userId
//   before(async () => {

//     uploadImageStub = sinon.stub(s3Service, 'uploadImage').callsFake((fullPath, fileContent, contentType) => {
//       return Promise.resolve(fullPath);
//     });
//   });

//   after(async () => {
//     uploadImageStub.restore();
//   });

//   beforeEach(async () => {
//     const collections = await mongoose.connection.db?.collections();
//     if (collections) {
//       for (let collection of collections) {
//         await collection.deleteMany({});
//       }
//     }

//     // ********create user and get token***********
//     const user = new User({ account: 'testaccount', password: bcrypt.hashSync(pwd, 8), nickname: 'nnnname', role: '1', safety: { nextTryAvailableAt: Date.now() } });
//     await user.save();
//     userId = user._id.toString()
//     const res = await request(app)
//       .post('/user/login')
//       .send({ account: 'testaccount', password: pwd });
//     token = res.body.data.token;
//     // ********create article***********
//     const articleData = {
//       board: fakeBoardId,
//       user: userId,
//       lang: "zh-TW",
//       privacy: "0",
//       title: "article title",
//       content: "article content tttttttttttttttttt.",
//     }
//     // Create a test user
//     const article = new Article(articleData);
//     await article.save();
//     articleId = article._id.toString()



//   });
//   // articleUpdateDraft

//   it('should upload an image and save to articleUpdateDraft', async () => {
//     const res = await request(app)
//       .post('/image/upload/articleUpdateDraft/' + articleId)
//       .set('Authorization', `Bearer ${token}`)
//       .attach('image', fakeImageBuffer, 'test-image.jpg');
//     expect(res.status).to.equal(201);
//     const newImage1 = await Image.findOne({}).lean()
//     // 應該是完整url , 但這省略
//     expect(res.body).to.have.property('data', newImage1.fullPath);
//   });

//   it('should refresh image list in draft', async () => {
//     // 模擬已經上傳圖片，重整圖片清單
//     const image = new Image({ fullPath: exampleFullPath });
//     await image.save();
//     const res = await request(app)
//       .post('/image/refreshImageList/articleUpdateDraft/' + articleId)
//       .set('Authorization', `Bearer ${token}`)
//       .send({ imageList: [exampleFullPath] });
//     expect(res.status).to.equal(201);
//     const updatedImage = await Image.findOne({ fullPath: exampleFullPath }).lean()
//     expect(updatedImage.resourceUsageCount).to.equal(2);
//   });

//   it('模擬完整上傳圖片>建立draft>整理list', async () => {
//     let res = await request(app)
//       .post('/image/upload/articleUpdateDraft/' + articleId)
//       .set('Authorization', `Bearer ${token}`)
//       .attach('image', fakeImageBuffer, 'test-image1.jpg');
//     expect(res.status).to.equal(201);
//     const newImage1 = await Image.findOne({}).lean()
//     // 應該是完整url , 但這省略
//     expect(res.body).to.have.property('data', newImage1.fullPath);
//     //
//     res = await request(app)
//       .post('/image/upload/articleUpdateDraft/' + articleId)
//       .set('Authorization', `Bearer ${token}`)
//       .attach('image', fakeImageBuffer, 'test-image2.jpg');
//     expect(res.status).to.equal(201);
//     const newImage2 = await Image.findOne({ _id: trusted({ $ne: newImage1._id }) }).lean()
//     // 應該是完整url , 但這省略
//     expect(res.body).to.have.property('data', newImage2.fullPath);
//     expect(newImage2.resourceUsageCount).to.equal(1);
//     // 模擬已經上傳圖片，重整圖片清單

//     res = await request(app)
//       .post('/image/refreshImageList/articleUpdateDraft/' + articleId)
//       .set('Authorization', `Bearer ${token}`)
//       // 應該被去重複
//       .send({ imageList: [newImage1.fullPath, newImage1.fullPath] });
//     expect(res.status).to.equal(201);
//     const updatedImage1 = await Image.findOne({ fullPath: newImage1.fullPath }).lean()
//     expect(updatedImage1.resourceUsageCount).to.equal(1);
//     const updatedImage2 = await Image.findOne({ fullPath: newImage2.fullPath }).lean()
//     expect(updatedImage2.resourceUsageCount).to.equal(0);
//   });
// });
