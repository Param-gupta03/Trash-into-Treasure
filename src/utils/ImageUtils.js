/**
 * Helper function to convert an image file to base64
 * @param {File} file - The image file to convert
 * @returns {Promise<string>} A promise that resolves with the base64 string
 */
export const imageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Get the base64 part of the data URL
      const base64Data = reader.result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};
