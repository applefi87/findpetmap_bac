import { expect } from 'chai';
import mongoose from 'mongoose'
import { trusted } from 'mongoose'
import request from 'supertest';
import articleConfigs from "../../src/infrastructure/configs/articleConfigs.js"
import bcrypt from 'bcrypt'

import { app } from '../testApp.js'; // Import from the setup file
import s3Service from '../../src/services/s3Service.js';
import User from '../../src/models/userModel.js';
import Article from '../../src/models/articleModel.js';

const pwd = "testPASSWORD"
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

describe('ArticleController Tests', function () {
  this.timeout(10000); // Increase timeout for the test suite
  let token
  let userId
  before(async () => {
  });

  after(async () => {
  });

  beforeEach(async () => {
    const collections = await mongoose.connection.db?.collections();
    if (collections) {
      for (let collection of collections) {
        await collection.deleteMany({});
      }
    }
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
      name: 'minimum valid rewardAmount',
      data: {
        ...articleValidData,
        rewardAmount: 0, // Testing the minimum valid value
        isDelete: true,
        createdAt: new Date() - 24 * 60 * 60 * 1000,
        updatedAt: new Date() - 24 * 60 * 60 * 1000
      },
      expectedStatus: 201,
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
    },
    {
      name: 'hasMicrochip true but no rewardAmount',
      data: {
        ...articleValidData,
        hasMicrochip: true,
        rewardAmount: 0, // Testing a scenario where a microchip is present but no reward
        isDelete: true,
        createdAt: new Date() - 24 * 60 * 60 * 1000,
        updatedAt: new Date() - 24 * 60 * 60 * 1000
      },
      expectedStatus: 201,
      expectedIsDelete: false,
    },
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