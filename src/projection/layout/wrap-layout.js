import {
    createDocFragment, createDiv, createInput, createLabel, createButton,
    isHTMLElement, valOrDefault, findAncestor,
} from "zenkai";
import { getVisibleElement, getClosest } from "@utils/index.js";
import { StyleHandler } from './../style-handler.js';
import { ContentHandler } from './../content-handler.js';
import { Layout } from "./layout.js";


export const BaseWrapLayout = {
    /** @type {HTMLElement[]} */
    elements: null,

    init(args = {}) {
        const { focusable = false } = this.schema;

        this.focusable = focusable;
        this.elements = [];

        Object.assign(this, args);

        return this;
    },

    /**
     * Renders the wrap layout container
     * @returns {HTMLElement}
     */
    render() {
        const { disposition, style, help } = this.schema;

        if (!Array.isArray(disposition)) {
            throw new SyntaxError("Bad disposition");
        }

        const fragment = createDocFragment();

        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["layout-container"],
                title: help,
                dataset: {
                    nature: "layout",
                    layout: "wrap",
                    id: this.id,
                }
            });
        }

        if (this.focusable) {
            this.container.tabIndex = 0;
        } else {
            this.container.dataset.ignore = "all";
        }

        for (let i = 0; i < disposition.length; i++) {
            let render = ContentHandler.call(this, disposition[i]);

            let element = this.environment.resolveElement(render);
            if (element) {
                element.parent = this;
            }

            this.elements.push(render);

            fragment.appendChild(render);
        }

        StyleHandler.call(this, this.container, style);

        if (fragment.hasChildNodes()) {
            this.container.appendChild(fragment);
            this.bindEvents();
        }

        this.container.style.display = "inline-flex";

        this.refresh();

        return this.container;
    },
    refresh() {

        return this;
    },

    focusIn() {
        this.focused = true;
        this.container.classList.add("active");
        this.container.classList.add("focus");

        return this;
    },
    focusOut() {
        this.container.classList.remove("active");
        this.container.classList.remove("focus");

        this.focused = false;

        return this;
    },
    focus(element) {
        if (this.focusable) {
            this.container.focus();
        } else {
            let firstElement = valOrDefault(getVisibleElement(this.container), this.elements[0]);
            let projectionElement = this.environment.resolveElement(firstElement);

            if (projectionElement) {
                projectionElement.focus(firstElement);
            }
        }
    },

    /**
     * Handles the `enter` command
     * @param {HTMLElement} target element
     */
    enterHandler(target) {
        let projectionElement = this.environment.resolveElement(this.elements[0]);

        if (projectionElement) {
            projectionElement.focus();
        }

        return false;
    },
    /**
     * Handles the `escape` command
     * @param {HTMLElement} target 
     */
    escapeHandler(target) {
        let parent = findAncestor(target, (el) => el.tabIndex === 0);
        let element = this.environment.resolveElement(parent);

        element.focus(parent);
    },
    /**
     * Handles the `arrow` command
     * @param {string} dir direction 
     * @param {HTMLElement} target target element
     */
    arrowHandler(dir, target) {
        if (target === this.container) {
            if (this.parent) {
                return this.parent.arrowHandler(dir, this.container);
            }

            return false;
        }

        let closestElement = getClosest(target, dir, this.container);

        if (isHTMLElement(closestElement)) {
            let element = this.environment.resolveElement(closestElement);
            if (element) {
                element.focus();
            }

            return true;
        }

        if (this.parent) {
            return this.parent.arrowHandler(dir, this.container);
        }

        return false;
    },

    bindEvents() {
        this.projection.registerHandler("view.changed", (value, from) => {
            console.log(value, from);
            if (from && from.parent === this.projection) {
                value.parent = this;
            }
        });
    }
};


export const WrapLayout = Object.assign({},
    Layout,
    BaseWrapLayout
);