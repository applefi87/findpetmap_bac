import { expect } from 'chai';
import sinon from 'sinon';
import sendEmailService from '../../src/services/externalServices/sendEmailService.js';
// import { getNewAccessToken } from '../../src/services/oauth2Service';

describe('EmailService', function() {
  let sendMailStub;
  let getNewAccessTokenStub;

  beforeEach(() => {
    sendMailStub = sinon.stub(sendEmailService.transporter, 'sendMail').resolves();
    getNewAccessTokenStub = sinon.stub(sendEmailService, 'refreshTokenIfNeeded').resolves('mocked-new-token');
  });

  afterEach(() => {
    sendMailStub.restore();
    getNewAccessTokenStub.restore();
  });

  it('should send an email successfully', async () => {
    await sendEmailService.sendMail('recipient@example.com', 'Test Email', '<h1>Hello, World!</h1>');
    expect(sendMailStub.calledOnce).to.be.true;
    expect(getNewAccessTokenStub.calledOnce).to.be.true;
  });
});
