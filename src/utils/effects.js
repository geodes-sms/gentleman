/// <reference path="utils.js" />

const HIDDEN = 'hidden';
const EMPTY = 'empty';
const SELECTED = 'selected';

var UTIL = (function (me) {
    /**
     * Shows an element
     * @param {Element} el element
     */
    me.show = function (el) {
        me.removeClass(el, HIDDEN);
    };

    /**
     * Hides an element
     * @param {Element} el element
     */
    me.hide = function (el) {
        me.addClass(el, HIDDEN);
    };

    me.highlight = function (el) {
        me.addClass(el, SELECTED);
    };

    me.unhighlight = function (el) {
        me.removeClass(el, SELECTED);
    };

    return me;
})(UTIL);