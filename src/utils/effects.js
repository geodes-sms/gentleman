import { isHTMLElement } from 'zenkai';

const HIDDEN = 'hidden';
const COLLAPSED = 'collapsed';
const HIGHLIGHTED = 'highlighted';
const CHECKED = 'checked';
const DISABLED = 'disabled';
const SHAKE = 'shake';
const SELECTED = 'selected';

/**
 * Shows an element
 * @param {HTMLElement} element element
 * @returns {HTMLElement} element
 */
export function show(element) {
    if (!isHTMLElement(element)) {
        return element;
    }
    
    element.classList.remove(HIDDEN);

    return element;
}

/**
 * Hides an element
 * @param {HTMLElement} element element
 * @returns {HTMLElement} element
 */
export function hide(element) {
    if (!isHTMLElement(element)) {
        return element;
    }

    element.classList.add(HIDDEN);

    return element;
}

/**
 * Toggles the display of an element
 * @param {HTMLElement} element element
 * @returns {HTMLElement} element
 */
export function toggle(element) {
    if (!isHTMLElement(element)) {
        return element;
    }

    element.classList.toggle(HIDDEN);

    return element;
}

/**
 * Shakes an element for a second
 * @param {Element} element element
 */
export function shake(element) {
    if (element.classList.contains(SHAKE)) {
        return;
    }

    element.classList.add(SHAKE);
    setTimeout(() => {
        element.classList.remove(SHAKE);
    }, 1000);
}

/**
 * Applies highlighting style to an element
 * @param {HTMLElement} element element
 * @returns {HTMLElement} element
 */
export function highlight(element) {
    if (!isHTMLElement(element)) {
        return element;
    }

    element.classList.add(HIGHLIGHTED);

    return element;
}

/**
 * Removes highlighting style of an element
 * @param {HTMLElement} element element
 * @returns {HTMLElement} element
 */
export function unhighlight(element) {
    if (!isHTMLElement(element)) {
        return element;
    }

    element.classList.remove(HIGHLIGHTED);

    return element;
}

/**
 * Adds collapse style of an element
 * @param {HTMLElement} element element
 * @returns {HTMLElement} element
 */
export function collapse(element) {
    if (isHTMLElement(element)) {
        element.classList.add(COLLAPSED);
    }

    return element;
}

/**
 * Removes collapse style of an element
 * @param {HTMLElement} element element
 * @returns {HTMLElement} element
 */
export function expand(element) {
    if (isHTMLElement(element)) {
        element.classList.remove(COLLAPSED);
    }

    return element;
}
