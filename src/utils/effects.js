import { isHTMLElement } from 'zenkai';

const HIDDEN = 'hidden';
const COLLAPSE = 'collapse';
const CHECKED = 'checked';
const DISABLED = 'disabled';
const EMPTY = 'empty';
const SHAKE = 'shake';
const SELECTED = 'selected';

/**
 * Shows an element
 * @param {HTMLElement} element element
 * @returns {HTMLElement} element
 */
export function show(element) {
    if (isHTMLElement(element)) {
        element.classList.remove(HIDDEN);
    }

    return element;
}

/**
 * Hides an element
 * @param {HTMLElement} element element
 * @returns {HTMLElement} element
 */
export function hide(element) {
    if (isHTMLElement(element)) {
        element.classList.add(HIDDEN);
    }

    return element;
}

/**
 * Toggles the display of an element
 * @param {HTMLElement} element element
 * @returns {HTMLElement} element
 */
export function toggle(element) {
    if (isHTMLElement(element)) {
        element.classList.toggle(HIDDEN);
    }

    return element;
}

/**
 * Shakes an element for a second
 * @param {Element} element element
 */
export const shake = (element) => {
    if (!element.classList.contains(SHAKE)) {
        element.classList.add(SHAKE);
        setTimeout(() => {
            element.classList.remove(SHAKE);
        }, 1000);
    }
};

/**
 * Applies highlighting style to an element
 * @param {HTMLElement} element element
 * @returns {HTMLElement} element
 */
export function highlight(element) {
    if (isHTMLElement(element)) {
        element.classList.add(SELECTED);
    }

    return element;
}

/**
 * Removes highlighting style of an element
 * @param {HTMLElement} element element
 * @returns {HTMLElement} element
 */
export function unhighlight(element) {
    if (isHTMLElement(element)) {
        element.classList.remove(SELECTED);
    }

    return element;
}
