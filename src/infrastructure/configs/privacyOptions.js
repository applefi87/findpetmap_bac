const privacyEnum = {
  0: "匿名",
  1: "暱稱"
};
const privacyEnumKeys = Object.keys(privacyEnum).map(Number)
const privacyEnumMap = Object.keys(privacyEnum).reduce((acc, key) => {
  const value = privacyEnum[key];
  acc[value] = Number.parseInt(key);
  return acc;
}, {});
export { privacyEnum, privacyEnumKeys, privacyEnumMap };
