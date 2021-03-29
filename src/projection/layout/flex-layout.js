import { createDocFragment, createDiv, isHTMLElement, valOrDefault, hasOwn, isNullOrUndefined } from "zenkai";
import { getClosest, getVisibleElement } from "@utils/index.js";
import { StyleHandler } from './../style-handler.js';
import { ContentHandler } from './../content-handler.js';
import { Layout } from "./layout.js";


const Orientation = {
    ROW: "row",
    COLUMN: "column"
};

export const BaseFlexLayout = {
    /** @type {string} */
    orientation: null,
    /** @type {boolean} */
    wrappable: null,
    /** @type {string} */
    alignItems: null,
    /** @type {string} */
    justifyContent: null,
    /** @type {*} */
    args: null,

    init(args = {}) {
        const { orientation = Orientation.ROW, wrappable = true, alignItems, justifyContent, editable = true, focusable = false } = this.schema;

        this.orientation = orientation;
        this.wrappable = wrappable;
        this.alignItems = alignItems;
        this.justifyContent = justifyContent;
        this.focusable = focusable;
        this.editable = editable;
        this.elements = [];
        this.args = args;

        Object.assign(this, args);

        return this;
    },
    getOrientation() {
        return this.orientation;
    },
    setOrientation(value) {
        if (!hasOwn(Orientation, value)) {
            return;
        }

        this.orientation = value;
        this.refresh();
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
     * Renders the stack layout container
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
                    layout: "stack",
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

        this.container.style.display = "flex";

        this.refresh();

        return this.container;
    },
    refresh() {
        this.container.style.flexDirection = this.orientation;
        this.container.style.justifyContent = this.justifyContent;
        this.container.style.alignItems = this.alignItems;

        if (this.wrappable) {
            this.container.style.flexWrap = "wrap";
        } else {
            this.container.style.flexWrap = "nowrap";
        }

        return this;
    },

    focus(element) {
        if (this.focusable) {
            this.container.focus();
        } else {
            let firstElement = valOrDefault(getVisibleElement(this.container), this.elements[0]);

            if (firstElement === this.btnCollapse) {
                firstElement = this.elements[0];
            }

            let projectionElement = this.environment.resolveElement(firstElement);

            if (projectionElement) {
                projectionElement.focus(firstElement);
            }
        }
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

    /**
     * Handles the `arrow` command
     * @param {string} dir direction 
     * @param {HTMLElement} target element
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
            return false;
        }

        let element = this.environment.resolveElement(closestElement);
        if (element) {
            element.focus();
        }

        return true;
    },

    bindEvents() {
        this.container.addEventListener('change', (event) => {
            const { target } = event;
            const { prop } = target.dataset;

            if (prop === "orientation") {
                this.setOrientation(target.value);
            }
        });

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

export const FlexLayout = Object.assign({},
    Layout,
    BaseFlexLayout
);