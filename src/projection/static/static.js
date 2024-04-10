import { removeChildren, findAncestor, isEmpty, isFunction } from 'zenkai';
import { ObserverHandler } from '@structure/index.js';
import { show, hide, shake, toggle, NotificationType } from '@utils/index.js';


const BaseStatic = {
    init() {
        throw new Error("This function has not been implemented");
    },

    /** @type {HTMLElement} */
    element: null,
    /** @type {*[]} */
    children: null,
    /** @type {HTMLElement} */
    statusElement: null,

    /** @type {HTMLElement[]} */
    attached: null,

    /** @type {boolean} */
    readonly: false,
    /** @type {boolean} */
    visible: false,
    /** @type {boolean} */
    disabled: false,
    /** @type {boolean} */
    active: false,
    /** @type {boolean} */
    focused: false,

    get hasAttached() { return !isEmpty(this.attached); },

    attach(element, type) {
        this.attached.push(element);
    },
    detach(element) {
        this.attached.slice(this.attached.indexOf(element), 1);
    },
    getAttached(pred) {
        if (!isFunction(pred)) {
            return this.attached;
        }

        return this.attached.filter(element => pred(element));
    },

    show() {
        show(this.element);

        this.visible = true;
        this.active = true;

        return this;
    },
    hide() {
        hide(this.element);

        this.visible = false;

        return this;
    },
    toggle() {
        toggle(this.container);
        this.visible = !this.visible;

        return this;
    },
    focus() {
        this.element.focus();
        this.focused = true;
        this.active = true;

        return this;
    },
    /**
     * Static Focus in handler
     * @param {HTMLElement} target 
     */
    _focusIn(target) {
        return false;
    },
    navigate(dir, from, to) {
        if (!this.focusable) {
            return this.parent.arrowHandler(dir, this.element);
        }

        this.element.focus();

        return true;
    },
    clear() {
        return true;
    },
    delete() {
        this.environment.notify("This element cannot be removed", NotificationType.WARNING, 1500);
        shake(this.element);
    },
    /**
     * Handles the `space` command
     * @param {HTMLElement} target 
     */
    spaceHandler(target) {
        return this.arrowHandler("right", target);
    },

    /**
     * Handles the `space` command
     * @param {HTMLElement} target 
     */
    _spaceHandler(target) {
        this.environment.notify("Nothing do here.", NotificationType.NORMAL, 1500);

        return false;
    },
    /**
     * Handles the `escape` command
     * @param {HTMLElement} target 
     */
    escapeHandler(target) {
        let parent = findAncestor(target, (el) => el.tabIndex === 0);
        let element = this.projection.resolveElement(parent);

        element.focus(parent);

        return true;
    },
    /**
     * Handles the `enter` command
     * @param {HTMLElement} target 
     */
    enterHandler(target) {
        this.element.click();
    },
    /**
     * Handles the `delete` command
     * @param {HTMLElement} target 
     */
    deleteHandler(target) {
        this.environment.notify("This element cannot be removed", NotificationType.WARNING, 1500);
        shake(this.element);

        return false;
    },
    /**
     * Handles the `backspace` command
     * @param {HTMLElement} target 
     */
    backspaceHandler(target) {
        return this.arrowHandler("left", target);
    },
    /**
     * Handles the `arrow` command
     * @param {string} dir 
     * @param {HTMLElement} target 
     */
    arrowHandler(dir, target) {
        if (this.parent) {
            return this.parent.arrowHandler(dir, target);
        }

        return false;
    },
    /**
     * Handles the `click` command
     * @param {HTMLElement} target 
     */
    clickHandler(target) {
        console.warn("CLICK_HANDLER NOT IMPLEMENTED");

        return false;
    },
    /**
     * Handles the `control` command
     * @param {HTMLElement} target 
     */
    controlHandler(target) {
        console.warn("CONTROL NOT IMPLEMENTED");

        return false;
    },

    meetSize() {
        return;
    }
};


export const Static = Object.assign(
    BaseStatic
);