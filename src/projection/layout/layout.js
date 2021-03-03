import { StyleHandler } from './../style-handler.js';
import { show, hide, toggle } from '@utils/index.js';

export const Layout = {
    /** @type {boolean} */
    focusable: null,
    /** @type {boolean} */
    readonly: false,
    /** @type {boolean} */
    visible: false,
    /** @type {boolean} */
    active: false,
    /** @type {HTMLElement} */
    container: null,

    getStyle() {
        return this.schema['style'];
    },
    setStyle(style) {
        this.schema.style = style;
        StyleHandler.call(this, this.container, style);

        this.refresh();

        return true;
    },
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

        this.focusOut();
    },
    /**
     * Handles the `backspace` command
     * @param {HTMLElement} target 
     */
    backspaceHandler(target) {
        console.warn("BACKSPACE_HANDLER NOT IMPLEMENTED");

        return false;
    },
    /**
     * Handles the `arrow` command
     * @param {string} dir 
     * @param {HTMLElement} target 
     */
    arrowHandler(dir, target) {
        console.warn("ARROW_HANDLER NOT IMPLEMENTED");

        return false;
    },
    /**
     * Handles the `click` command
     * @param {HTMLElement} target 
     */
    clickHandler(target) {
        console.warn("CLICK_HANDLER NOT IMPLEMENTED");

        return false;
    }
};