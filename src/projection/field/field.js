import { removeChildren, isEmpty, isFunction, isHTMLElement, createI } from 'zenkai';
import { shake, show, hide, toggle } from '@utils/index.js';
import { createNotificationMessage } from "./notification.js";

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
    /** @type {*[]} */
    children: null,

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
    getMessageElement() {
        if (!isHTMLElement(this.messageElement)) {
            this.messageElement = createI({
                class: ["field-message", "hidden"],
                dataset: {
                    nature: "field-component",
                    view: this.type,
                    id: this.id,
                }
            });

            this.notification.append(this.messageElement);
        }

        return this.messageElement;
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
    focus(target) {
        this.element.contentEditable = false;
        this.element.focus();
        this.focused = true;

        return this;
    },
    getContainer() { return this.element; },
    notify(message, type, time = 4500) {
        let msgElement = this.getMessageElement();

        removeChildren(msgElement);
        msgElement.append(createNotificationMessage(type, message));

        show(msgElement);
    },
    /**
     * Appends an element to the field container
     * @param {HTMLElement} element 
     */
    append(element) {
        if (!isHTMLElement(element)) {
            throw new TypeError("Bad argument: The 'element' argument must be an HTML Element");
        }

        this.element.append(element);

        return this;
    },

    /**
     * Component Focus in handler
     * @param {HTMLElement} target 
     */
    _focusIn(target) {
        return false;
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
            this.clear();
            removeChildren(this.element);
            this.element.remove();
        } else {
            this.environment.notify(result.message);
            shake(this.element);
        }
    },

    /**
     * Handles the `space` command
     * @param {HTMLElement} target 
     */
    spaceHandler(target) {
        console.warn(`SPACE_HANDLER NOT IMPLEMENTED FOR ${this.name}`);

        return false;
    },

    /**
     * Handles the `space` command
     * @param {HTMLElement} target 
     */
    _spaceHandler(target) {
        console.warn(`CTRL_SPACE_HANDLER NOT IMPLEMENTED FOR ${this.name}`);

        return false;
    },
    /**
     * Handles the `escape` command
     * @param {HTMLElement} target 
     */
    escapeHandler(target) {
        console.warn(`ESCAPE_HANDLER NOT IMPLEMENTED FOR ${this.name}`);

        return false;
    },
    /**
     * Handles the `enter` command
     * @param {HTMLElement} target 
     */
    enterHandler(target) {
        this.focusOut();
    },
    /**
     * Handles the `delete` command
     * @param {HTMLElement} target 
     */
    deleteHandler(target) {
        console.warn(`DELETE_HANDLER NOT IMPLEMENTED FOR ${this.name}`);
    },
    /**
     * Handles the `backspace` command
     * @param {HTMLElement} target 
     */
    backspaceHandler(target) {
        console.warn(`BACKSPACE_HANDLER NOT IMPLEMENTED FOR ${this.name}`);

        return false;
    },
    /**
     * Handles the `arrow` command
     * @param {string} dir 
     * @param {HTMLElement} target 
     */
    arrowHandler(dir, target) {
        console.warn(`ARROW_HANDLER NOT IMPLEMENTED FOR ${this.name}`);

        return false;
    },
    /**
     * Handles the `arrow` command
     * @param {HTMLElement} target 
     */
    _arrowHandler(dir, target) {
        console.warn(`CTRL_ARROW_HANDLER NOT IMPLEMENTED FOR ${this.name}`);

        return false;
    },
    /**
     * Handles the `click` command
     * @param {HTMLElement} target 
     */
    clickHandler(target) {
        console.warn(`CLICK_HANDLER NOT IMPLEMENTED FOR ${this.name}`);

        return false;
    },
    /**
     * Handles the `control` command
     * @param {HTMLElement} target 
     */
    controlHandler(target) {
        if (this.toolbar) {
            this.toolbar.remove();
        }

        // this.toolbar = createDiv({
        //     class: ["field-toolbar"],
        //     dataset: {
        //         nature: "field-component",
        //         view: "text",
        //         id: this.id,
        //     }
        // });

        // this.body = createDiv({
        //     class: ["field-body"],
        //     dataset: {
        //         nature: "field-component",
        //         view: "text",
        //         id: this.id,
        //     }
        // });
        // this.body.append(...this.element.childNodes);

        // this.element.append(this.toolbar, this.body);
        // this.element.classList.add("control");
    },
    shiftHandler(dir, target) {
        console.warn(`SHIFT_HANDLER NOT IMPLEMENTED FOR ${this.name}`);

        return false;
    }
};


export const Field = Object.assign(
    BaseField
);