import { expect } from 'chai';
import mongoose from 'mongoose'
import { trusted } from 'mongoose'
import request from 'supertest';
import articleConfigs from "../../src/infrastructure/configs/articleConfigs.js"
import bcrypt from 'bcrypt'

import { app } from '../testApp.js'; // Import from the setup file
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

describe('ArticleController Create Tests', function () {
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
        hasReward:true,
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
        hasReward:true,
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
    const collections = await mongoose.connection.db?.collections();
    if (collections) {
      for (let collection of collections) {
        await collection.deleteMany({});
      }
    }

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

  const testCases = [
    {
      name: 'valid data',
      data: {
        ...articleValidData,
        isDelete: true,
        createdAt: new Date() - 24 * 60 * 60 * 1000,
        updatedAt: new Date() - 24 * 60 * 60 * 1000
      },
      expectedStatus: 200,
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
        rewardAmount: 1, // Testing the minimum valid value
        isDelete: true,
        createdAt: new Date() - 24 * 60 * 60 * 1000,
        updatedAt: new Date() - 24 * 60 * 60 * 1000
      },
      expectedStatus: 200,
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
      expectedStatus: 200,
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
    it(`updateArticle - ${name}`, async () => {
      const res = await request(app)
        .put(`/article/update/${articleId}`) // Adjust to your update route
        .set('Authorization', `Bearer ${token}`)
        .send(data);
      expect(res.status).to.equal(expectedStatus);

      if (expectedStatus === 200) {
        const updatedArticle = await Article.findById(articleId).lean();
        updatedArticle.lostDate = new Date(updatedArticle.lostDate).toLocaleDateString('en-CA');
        const articleValidDataWithoutLocation = { ...data };
        expect(updatedArticle).to.include(removeNotEditableProperties(articleValidDataWithoutLocation));
        expect(updatedArticle).to.have.property('location').that.deep.equals(data.location);
        expect(updatedArticle.isDelete).to.equal(expectedIsDelete);
        expect(updatedArticle.createdAt).to.not.equal(data.createdAt);
        expect(updatedArticle.updatedAt).to.not.equal(data.updatedAt);
      }
    });
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
    // Clean up the database before each test
    const collections = await mongoose.connection.db?.collections();
    if (collections) {
      for (let collection of collections) {
        await collection.deleteMany({});
      }
    }

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
      articleId: () =>  "66b86e8297709336ef263543", // Random non-existent ID
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