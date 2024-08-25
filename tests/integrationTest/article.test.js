import { expect } from 'chai';
import mongoose from 'mongoose'
import { trusted } from 'mongoose'
import request from 'supertest';
import articleConfigs from "../../src/infrastructure/configs/articleConfigs.js"
import bcrypt from 'bcrypt'

import { app } from '../testApp.js'; // Import from the setup file
import User from '../../src/models/userModel.js';
import Article from '../../src/models/articleModel.js';
import Image from '../../src/models/imageModel.js';
import PreviewImage from '../../src/models/previewImageModel.js';

import s3Service from '../../src/services/s3Service.js';
import { processImage } from '../../src/utils/image.js';


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

describe('ArticleController Create Tests', function () {
  this.timeout(10000); // Increase timeout for the test suite
  let token
  let userId
  before(async () => {
  });

  after(async () => {
  });

  beforeEach(async () => {
    // Create a test user
    const user = new User({ account: 'testaccount', password: bcrypt.hashSync(pwd, 8), nickname: 'nnnname', role: '1', safety: { nextTryAvailableAt: Date.now() } });
    await user.save();
    userId = user.id.toString()
    // Log in to get JWT token
    const res = await request(app)
      .post('/user/login') // Adjust to your login route
      .send({ account: 'testaccount', password: pwd });
    token = res.body.data.token;
  });
  afterEach(async () => {
    const collections = await mongoose.connection.db?.collections();
    if (collections) {
      for (let collection of collections) {
        await collection.deleteMany({});
      }
    }
  });

  const testCases = [
    {
      name: 'valid data',
      data: {
        ...articleValidData,
        isDelete: true,
        createdAt: new Date() - 24 * 60 * 60 * 1000,
        updatedAt: new Date() - 24 * 60 * 60 * 1000
      },
      expectedStatus: 201,
      expectedIsDelete: false,
    },
    // Missing required fields
    {
      name: 'missing required field "lostDate"',
      data: {
        ...articleValidData,
        lostDate: undefined,
        isDelete: true,
        createdAt: new Date() - 24 * 60 * 60 * 1000,
        updatedAt: new Date() - 24 * 60 * 60 * 1000
      },
      expectedStatus: 422,
    },
    {
      name: 'missing required field "petType"',
      data: {
        ...articleValidData,
        petType: undefined,
        isDelete: true,
        createdAt: new Date() - 24 * 60 * 60 * 1000,
        updatedAt: new Date() - 24 * 60 * 60 * 1000
      },
      expectedStatus: 422,
    },

    // Invalid data types
    {
      name: 'invalid data type for "rewardAmount"',
      data: {
        ...articleValidData,
        hasReward: true,
        rewardAmount: 'five thousand',
        isDelete: true,
        createdAt: new Date() - 24 * 60 * 60 * 1000,
        updatedAt: new Date() - 24 * 60 * 60 * 1000
      },
      expectedStatus: 422,
    },
    {
      name: 'invalid data type for "location.coordinates"',
      data: {
        ...articleValidData,
        location: {
          type: 'Point',
          coordinates: ['121.532328', '25.040792'] // Strings instead of numbers
        },
        isDelete: true,
        createdAt: new Date() - 24 * 60 * 60 * 1000,
        updatedAt: new Date() - 24 * 60 * 60 * 1000
      },
      expectedStatus: 422,
    },

    // Edge Cases
    {
      name: 'rewardAmount should be greater than 0',
      data: {
        ...articleValidData,
        hasReward: true,
        rewardAmount: 0, // Testing the minimum valid value
        isDelete: true,
        createdAt: new Date() - 24 * 60 * 60 * 1000,
        updatedAt: new Date() - 24 * 60 * 60 * 1000
      },
      expectedStatus: 422,
      expectedIsDelete: false,
    },
    {
      name: 'maximum string length for "content"',
      data: {
        ...articleValidData,
        content: 'A'.repeat(articleConfigs.content.maxLength), // Maximum allowed content length
        isDelete: true,
        createdAt: new Date() - 24 * 60 * 60 * 1000,
        updatedAt: new Date() - 24 * 60 * 60 * 1000
      },
      expectedStatus: 201,
      expectedIsDelete: false,
    },

    // Invalid enum values
    {
      name: 'invalid enum value for "petType"',
      data: {
        ...articleValidData,
        petType: 'dragon', // Invalid pet type
        isDelete: true,
        createdAt: new Date() - 24 * 60 * 60 * 1000,
        updatedAt: new Date() - 24 * 60 * 60 * 1000
      },
      expectedStatus: 422,
    },
    {
      name: 'invalid enum value for "lostCityCode"',
      data: {
        ...articleValidData,
        lostCityCode: 'Z', // Invalid city code
        isDelete: true,
        createdAt: new Date() - 24 * 60 * 60 * 1000,
        updatedAt: new Date() - 24 * 60 * 60 * 1000
      },
      expectedStatus: 422,
    },

    // Logical inconsistencies
    {
      name: 'rewardAmount without hasReward being true',
      data: {
        ...articleValidData,
        hasReward: false,
        rewardAmount: 5000, // Should not allow a reward amount if hasReward is false
        isDelete: true,
        createdAt: new Date() - 24 * 60 * 60 * 1000,
        updatedAt: new Date() - 24 * 60 * 60 * 1000
      },
      expectedStatus: 422,
    }
  ];

  testCases.forEach(({ name, data, expectedStatus, expectedIsDelete }) => {
    it(`createArticle - ${name}`, async () => {
      const res = await request(app)
        .post('/article/create')
        .set('Authorization', `Bearer ${token}`)
        .send(data);

      expect(res.status).to.equal(expectedStatus);

      if (expectedStatus === 201) {
        const newArticle = await Article.findOne({}).lean();
        // 輸入是字串，但存資料庫是date，同時date不能比較，所以用文字比較
        newArticle.lostDate = new Date(newArticle.lostDate).toLocaleDateString('en-CA');
        const articleValidDataWithoutLocation = { ...data };
        expect(newArticle).to.include(removeNotEditableProperties(articleValidDataWithoutLocation));
        expect(newArticle).to.have.property('location').that.deep.equals(data.location);
        // 以下區域應該是系統自動產生的,不該被用戶附職
        expect(newArticle.isDelete).to.equal(expectedIsDelete);
        expect(newArticle.createdAt).to.not.equal(data.createdAt);
        expect(newArticle.updatedAt).to.not.equal(data.updatedAt);
      }
    });
  });
});

