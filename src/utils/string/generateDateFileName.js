/**
 * @description: Generate a file path and name based on the current date and time
 * @param {string} fileExtension - File extension
 * @returns {string} The full path including the generated file name
 */
export default function generateFullPath(fileExtension, preFolder) {
  const now = new Date();
  const path = generateFilePath(now, preFolder);
  const fileName = generateFileName(now, fileExtension);
  return `${path}/${fileName}`;
}

/**
 * @description: Generate a folder path based on the current date
 * @param {Date} now - The current date object
 * @returns {string} The generated folder path
 */
export function generateFilePath(now, preFolder) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const day = String(now.getDate()).padStart(2, '0');
  const result = preFolder ? `${preFolder}/${year}/${month}/${day}` : `${year}/${month}/${day}`
  return result
}

/**
 * @description: Generate a file name based on the current time
 * @param {Date} now - The current date object
 * @param {string} fileExtension - File extension
 * @returns {string} The generated file name
 */
export function generateFileName(now, fileExtension) {
  const timeString = now.toISOString().slice(11, 23).replace(/[:.]/g, ''); // HHMMSSmmm
  const randomNumber = Math.floor(Math.random() * 100);
  return `${timeString}_${randomNumber}.${fileExtension}`;
}