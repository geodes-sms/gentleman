import {
    createDocFragment, createDiv, createButton, createInput, createLabel,
    isHTMLElement, isEmpty, valOrDefault, findAncestor,
} from "zenkai";
import { getElementTop, getElementBottom, getElementLeft, getElementRight } from "@utils/index.js";
import { StyleHandler } from './../style-handler.js';
import { ContentHandler } from './../content-handler.js';
import { Layout } from "./layout.js";


export const BaseStackLayout = {
    /** @type {string} */
    orientation: null,
    /** @type {HTMLElement[]} */
    elements: null,
    /** @type {boolean} */
    edit: false,
    /** @type {HTMLElement} */
    btnEdit: false,
    /** @type {HTMLElement} */
    menu: false,

    init(args = {}) {
        const { orientation = "horizontal", focusable = false } = this.schema;

        this.orientation = orientation;
        this.focusable = focusable;
        this.elements = [];

        Object.assign(this, args);

        return this;
    },
    getOrientation() {
        return this.orientation;
    },
    setOrientation(value) {
        if (!["horizontal", "vertical"].includes(value)) {
            return;
        }

        this.orientation = value;
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

        if (this.focusable) {
            this.container.tabIndex = 0;
        } else {
            this.container.dataset.ignore = "all";
        }
        // this.btnEdit = createButton({
        //     class: ["btn", "btn-edit"]
        // }, "Edit");
        // fragment.appendChild(this.btnEdit);

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

        this.container.style.display = "flex";

        this.refresh();

        return this.container;
    },
    refresh() {
        if (this.orientation === "vertical") {
            this.container.style.flexDirection = "column";
        }
        if (this.orientation === "horizontal") {
            this.container.style.flexDirection = "row";
        }
        // if (this.edit) {
        //     this.container.classList.add("edit");
        //     this.openMenu();
        //     this.btnEdit.textContent = "Done";
        // } else {
        //     this.container.classList.remove("edit");
        //     this.closeMenu();
        //     this.btnEdit.textContent = "Edit";
        // }

        return this;
    },

    focus(element) {
        if (this.focusable) {
            this.container.focus();
        } else {
            let projectionElement = this.environment.resolveElement(valOrDefault(element, this.container.children[0]));
            if (projectionElement) {
                projectionElement.focus();
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
     * @param {HTMLElement} target element
     */
    arrowHandler(dir, target) {
        if (target === this.container) {
            if (this.parent) {
                return this.parent.arrowHandler(dir, this.container);
            }

            return false;
        }

        let closestElement = null;

        if (dir === "up") {
            closestElement = getElementTop(target, this.container);
        } else if (dir === "down") {
            closestElement = getElementBottom(target, this.container);
        } else if (dir === "left") {
            closestElement = getElementLeft(target, this.container);
        } else if (dir === "right") {
            closestElement = getElementRight(target, this.container);
        }

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
        // this.btnEdit.addEventListener('click', (event) => {
        //     this.edit = !this.edit;
        //     this.refresh();
        // });

        this.container.addEventListener('change', (event) => {
            const { target } = event;
            const { prop } = target.dataset;

            if (prop === "orientation") {
                this.setOrientation(target.value);
                this.refresh();
            }
        });
    }
};

/**
 * @returns {HTMLElement}
 */
function createOrientationField() {
    var radioVertical = createInput({
        type: "radio",
        class: ["stack-orientation__input"],
        name: `${this.id}orientation`,
        value: "vertical",
        checked: this.orientation === "vertical",
        dataset: {
            prop: "orientation"
        }
    });

    var radioHorizontal = createInput({
        type: "radio",
        class: ["stack-orientation__input"],
        name: `${this.id}orientation`,
        value: "horizontal",
        checked: this.orientation === "horizontal",
        dataset: {
            prop: "orientation"
        }
    });

    var radioVerticalLabel = createLabel({
        class: ["stack-orientation"]
    }, [radioVertical, "Vertical"]);

    var radioHorizontalLabel = createLabel({
        class: ["stack-orientation"]
    }, [radioHorizontal, "Horizontal"]);


    var orientationField = createDiv({
        class: ["radio-group"]
    }, [radioVerticalLabel, radioHorizontalLabel]);

    return orientationField;
}

/**
 * @returns {HTMLElement}
 */
function createStyleField() {
    var container = createDiv({
        class: ["style-container"]
    });

    return container;
}

/**
 * @this {WrapLayout}
 */
function Collapsible() {
    const fragment = createDocFragment();

    /** @type {HTMLElement} */
    const btnCollapse = createButton({
        class: ["btn", "btn-collapse"],
        dataset: {
            "action": "collapse"
        }
    });


    btnCollapse.addEventListener('click', (event) => {
        if (btnCollapse.dataset.status === "off") {
            let children = Array.from(this.container.children).filter(element => element !== btnCollapse);
            this.collapseContainer = createDiv({
                class: "layout-container-collapse"
            }, children);
            btnCollapse.after(this.collapseContainer);
            this.container.classList.add("collapsed");
            btnCollapse.classList.add("on");
            btnCollapse.dataset.status = "on";
        }
        else {
            let fragment = createDocFragment(Array.from(this.collapseContainer.children));
            btnCollapse.after(fragment);
            this.collapseContainer.remove();
            this.container.classList.remove("collapsed");
            btnCollapse.classList.remove("on");
            btnCollapse.dataset.status = "off";
        }
    });

    fragment.appendChild(btnCollapse);

    return fragment;
}


export const StackLayout = Object.assign({},
    Layout,
    BaseStackLayout
);