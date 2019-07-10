/**
 * @namespace URI
 */

import { hasOwn } from './datatype/index.js';

const encode = encodeURIComponent;

/**
 * Extracts and returns the protocol and host of a given url
 * @param {string} url 
 * @memberof URI
 */
export function getRootUrl(url) {
    return url.toString().replace(/^(.*\/\/[^/?#]*).*$/, "$1");
}

/**
 * Extracts and returns the parameters of a URL
 * @param {string} [prop] Searched parameter
 * @memberof URI
 */
export function getUrlPrams(prop) {
    var href = window.location.href;
    var search = decodeURIComponent(href.slice(href.indexOf('?') + 1));
    if (this.isNullOrWhiteSpace(search)) {
        return undefined;
    }

    var defs = search.split('&');
    var params = {};
    defs.forEach((val) => {
        var parts = val.split('=', 2);
        params[parts[0]] = parts[1];
    });

    if (prop) {
        return params[prop];
    }
    return params;
}

/**
 * Creates a query string
 * @param {Object} query 
 * @returns {string} Query string
 * @memberof URI
 */
export function queryBuilder(query) {
    var str = [];
    for (const key in query) {
        if (hasOwn(query, key)) {
            str.push(`${encode(key)}=${encode(query[key])}`);
        }
    }
    return str.join('&');
}