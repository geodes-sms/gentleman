
/**
 * Verifies that a character is a vowel
 * @param {string} char 
 * @returns {boolean}
 */
export const isVowel = (char) => char && ["a", "e", "i", "o", "u"].includes(char.toLowerCase());