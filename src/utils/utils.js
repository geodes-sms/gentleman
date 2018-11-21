import { HELPER } from './helpers.js';
import { __VERSION } from '../global.js';

export const UTIL = (function (_) {
    const DOC = typeof module !== 'undefined' && module.exports ? {} : document;

    var pub = {
        /**
         * Gets the window's width
         */
        get windowWidth() { return window.innerWidth || DOC.documentElement.clientWidth || DOC.body.clientWidth; },

        /**
         * Returns the first Element within the specified container that matches the specified selector, group or selectors.
         * @param {string} selector A DOMString containing one or more selectors to match
         * @param {HTMLElement} [el] Container queried
         * @returns {HTMLElement|null} The first Element matches that matches the specified set of CSS selectors.
         */
        getElement(selector, el) {
            el = _.valOrDefault(el, DOC);

            if (/^#[a-zA-Z0-9_-]+$/.test(selector)) {
                return DOC.getElementById(selector.substring(1));
            }
            if (/^\.[a-zA-Z0-9_-]+$/.test(selector)) {
                return el.getElementsByClassName(selector.substring(1))[0];
            }

            return el.querySelector(selector);
        },
        /**
         * Returns all elements that match the selector query.
         * @param {string} selector A DOMString containing one or more selectors to match
         * @param {HTMLElement} [el] Container queried
         * @returns {HTMLCollection|NodeList} A live or *static* (not live) collection of the `container`'s children Element that match the `selector`.
         */
        getElements(selector, el) {
            el = _.valOrDefault(el, DOC);

            return /^\.[a-zA-Z0-9_-]+$/.test(selector) ?
                el.getElementsByClassName(selector.substring(1)) :
                el.querySelectorAll(selector);
        },
        /**
         * Gets the previous or next element of the specified element
         * @param {HTMLElement} el element
         * @param {string} dir sibling direction
         * @returns {(Element|null)} Element or null
         */
        getElementSibling(el, dir) {
            var sibling = el[dir];

            while (sibling && this.hasClass(sibling, "autocomplete")) sibling = sibling[dir];

            return sibling;
        },
        /**
         * Gets the previous element of the specified one in its parent's children list
         * @param {HTMLElement} el element
         * @returns {(Element|null)} Element or null if the specified element is the first one in the list
         */
        getPreviousElementSibling(el) { return this.getElementSibling(el, "previousElementSibling"); },
        /**
         * Gets the element following the specified one in its parent's children list
         * @param {HTMLElement} el element
         * @returns {(Element|null)} Element or null if the specified element is the last one in the list
         */
        getNextElementSibling(el) { return this.getElementSibling(el, "nextElementSibling"); },
        /**
         * Inserts a given element before the targetted element
         * @param {HTMLElement} target 
         * @param {HTMLElement} el 
         */
        insertBeforeElement(target, el) { target.insertAdjacentElement('beforebegin', el); },
        /**
         * Inserts a given element after the targetted element
         * @param {HTMLElement} target 
         * @param {HTMLElement} el 
         */
        insertAfterElement(target, el) { target.insertAdjacentElement('afterend', el); },
        /**
         * Inserts a givern element as the first children of the targetted element
         * @param {HTMLElement} target 
         * @param {HTMLElement} el 
         */
        preprendChild(target, el) { target.insertAdjacentElement('afterbegin', el); },
        /**
         * Append a list of elements to a node.
         * @param {HTMLElement} parent
         * @param {HTMLElement[]} children
         */
        appendChildren(parent, children) {
            var fragment = this.createDocFragment();
            children.forEach(element => {
                fragment.appendChild(element);
            });
            parent.appendChild(fragment);
            fragment = null;
            return parent;
        },
        /**
         * Verifies that an element has a class
         * @param {HTMLElement} e element
         * @param {string} c class
         */
        hasClass(e, c) {
            var classes = e.className.split(" ");
            for (let i = 0, len = classes.length; i < len; i++) {
                if (c == classes[i])
                    return true;
            }
            return false;
        },
        /**
         * Removes a class from an element if it exists
         * @param {HTMLElement} e element
         * @param {string} c class
         */
        removeClass(e, c) {
            if (this.hasClass(e, c)) {
                var classes = e.className.split(" ");
                var classes2 = "";
                for (let i = 0, len = classes.length; i < len; i++) {
                    if (c != classes[i])
                        classes2 += " " + classes[i];
                }
                e.className = classes2.trim();
            }
        },
        /**
         * Adds one or many classes to an element if it doesn't exist
         * @param {HTMLElement} el Element
         * @param {string} c classes
         */
        addClass(el, c) {
            // If c is an Array => Format c as a space-separated string
            if (Array.isArray(c)) {
                c = c.map(function (c) { return _.valOrDefault(c.class, c); }).join(' ');
            }
            var strClass = _.valOrDefault(c.class, c);

            if (_.isNullOrWhiteSpace(el.className))
                el.className = strClass;
            else if (!pub.hasClass(el, c))
                el.className += " " + strClass;
        },
        /**
         * Adds or removes a class from an element depending on the class's presence.
         * @param {HTMLElement} el 
         * @param {string} c ClassName
         */
        toggleClass(el, c) {
            if (this.hasClass(el, c))
                this.removeClass(el, c);
            else
                this.addClass(el, c);
        },

        /**
         * Removes all children of a node from the DOM
         * @param {Node} node 
         */
        removeChildren(node) {
            while (node.hasChildNodes())
                node.removeChild(node.lastChild);
        }
    };

    return pub;
}(HELPER));