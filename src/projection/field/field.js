import { removeChildren, isEmpty, isFunction } from 'zenkai';
import { ObserverHandler } from '@structure/index.js';
import { shake, show, hide } from '@utils/index.js';


const BaseField = {
    init() {
        throw new Error("This function has not been implemented");
    },

    /** @type {HTMLElement} */
    element: null,
    /** @type {HTMLElement} */
    statusElement: null,

    /** @type {HTMLElement[]} */
    attached: null,
    /** @type {string[]} */
    errors: null,

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

    get hasError() { return !isEmpty(this.errors); },
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
    focus() {
        this.element.contentEditable = false;
        this.element.focus();
        this.focused = true;

        return this;
    },
    enable() {
        this.disabled = false;

        return this;
    },
    disable() {
        this.disabled = true;

        return this;
    },

    clear() {
        return true;
    },
    delete() {
        var result = this.source.delete();
        
        if (result.success) {
            this.source.unregister(this);
            this.clear();
            removeChildren(this.element);
            this.element.remove();
        } else {
            this.environment.notify(result.message);
            shake(this.element);
        }
    },

    enterHandler(target) {
        this.focusOut();
    },
    backspaceHandler(target) {
        console.warn("BACKSPACE_HANDLER NOT IMPLEMENTED");
    },
    clickHandler(target) {
        console.warn("CLICK_HANDLER NOT IMPLEMENTED");
    },
    arrowHandler(target) {
        console.warn("ARROW_HANDLER NOT IMPLEMENTED");
    },
};


export const Field = Object.assign(
    BaseField,
    ObserverHandler
);