function removeNotEditableProperties(article) {
  // location 物件不能比較，所以刪除另外用.deep.equals 比較
  delete article.location;
  // 以下區域應該是系統自動產生的,不該被用戶附職
  delete article.isDelete;
  delete article.createdAt;
  delete article.updatedAt;
  return article;
}

describe('ArticleController Update Tests', function () {
  this.timeout(10000); // Increase timeout for the test suite
  let token;
  let userId;
  let articleId;

  before(async () => {
    // Your setup logic here, if needed
  });

  after(async () => {
    // Your teardown logic here, if needed
  });


  beforeEach(async () => {
    // Create a test user
    const user = new User({ account: 'testaccount', password: bcrypt.hashSync(pwd, 8), nickname: 'nnnname', role: '1', safety: { nextTryAvailableAt: Date.now() } });
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


  const testCases = [
    {
      name: 'valid data with valid updateImageList',
      data: {
        ...articleValidData,
        isDelete: true,
        createdAt: new Date() - 24 * 60 * 60 * 1000,
        updatedAt: new Date() - 24 * 60 * 60 * 1000,
        updateImageList: [
          { id: image1Id, isPreview: true },
          { id: image2Id, isPreview: false }
        ]
      },
      expectedStatus: 200,
      expectedIsDelete: false,
    },
    // Missing required fields
    {
      name: 'missing required field "lostDate" with valid updateImageList',
      data: {
        ...articleValidData,
        lostDate: undefined,
        isDelete: true,
        createdAt: new Date() - 24 * 60 * 60 * 1000,
        updatedAt: new Date() - 24 * 60 * 60 * 1000,
        updateImageList: [
          { id: image1Id, isPreview: true },
        ]
      },
      expectedStatus: 422,
    },
    {
      name: 'missing required field "petType" with valid updateImageList',
      data: {
        ...articleValidData,
        petType: undefined,
        isDelete: true,
        createdAt: new Date() - 24 * 60 * 60 * 1000,
        updatedAt: new Date() - 24 * 60 * 60 * 1000,
        updateImageList: [
          { id: image1Id, isPreview: true },
        ]
      },
      expectedStatus: 422,
    },

    // Invalid data types
    {
      name: 'invalid data type for "rewardAmount" with valid updateImageList',
      data: {
        ...articleValidData,
        rewardAmount: 'five thousand',
        isDelete: true,
        createdAt: new Date() - 24 * 60 * 60 * 1000,
        updatedAt: new Date() - 24 * 60 * 60 * 1000,
        updateImageList: [
          { id: image1Id, isPreview: true },
        ]
      },
      expectedStatus: 422,
    },
    {
      name: 'invalid data type for "location.coordinates" with valid updateImageList',
      data: {
        ...articleValidData,
        location: {
          type: 'Point',
          coordinates: ['121.532328', '25.040792'] // Strings instead of numbers
        },
        isDelete: true,
        createdAt: new Date() - 24 * 60 * 60 * 1000,
        updatedAt: new Date() - 24 * 60 * 60 * 1000,
        updateImageList: [
          { id: image1Id, isPreview: true },
        ]
      },
      expectedStatus: 422,
    },

    // Edge Cases
    {
      name: 'minimum valid rewardAmount with valid updateImageList',
      data: {
        ...articleValidData,
        rewardAmount: 1, // Testing the minimum valid value
        isDelete: true,
        createdAt: new Date() - 24 * 60 * 60 * 1000,
        updatedAt: new Date() - 24 * 60 * 60 * 1000,
        updateImageList: [
          { id: image1Id, isPreview: true },
        ]
      },
      expectedStatus: 200,
      expectedIsDelete: false,
    },
    {
      name: 'maximum string length for "content" with valid updateImageList',
      data: {
        ...articleValidData,
        content: 'A'.repeat(articleConfigs.content.maxLength), // Maximum allowed content length
        isDelete: true,
        createdAt: new Date() - 24 * 60 * 60 * 1000,
        updatedAt: new Date() - 24 * 60 * 60 * 1000,
        updateImageList: [
          { id: image1Id, isPreview: true },
        ]
      },
      expectedStatus: 200,
      expectedIsDelete: false,
    },

    // Invalid enum values
    {
      name: 'invalid enum value for "petType" with valid updateImageList',
      data: {
        ...articleValidData,
        petType: 'dragon', // Invalid pet type
        isDelete: true,
        createdAt: new Date() - 24 * 60 * 60 * 1000,
        updatedAt: new Date() - 24 * 60 * 60 * 1000,
        updateImageList: [
          { id: image1Id, isPreview: true },
        ]
      },
      expectedStatus: 422,
    },
    {
      name: 'invalid enum value for "lostCityCode" with valid updateImageList',
      data: {
        ...articleValidData,
        lostCityCode: 'Z', // Invalid city code
        isDelete: true,
        createdAt: new Date() - 24 * 60 * 60 * 1000,
        updatedAt: new Date() - 24 * 60 * 60 * 1000,
        updateImageList: [
          { id: image1Id, isPreview: true },
        ]
      },
      expectedStatus: 422,
    },

    // Logical inconsistencies
    {
      name: 'rewardAmount without hasReward being true with valid updateImageList',
      data: {
        ...articleValidData,
        hasReward: false,
        rewardAmount: 5000, // Should not allow a reward amount if hasReward is false
        isDelete: true,
        createdAt: new Date() - 24 * 60 * 60 * 1000,
        updatedAt: new Date() - 24 * 60 * 60 * 1000,
        updateImageList: [
          { id: image1Id, isPreview: true },
        ]
      },
      expectedStatus: 422,
    },
  ];

  testCases.forEach(({ name, data, expectedStatus, expectedIsDelete }) => {
    it(`updateArticle - ${name}`, async () => {
      const res = await request(app)
        .put(`/article/update/${articleId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(data);
      expect(res.status).to.equal(expectedStatus);

      if (expectedStatus === 200) {
        const updatedArticle = await Article.findById(articleId).lean();
        updatedArticle.lostDate = new Date(updatedArticle.lostDate).toLocaleDateString('en-CA');
        const articleValidDataWithoutLocationUpdateImageList = { ...data };
        delete articleValidDataWithoutLocationUpdateImageList.location;
        delete articleValidDataWithoutLocationUpdateImageList.updateImageList

        expect(updatedArticle).to.include(removeNotEditableProperties(articleValidDataWithoutLocationUpdateImageList));
        expect(updatedArticle).to.have.property('location').that.deep.equals(data.location);
        expect(updatedArticle.isDelete).to.equal(expectedIsDelete);
        expect(updatedArticle.createdAt).to.not.equal(data.createdAt);
        expect(updatedArticle.updatedAt).to.not.equal(data.updatedAt);
      }
    });
  });
});

const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgEB/w7TXMIAAAAASUVORK5CYII=';
const fakeImageBuffer = Buffer.from(base64Image, 'base64');
// 預設情況: 本來就要有建立的圖片2張+有預覽圖1張
// 大邏輯: 預覽圖，只有在增加後才會把舊的改刪除(確保不會沒圖)
// 所以有不同的因應情形: 
// 1.沒有續用圖: 把舊的全改isDelete，而預覽圖不能被刪除，反正後續步驟會把它改掉，沒改掉也不影響
// 2.不動預覽狀態，可能一張沒續用(一個有預覽) : 那一張被改刪除&&預覽圖不能被刪除
// 3.增加預覽(沒有): 兩張有一張新改成預覽圖，所以除了圖片欄位改，舊預覽要刪除+建新預覽
// 4.重回預覽(原本有，但目前預覽圖是刪除狀態): 該預計預覽的路徑已經有了(取得id)，所以把該resource所有預覽圖刪除&對應id的不可為刪除
describe('ArticleController Update Tests For Image Handle', function () {
  this.timeout(10000); // Increase timeout for the test suite
  let token;
  let userId;
  let articleId;

  before(async () => {
    s3Service.changeBucketNameForTest()
    const result = await processImage(fakeImageBuffer, 'jpeg', true)
    await s3Service.uploadImage(`original/${image1Id}.jpg`, result);
    await s3Service.uploadImage(`original/${image2Id}.jpg`, result);
    await s3Service.uploadImage(`original/${image3Id}.jpg`, result);
    await s3Service.processAndUploadImage(`original/${image1Id}.jpg`, `preview/${image1Id}.jpg`)
  });

  after(async () => {
    await s3Service.deleteImage(`original/${image1Id}.jpg`);
    await s3Service.deleteImage(`original/${image2Id}.jpg`);
    await s3Service.deleteImage(`original/${image3Id}.jpg`);
    await s3Service.deleteImage(`preview/${image1Id}.jpg`);
    await s3Service.deleteImage(`preview/${image2Id}.jpg`);
  });

  beforeEach(async () => {
    // Create a test user
    const user = new User({ account: 'testaccount', password: bcrypt.hashSync(pwd, 8), nickname: 'nnnname', role: '1', safety: { nextTryAvailableAt: Date.now() } });
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

    //
    const imageList = [
      { _id: image1Id, resource: articleId, fullPath: `original/${image1Id}.jpg`, isPreview: true },
      { _id: image2Id, resource: articleId, fullPath: `original/${image2Id}.jpg`, isPreview: false },
      { _id: image3Id, resource: articleId, fullPath: `original/${image3Id}.jpg`, isPreview: false },
    ];
    await Image.insertMany(imageList);
    const previewIageList = [
      {
        image: image1Id, resource: articleId, fullPath: `preview/${image1Id}.jpg`, isDelete: false
      }
    ];
    await PreviewImage.insertMany(previewIageList);
  });

  afterEach(async () => {
    const collections = await mongoose.connection.db?.collections();
    if (collections) {
      for (let collection of collections) {
        await collection.deleteMany({});
      }
    }
  });

  it('should retain existing preview image when no new preview is selected', async () => {
    const updateImageList = []; // No keep image
    const data = { ...articleValidData, updateImageList };
    const res = await request(app)
      .put(`/article/update/${articleId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(data);
    expect(res.status).to.equal(200);
    // Check that all images are deleted
    let images = await Image.find({ resource: articleId, isDelete: false }).lean();
    expect(images.length).to.be.equal(0);
    // should not be deleted
    let previewImage = await PreviewImage.findOne({ image: image1Id, isDelete: false }).lean();
    expect(previewImage).to.not.be.null;
  });

  it('should keep the selected image as the only preview and remove others', async () => {
    const updateImageList = [{ id: image1Id, isPreview: true }];
    const data = { ...articleValidData, updateImageList };
    const res = await request(app)
      .put(`/article/update/${articleId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(data);
    expect(res.status).to.equal(200);

    let image = await Image.findOne({ _id: image1Id }).lean();
    expect(image.isDelete).to.be.false;
    expect(image.isPreview).to.be.true;
    image = await Image.findOne({ _id: image2Id }).lean();
    expect(image.isDelete).to.be.true;
    image = await Image.findOne({ _id: image3Id }).lean();
    expect(image.isDelete).to.be.true;

    const previewImage = await PreviewImage.findOne({ image: image1Id, isDelete: false }).lean();
    expect(previewImage).to.not.be.null;
    expect(previewImage.fullPath).to.include(`preview/${image1Id}.jpg`);

    const otherPreviewImages = await PreviewImage.find({ image: trusted({ $ne: image1Id }) }).lean();
    expect(otherPreviewImages).to.be.empty;
  });

  it('should create a preview image if none existed previously', async () => {
    const updateImageList = [{ id: image2Id, isPreview: true }];
    const data = { ...articleValidData, updateImageList };
    const res = await request(app)
      .put(`/article/update/${articleId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(data);
    expect(res.status).to.equal(200);

    let image1 = await Image.findOne({ _id: image1Id }).lean();
    expect(image1.isDelete).to.be.true;

    let image2 = await Image.findOne({ _id: image2Id }).lean();
    expect(image2.isDelete).to.be.false;
    expect(image2.isPreview).to.be.true;

    const previewImage = await PreviewImage.findOne({ image: image2Id, isDelete: false }).lean();
    expect(previewImage).to.not.be.null;
    expect(previewImage.fullPath).to.be.equal(`preview/${image2Id}.jpg`)

  });

  it('should restore a deleted preview image if it is re-selected', async () => {
    const previewIageList = [
      {
        image: image2Id, resource: articleId, fullPath: `preview/${image2Id}.jpg`, isDelete: true
      },
    ];
    await PreviewImage.insertMany(previewIageList);
    await s3Service.processAndUploadImage(`original/${image2Id}.jpg`, `preview/${image2Id}.jpg`)
    const updateImageList = [
      { id: image1Id, isPreview: false },
      { id: image2Id, isPreview: true }
    ];
    const data = { ...articleValidData, updateImageList };
    const res = await request(app)
      .put(`/article/update/${articleId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(data);
    expect(res.status).to.equal(200);

    let image1 = await Image.findOne({ _id: image1Id }).lean();
    expect(image1.isDelete).to.be.false;
    expect(image1.isPreview).to.be.false;

    let image2 = await Image.findOne({ _id: image2Id }).lean();
    expect(image2.isDelete).to.be.false;
    expect(image2.isPreview).to.be.true;

    const previewImages = await PreviewImage.find({ resource: articleId, isDelete: false }).lean();
    expect(previewImages).to.have.lengthOf(1);
    expect(previewImages[0].image.toString()).to.be.equal(image2Id);
    expect(previewImages[0].fullPath).to.be.equal(`preview/${image2Id}.jpg`);
  });
});


describe('ArticleController delete Tests', function () {
  this.timeout(10000); // Increase timeout for the test suite
  let token;
  let userId;
  let articleId;
  let otherArticleId;

  before(async () => {
    // Any setup logic if needed
  });

  after(async () => {
    // Any teardown logic if needed
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

    // Create a test article for the user
    const article = new Article({
      ...articleValidData,
      user: userId,
    });
    await article.save();
    articleId = article.id.toString();

    // Create another test article for a different user
    const otherArticle = new Article({
      ...articleValidData,
      user: "66b86e8297709336ef263543",
    });
    await otherArticle.save();
    otherArticleId = otherArticle.id.toString();
  });
  afterEach(async () => {
    const collections = await mongoose.connection.db?.collections();
    if (collections) {
      for (let collection of collections) {
        await collection.deleteMany({});
      }
    }
  });


  const testCases = [
    // Case 1: Valid deletion by the article owner
    {
      name: 'valid deletion by the article owner',
      articleId: () => articleId,
      token: () => token,
      expectedStatus: 200,
      shouldExistAfter: false,
    },
    // Case 2: Attempt to delete article by a different user (not the owner)
    {
      name: 'unauthorized deletion attempt by a different user',
      articleId: () => otherArticleId,
      token: () => token,
      expectedStatus: 422,
      shouldExistAfter: true,
    },
    // Case 3: Attempt to delete a non-existent article
    {
      name: 'deletion attempt of a non-existent article',
      articleId: () => "66b86e8297709336ef263543", // Random non-existent ID
      token: () => token,
      expectedStatus: 422,
      shouldExistAfter: false,
    },
    // Case 4: Deletion attempt without a valid token
    {
      name: 'deletion attempt without a valid token',
      articleId: () => articleId,
      token: () => null, // No token provided
      expectedStatus: 401,
      shouldExistAfter: true,
    },
    // Case 5: Deletion attempt with an expired or invalid token
    {
      name: 'deletion attempt with an expired or invalid token',
      articleId: () => articleId,
      token: () => 'invalidtoken', // Invalid token
      expectedStatus: 401,
      shouldExistAfter: true,
    },
  ];

  testCases.forEach(({ name, articleId, token, expectedStatus, shouldExistAfter }) => {
    it(`deleteArticle - ${name}`, async () => {
      const res = await request(app)
        .delete(`/article/${articleId()}`)
        .set('Authorization', token() ? `Bearer ${token()}` : '');
      expect(res.status).to.equal(expectedStatus);

      const deletedArticle = await Article.findOne({ _id: articleId(), isDelete: false }).lean();
      if (shouldExistAfter) {
        expect(deletedArticle).to.not.be.null;
      } else {
        expect(deletedArticle).to.be.null;
      }
    });
  });
});


describe('ArticleController getArticleDetail Tests', function () {
  this.timeout(10000); // Increase timeout for the test suite
  let token;
  let userId;
  let articleId;

  before(async () => {
    // Any global setup logic if needed
  });

  after(async () => {
    // Any global teardown logic if needed
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

    // Create a test article for the user
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


  const testCases = [
    // Case 1: Valid ID and article exists
    {
      name: 'valid ID and article exists',
      articleId: () => articleId,
      token: () => token,
      expectedStatus: 200,
      shouldReturnArticle: true,
    },
    // Case 4: Valid ID but no token provided
    {
      name: 'valid ID but no token provided, should still pass',
      articleId: () => articleId,
      token: () => null,
      expectedStatus: 200,
      shouldReturnArticle: true,
    },
    // Case 2: Invalid ID format
    {
      name: 'invalid ID format',
      articleId: () => 'invalidID123',
      token: () => token,
      expectedStatus: 422,
      shouldReturnArticle: false,
    },
    // Case 3: Valid ID but article does not exist
    {
      name: 'valid ID but article does not exist',
      articleId: () => '66b86e8297709336ef263543', // Some random ObjectId
      token: () => token,
      expectedStatus: 422,
      shouldReturnArticle: false,
    },

  ];

  testCases.forEach(({ name, articleId, token, expectedStatus, shouldReturnArticle }) => {
    it(`getArticleDetail - ${name}`, async () => {
      const res = await request(app)
        .post(`/article/${articleId()}`)
        .set('Authorization', token() ? `Bearer ${token()}` : '');
      expect(res.status).to.equal(expectedStatus);

      if (shouldReturnArticle) {
        expect(res.body.data).to.have.property('article');
        expect(res.body.data.article).to.have.property('_id', articleId());
      } else {
        if (res.body.data) {
          expect(res.body.data).to.not.have.property('article');
        } else {
          expect(res.body).to.not.have.property('data');
        }
      }
    });
  });
});
describe.only('ArticleController searchArticleList Tests', function () {
  this.timeout(10000); // Increase timeout for the test suite
  let token;
  let userId;

  // Sample password for the test user
  const pwd = 'Test@1234';

  // Sample article data
  const articleData = [
    {
      petType: '貓',
      color: '橘',
      location: { type: 'Point', coordinates: [121.5111, 25.05111] },
      lostDate: new Date('2024-02-20'),
      lostCityCode: 'A',
      lostDistrict: '內湖區',
      hasReward: true,
      rewardAmount: 50000,
      hasMicrochip: true,
      title: 'Lost Orange Cat',
      content: 'Lost in Neihu District.',
    },
    {
      petType: '狗',
      color: '黑',
      location: { type: 'Point', coordinates: [121.6, 25.04] },
      lostDate: new Date('2024-02-18'),
      lostCityCode: 'T',
      lostDistrict: '信義區',
      hasReward: false,
      hasMicrochip: false,
      title: 'Lost Black Dog',
      content: 'Lost near Taipei 101.',
    },
    // Add more articles as needed for testing
  ];

  before(async () => {
    // Any global setup logic if needed
  });

  after(async () => {
    // Any global teardown logic if needed
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Create a test user
    const user = new User({
      account: 'testaccount',
      password: bcrypt.hashSync(pwd, 8),
      nickname: 'Test User',
      role: '1',
      safety: { nextTryAvailableAt: Date.now() },
    });
    await user.save();
    userId = user.id.toString();

    // Log in to get JWT token
    const res = await request(app)
      .post('/user/login')
      .send({ account: 'testaccount', password: pwd });
    token = res.body.data.token;

    // Insert sample articles
    for (const article of articleData) {
      const newArticle = new Article({
        ...article,
        user: userId,
        isDelete: false,
      });
      await newArticle.save();
    }
  });
  afterEach(async () => {
    const collections = await mongoose.connection.db?.collections();
    if (collections) {
      for (let collection of collections) {
        await collection.deleteMany({});
      }
    }
  });


  const testCases = [
    // Case 1: Valid search with all parameters
    {
      name: 'valid search with all parameters',
      body: {
        petType: '貓',
        color: '橘',
        location: { type: 'Point', coordinates: [121.5111, 25.05111] },
        lostDate: '2024-02-19',
        lostCityCode: 'A',
        lostDistrict: '內湖區',
        hasReward: true,
        rewardAmount: 50000,
        hasMicrochip: true,
        skip: 0,
        limit: 10,
      },
      expectedStatus: 200,
      expectedArticlesCount: 1,
    },
    // Case 2: Missing all required fields
    {
      name: 'missing all required fields',
      body: {
        lostDate: '2024-02-19',
      },
      expectedStatus: 422,
      expectedArticlesCount: 0,
    },
    // Case 3: Missing some required fields
    {
      name: 'missing some required fields (petType and location)',
      body: {
        color: '黑',
        lostDate: '2024-02-19',
      },
      expectedStatus: 422,
      expectedArticlesCount: 0,
    },
    // Case 4: Invalid petType value
    {
      name: 'invalid petType value',
      body: {
        petType: 'rabbit', // Assuming only '貓' and '狗' are valid
        color: '黑',
        location: { type: 'Point', coordinates: [121.5111, 25.05111] },
      },
      expectedStatus: 422,
      expectedArticlesCount: 0,
    },
    // Case 5: Invalid location format
    {
      name: 'invalid location format',
      body: {
        petType: '狗',
        color: '黑',
        location: { type: 'Point', coordinates: ['invalid', 'invalid'] },
      },
      expectedStatus: 422,
      expectedArticlesCount: 0,
    },
    // Case 6: Valid search with optional parameters missing
    {
      name: 'valid search with optional parameters missing',
      body: {
        petType: '狗',
        color: '黑',
        location: { type: 'Point', coordinates: [121.5, 25.05] },
      },
      expectedStatus: 200,
      expectedArticlesCount: 1,
    },
    // Case 7: Valid search but no matching articles
    {
      name: 'valid search but no matching articles',
      body: {
        petType: '貓',
        color: '黑',
        location: { type: 'Point', coordinates: [121.5, 25.05] },
      },
      expectedStatus: 200,
      expectedArticlesCount: 0,
    },
    // Case 8: Pagination test with skip and limit
    {
      name: 'pagination test with skip and limit',
      body: {
        petType: '貓',
        color: '橘',
        location: { type: 'Point', coordinates: [121.5, 25.05] },
        skip: 0,
        limit: 1,
      },
      expectedStatus: 200,
      expectedArticlesCount: 1,
    },
    // Case 9: Exceeding maximum limit
    {
      name: 'exceeding maximum limit',
      body: {
        petType: '狗',
        color: '黑',
        location: { type: 'Point', coordinates: [121.5, 25.05] },
        skip: 0,
        limit: 100, // Assuming max limit is 50
      },
      expectedStatus: 200,
      expectedArticlesCount: 1, // Should still return valid articles but limit applied
    },
    // Case 10: Negative skip value
    {
      name: 'negative skip value',
      body: {
        petType: '狗',
        color: '黑',
        location: { type: 'Point', coordinates: [121.5, 25.05] },
        skip: -10,
        limit: 10,
      },
      expectedStatus: 200,
      expectedArticlesCount: 1, // skip should default to 0
    },
    // Case 11: Invalid date format
    {
      name: 'invalid date format for lostDate',
      body: {
        petType: '貓',
        color: '橘',
        location: { type: 'Point', coordinates: [121.5, 25.05] },
        lostDate: '20th Feb 2024', // Invalid format
      },
      expectedStatus: 422,
      expectedArticlesCount: 0,
    },
    // Case 12: Missing location coordinates
    {
      name: 'missing location coordinates',
      body: {
        petType: '貓',
        color: '橘',
        location: { type: 'Point' }, // Coordinates missing
      },
      expectedStatus: 422,
      expectedArticlesCount: 0,
    },
    // Case 13: pure hasReward is accepted
    {
      name: 'pure hasReward is accepted',
      body: {
        petType: '貓',
        color: '橘',
        location: { type: 'Point', coordinates: [121.5111, 25.05111] },
        hasReward: true,
      },
      expectedStatus: 200,
      expectedArticlesCount: 1,
    },
    // Case 14: hasReward is false but rewardAmount provided
    {
      name: 'hasReward is false but rewardAmount provided',
      body: {
        petType: '貓',
        color: '橘',
        location: { type: 'Point', coordinates: [121.5, 25.05] },
        hasReward: false,
        rewardAmount: 1000,
      },
      expectedStatus: 422,
      expectedArticlesCount: 0,
    },
    // Case 15: hasMicrochip is invalid boolean
    {
      name: 'hasMicrochip is invalid boolean',
      body: {
        petType: '貓',
        color: '橘',
        location: { type: 'Point', coordinates: [121.5, 25.05] },
        hasMicrochip: 'yes', // Should be a boolean
      },
      expectedStatus: 422,
      expectedArticlesCount: 0,
    },
  ];

  testCases.forEach(({ name, body, expectedStatus, expectedArticlesCount }) => {
    it(`searchArticleList - ${name}`, async () => {
      const res = await request(app)
        .post('/article')
        .set('Content-Type', 'application/json')
        .send(body);
console.log(res.message);
      expect(res.status).to.equal(expectedStatus);
      // console.log(res.body);
      if (expectedStatus === 200) {
        expect(res.body.data).to.have.property('articleList');
        expect(res.body.data.articleList).to.be.an('array');
        expect(res.body.data.articleList.length).to.equal(expectedArticlesCount);

        // Additional checks to ensure returned articles match the search criteria
        if (expectedArticlesCount > 0) {
          res.body.data.articleList.forEach((article) => {
            expect(article).to.have.property('petType', body.petType);
            expect(article).to.have.property('color', body.color);
            // You can add more field checks as needed
          });
        }
      }
    });
  });
});