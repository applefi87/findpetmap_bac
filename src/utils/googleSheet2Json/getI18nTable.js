import 'dotenv/config'; // Automatically loads environment variables from .env file
import fs from 'fs-extra';
import { unflatten } from 'flat';
import { extractSheets } from 'spreadsheet-to-json';
import { dirname, resolve, join } from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

// const tablename = 'GOOGLE_SHEET_TABLE_ID_I18NTable';
const require = createRequire(import.meta.url);
const credentials = require("../../../secrets/GOOGLE_SHEET_TABLE_ErrorCodeTable-secret.json");

extractSheets(
  {
    spreadsheetKey: process.env.GOOGLE_SHEET_TABLE_ID_I18NTable,
    credentials: credentials,
    sheetsToExtract: ['FrontCodeMessage', "email", "ValidationErrorMessage","user","board","article","comment","reply","rating","image"]
  },
  (err, data) => {
    if (err) throw err;

    const read = [];
    Object.keys(data).forEach(t => read.push(...data[t]));

    const result = {};
    const files = [];
    for (const key in read[0]) {
      if (key !== 'key') {
        files.push(key);
        result[key] = {};
      }
    }

    read.forEach((el) => {
      for (const file of files) {
        result[file][el.key] = el[file] ? el[file] : '';
      }
    });
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const rootDir = resolve(__dirname, '../../../');

    for (const fileName of files) {
      const outputFilePath = join(rootDir, "configs", "generated", "i18n", `${fileName}.json`);
      fs.ensureDirSync(dirname(outputFilePath));
      fs.writeJSONSync(
        outputFilePath,
        unflatten(result[fileName], { object: true }),
        { spaces: 2 }
      );
      console.log('Data I18N successfully written to', outputFilePath);
    }

  }
);