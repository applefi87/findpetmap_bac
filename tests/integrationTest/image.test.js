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
import i18n from 'i18n'
import s3Service from '../../src/services/s3Service.js';
import imageConfigs from '../../src/infrastructure/configs/imageConfigs.js';
const articleImageMaxAmount = imageConfigs.articleImage.maxAmount

const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgEB/w7TXMIAAAAASUVORK5CYII=';
const fakeImageBuffer = Buffer.from(base64Image, 'base64');
const image1Id = "60ddc71d3b7f4e3a2c8d9a71"

const articleValidData = {
  petType: '貓',
  color: '橘',
  location: { type: 'Point', coordinates: [121.5111, 25.05111] },
  lostDate: new Date('2024-02-20'),
  lostCityCode: 'A',
  lostDistrict: '內湖區',
  hasReward: true,
  rewardAmount: 50000,
  breed: '英國短毛貓',
  size: 'M',
  age: 1.3,
  gender: 'F',
  hasMicrochip: true,
  title: 'Lost Orange Cat',
  content: 'Lost in Neihu District.',
}

describe('Article Image Upload Tests', function () {
  this.timeout(10000); // Increase timeout for the test suite
  let uploadImageStub;
  let i18nStub;
  let token;
  let userId;
  let articleId;

  const pwd = 'YourTestPassword'; // Replace with your test password

  before(async () => {
    uploadImageStub = sinon.stub(s3Service, 'uploadImage').callsFake((fullPath, fileContent, contentType) => {
      return Promise.resolve(fullPath);
    });
    i18nStub = sinon.stub(i18n, '__').callsFake((key) => key);
  });

  after(async () => {
    uploadImageStub.restore();
    i18nStub.restore();
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

  async function createImageList(totalImages, needFirstPreview = false) {
    const imageList = [];
    for (let i = 1; i <= totalImages; i++) {
      const imageId = `60ddc71d3b7f4e3a2c8d9a7${i}`;
      imageList.push({
        _id: imageId,
        resource: articleId,
        fullPath: `original/${imageId}.jpg`,
        isPreview: i === 1 && needFirstPreview, // Set the first image as the preview by default
      });
    }
    await Image.insertMany(imageList);
    if (needFirstPreview && imageList.length > 1) {
      const previewImageList = [
        { image: image1Id, resource: articleId, fullPath: `preview/${image1Id}.jpg`, isDelete: false },
      ];
      await PreviewImage.insertMany(previewImageList);
    }
  }
  it('should upload a new image for not reached max amount ' + articleImageMaxAmount + ', and no preview before so add it as a preview', async () => {
    // Insert initial images and preview images
    await createImageList(articleImageMaxAmount - 1);

    const res = await request(app)
      .post(`/image/upload/article/${articleId}`)
      .set('Authorization', `Bearer ${token}`)
      .field('isPreview', "true")
      .attach('image', fakeImageBuffer, 'test-image1.jpg');
      
    const newImageOriginalFullPath = res.body.data.fullPath
    const newImagePreviewFullPath = newImageOriginalFullPath.replace("original/", "preview/");
    expect(res.status).to.equal(201);

    const images = await Image.find({ resource: articleId, isDelete: false }).lean();
    expect(images.length).to.be.equal(articleImageMaxAmount);

    const previewImages = await PreviewImage.find({ resource: articleId, isDelete: false }).lean();
    expect(previewImages.length).to.be.equal(1);
    expect(previewImages[0].fullPath).to.be.equal(newImagePreviewFullPath);
  });

  it('should upload a new image, but already have preview, so keep original', async () => {
    // Insert initial images and preview images
    await createImageList(articleImageMaxAmount - 1, true);

    const res = await request(app)
      .post(`/image/upload/article/${articleId}`)
      .set('Authorization', `Bearer ${token}`)
      .field('isPreview', "true")
      .attach('image', fakeImageBuffer, 'test-image1.jpg');
    expect(res.status).to.equal(201);

    const images = await Image.find({ resource: articleId, isDelete: false }).lean();
    expect(images.length).to.be.equal(articleImageMaxAmount);

    const previewImages = await PreviewImage.find({ resource: articleId, isDelete: false }).lean();
    expect(previewImages.length).to.be.equal(1);
    expect(previewImages[0].fullPath).to.be.equal(`preview/${image1Id}.jpg`);
    expect(previewImages[0].image.toString()).to.be.equal(image1Id);
  });

  it('max ' + articleImageMaxAmount + ' image, will throw error', async () => {
    // Insert initial images and preview images
    await createImageList(articleImageMaxAmount, true);
    const res = await request(app)
      .post(`/image/upload/article/${articleId}`)
      .set('Authorization', `Bearer ${token}`)
      .field('isPreview', "true")
      .attach('image', fakeImageBuffer, 'test-image1.jpg');
    expect(res.status).to.equal(422);
    expect(res.body).to.haveOwnProperty('message');
    // i18n
    expect(res.body.message).to.equal("tooManyImages");
    expect(i18nStub.calledWith('tooManyImages')).to.be.true;
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

