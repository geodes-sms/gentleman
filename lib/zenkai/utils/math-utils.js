/**
 * @namespace MATH
 */

/**
 * Return a random integer between min and max (inclusive).
 * @param {number} min 
 * @param {number} [max] 
 * @memberof MATH
*/
export function random(min, max) {
    if (max == null) {
        max = min;
        min = 0;
    }

    return min + Math.floor(Math.random() * (max - min + 1));
}