import {
    createDocFragment, createSpan, createDiv, createI, createUnorderedList,
    createListItem, createButton, findAncestor, removeChildren, isHTMLElement,
    isNullOrUndefined, valOrDefault, hasOwn,
} from "zenkai";
import {
    hide, show, shake, NotificationType, getClosest, isHidden,
    getTopElement, getBottomElement, getRightElement, getLeftElement
} from "@utils/index.js";
import { StyleHandler } from "./../style-handler.js";
import { ContentHandler } from "./../content-handler.js";
import { StateHandler } from "./../state-handler.js";
import { Field } from "./field.js";


const actionDefaultSchema = {
    add: {
        content: {
            "type": "static",
            "static": {
                "type": "text",
                "content": "Add",
                "focusable": false
            }
        }
    },
    remove: {
        content: {
            "type": "static",
            "static": {
                "type": "text",
                "content": "Remove",
                "focusable": false
            }
        }
    }
};

function createMessageElement() {
    if (!isHTMLElement(this.messageElement)) {
        this.messageElement = createI({
            class: ["field-message", "hidden"],
            dataset: {
                nature: "field-component",
                view: "text",
                id: this.id,
            }
        });
        this.notification.appendChild(this.messageElement);
    }

    return this.messageElement;
}



/**
 * Creates a notification message
 * @param {string} type 
 * @param {string} message 
 * @returns {HTMLElement}
 */
function createNotificationMessage(type, message) {
    var element = createSpan({ class: ["notification-message", `notification-message--${type}`] }, message);

    if (Array.isArray(message)) {
        element.style.minWidth = `${Math.min(message[0].length * 0.5, 30)}em`;
    } else {
        element.style.minWidth = `${Math.min(message.length * 0.5, 30)}em`;
    }

    return element;
}

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

/**
 * Gets the parent list-item element
 * @param {HTMLElement} element 
 * @this {BaseListField}
 * @returns {HTMLElement}
 */
function getItem(element) {
    const isValid = (el) => el.parentElement === this.list;

    if (isValid(element)) {
        return element;
    }

    return findAncestor(element, isValid, 3);
}

