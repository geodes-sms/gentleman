import { createDocFragment, createDiv, isHTMLElement, valOrDefault, isNullOrUndefined } from "zenkai";
import { getVisibleElement, getClosest } from "@utils/index.js";
import { StyleHandler } from './../style-handler.js';
import { ContentHandler } from './../content-handler.js';
import { Layout } from "./layout.js";


export const BaseWrapLayout = {
    /** @type {boolean} */
    containerless: false,
    /** @type {*} */
    args: null,

    init(args = {}) {
        const { containerless = false, editable = true, focusable = false } = this.schema;

        this.containerless = containerless;
        this.focusable = focusable;
        this.editable = editable;

        this.elements = [];
        this.args = args;

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


        if (this.containerless) {
            this.container = fragment;
        } else if (!isHTMLElement(this.container)) {
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

        for (let i = 0; i < disposition.length; i++) {
            let render = ContentHandler.call(this, disposition[i], null, this.args);

            let element = this.environment.resolveElement(render);
            if (element) {
                element.parent = this;
            }

            this.elements.push(render);

            fragment.appendChild(render);
        }

        if (this.containerless) {
            return this.container;
        }

        if (this.focusable) {
            this.container.tabIndex = 0;
        } else {
            this.container.dataset.ignore = "all";
        }

        StyleHandler.call(this, this.container, style);

        if (fragment.hasChildNodes()) {
            this.container.appendChild(fragment);
            this.bindEvents();
        }

        if (this.collapsed) {
            this.collapse(true);
        }

        this.container.style.display = "inline-flex";
        this.container.style.alignItems = "center";

        this.refresh();

        return this.container;
    },
    refresh() {
        if (this.collapsed) {
            this.container.classList.add("collapsed");
        } else {
            this.container.classList.remove("collapsed");
        }

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
     * Handles the `arrow` command
     * @param {string} dir direction 
     * @param {HTMLElement} target target element
     */
    arrowHandler(dir, target) {
        if (target === this.container) {
            if (isNullOrUndefined(this.parent) || this.parent.object !== "layout") {
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
            element.focus();
        }

        return true;
    },

    bindEvents() {
        this.projection.registerHandler("view.changed", (value, from) => {
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