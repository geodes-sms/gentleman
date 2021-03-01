import { StyleHandler } from './../style-handler.js';

export const Layout = {
    /** @type {boolean} */
    focusable: null,
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
};