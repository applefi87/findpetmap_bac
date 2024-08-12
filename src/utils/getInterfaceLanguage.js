import { languageValues } from "../infrastructure/configs/languageOptions.js";

const getPrimaryLanguageCode = (lang) => lang.split('-')[0];

const parseAcceptedLanguages = (languageHeader) => {
  return languageHeader
    ? languageHeader.split(',')
      .map(lang => {
        const parts = lang.split(';q=');
        return {
          code: parts[0].split(';')[0],
          //Accept-Language: en-US,en;q=0.9,fr;q=0.8
          //依照 q 大到小排序
          quality: parts.length > 1 ? parseFloat(parts[1]) : 1
        };
      })
      .sort((a, b) => b.quality - a.quality)
    : [];
};

// 以瀏覽器通知-前面的英文比對 ex: en-US 只取en,比對系統有提供的語言
const matchedInterfaceLanguage = (acceptedLanguages) => {
  for (const lang of acceptedLanguages) {
    const primaryCode = getPrimaryLanguageCode(lang.code);
    const match = languageValues.find(availableLang => getPrimaryLanguageCode(availableLang) === primaryCode);
    if (match) {
      // 如果用戶偏好語言比較詳細則用用戶偏好語言，不然用戶偏好語言是 "en" 則改用比對到的系統語言
      return primaryCode.length == 5 ? primaryCode : match
    }
  }
  return 'en-US'; // Default to 'en-US' if no match is found
};

// Cookie should store as "en-US", not "en"
const getLanguageFromCookie = (req) => {
  return req.cookies?.interfaceLanguage && languageValues.includes(req.cookies.interfaceLanguage) && req.cookies.interfaceLanguage
}

// Support both at server, server SSR and client.
export default function getInterfaceLanguage(req = null) {
  try {
    let acceptedLanguages;
    const isServer = typeof window === 'undefined';
    if (isServer && req) {
      // Server-side: use request headers
      acceptedLanguages = getLanguageFromCookie(req)
      if (acceptedLanguages) return acceptedLanguages
      acceptedLanguages = parseAcceptedLanguages(req.headers['accept-language']);
    } else {
      // Client-side: use navigator.languages or navigator.language
      const userLanguages = navigator.languages || [navigator.language];
      acceptedLanguages = parseAcceptedLanguages(userLanguages.join(','));
    }
    return matchedInterfaceLanguage(acceptedLanguages);
  } catch (error) {
    console.error('Error determining interface language:', error);
    return 'en-US'; // Fallback to default language in case of an error
  }
}

