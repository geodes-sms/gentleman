/**
 * @namespace PATH
 */

import { isNullOrWhitespace, isNullOrUndefined, valOrDefault, cloneObject } from './datatype/index.js';

/**
 * Append the path to the current path
 * @param {string} target 
 * @param {string} path 
 * @memberof PATH
 */
export function addPath(target, path) { return isNullOrWhitespace(target) ? path : target + '.' + path; }

/**
 * Returns the directory of the path
 * @param {string} path 
 * @memberof PATH
 */
export function getDir(path) { return path.substring(0, path.lastIndexOf('.')); }

/**
 * Returns the directory of the path from the target
 * @param {string} path 
 * @memberof PATH
 */
export function getDirTarget(path, target) { return path.substring(0, path.lastIndexOf(target) - 1); }

function findByIndex(obj, match, prop) {
    const REGEX_DIGIT = /\d+/g;
    var index = +match[0].match(REGEX_DIGIT);
    return obj[prop][index];
}

/**
 * Returns an element in an object using its path
 * @param {Object} obj
 * @param {string} path  
 * @param {string} [_separator=.]
 * @memberof PATH
 */
export function findByPath(obj, path, _separator) {
    const REGEX_BRACKET_DIGIT = /\[\d+\]/g;
    const REGEX_BRACKET_WORD = /\[\w+\]/g;
    
    const separator = valOrDefault(_separator, '.');
    var me = cloneObject(obj);

    const findHandler = function (part, regex, callback) {
        var match = part.match(regex);
        var prop = part.substring(0, part.indexOf('['));
        return callback(me, match, prop);
    };

    var parts = path.split(separator);
    for (let i = 0, len = parts.length; i < len; i++) {
        let part = parts[i];

        if (REGEX_BRACKET_DIGIT.test(part)) {
            me = findHandler(part, REGEX_BRACKET_DIGIT, findByIndex);
        } else {
            me = me[part];
        }

        if (isNullOrUndefined(me)) {
            return undefined;
        }
    }

    return me;
}