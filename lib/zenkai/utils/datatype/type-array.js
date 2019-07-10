/**
 * Inserts an item in an array at the specified index
 * @param {Object[]} arr array
 * @param {number} index 
 * @param {object} item 
 * @returns {number} The new length of the array
 * @memberof TYPE
 */
export function insert(arr, index, item) { 
    arr.splice(index, 0, item); 

    return arr.length;
}

/**
 * Returns last element of array.
 * @param {Object[]} arr array
 * @memberof TYPE
 */
export function last(arr) {
    if (Array.isArray(arr) && arr.length - 1) {
        return arr[arr.length - 1];
    }

    return undefined;
}