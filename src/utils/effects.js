import { UI } from '@src/global/enums.js';

const Elements = ['BUTTON', 'COMMAND', 'FIELDSET', 'INPUT', 'KEYGEN', 'OPTGROUP', 'OPTION', 'SELECT', 'TEXTAREA'];

/**
 * Shows an element
 * @param {Element} el Element
 */
export const show = (el) => el.classList.remove(UI.HIDDEN);
/**
 * Hides an element
 * @param {Element} el element
 */
export const hide = (el) => el.classList.add(UI.HIDDEN);
/**
 * Moves an element out of screen
 * @param {HTMLElement} el Element
 */
export const fakeHide = (el) => Object.assign(el, { position: 'absolute', top: '-9999px', left: '-9999px' });
/**
 * Applies highlighting style to an element
 * @param {HTMLElement} el Element
 */
export const highlight = (el) => el.classList.add(UI.SELECTED);
/**
 * Removes highlighting style of an element
 * @param {HTMLElement} el Element
 */
export const unhighlight = (el) => el.classList.remove(UI.SELECTED);

/**
 * Enable an element
 * @param {HTMLElement} el Element
 */
export const enable = function (el, val) {
    if (Elements.indexOf(el.tagName) !== -1) {
        el.disabled = val === false;
    }

    el.dataset.disabled = val === false;
};
/**
 * Disable an element
 * @param {HTMLElement} el 
 */
export const disable = function (el, val) {
    if (Elements.indexOf(el.tagName) !== -1) {
        el.disabled = val !== false;
    }

    el.dataset.disabled = val !== false;
};