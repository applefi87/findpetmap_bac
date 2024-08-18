import { expect } from 'chai';
import mongoose from 'mongoose'
import request from 'supertest';
import bcrypt from 'bcrypt'
import sinon from 'sinon';

import { app } from '../testApp.js'; // Import from the setup file
import User from '../../src/models/userModel.js';
import Image from '../../src/models/imageModel.js';
import PreviewImage from '../../src/models/previewImageModel.js';
import Article from '../../src/models/articleModel.js';

import s3Service from '../../src/services/s3Service.js';

const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgEB/w7TXMIAAAAASUVORK5CYII=';
const fakeImageBuffer = Buffer.from(base64Image, 'base64');
const pwd = "testPASSWORD"
const image1Id = "60ddc71d3b7f4e3a2c8d9a71"
const image2Id = "60ddc71d3b7f4e3a2c8d9a72"
const image3Id = "60ddc71d3b7f4e3a2c8d9a73"
const articleValidData = {
  petType: '貓',
  color: '黑白',
  hasReward: true,
  rewardAmount: 5000,
  hasMicrochip: true,
  lostDate: '2024-08-01',
  lostCityCode: 'A',
  lostDistrict: '中山區',
  location: {
    type: 'Point',
    coordinates: [121.532328, 25.040792]
  },
  content: '我們的貓咪失蹤了，牠的名字是小黑，牠喜歡在公園玩耍。如果有看到牠，請聯繫我們，有重賞！',
};

describe('Article Image Upload Tests', function () {
  this.timeout(10000); // Increase timeout for the test suite
  let uploadImageStub;
  let token;
  let userId;
  let articleId;

  const pwd = 'YourTestPassword'; // Replace with your test password

  before(async () => {
    uploadImageStub = sinon.stub(s3Service, 'uploadImage').callsFake((fullPath, fileContent, contentType) => {
      return Promise.resolve(fullPath);
    });
  });

  after(async () => {
    uploadImageStub.restore();
  });

  beforeEach(async () => {
    // Create a test user
    const user = new User({
      account: 'testaccount',
      password: bcrypt.hashSync(pwd, 8),
      nickname: 'nnnname',
      role: '1',
      safety: { nextTryAvailableAt: Date.now() }
    });
    await user.save();
    userId = user.id.toString();

    // Log in to get JWT token
    const res = await request(app)
      .post('/user/login')
      .send({ account: 'testaccount', password: pwd });
    token = res.body.data.token;

    // Create a test article
    const article = new Article({
      ...articleValidData,
      user: userId,
    });
    await article.save();
    articleId = article.id.toString();
  });

  afterEach(async () => {
    const collections = await mongoose.connection.db?.collections();
    if (collections) {
      for (let collection of collections) {
        await collection.deleteMany({});
      }
    }
  });

  it('should upload a new image, and no preview before so add it as a preview', async () => {
    // Insert initial images and preview images
    const imageList = [
      { _id: image1Id, resource: articleId, fullPath: `original/${image1Id}.jpg`, isPreview: false },
      { _id: image2Id, resource: articleId, fullPath: `original/${image2Id}.jpg`, isPreview: false },
    ];
    await Image.insertMany(imageList);
    const res = await request(app)
      .post(`/image/upload/article/${articleId}`)
      .set('Authorization', `Bearer ${token}`)
      .field('isPreview', "true")
      .attach('image', fakeImageBuffer, 'test-image1.jpg');
    const newImageOriginalFullPath = res.body.data.fullPath
    const newImagePreviewFullPath = newImageOriginalFullPath.replace("original/", "preview/");
    expect(res.status).to.equal(201);

    const images = await Image.find({ resource: articleId, isDelete: false }).lean();
    expect(images.length).to.be.equal(3);

    const previewImages = await PreviewImage.find({ resource: articleId, isDelete: false }).lean();
    expect(previewImages.length).to.be.equal(1);
    expect(previewImages[0].fullPath).to.be.equal(newImagePreviewFullPath);
  });

  it('should upload a new image, but already have preview, so keep original', async () => {
    // Insert initial images and preview images
    const imageList = [
      { _id: image1Id, resource: articleId, fullPath: `original/${image1Id}.jpg`, isPreview: true },
      { _id: image2Id, resource: articleId, fullPath: `original/${image2Id}.jpg`, isPreview: false },
    ];
    await Image.insertMany(imageList);

    const previewImageList = [
      { image: image1Id, resource: articleId, fullPath: `preview/${image1Id}.jpg`, isDelete: false },
    ];
    await PreviewImage.insertMany(previewImageList);

    const res = await request(app)
      .post(`/image/upload/article/${articleId}`)
      .set('Authorization', `Bearer ${token}`)
      .field('isPreview', "true")
      .attach('image', fakeImageBuffer, 'test-image1.jpg');
    const newImageOriginalFullPath = res.body.data.fullPath
    expect(res.status).to.equal(201);

    const images = await Image.find({ resource: articleId, isDelete: false }).lean();
    expect(images.length).to.be.equal(3);

    const previewImages = await PreviewImage.find({ resource: articleId, isDelete: false }).lean();
    expect(previewImages.length).to.be.equal(1);
    expect(previewImages[0].fullPath).to.be.equal(`preview/${image1Id}.jpg`);
    expect(previewImages[0].image.toString()).to.be.equal(image1Id);
  });

  it('max 3 image, will throw error', async () => {
    // Insert initial images and preview images
    const imageList = [
      { _id: image1Id, resource: articleId, fullPath: `original/${image1Id}.jpg`, isPreview: true },
      { _id: image2Id, resource: articleId, fullPath: `original/${image2Id}.jpg`, isPreview: false },
      { _id: image3Id, resource: articleId, fullPath: `original/${image3Id}.jpg`, isPreview: false },
    ];
    await Image.insertMany(imageList);
    const previewImageList = [
      { image: image1Id, resource: articleId, fullPath: `preview/${image1Id}.jpg`, isDelete: false },
    ];
    await PreviewImage.insertMany(previewImageList);
    const res = await request(app)
      .post(`/image/upload/article/${articleId}`)
      .set('Authorization', `Bearer ${token}`)
      .field('isPreview', "true")
      .attach('image', fakeImageBuffer, 'test-image1.jpg');
    expect(res.status).to.equal(422);
    expect(res.body).to.haveOwnProperty('message');
    expect(res.body.message).to.be.equal("tooManyImages");
  });


  it('If first image of article, will force set as preview image', async () => {
    const res = await request(app)
      .post(`/image/upload/article/${articleId}`)
      .set('Authorization', `Bearer ${token}`)
      .field('isPreview', "false")
      .attach('image', fakeImageBuffer, 'test-image1.jpg');
    const newImageOriginalFullPath = res.body.data.fullPath
    const newImagePreviewFullPath = newImageOriginalFullPath.replace("original/", "preview/");
    expect(res.status).to.equal(201);

    const images = await Image.find({ resource: articleId, isDelete: false }).lean();
    expect(images.length).to.be.equal(1);
    expect(images[0].fullPath).to.be.equal(newImageOriginalFullPath);
    expect(images[0].isPreview).to.be.true;

    const previewImages = await PreviewImage.find({ resource: articleId, isDelete: false }).lean();
    expect(previewImages.length).to.be.equal(1);
    expect(previewImages[0].fullPath).to.be.equal(newImagePreviewFullPath);
  });
});
