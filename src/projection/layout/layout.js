import { findAncestor, getElement, isNullOrUndefined, isHTMLElement, isFunction } from "zenkai";
import { StyleHandler } from './../style-handler.js';
import { show, hide, toggle, pixelToNumber, getClosest, shake } from '@utils/index.js';

export const Layout = {
    /** @type {boolean} */
    focusable: null,
    /** @type {boolean} */
    readonly: false,
    /** @type {boolean} */
    visible: false,
    /** @type {boolean} */
    editable: false,
    /** @type {boolean} */
    active: false,
    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement[]} */
    elements: null,
    /** @type {*[]} */
    children: null,
    /** @type {boolean} */
    editing: false,

    getStyle() {
        return this.schema['style'];
    },
    setStyle(style) {
        this.schema.style = style;
        StyleHandler.call(this.projection, this.container, style);

        this.refresh();

        return true;
    },
    getContainer() { return this.container; },
    isRoot() { return isNullOrUndefined(this.parent); },
    /**
     * Get a the related field object
     * @param {HTMLElement} element 
     */
    getField(element) {
        return this.projection.getField(element);
    },
    /**
     * Get a the related static object
     * @param {HTMLElement} element 
     */
    getStatic(element) {
        return this.projection.getStatic(element);
    },
    /**
     * Get a the related static object
     * @param {HTMLElement} element 
     */
    getLayout(element) {
        return this.environment.getLayout(element);
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

    /**
     * Component Focus in handler
     * @param {HTMLElement} target 
     */
    _focusIn(target) {
        return false;
    },

    /**
     * Handles the `space` command
     * @param {HTMLElement} target 
     */
    spaceHandler(target) {
        if (target !== this.container) {
            return false;
        }

        if (isNullOrUndefined(this.parent)) {
            return false;
        }

        return this.parent.spaceHandler(this.container);
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
        if (this.isRoot()) {
            return false;
        }

        let parent = findAncestor(target, (el) => el.tabIndex === 0);
        let element = this.environment.resolveElement(parent);

        if (isNullOrUndefined(element)) {
            return false;
        }

        element.focus(parent);

        return true;
    },
    /**
     * Handles the `enter` command
     * @param {HTMLElement} target element
     */
    enterHandler(target) {
        let focusableElement = getElement('[tabindex]:not([tabindex="-1"])', this.container);
        let child = this.environment.resolveElement(focusableElement);

        if (isNullOrUndefined(child)) {
            return false;
        }

        child.focus();

        return true;
    },
    delete() {
        var result = this.source.delete();

        if (!result.success) {
            this.environment.notify(result.message);
        }
    },
    /**
     * Handles the `delete` command
     * @param {HTMLElement} target 
     */
    deleteHandler(target) {
        if (this.projection.element !== this) {
            return false;
        }

        if (!this.projection.optional) {
            shake(this.container);

            return false;
        }

        let parent = findAncestor(target, (el) => el.tabIndex === 0);
        let clone = this.container.cloneNode(true);

        if (this.source.hasParent()) {
            this.environment.save(this.source.getParent(), clone);
        }

        this.source.delete();

        let element = this.environment.resolveElement(parent);

        if (isNullOrUndefined(element)) {
            return false;
        }

        element.focus();

        return false;
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
     * @param {string} dir direction 
     * @param {HTMLElement} target element
     */
    arrowHandler(dir, target) {
        if (target === this.container) {
            if (isNullOrUndefined(this.parent)) {
                return false;
            }

            return this.parent.arrowHandler(dir, this.container);
        }

        let closestElement = getClosest(target, dir, this.container);

        if (!isHTMLElement(closestElement)) {
            if (isNullOrUndefined(this.parent) || this.parent.object !== "layout") {
                return false;
            }

            return this.parent.arrowHandler(dir, this.container);
        }

        let element = this.environment.resolveElement(closestElement);
        if (element) {
            isFunction(element.navigate) ? element.navigate(dir) : element.focus();
        }

        return true;
    },
    /**
     * Handles the `shift` command
     * @param {string} dir 
     * @param {HTMLElement} target 
     */
    shiftHandler(dir, target) {
        if (dir === "up") {
            let space = pixelToNumber(window.getComputedStyle(this.container).marginTop);
            this.container.style.marginTop = `${space + 1}px`;
        }

        return true;
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

    updateSize(){
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
};