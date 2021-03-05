import {
    createDocFragment, createSpan, createDiv, createI, createUnorderedList,
    createListItem, createButton, findAncestor, removeChildren, isHTMLElement,
    isNullOrUndefined, valOrDefault, hasOwn,
} from "zenkai";
import {
    hide, show, shake, NotificationType,
    getElementTop, getElementBottom, getElementLeft, getElementRight, getTopElement
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
                "content": "Add"
            }
        }
    },
    remove: {
        content: {
            "type": "static",
            "static": {
                "type": "text",
                "content": "Remove"
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
 * Creates a list field item
 * @param {*} object 
 * @returns {HTMLElement}
 * @this {BaseListField}
 */
function createListFieldItem(object) {
    const { action = {} } = this.schema;

    const listSchema = this.content.find(c => c.type === "list");
    const { template, style } = listSchema.list.item;

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

    var { content: removeLayout, style: removeStyle } = valOrDefault(action.remove, actionDefaultSchema.remove);

    var btnRemoveProjection = ContentHandler.call(this, removeLayout);

    var btnRemove = createButton({
        class: ["btn", "field-action", "btn-remove"],
        tabindex: -1,
        title: "Remove",
        dataset: {
            nature: "field-component",
            view: "list",
            component: "action",
            id: this.id,
            action: "remove",
            index: container.dataset.index
        }
    }, btnRemoveProjection);

    StyleHandler(btnRemove, removeStyle);

    container.appendChild(btnRemove);

    var itemProjection = this.model.createProjection(object, template.tag);
    itemProjection.parent = this.projection;

    container.appendChild(itemProjection.init().render());

    this.items.set(object.id, container);

    StyleHandler(container, style);

    return container;
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
        const { content = [], focusable = true } = this.schema;

        this.items = new Map();
        this.elements = new Map();
        this.focusable = focusable;
        this.content = content;

        return this;
    },

    render() {
        const fragment = createDocFragment();

        const { content, style, action = {} } = this.schema;

        if (!Array.isArray(content)) {
            throw new Error("Empty content for listfield");
        }

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

            StyleHandler(this.element, this.schema.style);
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

        content.forEach(element => {
            if (element.type === "list") {
                let schema = valOrDefault(element.list, {});

                const { style } = schema;

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

                schema.currentState = null;
                this.elements.set(schema, this.list);

                StyleHandler(this.list, style);

                fragment.appendChild(this.list);
            } else if (element.type === "action") {
                let schema = valOrDefault(element, actionDefaultSchema.add);

                const { content, style } = schema;

                let addProjection = ContentHandler.call(this, content, null);

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
                }, [addProjection]);

                schema.currentState = null;
                this.elements.set(schema, addElement);

                StyleHandler(addElement, style);

                fragment.appendChild(addElement);
            } else {
                let content = ContentHandler.call(this, element);

                this.elements.set(element, content);

                fragment.appendChild(content);
            }
        });

        this.source.getValue().forEach((value) => {
            var item = createListFieldItem.call(this, value);
            this.list.appendChild(item);
        });

        StyleHandler(this.element, style);

        if (fragment.hasChildNodes()) {
            this.element.appendChild(fragment);
            this.bindEvents();
        }

        this.refresh();

        return this.element;
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
            var item = createListFieldItem.call(this, val);
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
    createElement() {
        return this.source.createElement();
    },
    getItem(id) {
        return this.items.get(id);
    },
    addItem(value) {
        const item = createListFieldItem.call(this, value);

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

        if(this.selection == item) {
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
            }else{
                this.focus();
            }
        } else {
            this.environment.notify(`This element cannot be deleted: ${result.message}`);
            shake(target);
        }
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
        if (this.messageElement) {
            hide(this.messageElement);

            return true;
        }

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
            this.selection = component;
            this.createElement();

            return true;
        } else if (action === "remove") {
            this.selection = component.parentElement;
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
            this.selection = component;
            this.createElement();
        } else if (action === "remove") {
            this.selection = component.parentElement;
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

        if (target.parentElement === this.list) {
            let closestItem = null;

            if (dir === "up") {
                closestItem = getElementTop(target, this.list);
            } else if (dir === "down") {
                closestItem = getElementBottom(target, this.list);
            } else if (dir === "left") {
                closestItem = getElementLeft(target, this.list);
            } else if (dir === "right") {
                closestItem = getElementRight(target, this.list);
            }

            if (isHTMLElement(closestItem)) {
                closestItem.focus();
                this.selection = closestItem;

                return true;
            }

            return this.arrowHandler(dir, target.parentElement);
        } else if (target.parentElement === this.element) {
            let closestItem = null;

            if (dir === "up") {
                closestItem = getElementTop(target, this.element);
            } else if (dir === "down") {
                closestItem = getElementBottom(target, this.element);
            } else if (dir === "left") {
                closestItem = getElementLeft(target, this.element);
            } else if (dir === "right") {
                closestItem = getElementRight(target, this.element);
            }

            if (isHTMLElement(closestItem)) {
                if (closestItem === this.list) {
                    if (this.list.hasChildNodes()) {
                        closestItem.children[0].focus();
                    } else {
                        return this.arrowHandler(dir, this.list);
                    }
                } else {
                    closestItem.focus();
                }

                return true;
            }
        }

        if (this.parent) {
            return this.parent.arrowHandler(dir, this.element);
        }

        return false;
    },

    bindEvents() {

    }
};

export const ListField = Object.assign(
    Object.create(Field),
    BaseListField
);

Object.defineProperty(ListField, 'size', { get() { return this.items.size; } });