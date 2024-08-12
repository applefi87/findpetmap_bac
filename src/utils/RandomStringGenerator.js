/**
 * @description: 隨機亂碼
 * @param {*} len 亂碼位數
 * @param {*} mode 亂碼難度：hide(大小寫+數字+特殊字符)、medium(大小寫+數字)、low(小寫+數字)
 */
class RandomStringGenerator {
  constructor() {
    this.lowerCaseArr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',];
    this.upperCaseArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    this.numberArr = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    this.specialArr = ['!', '@', '-', '_', '=', '<', '>', '*', ' ', '/', '|', '#', '*', '%', '+', '&', '^', '$', '~', '`', '(', ')', '[', ']', '{', '}', '.'];
  }

  specifyRandom(...arr) {
    let str = "";
    arr.forEach(item => {
      str += item[Math.floor(Math.random() * item.length)];
    });
    return str;
  }

  generate(len = 10, mode = "medium") {
    let code = '';
    const passArr = [];
    if (len <= 0) {
      throw new Error('Length must be a positive number');
    }
    switch (mode) {
      case "high":
        code += this.specifyRandom(this.lowerCaseArr, this.upperCaseArr, this.numberArr, this.specialArr);
        passArr.push(...this.lowerCaseArr, ...this.upperCaseArr, ...this.numberArr, ...this.specialArr);
        break;
      case "medium":
        code += this.specifyRandom(this.lowerCaseArr, this.upperCaseArr, this.numberArr);
        passArr.push(...this.lowerCaseArr, ...this.upperCaseArr, ...this.numberArr);
        break;
      case "low":
        code += this.specifyRandom(this.lowerCaseArr, this.numberArr);
        passArr.push(...this.lowerCaseArr, ...this.numberArr);
        break;
      case "number":
        code += this.specifyRandom(this.numberArr);
        passArr.push(...this.numberArr);
        break;
      default:
        throw new Error('Invalid mode');
    }

    const forLen = len - code.length;
    for (let i = 0; i < forLen; i++) {
      code += this.specifyRandom(passArr);
    }

    return code;
  }
}
const randomStringGenerator = new RandomStringGenerator()

export default randomStringGenerator;