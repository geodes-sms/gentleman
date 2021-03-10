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
    /** @type {boolean} */
    edit: false,
    /** @type {HTMLElement} */
    btnEdit: false,
    /** @type {HTMLElement} */
    btnCollapse: false,
    /** @type {boolean} */
    collapsed: false,

    init(args = {}) {
        const { editable = true, collapsible = false, collapsed = false, focusable = false } = this.schema;

        this.focusable = focusable;
        this.collapsible = collapsible;
        this.collapsed = collapsed;
        this.editable = editable;
        this.elements = [];

        Object.assign(this, args);

        return this;
    },
    collapse(force = false) {
        if (this.collapsed && !force) {
            return;
        }

        this.collapseContainer = createDiv({
            class: "layout-container-collapse"
        }, this.elements);
        this.btnCollapse.after(this.collapseContainer);
        this.collapsed = true;

        this.refresh();

        return this;
    },
    expand(force = false) {
        if (!this.collapsed && !force) {
            return;
        }
        let fragment = createDocFragment(Array.from(this.collapseContainer.children));
        this.btnCollapse.after(fragment);
        this.collapseContainer.remove();
        this.collapsed = false;

        this.refresh();

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

        if (this.collapsible) {
            this.container.dataset.collapsible = "all";
            if (!isHTMLElement(this.btnCollapse)) {
                this.btnCollapse = createButton({
                    class: ["btn", "btn-collapse"],
                    tabindex: 0,
                    dataset: {
                        nature: "layout-component",
                        layout: "stack",
                        component: "action",
                        id: this.id,
                        action: "collapse"
                    }
                });

                this.btnCollapse.classList.add("off");
                this.btnCollapse.dataset.status = "off";

                fragment.appendChild(this.btnCollapse);
            }
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

        if (this.collapsed) {
            this.collapse(true);
        }

        this.container.style.display = "inline-flex";

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
            if (from && from.parent === this.projection) {
                value.parent = this;
            }
        });

        if (this.btnCollapse) {
            this.btnCollapse.addEventListener('click', (event) => {
                if (this.collapsed) {
                    this.expand();
                }
                else {
                    this.collapse();
                }
            });
        }
    }
};


export const WrapLayout = Object.assign({},
    Layout,
    BaseWrapLayout
);