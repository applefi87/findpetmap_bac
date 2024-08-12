import i18n from 'i18n';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import getInterfaceLanguage from '../utils/getInterfaceLanguage.js';

const configureI18n = () => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    i18n.configure({
        locales: ['en-US', 'zh-TW'],
        directory: __dirname + '/../../configs/generated/i18n/',
        debug: true,
        updateFiles: false,
        objectNotation: true
        // 目前沒用到 但很可能會改動
        // defaultLocale: 'en-US',
        // cookie: 'interfaceLanguage', //全交給getInterfaceLanguage處理
        // autoReload: true,
    });
};

const createI18nMiddleware = () => {
    configureI18n();
    return (req, res, next) => {
        i18n.init(req, res, () => {
            const interfaceLanguage = getInterfaceLanguage(req);
            req.setLocale(interfaceLanguage);
            req.interfaceLanguage = interfaceLanguage;
            next()
        });
    };
};

export default createI18nMiddleware;