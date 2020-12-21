import { hasOwn, findAncestor } from 'zenkai';

/**
 * Gets an event real target
 * @param {HTMLElement} element 
 * @returns {HTMLElement}
 */
export function getEventTarget(element) {
    const isValid = (el) => !hasOwn(el.dataset, "ignore");

    if (isValid(element)) {
        return element;
    }

    return findAncestor(element, isValid, 10);
}