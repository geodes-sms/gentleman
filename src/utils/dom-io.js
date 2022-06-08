import {
    createStrong, createEmphasis
} from 'zenkai';

/**
     * Creates a bold text
     * @param {string} text 
     * @returns {string}
     */
export const _b = (text) => {
    /** @type {HTMLElement} */
    let element = createStrong({
        class: ["text-bf"],
    }, text);

    return element.outerHTML;
};

/**
 * Creates an italic text
 * @param {string} text 
 * @returns {string}
 */
export const _i = (text) => {
    /** @type {HTMLElement} */
    let element = createEmphasis({
        class: ["text-it"],
    }, text);

    return element.outerHTML;
};
