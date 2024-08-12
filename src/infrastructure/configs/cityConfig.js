const cityCodeToNameMap = {
  "A": "臺北市",
  "F": "新北市",
  "J": "新竹縣",
  "O": "新竹市",
  "H": "桃園市",
  "B": "臺中市",
  "C": "基隆市",
  "E": "高雄市",
  "D": "臺南市",
  "G": "宜蘭縣",
  "Q": "嘉義縣",
  "I": "嘉義市",
  "K": "苗栗縣",
  "M": "南投縣",
  "N": "彰化縣",
  "P": "雲林縣",
  "T": "屏東縣",
  "U": "花蓮縣",
  "V": "臺東縣",
  "W": "金門縣",
  "X": "澎湖縣",
  "Z": "連江縣",
  "other": "其他"
};

const cityNameToCodeMap = Object.keys(cityCodeToNameMap).reduce((acc, key) => {
  const value = cityCodeToNameMap[key];
  acc[value] = key;
  return acc;
}, {});

export { cityCodeToNameMap, cityNameToCodeMap };
