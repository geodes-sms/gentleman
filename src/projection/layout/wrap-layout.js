import {
    createDocFragment, createDiv, createInput, createLabel, createButton,
    isHTMLElement, isEmpty, valOrDefault,
} from "zenkai";
import { StyleHandler } from './../style-handler.js';
import { ContentHandler } from './../content-handler.js';


export const WrapLayout = {
    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement[]} */
    elements: null,
    /** @type {boolean} */
    focusable: null,

    init(args) {
        this.collapsible = valOrDefault(this.schema.collapsible, false);
        this.focusable = valOrDefault(this.schema.focusable, true);
        this.elements = [];

        Object.assign(this, valOrDefault(args, {}));

        return this;
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
                }
            });
        }

        if (this.focusable) {
            this.container.tabIndex = -1;
        } else {
            this.container.dataset.ignore = "all";
        }
        // this.btnEdit = createButton({
        //     class: ["btn", "btn-edit"]
        // }, "Edit");
        // fragment.appendChild(this.btnEdit);


        for (let i = 0; i < disposition.length; i++) {
            let render = ContentHandler.call(this, disposition[i]);

            this.elements.push(render);

            fragment.appendChild(render);
        }

        StyleHandler.call(this, this.container, style);

        if (fragment.hasChildNodes()) {
            this.container.appendChild(fragment);
            this.bindEvents();
        }

        // this.container.style.display = "inline-block";

        this.refresh();

        return this.container;
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
    refresh() {

        return this;
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