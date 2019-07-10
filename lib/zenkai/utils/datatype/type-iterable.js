/**
 * Returns the index or value of the first element in the object
 * @param {Object|Array} obj 
 * @param {any} value 
 * @memberof TYPE
 */
export function find(obj, value) {
    if (Array.isArray(obj)) {
        let index = obj.indexOf(value);
        if (index !== -1) return index;
    } else {
        for (const e of Object.keys(obj)) {
            if (obj[e] === value || obj[e].val === value) {
                return e;
            }
        }
    }

    return undefined;
}