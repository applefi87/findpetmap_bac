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

//html的部分
const content = {
  minLength: 5,
  maxLength: 30000
};
//移除html後的部分  目前不管
// const textContent = {
//   minLength: 10,
//   maxLength: 10000
// };

const previewContent = {
  minLength: 5,
  maxLength: 50
};

const thumbnail = {
  maxLength: 1000
};








export default { petType, catColorEnum,dogColorEnum ,content };
