/** @private */
const hasOwnProperty = Object.prototype.hasOwnProperty;
/** @private */
const isPrototypeOf = Object.prototype.isPrototypeOf;

export const defProp = Object.defineProperty;

/**
 * Returns a boolean indicating whether the object has the specified property as its own property (not inherited).
 * @param {*} obj target object
 * @param {string} key name of the property
 * @memberof TYPE
 */
export const hasOwn = function (obj, key) { return hasOwnProperty.call(obj, key); };

/**
 * Returns a boolean indicating whether the object (child) inherit from another (parent)
 * @param {*} child 
 * @param {*} parent 
 * @memberof TYPE
 */
export const isDerivedOf = function (child, parent) {
    return Object.getPrototypeOf(child) !== parent && isPrototypeOf.call(parent, child);
};

/**
 * 
 * @param {*} obj 
 * @memberof TYPE
 */
export function cloneObject(obj) {
    if (obj === null || typeof (obj) !== 'object') {
        return obj;
    }

    var temp = obj.constructor(); // changed
    for (var key in obj) {
        if (hasOwn(obj, key)) {
            obj['isActiveClone'] = null;
            temp[key] = cloneObject(obj[key]);
            delete obj['isActiveClone'];
        }
    }

    return temp;
}