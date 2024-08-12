// routes.js
import anValidator from 'an-validator';
import ResponseHandler from '../src/middlewares/ResponseHandler.js';
import ValidationError from '../src/infrastructure/errors/ValidationError.js';
import PageNotFoundError from '../src/infrastructure/errors/PageNotFoundError.js';

const { rules, validateByRules } = anValidator;

export default (app) => {
  app.get('/interface-language', (req, res) => {
    res.json({ interfaceLanguage: req.getLocale() });
  });

  app.get('/validatePureValidationError', (req, res) => {
    throw new ValidationError({ success: false, message: { title: { key: `validation.lengthBetween`, params: { min: 5, max: 8 } } } })
  });

  app.get('/validateLengthBetweenByAn', (req, res) => {
    throw new ValidationError(validateByRules("moreThan8Charactor", rules.createLengthBetweenRule(5, 8)));
  });

  app.get('/validateValidateAndFormatEmail', (req, res) => {
    throw new ValidationError(validateByRules("wdawdwa*dawd@gmail.com", rules.createEmailRules()));
  });

  app.all('(.*)', (req, res, next) => { throw new PageNotFoundError(req.url) });

  // Error handling middleware should be the last middleware added
  app.use(ResponseHandler.errorHandler);
};
