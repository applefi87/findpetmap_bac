// Assuming 'chai' and 'supertest' are installed
import { expect } from 'chai';
import request from 'supertest';
import testApp from '../testApp.js';

describe('API Integration Tests', function() {
  it('should return 200 on success  and i18n should set 200 message as 成功', async function() {
    const response = await request(testApp).get('/').set('Cookie', 'interfaceLanguage=zh-TW');
    expect(response.status).to.equal(200);
    expect(response.body.code).to.equal(200);
    expect(response.body.message).to.equal("成功");
  });

  it('should handle 404 errors and i18n should set 404 message as 不存在的頁面', async function() {
    const response = await request(testApp).get('/non-existent-route').set('Cookie', 'interfaceLanguage=zh-TW');
    expect(response.status).to.equal(404);
    expect(response.body.code).to.equal(404);
    expect(response.body.message).to.equal("不存在的頁面");
  });
  it('Checking PureValidationError handle an-validator format, should handle 422 errors and i18n should set message as 長度必須在 {min} 到 {max} 個字符之間。', async function() {
    const response = await request(testApp).get('/validatePureValidationError').set('Cookie', 'interfaceLanguage=zh-TW');
    expect(response.status).to.equal(422);
    expect(response.body.code).to.equal(422);
    expect(response.body.message).to.equal("長度必須在 5 到 8 個字符之間。");
  });
  it('Checking an-validator into validationError,  should handle 422 errors and i18n should set message as 長度必須在 {min} 到 {max} 個字符之間。', async function() {
    const response = await request(testApp).get('/validateLengthBetweenByAn').set('Cookie', 'interfaceLanguage=zh-TW');
    expect(response.status).to.equal(422);
    expect(response.body.code).to.equal(422);
    expect(response.body.message).to.equal("長度必須在 5 到 8 個字符之間。");
  });

  it(`Checking an-validator & validationError &validateAndFormatEmail,  should handle 422 errors and i18n set message as 只允許使用英文字母、數字、'{'@'}' 和 '.'。。'`, async function() {
    const response = await request(testApp).get('/validateValidateAndFormatEmail').set('Cookie', 'interfaceLanguage=zh-TW');
    expect(response.status).to.equal(422);
    expect(response.body.code).to.equal(422);
    expect(response.body.message).to.equal(`只允許使用英文字母、數字、'{'@'}' 和 '.'。`);
  });

  it('should respond quickly for performance-basic routes', async function() {
    const start = new Date();
    const response = await request(testApp).get('/');
    const duration = new Date() - start;
    expect(duration).to.be.below(100); 
  });

});
