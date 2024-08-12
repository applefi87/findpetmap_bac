import { expect } from 'chai';
import getInterfaceLanguage from '../../src/utils/getInterfaceLanguage.js';

describe('getInterfaceLanguage', function() {
  it('should return the language from the cookie if present on the server', function() {
    const req = {
      cookies: { interfaceLanguage: 'zh-TW' },
      headers: { 'accept-language': 'en-US,en;q=0.9,fr;q=0.8' }
    };
    expect(getInterfaceLanguage(req)).to.equal('zh-TW');
  });

  it('should ignore cookie if invalid', function() {
    const req = {
      cookies: { interfaceLanguage: 'fr' },
      headers: { 'accept-language': 'zh-TW,en;q=0.9,fr;q=0.8' }
    };
    expect(getInterfaceLanguage(req)).to.equal('zh-TW');
  });

  it('should parse accept-language header on the server', function() {
    const req = {
      cookies: {},
      headers: { 'accept-language': 'zh-TW,en;q=0.9,fr;q=0.8' }
    };
    expect(getInterfaceLanguage(req)).to.equal('zh-TW');
  });

  it('should use navigator.languages on the client', function() {
    global.navigator = { languages: ['zh', 'en-US'] };
    expect(getInterfaceLanguage()).to.equal('zh-TW');
  });

  it('should use navigator.language on the client if navigator.languages is not available', function() {
    global.navigator = { language: 'zh-TW' };
    expect(getInterfaceLanguage()).to.equal('zh-TW');
  });

  it('should return default language if no match is found', function() {
    global.navigator = { languages: ['es'] };
    expect(getInterfaceLanguage()).to.equal('en-US');
  });
});
