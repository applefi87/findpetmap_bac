import { languageValues } from '../infrastructure/configs/languageOptions.js'
export function generateLangKeysSchema() {
  const schema = {};
  for (const languageValue of languageValues) {
    schema[languageValue] = {
      type: String,
      required: languageValue === "en-US"
    };
  }
  return schema;
}