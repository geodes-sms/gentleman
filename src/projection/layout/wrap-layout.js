import {
    createDocFragment, createDiv, createInput, createLabel, createButton, isHTMLElement, valOrDefault,
} from "zenkai";
import { getElementTop, getElementBottom, getElementLeft, getElementRight } from "@utils/index.js";
import { StyleHandler } from './../style-handler.js';
import { ContentHandler } from './../content-handler.js';


export const WrapLayout = {
    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement[]} */
    elements: null,
    /** @type {boolean} */
    focusable: null,

    init(args = {}) {
        const { focusable = false } = this.schema;

        this.focusable = focusable;
        this.elements = [];

        Object.assign(this, args);

        return this;
    },

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
     * Get a the related layout object
     * @param {HTMLElement} element 
     */
    getLayout(element) {
        return this.projection.getLayout(element);
    },

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
            this.container.tabIndex = -1;
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

        this.refresh();

        return this.container;
    },
    refresh() {

        return this;
    },

    openMenu() {
        if (!isHTMLElement(this.menu)) {
            this.menu = createDiv({
                class: ["layout-menu"]
            });

            let orientationField = createOrientationField.call(this);
            let styleField = createStyleField.call(this);
            this.menu.append(orientationField, styleField);
            this.btnEdit.after(this.menu);
        }

        this.menu.prepend(this.btnEdit);
        this.menu.classList.add("open");
    },
    closeMenu() {
        if (!isHTMLElement(this.menu)) {
            return;
        }

        this.menu.classList.remove("open");
        setTimeout(() => {
            this.menu.before(this.btnEdit);
        }, 200);
    },
    focus(target) {
        if (this.focusable) {
            this.container.focus();
        } else {
            let projectionElement = this.environment.resolveElement(valOrDefault(target, this.elements[0]));
            if (projectionElement) {
                projectionElement.focus();
            }
        }
    },

    /**
     * Handles the `arrow` command
     * @param {string} dir direction 
     * @param {HTMLElement} target target element
     */
    arrowHandler(dir, target) {
        if (!this.elements.includes(target)) {
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