const languageOptions = [
  { value: 'en-US', label: 'English' },
  { value: 'zh-TW', label: '繁體中文' }
]
const languageValues = languageOptions.map(obj => obj.value)
const languageLabels = languageOptions.map(obj => obj.label)
export { languageOptions, languageValues, languageLabels }

// 後端: 1.文章的語言有引用一樣檔案要更新 2.對應文章主題有mongoDB search index 要手動更新
// https://cloud.mongodb.com/v2/62a83ee8fe15fd039ee7f421#/clusters/atlasSearch/Cluster0?collectionName=articles&database=test&indexName=article_title_multilang_match&view=IndexOverview
// https://www.mongodb.com/docs/atlas/atlas-search/define-field-mappings/#std-label-fts-field-mappings
// https://www.mongodb.com/docs/atlas/atlas-search/analyzers/language/
