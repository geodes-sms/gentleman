import {
    createDocFragment, createDiv, createUnorderedList, createListItem, createButton,
    findAncestor, removeChildren, isHTMLElement, isNullOrUndefined, valOrDefault, hasOwn,
} from "zenkai";
import { StyleHandler } from "../style-handler.js";
import { Field } from "./field.js";


/**
 * Verifies whether this element is valid
 * @param {HTMLElement} element 
 * @returns {boolean}
 * @this {BaseListField}
 */
function isValid(element) {
    if (!isHTMLElement(element)) {
        return false;
    }

    const { nature, id } = element.dataset;

    return nature === "field-component" && id === this.id;
}

const BaseAddField = {

    init() {
        this.elements = new Map();

        return this;
    },

    render() {
        const fragment = createDocFragment();

        const { content = "Add", items } = this.schema;

        if (!isHTMLElement(this.element)) {
            this.element = createDiv({
                id: this.id,
                class: ["field", "add-button"],
                tabindex: -1,
                dataset: {
                    nature: "field",
                    view: "list",
                    id: this.id,
                }
            });

            if (this.readonly) {
                this.element.classList.add("readonly");
            }

            StyleHandler.call(this.projection, this.element, this.schema.style);
        }

        let addElement = createButton({
            class: ["field-action", "field--list__add"],
            tabindex: 0,
            dataset: {
                nature: "field-component",
                view: "list",
                component: "action",
                id: this.id,
                action: "add",
            }
        });

        if (!isNullOrUndefined(items)) {
            this.item = items;
        }

        addElement.append(content);

        fragment.appendChild(addElement);

        if (fragment.hasChildNodes()) {
            this.element.append(fragment);
        }

        this.bindEvent();

        return this.element;
    },

    focusIn() {
    },

    clickHandler(target) {
        const getComponent = (element) => {
            if (isValid.call(this, element)) {
                return element;
            }

            return findAncestor(element, (el) => isValid.call(this, el), 5);
        };

        const component = getComponent(target);

        if (isNullOrUndefined(component)) {
            return;
        }

        const { action, index, name } = component.dataset;

        if (action === "add") {
            this.parent.prio = this.element;
            this.createElement();
        } else if (action === "remove") {
            this.delete(component.parentElement);
        }

        this.parent.prio = this.element;

    },

    createElement() {
        this.source.createElement();
    },

    addItem(value) {
        this.parent.addItem(value, this);

        /*this.element.append(item);*/

        return this;
    },

    removeItem(value) {
        this.parent.removeItem(value);
    },

    refresh() {
        if (this.element) {
            this.source.getValue().forEach((value) => {
                this.addItem(value);
            });
        }
    },

    focusOut() {

    },

    bindEvent() {
        this.projection.registerHandler("value.added", (value) => {
            this.addItem(value);
        });

        this.projection.registerHandler("value.removed", (value) => {
            this.removeItem(value);
        });
    }
};

export const AddField = Object.assign(
    Object.create(Field),
    BaseAddField
);