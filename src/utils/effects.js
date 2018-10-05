import { UTIL } from './utils.js';
import { UI } from './../enums.js';

export const Effect = (function (me) {

    var pub = {
        /**
         * Shows an element
         * @param {Element} el Element
         */
        show(el) { me.removeClass(el, UI.HIDDEN); },
        /**
         * Hides an element
         * @param {Element} el element
         */
        hide(el) { me.addClass(el, UI.HIDDEN); },
        /**
         * Moves an element out of screen
         * @param {HTMLElement} el Element
         */
        fakeHide(el) { return Object.assign(el, { position: 'absolute', top: '-9999px', left: '-9999px' }); },
        /**
         * Applies highlighting style to an element
         * @param {HTMLElement} el Element
         */
        highlight(el) { me.addClass(el, UI.SELECTED); },
        /**
         * Removes highlighting style of an element
         * @param {HTMLElement} el Element
         */
        unhighlight(el) { me.removeClass(el, UI.SELECTED); },
        /**
         * Enable an element
         * @param {HTMLElement} el Element
         */
        enable(el) {
            if (el.hasAttribute(UI.DISABLED)) {
                el.disabled = false;
            }

            el.dataset.disabled = false;
        },
        /**
         * Disable an element
         * @param {HTMLElement} el 
         */
        disable(el) {
            if (el.hasAttribute(UI.DISABLED)) {
                el.disabled = true;
            }

            el.dataset.disabled = true;
        }
    };

    return pub;
})(UTIL);