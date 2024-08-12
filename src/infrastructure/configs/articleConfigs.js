const title = {
  minLength: 5,
  maxLength: 100
};

//html的部分
const content = {
  minLength: 10,
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








export default { title, content, previewContent, thumbnail };
