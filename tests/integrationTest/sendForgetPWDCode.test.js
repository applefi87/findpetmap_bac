import { expect } from 'chai';
import sinon from 'sinon';
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import app from '../testApp.js';
import Email from '../../src/models/emailModel.js'; // Your Email model
import User from '../../src/models/userModel.js'; // Adjust the import path to your User model
import sendEmailService from '../../src/services/externalServices/sendEmailService.js';

describe('sendForgetPWDCode', function () {
  this.timeout(10000); // Increase timeout for the test suite
  let sendMailStub;
  let refreshTokenStub;
  let userId;

  beforeEach(async () => {
    // Clear the database
    const collections = await mongoose.connection.db?.collections();
    if (collections) {
      for (let collection of collections) {
        await collection.deleteMany({});
      }
    }

    // Create a test user and associated email
    const user = new User({
      account: 'testaccount',
      password: bcrypt.hashSync('password123', 8),
      nickname: 'testnickname',
      role: '1',
      safety: { nextTryAvailableAt: Date.now() }
    });
    await user.save();
    userId = user._id.toString();

    const email = new Email({
      email: 'test@example.com',
      user: userId,
      verificationCode: "888"
    });
    await email.save();

    // Stub the email service methods
    sendMailStub = sinon.stub(sendEmailService.transporter, 'sendMail').resolves();
    refreshTokenStub = sinon.stub(sendEmailService, 'refreshTokenIfNeeded').resolves('mocked-new-token');
  });

  afterEach(() => {
    // Restore the stubs
    sendMailStub.restore();
    refreshTokenStub.restore();
  });

  it('should send a verification email successfully', async () => {
    const res = await request(app)
      .post('/email/forgetPWDCode/send')
      .send({ email: 'test@example.com', account: 'testaccount' });

    expect(res.status).to.equal(200);
    expect(sendMailStub.calledOnce).to.be.true;
    expect(refreshTokenStub.calledOnce).to.be.true;
  });

  it('should return an error when the account does not match the email', async () => {
    const res = await request(app)
      .post('/email/forgetPWDCode/send')
      .set('Accept-Language', 'en-US')
      .send({ email: 'test@example.com', account: 'wrongaccount' });

    expect(res.status).to.equal(422);
    expect(res.body.success).to.be.false;
    // 用i18n 轉換過，所以只能期待回傳字包含必有的警告關鍵字
    expect(res.body.message).to.include('match');
  });

  it('should return an error when the email is not registered', async () => {
    const res = await request(app)
      .post('/email/forgetPWDCode/send')
      .set('Accept-Language', 'en-US')
      .send({ email: 'notregistered@example.com', account: 'testaccount' });

    expect(res.status).to.equal(422);
    expect(res.body.success).to.be.false;
    // 用i18n 轉換過，所以只能期待回傳字包含必有的警告關鍵字
    expect(res.body.message).to.include('register');
  });
});