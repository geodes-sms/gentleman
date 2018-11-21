import { UTIL } from './utils.js';
import { HELPER } from './helpers.js';
import { UI } from './../enums.js';

export const Effect = (function (me, _) {

    const Elements = ['BUTTON', 'COMMAND', 'FIELDSET', 'INPUT', 'KEYGEN', 'OPTGROUP', 'OPTION', 'SELECT', 'TEXTAREA'];

    /**
     * Shows an element
     * @param {Element} el Element
     */
    me.show = function (el) { me.removeClass(el, UI.HIDDEN); };
    /**
     * Hides an element
     * @param {Element} el element
     */
    me.hide = function (el) { me.addClass(el, UI.HIDDEN); };
    /**
     * Moves an element out of screen
     * @param {HTMLElement} el Element
     */
    me.fakeHide = function (el) { return Object.assign(el, { position: 'absolute', top: '-9999px', left: '-9999px' }); };
    /**
     * Applies highlighting style to an element
     * @param {HTMLElement} el Element
     */
    me.highlight = function (el) { me.addClass(el, UI.SELECTED); };
    /**
     * Removes highlighting style of an element
     * @param {HTMLElement} el Element
     */
    me.unhighlight = function (el) { me.removeClass(el, UI.SELECTED); };
    /**
     * Enable an element
     * @param {HTMLElement} el Element
     */
    me.enable = function (el, val) {
        if (Elements.indexOf(el.tagName) !== -1) {
            el.disabled = val === false;
        }

        el.dataset.disabled = val === false;
    };
    /**
     * Disable an element
     * @param {HTMLElement} el 
     */
    me.disable = function (el, val) {
        if (Elements.indexOf(el.tagName) !== -1) {
            el.disabled = val !== false;
        }

        el.dataset.disabled = val !== false;
    };

    return me;
})(UTIL, HELPER);