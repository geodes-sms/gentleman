import { createDocFragment, createDiv, isHTMLElement, getElement, hasOwn, isNullOrUndefined } from "zenkai";
import { StyleHandler } from './style-handler.js';
import { ContentHandler } from './content-handler.js';
import { Layout } from "./layout/layout.js";


const Orientation = {
    ROW: "row",
    COLUMN: "column"
};

const Alignment = {
    "start": "flex-start",
    "end": "flex-end",
    "flex-start": "flex-start",
    "flex-end": "flex-end",
    "center": "center",
    "stretch": "stretch",
    "baseline": "baseline"
};

const Justify = {
    "start": "flex-start",
    "end": "flex-end",
    "flex-start": "flex-start",
    "flex-end": "flex-end",
    "center": "center",
    "space-between": "space-between",
    "space-around": "space-around",
    "space-evenly": "space-evenly"
};


var inc = 0;
const nextId = () => `layout${inc++}`;

export function createContainer(model, schema, projection) {
    const container = Object.create(Container, {
        object: { value: "layout" },
        name: { value: "flex-layout" },
        type: { value: "flex" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept, writable: true },
    });

    return container;
}

const BaseContainer = {
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
        const { editable = true, focusable = false } = this.schema;
        const { orientation = Orientation.ROW, wrappable = true, alignItems, justifyContent } = this.schema.layout;

        this.orientation = orientation;
        this.wrappable = wrappable;
        this.alignItems = alignItems;
        this.justifyContent = justifyContent;
        this.focusable = focusable;
        this.editable = editable;
        this.elements = [];
        this.children = [];
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
        const { label, content, style, help } = this.schema;

        const fragment = createDocFragment();

        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["layout-container"],
                dataset: {
                    nature: "layout",
                    layout: "flex",
                    id: this.id,
                }
            });
        }

        if (help) {
            this.container.title = help;
        }

        for (let i = 0; i < content.length; i++) {
            let render = ContentHandler.call(this, content[i], null, this.args);
            
            let element = this.environment.resolveElement(render);
            if (element) {
                element.parent = this;
            }

            this.elements.push(render);

            fragment.append(render);
        }

        if (this.focusable) {
            this.container.tabIndex = 0;
        } else {
            this.container.dataset.ignore = "all";
        }

        StyleHandler.call(this.projection, this.container, style);

        if (fragment.hasChildNodes()) {
            this.container.append(fragment);
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
        this.container.style.justifyContent = Justify[this.justifyContent];
        this.container.style.alignItems = Alignment[this.alignItems];

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
            let focusableElement = getElement('[tabindex]:not([tabindex="-1"])', this.container);

            if (isNullOrUndefined(focusableElement)) {
                return false;
            }

            let child = this.environment.resolveElement(focusableElement);

            if (child) {
                child.focus(focusableElement);
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

export const Container = Object.assign({},
    Layout,
    BaseContainer
);