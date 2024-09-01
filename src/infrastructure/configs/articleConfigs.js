// 未來名稱後面加enum & 統一 純key, map , select 版本分別叫甚麼
const petType = ['貓', '狗']

const catColorEnum = [
  // Solid Colors
  '黑', '白', '灰', '橘', '咖啡',
  // Mixed Colors
  '黑白', '灰白', '橘白',
  // Patterned Colors
  '玳瑁', '花斑', '虎斑'
];

const dogColorEnum = [
  // Solid Colors
  '黑', '白', '灰', '米黃', '棕', '咖啡',
  // Patterned Colors
  '斑點', '花斑', '虎斑'
];

const catBreedEnum = [
  // Purebred Cats
  '波斯貓',         // Persian
  '英國短毛貓',     // British Shorthair
  '美國短毛貓',     // American Shorthair
  '暹羅貓',         // Siamese
  '孟加拉貓',       // Bengal
  '蘇格蘭摺耳貓',   // Scottish Fold
  '布偶貓',         // Ragdoll
  '阿比西尼亞貓',   // Abyssinian
  '狸花貓',         // Chinese Li Hua
  '無毛貓',         // Sphynx
  '緬因貓',         // Maine Coon
  '俄羅斯藍貓',     // Russian Blue
  '挪威森林貓',     // Norwegian Forest Cat
  '埃及貓',         // Egyptian Mau
  '索馬利貓',       // Somali
  '土耳其梵貓',     // Turkish Van
  '喜馬拉雅貓',     // Himalayan
  '東方短毛貓',     // Oriental Shorthair
  '柯尼斯卷毛貓',   // Cornish Rex
  '德文卷毛貓',     // Devon Rex

  // Mixed Breed Cats
  '家貓',           // Domestic Shorthair
  '家長毛貓',       // Domestic Longhair
  '混種貓'          // Mixed Breed (general)
];

const dogBreedEnum = [
  // Purebred Dogs
  '拉布拉多',       // Labrador Retriever
  '金毛',           // Golden Retriever
  '哈士奇',         // Siberian Husky
  '德國牧羊犬',     // German Shepherd
  '柴犬',           // Shiba Inu
  '法國鬥牛犬',     // French Bulldog
  '貴賓犬',         // Poodle
  '臘腸犬',         // Dachshund
  '比熊犬',         // Bichon Frise
  '邊境牧羊犬',     // Border Collie
  '鬆獅犬',         // Chow Chow
  '杜賓犬',         // Doberman Pinscher
  '羅威納犬',       // Rottweiler
  '鬥牛梗',         // Bull Terrier
  '約克夏犬',       // Yorkshire Terrier
  '巴哥犬',         // Pug
  '西施犬',         // Shih Tzu
  '喜樂蒂牧羊犬',   // Shetland Sheepdog
  '松鼠犬',         // Pomeranian
  '西高地白梗犬',   // West Highland White Terrier
  '大丹犬',         // Great Dane
  '馬爾濟斯犬',     // Maltese
  '貝靈頓梗',       // Bedlington Terrier
  '威瑪獵犬',       // Weimaraner
  '巴吉度犬',       // Basset Hound
  '惠比特犬',       // Whippet
  '澳洲牧羊犬',     // Australian Shepherd

  // Mixed Breed Dogs
  '拉布拉多混種',   // Labrador Mix
  '金毛混種',       // Golden Retriever Mix
  '哈士奇混種',     // Siberian Husky Mix
  '牧羊犬混種',     // Shepherd Mix
  '比特犬混種',     // Pit Bull Mix
  '小型混種犬',     // Small Mixed Breed
  '中型混種犬',     // Medium Mixed Breed
  '大型混種犬',     // Large Mixed Breed
  '田園犬',         // Mongrel (general term for mixed breeds, often used for local breeds)
  '土狗'            // Native dog (local mixed breed, common in some regions)
];

const title = {
  minLength: 1,
  maxLength: 10
};

const content = {
  minLength: 5,
  maxLength: 30000
};

const genderEnum = ['M', 'F']
const genderMap = { 'M': "genderMale", 'F': "genderFemale" }

const sizeEnum = ['S', 'M', 'L', 'XL']
const sizeMap = { 'S': "sizeSmall", 'M': "sizeMedium", 'L': "sizeLarge", 'XL': "sizeExtraLarge" }

const age = {
  min: 0,
  max: 30
};

const region = {
  // 減少 api 次數，多抓廣一些的範圍
  bufferMultiplier: 1.5,
  maxDistance: 50 // in km
}

const search = {
  skip: 100000,
  limit: 1000
}



export default { petType, catColorEnum, dogColorEnum, catBreedEnum, dogBreedEnum, title, content, genderEnum, genderMap, sizeEnum, sizeMap, age, region, search };
