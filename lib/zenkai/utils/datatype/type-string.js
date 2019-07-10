import { isString } from "./type-manip.js";

/**
 * Returns a value indicating whether a string is null or made of whitespace.
 * @param {string} str string
 * @memberof TYPE
 */
export function isNullOrWhitespace(str) {
    return (!str || isString(str) && (str.length === 0 || /^\s*$/.test(str)));
}

/**
 * Capitalizes all words in a sequence
 * @param {string} str Sequence
 * @returns {string} Capitalized sequence
 * @memberof TYPE
 */
export function capitalize(str) {
    return str.replace(/\b\w/g, function (s) { return s.toUpperCase(); });
}

/**
 * Capitalizes the first letter of a sequence
 * @param {string} str Sequence
 * @returns {string} Sequence with its first letter capitalized
 * @memberof TYPE
 */
export function capitalizeFirstLetter(str) {
    return isNullOrWhitespace(str) ? str : str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Removes all accents from a string
 * @param {*} str string
 * @returns {string}
 * @memberof TYPE
 */
export function removeAccents(str) {
    if (String.prototype.normalize) {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    }
    
    return str.replace(/[àâäæ]/gi, 'a')
        .replace(/[ç]/gi, 'c')
        .replace(/[éèê]/gi, 'e')
        .replace(/[îï]/gi, 'i')
        .replace(/[ôœ]/gi, 'o')
        .replace(/[ùûü]/gi, 'u');
}