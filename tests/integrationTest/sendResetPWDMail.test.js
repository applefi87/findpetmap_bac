import { expect } from 'chai';
import sinon from 'sinon';
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import hash from 'hash.js'
import i18n from 'i18n';
import app from '../testApp.js';
import emailConfigs from '../../src/infrastructure/configs/emailConfigs.js'
import Email from '../../src/models/emailModel.js'; // Your Email model
import User from '../../src/models/userModel.js'; // Adjust the import path to your User model
import sendEmailService from '../../src/services/externalServices/sendEmailService.js';
import userService from '../../src/services/userService.js';
import randomStringGenerator from '../../src/utils/RandomStringGenerator.js'

describe('sendForgetPWDCode', function () {
  this.timeout(10000); // Increase timeout for the test suite
  const pwd = 'password123'
  const newRandomPWD = "123EEE5E"
  const type = "forgetPWD"
  const exampleEmail = 'test@example.com'
  const verificationCodeLength = emailConfigs[`${type}VerificationCode`].codeRandomLength
  const verificationCodeMode = emailConfigs[`${type}VerificationCode`].codeRandomMode
  let verificationCode = randomStringGenerator.generate(verificationCodeLength, verificationCodeMode)
  let wrongVerificationCode = randomStringGenerator.generate(verificationCodeLength, verificationCodeMode)
  let sendMailStub;
  let refreshTokenStub;
  let i18nStub;
  let randomStringGeneratorStub;
  let userId;
  let token

  before(async () => {

    randomStringGeneratorStub = sinon.stub(randomStringGenerator, 'generate').returns(newRandomPWD);
    i18nStub = sinon.stub(i18n, '__').callsFake((key) => key);
  });

  after(async () => {
    // Restore the stubs
    randomStringGeneratorStub.restore();
    i18nStub.restore();
  });



  beforeEach(async () => {
    // 會被檢查呼叫次數的，每次要重建 
    sendMailStub = sinon.stub(sendEmailService.transporter, 'sendMail').resolves();
    refreshTokenStub = sinon.stub(sendEmailService, 'refreshTokenIfNeeded').resolves('mocked-new-token');
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
      password: bcrypt.hashSync(pwd, 8),
      nickname: 'testnickname',
      role: '1',
      safety: { nextTryAvailableAt: Date.now() }
    });
    await user.save();
    userId = user._id.toString();
    const res = await request(app)
      .post('/user/login') // Adjust to your login route
      .send({ account: 'testaccount', password: pwd });
    token = res.body.data.token;
    let hashedVerificationCode = hash.sha256().update(verificationCode).digest('hex')
    const email = new Email({
      email: exampleEmail,
      user: userId,
      verificationCode: hashedVerificationCode,
      codeValidAt: Date.now() + (60 * 1000)
    });
    await email.save();


  });

  afterEach(() => {
    // 會被檢查呼叫次數的，每次要重建 
    sendMailStub.restore();
    refreshTokenStub.restore();
  });

  it('should still can resetPWD successfully only in three try', async () => {
    let res = await request(app)
      .post('/user/resetPWD')
      .send({ verificationCode: wrongVerificationCode, email: exampleEmail });
    res = await request(app)
      .post('/user/resetPWD')
      .send({ verificationCode: wrongVerificationCode, email: exampleEmail });
    res = await request(app)
      .post('/user/resetPWD')
      .send({ verificationCode: verificationCode, email: exampleEmail });
    expect(res.status).to.equal(200);
    expect(sendMailStub.calledOnce).to.be.true;
    expect(refreshTokenStub.calledOnce).to.be.true;
  });

  it('should return an error when the code fail 3 times', async () => {
    let res = await request(app)
      .post('/user/resetPWD')
      .send({ verificationCode: wrongVerificationCode, email: exampleEmail });
    res = await request(app)
      .post('/user/resetPWD')
      .send({ verificationCode: wrongVerificationCode, email: exampleEmail });
    res = await request(app)
      .post('/user/resetPWD')
      .send({ verificationCode: wrongVerificationCode, email: exampleEmail });
    res = await request(app)
      .post('/user/resetPWD')
      .send({ verificationCode: verificationCode, email: exampleEmail });
    // let res = await request(app)
    //   .post('/user/resetPWD')
    //   .send({ verificationCode: wrongVerificationCode, email: exampleEmail });

    expect(res.status).to.equal(422);
    expect(res.body.success).to.be.false;
    // i18n
    expect(res.body.message).to.equal("tooManyVerificationErrors");
    expect(i18nStub.calledWith('tooManyVerificationErrors')).to.be.true;
  });

  it('should return an error when the email is not registered', async () => {
    const res = await request(app)
      .post('/user/resetPWD')
      .send({ email: 'notregistered@example.com', verificationCode: verificationCode });

    expect(res.status).to.equal(422);
    expect(res.body.success).to.be.false;
    // i18n
    expect(res.body.message).to.equal("sendEmailFirst");
    expect(i18nStub.calledWith('sendEmailFirst')).to.be.true;
  });


  it('complete test for user token should be cleared and password changed', async () => {
    // Log in the user to generate one token record
    let res = await request(app)
      .post('/user/login') // Adjust to your login route
      .send({ account: 'testaccount', password: pwd });

    // Reset password with the verification code
    res = await request(app)
      .post('/user/resetPWD') // Adjust to your reset password route
      .send({ email: 'test@example.com', verificationCode });

    expect(res.status).to.equal(200);

    // Ensure the sendMail method was called correctly
    expect(sendMailStub.calledOnce).to.be.true;

    // Check that the user's token was cleared
    const user = await userService.findOneUser({ account: 'testaccount' }, "tokens");
    // Ensure `user.token` is an array
    expect(user.tokens).to.be.an('array');
    // Check if the array is empty
    expect(user.tokens).to.be.empty;
    // Log in with the new password to verify the change
    res = await request(app)
      .post('/user/login') // Adjust to your login route
      .send({ account: 'testaccount', password: newRandomPWD });

    expect(res.status).to.equal(200);
    expect(res.body.data.token).to.exist;
  });
});