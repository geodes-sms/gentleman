import { createDocFragment, createDiv, isHTMLElement, valOrDefault, hasOwn, isNullOrUndefined, createInput, createLabel, } from "zenkai";
import { getClosest, getVisibleElement } from "@utils/index.js";
import { StyleHandler } from './../style-handler.js';
import { ContentHandler } from './../content-handler.js';
import { Layout } from "./layout.js";


const Orientation = {
    HORIZONTAL: "horizontal",
    VERTICAL: "vertical"
};


const PROJECTION_SCHEMA = [
    {
        "concept": { "name": "stack-layout" },
        "type": "layout",
        "tags": [],
        "projection": {
            "type": "stack",
            "orientation": "vertical",
            "disposition": [
                {
                    "type": "attribute",
                    "name": "orientation"
                }
            ]
        }
    }
];

export const BaseStackLayout = {
    /** @type {string} */
    orientation: null,
    /** @type {*} */
    args: null,

    init(args = {}) {
        const { orientation = Orientation.HORIZONTAL, editable = true, focusable = false } = this.schema;

        this.orientation = orientation;
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
                class: ["layout-container", "stack-layout"],
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

            fragment.append(render);
        }

        if (this.focusable) {
            this.container.tabIndex = 0;
        } else {
            this.container.dataset.ignore = "all";
        }

        StyleHandler.call(this, this.container, style);

        if (fragment.hasChildNodes()) {
            this.container.append(fragment);
            this.bindEvents();
        }

        this.container.style.display = "flex";
        this.container.style.flexWrap = "nowrap";

        this.refresh();

        return this.container;
    },
    design() {
        const CONCEPT_SCHEMA = [
            {
                "name": "stack-layout",
                "nature": "concrete",
                "attributes": [
                    {
                        "name": "orientation",
                        "target": {
                            "name": "string",
                            "default": this.orientation,
                            "constraint": {
                                "values": ["horizontal", "vertical"]
                            }
                        }
                    }
                ]
            }
        ];

        return {
            concept: CONCEPT_SCHEMA,
            projection: PROJECTION_SCHEMA,
            handlers: {
                orientation: (message, value) => {
                    this.setOrientation(value);
                }
            }
        };
    },
    refresh() {
        if (this.orientation === Orientation.VERTICAL) {
            this.container.style.flexDirection = "column";
        } else if (this.orientation === Orientation.HORIZONTAL) {
            this.container.style.flexDirection = "row";
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

export const StackLayout = Object.assign({},
    Layout,
    BaseStackLayout
);