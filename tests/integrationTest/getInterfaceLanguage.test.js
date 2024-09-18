import request from 'supertest';
import { expect } from 'chai';
import app from '../testApp.js'; 
import { defaultLanguage } from '../../src/infrastructure/configs/languageOptions.js';

describe('GET /interface-language', () => {
  
  it('should return the language from the cookie if present and valid', async () => {
    const res = await request(app)
      .get('/interface-language')
      .set('Cookie', 'interfaceLanguage=zh-TW')
      .set('Accept-Language', 'en-US,en;q=0.9,fr;q=0.8');
    expect(res.body.interfaceLanguage).to.equal('zh-TW');
  });

  it('should parse accept-language header if cookie is invalid', async () => {
    const res = await request(app)
      .get('/interface-language')
      .set('Cookie', 'interfaceLanguage=invalid-language')
      .set('Accept-Language', 'en-US,en;q=0.9,fr;q=0.8');
    expect(res.body.interfaceLanguage).to.equal('en-US');
  });

  it('should parse accept-language header if no cookie is present', async () => {
    const res = await request(app)
      .get('/interface-language')
      .set('Accept-Language', 'zh-TW,en;q=0.9,fr;q=0.8');
    expect(res.body.interfaceLanguage).to.equal('zh-TW');
  });

  it('should return default language if no match is found', async () => {
    const res = await request(app)
      .get('/interface-language')
      .set('Accept-Language', 'zx');
    expect(res.body.interfaceLanguage).to.equal(defaultLanguage);
  });
});