const BaseListField = {
    /** @type {HTMLElement} */
    list: null,
    /** @type {Map} */
    items: null,
    /** @type {Map} */
    elements: null,
    /** @type {HTMLElement} */
    selection: null,
    /** @type {*[]} */
    content: null,


    init() {
        const { focusable = true } = this.schema;

        this.items = new Map();
        this.elements = new Map();
        this.focusable = focusable;

        if (!hasOwn(this.schema, "list")) {
            this.schema.list = {
                item: {}
            };
        }

        return this;
    },

    /**
     * Verifies that the field has a changes
     * @returns {boolean}
     */
    hasChanges() {
        return false;
    },
    /**
     * Verifies that the field has a value
     * @returns {boolean}
     */
    hasValue() {
        return this.items.size > 0;
    },
    /**
     * Gets the input value
     * @returns {*[]}
     */
    getValue() {
        return this.list.children;
    },
    setValue(value, update = false) {
        var response = null;

        if (update) {
            response = this.source.setValue(value);
        } else {
            response = {
                success: true
            };
        }

        removeChildren(this.list);

        value.forEach((val) => {
            var item = this.createItem(val);
            this.list.appendChild(item);
        });

        this.refresh();
    },

    clear() {
        this.items.clear();
        removeChildren(this.list);
    },

    focus(element) {
        if (isValid.call(this, element)) {
            this.focusIn(element);
            this.selection.focus();
        } else if (isHTMLElement(this.selection)) {
            this.selection.focus();
        } else if (this.hasValue()) {
            this.list.firstElementChild.focus();
        } else {
            let target = getTopElement(this.element);
            if (!isHTMLElement(target)) {
                return this;
            }
            if (target === this.list) {
                if (this.list.hasChildNodes()) {
                    target.children[0].focus();
                } else {
                    return this.arrowHandler("down", this.list);
                }
            } else {
                target.focus();
            }
        }


        return this;
    },

    /**
     * Element Focus in handler
     * @param {HTMLElement} target 
     */
    focusIn(target) {
        this.focused = true;
        this.element.classList.add("active");

        const { component: name } = target.dataset;

        if (name === "list-item") {
            this.selection = target;
        }
    },
    /**
     * Component Focus in handler
     * @param {HTMLElement} target 
     */
    _focusIn(target) {
        const { component: name } = target.dataset;

        if (name === "list-item") {
            this.selection = target;
        }
    },
    focusOut() {
        if (this.readonly) {
            return;
        }

        if (this.messageElement) {
            hide(this.messageElement);
            removeChildren(this.messageElement);
        }

        this.element.classList.remove("active");

        this.refresh();
        this.focused = false;

        return this;
    },
    createElement() {
        return this.source.createElement();
    },
    getItem(id) {
        return this.items.get(id);
    },

    /**
     * Creates a list field item
     * @param {*} object 
     * @returns {HTMLElement}
     */
    createItem(object) {
        const { action = {} } = this.schema;

        const { template = {}, style } = this.schema.list.item;

        const container = createListItem({
            class: ["field--list-item"],
            tabindex: 0,
            dataset: {
                nature: "field-component",
                view: "list",
                component: "list-item",
                id: this.id,
                value: object.id,
                name: object.name,
                index: valOrDefault(object.index, this.items.size)
            }
        });

        const { content: removeLayout, help, style: removeStyle } = valOrDefault(action.remove, actionDefaultSchema.remove);

        let btnRemove = createButton({
            class: ["btn", "field-action", "btn-remove"],
            tabindex: -1,
            title: "Remove",
            help: help,
            dataset: {
                nature: "field-component",
                view: "list",
                component: "action",
                id: this.id,
                action: "remove",
                index: container.dataset.index
            }
        });

        removeLayout.forEach(element => {
            let content = ContentHandler.call(this, element, null, { focusable: false });

            btnRemove.append(content);
        });

        StyleHandler.call(this.projection, btnRemove, removeStyle);

        container.appendChild(btnRemove);

        let itemProjection = this.model.createProjection(object, template.tag);
        itemProjection.parent = this.projection;

        container.appendChild(itemProjection.init().render());

        itemProjection.element.parent = this;

        this.items.set(object.id, container);

        StyleHandler.call(this.projection, container, style);

        return container;
    },
    addItem(value) {
        const item = this.createItem(value);

        if (value.index) {
            this.list.children[value.index - 1].after(item);
        } else {
            this.list.appendChild(item);
        }

        this.refresh();
    },
    removeItem(value) {
        let item = this.getItem(value.id);

        if (!isHTMLElement(item)) {
            throw new Error("List error: Item not found");
        }

        const index = +item.dataset.index;

        this.items.delete(value.id);

        if (this.selection == item) {
            this.selection = null;
        }

        removeChildren(item);
        item.remove();

        for (let i = index; i < this.list.children.length; i++) {
            const item = this.list.children[i];
            const { index } = item.dataset;
            item.dataset.index = +index - 1;
        }

        this.refresh();
    },
    /**
     * Appends an element to the field container
     * @param {HTMLElement} element 
     */
    append(element) {
        if (!isHTMLElement(element)) {
            throw new TypeError("Bad argument: The 'element' argument must be an HTML Element");
        }

        this.element.appendChild(element);

        return this;
    },
    delete(target) {
        if (target === this.element) {
            this.source.remove();

            return;
        }

        const { index } = target.dataset;

        var result = this.source.removeElementAt(+index);

        if (result.success) {
            if (this.hasValue()) {
                let itemIndex = +index < this.list.childElementCount ? +index : this.list.childElementCount - 1;
                this.list.children[itemIndex].focus();
            } else {
                this.focus();
            }
        } else {
            this.environment.notify(`This element cannot be deleted: ${result.message}`);
            shake(target);
        }
    },


    refresh() {
        if (this.hasValue()) {
            this.element.classList.remove("empty");
            this.list.classList.remove("empty");
        } else {
            this.element.classList.add("empty");
            this.list.classList.add("empty");
        }

        if (this.hasChanges()) {
            this.statusElement.classList.add("change");
        } else {
            this.statusElement.classList.remove("change");
        }

        this.elements.forEach((element, schema) => {
            if (!Array.isArray(schema.state)) {
                return;
            }

            const { currentState: prevState } = schema;

            const result = StateHandler.call(this, schema, schema.state);

            if (prevState === schema.currentState) {
                return;
            }

            let content = null;
            if (result) {
                content = ContentHandler.call(this, result.content, null);
            } else {
                content = ContentHandler.call(this, schema.content, null);
            }

            removeChildren(element).append(content);
        });

        removeChildren(this.statusElement);
        if (this.hasError) {
            this.element.classList.add("error");
            this.list.classList.add("error");
            this.statusElement.classList.add("error");
            this.statusElement.appendChild(createNotificationMessage(NotificationType.ERROR, this.errors));
        } else {
            this.element.classList.remove("error");
            this.list.classList.remove("error");
            this.statusElement.classList.remove("error");
        }
    },
    render() {
        const fragment = createDocFragment();

        const { list, style, action = {} } = this.schema;

        if (!isHTMLElement(this.element)) {
            this.element = createDiv({
                id: this.id,
                class: ["field", "field--list"],
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

        if (!isHTMLElement(this.notification)) {
            this.notification = createDiv({
                class: ["field-notification"],
                dataset: {
                    nature: "field-component",
                    view: "list",
                    id: this.id,
                }
            });
            fragment.appendChild(this.notification);
        }

        if (!isHTMLElement(this.statusElement)) {
            this.statusElement = createI({
                class: ["field-status"],
                dataset: {
                    nature: "field-component",
                    view: "list",
                    id: this.id,
                }
            });
            this.notification.appendChild(this.statusElement);
        }

        if (!isHTMLElement(this.list)) {
            const { style } = list;

            this.list = createUnorderedList({
                class: ["bare-list", "field--list__list"],
                dataset: {
                    nature: "field-component",
                    view: "list",
                    id: this.id
                }
            });

            if (!this.source.hasValue()) {
                this.list.classList.add("empty");
            }

            list.currentState = null;
            this.elements.set(list, this.list);

            StyleHandler.call(this.projection, this.list, style);

            fragment.appendChild(this.list);

        }

        let addSchema = valOrDefault(action.add, actionDefaultSchema.add);
        if (addSchema) {
            const { content, help, style } = addSchema;

            let addElement = createButton({
                class: ["field-action", "field--list__add"],
                tabindex: 0,
                title: help,
                dataset: {
                    nature: "field-component",
                    view: "list",
                    component: "action",
                    id: this.id,
                    action: "add",
                }
            });

            content.forEach(element => {
                let content = ContentHandler.call(this, element, null, { focusable: false });

                addElement.append(content);
            });

            addSchema.currentState = null;
            this.elements.set(addSchema, addElement);

            StyleHandler.call(this.projection, addElement, style);

            fragment.appendChild(addElement);
        }

        this.source.getValue().forEach((value) => {
            var item = this.createItem(value);
            this.list.appendChild(item);
        });

        StyleHandler.call(this.projection, this.element, style);

        if (fragment.hasChildNodes()) {
            this.element.appendChild(fragment);
            this.bindEvents();
        }

        this.refresh();

        return this.element;
    },

    /**
     * Handles the `ctrl+space` command
     * @param {HTMLElement} target 
     */
    _spaceHandler(target) {
        createMessageElement.call(this);

        removeChildren(this.messageElement);
        this.messageElement.appendChild(createNotificationMessage(NotificationType.INFO, "Enter any text."));

        show(this.messageElement);
    },

    /**
     * Handles the `space` command
     * @param {HTMLElement} target 
     */
    spaceHandler(target) {
        if (!isValid.call(this, target) || target.parentElement !== this.list) {
            return false;
        }

        this.createElement();

        return true;
    },
    /**
     * Handles the `space` command
     * @param {HTMLElement} target 
     */
    deleteHandler(target) {
        if (!isValid.call(this, target) || target.parentElement !== this.list) {
            return false;
        }

        this.selection = target;
        this.delete(target);

        return true;
    },
    /**
     * Handles the `escape` command
     * @param {HTMLElement} target 
     */
    escapeHandler(target) {
        let exit = true;

        if (this.messageElement && !isHidden(this.messageElement)) {
            hide(this.messageElement);

            exit = false;
        }

        if (exit) {
            let parent = findAncestor(target, (el) => el.tabIndex === 0);
            let element = this.environment.resolveElement(parent);

            element.focus(parent);

            return true;
        }

        this.focus();

        return false;
    },
    /**
     * Handles the `enter` command
     * @param {HTMLElement} target 
     */
    enterHandler(target) {
        const getComponent = (element) => {
            if (isValid.call(this, element)) {
                return element;
            }

            return findAncestor(element, (el) => isValid.call(this, el), 5);
        };

        const component = getComponent(target);

        if (isNullOrUndefined(component)) {
            return false;
        }

        const { action, index, component: name } = component.dataset;

        if (name === "list-item") {
            let element = component.firstElementChild;
            while (element && element.dataset.id === this.id) {
                element = element.nextElementSibling;
            }

            let projectionElement = this.environment.resolveElement(element);
            if (projectionElement) {
                projectionElement.focus();
            }

            return true;
        } else if (action === "add") {
            this.createElement();

            return true;
        } else if (action === "remove") {
            this.delete(component.parentElement);

            return true;
        }

        return false;
    },
    /**
     * Handles the `backspace` command
     * @param {HTMLElement} target 
     */
    backspaceHandler(target) {
        return false;
    },
    /**
     * Handles the `click` command
     * @param {HTMLElement} target 
     */
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
            this.createElement();
        } else if (action === "remove") {
            this.delete(component.parentElement);
        }
    },
    /**
     * Handles the `arrow` command
     * @param {HTMLElement} target 
     */
    arrowHandler(dir, target) {
        if (!isHTMLElement(target)) {
            return false;
        }

        const { parentElement } = target;

        const exit = () => {
            if (this.parent) {
                return this.parent.arrowHandler(dir, this.element);
            }

            return false;
        };

        // gets the parent list item if target is a children
        let item = getItem.call(this, target);

        if (item) {
            let closestItem = getClosest(item, dir, this.list);

            if (!isHTMLElement(closestItem)) {
                return this.arrowHandler(dir, this.list);
            }

            closestItem.focus();
            this.selection = closestItem;

            return true;
        }

        if (parentElement !== this.element) {
            return exit();
        }

        let closestItem = getClosest(target, dir, this.element);

        if (!isHTMLElement(closestItem)) {
            return exit();
        }

        if (closestItem === this.list && this.list.hasChildNodes()) {
            if (dir === "up") {
                closestItem = getBottomElement(this.list);
            } else if (dir === "down") {
                closestItem = getTopElement(this.list);
            } else if (dir === "left") {
                closestItem = getRightElement(this.list);
            } else if (dir === "right") {
                closestItem = getLeftElement(this.list);
            }
        }

        closestItem.focus();

        return true;
    },

    bindEvents() {
        this.projection.registerHandler("value.added", (value) => {
            this.addItem(value);
        });

        this.projection.registerHandler("value.removed", (value) => {
            this.removeItem(value);
        });
        this.projection.registerHandler("value.changed", (value) => {
            this.clear();

            this.source.getValue().forEach((value) => {
                let item = this.createItem(value);
                this.list.appendChild(item);
            });
        });
    }
};

export const ListField = Object.assign(
    Object.create(Field),
    BaseListField
);

Object.defineProperty(ListField, 'size', { get() { return this.items.size; } });