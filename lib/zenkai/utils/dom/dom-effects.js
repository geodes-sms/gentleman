import { removeClass, addClass } from './dom-manip.js';

const Elements = ['BUTTON', 'COMMAND', 'FIELDSET', 'INPUT', 'KEYGEN', 'OPTGROUP', 'OPTION', 'SELECT', 'TEXTAREA'];

/** 
 * @enum 
 * @ignore
 * @memberof DOM
 */
const UI = {
    COLLAPSE: 'collapse',
    CHECKED: 'checked',
    DISABLED: 'disabled',
    EMPTY: 'empty',
    HIDDEN: 'hidden',
    SELECTED: 'selected',
};

/**
 * Shows an element
 * @param {Element} el Element
 * @memberof DOM
 */
export function show(el) { removeClass(el, UI.HIDDEN); }

/**
 * Hides an element
 * @param {Element} el element
 * @memberof DOM
 */
export function hide(el) { addClass(el, UI.HIDDEN); }

/**
 * Moves an element out of screen
 * @param {HTMLElement} el Element
 * @memberof DOM
 */
export function conceal(el) { return Object.assign(el, { position: 'absolute', top: '-9999px', left: '-9999px' }); }

/**
 * Applies highlighting style to an element
 * @param {HTMLElement} el Element
 * @memberof DOM
 */
export function highlight(el) { addClass(el, UI.SELECTED); }

/**
 * Removes highlighting style of an element
 * @param {HTMLElement} el Element
 * @memberof DOM
 */
export function unhighlight(el) { removeClass(el, UI.SELECTED); }

/**
 * Enable an element
 * @param {HTMLElement} el Element
 * @memberof DOM
 */
export function enable(el, val) {
    if (Elements.indexOf(el.tagName) !== -1) {
        el.disabled = val === false;
    }

    el.dataset.disabled = val === false;
}

/**
 * Disable an element
 * @param {HTMLElement} el 
 * @memberof DOM
 */
export function disable(el, val) {
    if (Elements.indexOf(el.tagName) !== -1) {
        el.disabled = val !== false;
    }

    el.dataset.disabled = val !== false;
}