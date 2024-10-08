// 未來名稱後面加enum & 統一 純key, map , select 版本分別叫甚麼
const password = {
  minLength: 8,
  maxLength: 50,
  type: "basic",
}

const account = {
  minLength: 8,
  maxLength: 20
}

const nickname = {
  minLength: 4,
  maxLength: 20
}

const name = {
  minLength: 0,
  maxLength: 20
}

const phone = {
  minLength: 0,
  maxLength: 20
}
const lineId = {
  minLength: 0,
  maxLength: 20
}

const others = {
  minLength: 0,
  maxLength: 200
}

export default { password, account, nickname, name, phone, lineId, others };
