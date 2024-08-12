import getInterfaceLanguage from '../infrastructure/utils/getInterfaceLanguage.js';

const getInterfaceLanguageMiddleware = (req, res, next) => {
  const interfaceLanguage = getInterfaceLanguage(req);
  req.interfaceLanguage = interfaceLanguage;
  next();
};

export default getInterfaceLanguageMiddleware;
