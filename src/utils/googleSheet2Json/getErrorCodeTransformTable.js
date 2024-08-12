import dotenv from 'dotenv';
import fs from 'fs-extra';
import { extractSheets } from 'spreadsheet-to-json';
import { dirname, resolve, join } from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

// 插件使用教學 https://ithelp.ithome.com.tw/m/articles/10262354
// 請來這編輯管理
// https://docs.google.com/spreadsheets/d/1eQK9HpxM0Z17f-0z3QxlGMlIV9Z_NHP23Z8xuJ-j2X8/edit#gid=0

dotenv.config();
const require = createRequire(import.meta.url);

const tablename = 'GOOGLE_SHEET_TABLE_ID_ErrorCodeTable';
const credentials = require("../../../secrets/GOOGLE_SHEET_TABLE_ErrorCodeTable-secret.json");
extractSheets(
  {
    spreadsheetKey: process.env.GOOGLE_SHEET_TABLE_ID_ErrorCodeTable,
    credentials: credentials,
    sheetsToExtract: ['first']
  },
  (err, data) => {
    if (err) {
      console.error('Error extracting ' + tablename + ' sheets:', err);
      return;
    }
    // Transform the extracted data to an object with error codes as keys
    const processedData = data.first.reduce((acc, row) => {
      acc[row.code] = {
        frontCode: Number(row.frontCode),
        level: row.level,
        HTTPCode: Number(row.HTTPCode),
        logExtra: Boolean(row.logExtra)
      };
      return acc;
    }, {});
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const rootDir = resolve(__dirname, '../../../');
    const outputFilePath = join(rootDir, "configs", "generated", "errors", 'errorCodeTable.json');

    // Ensure the directory exists, then write the processed data to a JSON file
    fs.ensureDir(dirname(outputFilePath))
      .then(() => fs.writeJson(outputFilePath, processedData, { spaces: 2 }))
      .then(() => {
        console.log('Data successfully written to', outputFilePath);
      })
      .catch(writeErr => {
        console.error('Error writing ' + tablename + ' JSON file:', writeErr);
      });
  }
);
