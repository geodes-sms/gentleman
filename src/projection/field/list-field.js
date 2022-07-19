import { createDocFragment, createDiv, createButton, findAncestor, removeChildren, isHTMLElement, isNullOrUndefined, valOrDefault, hasOwn, } from "zenkai";
import { hide, shake, getClosest, isHidden, getTopElement, getBottomElement, getRightElement, getLeftElement } from "@utils/index.js";
import { StyleHandler } from "./../style-handler.js";
import { ContentHandler } from "./../content-handler.js";
import { StateHandler } from "./../state-handler.js";
import { Field } from "./field.js";


const actionDefaultSchema = {
    add: {
        content: [{
            "type": "static",
            "static": {
                "type": "text",
                "content": "+",
                "focusable": false
            }
        }]
    },
    remove: {
        content: [{
            "type": "static",
            "static": {
                "type": "text",
                "content": "✖",
                "focusable": false
            }
        }]
    }
};

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


    init(args) {
        const { focusable = true } = this.schema;

        this.items = new Map();
        this.elements = new Map();
        this.children = [];
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

        if (this.list) {
            removeChildren(this.list);

            value.forEach((val) => {
                var item = this.createItem(val);
                this.list.append(item);
            });
        }

        this.refresh();
    },

    clear() {
        this.items.clear();
        if (this.list) {
            removeChildren(this.list);
        }
    },

    focus(element) {
        if (this.hasValue() && this.list) {
            this.list.firstElementChild.focus();
        } else {
            let target = getTopElement(this.element, (el) => el !== this.list);
            if (!isHTMLElement(target)) {
                return this;
            } else {
                target.focus();
            }
        }


        return this;
    },
    navigate(dir, from, to) {
        let target = null;

        if (dir === "up") {
            target = getBottomElement(this.element, (item) => item !== this.notification && item.hasChildNodes());
        } else if (dir === "down") {
            target = getTopElement(this.element, (item) => item !== this.notification && item.hasChildNodes());
        } else if (dir === "left") {
            target = getRightElement(this.element, (item) => item !== this.notification && item.hasChildNodes());
        } else if (dir === "right") {
            target = getLeftElement(this.element, (item) => item !== this.notification && item.hasChildNodes());
        }

        if (!isHTMLElement(target)) {
            return false;
        }

        let element = this.environment.resolveElement(target);

        if (isNullOrUndefined(element)) {
            return false;
        }

        element.focus();

        return true;
    },

    /**
     * Element Focus in handler
     * @param {HTMLElement} target 
     */
    focusIn(target) {
        this.focused = true;
        this.element.classList.add("active");

        const { component: name } = target.dataset;
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
    getItem(arg) {
        if (isNullOrUndefined(arg)) {
            return null;
        }

        if (hasOwn(arg, "id")) {
            return this.items.get(arg.id);
        }

        return this.items.get(arg);
    },
    getItemIndex(item) {
        if (!isHTMLElement(item)) {
            return null;
        }

        return item.dataset.index;
    },

    /**
     * Creates a list field item
     * @param {*} object 
     * @returns {HTMLElement}
     */
    createItem(object) {
        const { template = {}, style } = this.schema.list.item;

        if (!this.model.hasProjectionSchema(object, template.tag)) {
            return "";
        }

        let itemProjection = this.model.createProjection(object, template.tag);
        itemProjection.optional = true;
        itemProjection.collapsible = true;
        itemProjection.parent = this.projection;

        let container = itemProjection.init(template.options).render();
        container.dataset.index = object.index;

        itemProjection.element.parent = this;
        itemProjection.registerHandler("view.changed", (container) => {
            StyleHandler.call(this.projection, container, style);
        });

        StyleHandler.call(this.projection, container, style);

        this.items.set(object.id, container);

        return container;
    },
    addItem(value) {
        if (!isHTMLElement(this.list)) {
            return;
        }

        const item = this.createItem(value);

        if (value.index) {
            this.list.children[value.index - 1].after(item);
        } else {
            this.list.append(item);
        }

        this.refresh();
    },
    removeItem(value) {
        if (!this.hasList || isNullOrUndefined(value)) {
            return;
        }

        this.items.delete(value.id);

        this.items.forEach((element, id) => {
            let concept = this.source.getElement(id);
            if (concept) {
                element.dataset.index = concept.index;
            }
        });

        this.refresh();
    },
    moveItem(item, index, update = false) {
        this.list.children[index].before(item);
        item.dataset.index = index;

        if (update) {
            this.source.swapElement(+this.getItemIndex(item), +index);
        }

        return this;
    },
    swapItem(item1, item2, update = false) {
        const index1 = this.getItemIndex(item1);
        const index2 = this.getItemIndex(item2);

        this.moveItem(item2, index1);
        this.moveItem(item1, index2);

        if (update) {
            this.source.swapElement(+index1, +index2);
        }

        return this;
    },
    delete(target) {
        if (target === this.element) {
            this.environment.save(this.source.getParent());
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
            if (this.list) {
                this.list.classList.remove("empty");
            }
        } else {
            this.element.classList.add("empty");
            if (this.list) {
                this.list.classList.add("empty");
            }
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

            let contentSchema = schema.content;

            if (result) {
                contentSchema = result.content;
            }

            let fragment = createDocFragment();
            contentSchema.forEach(element => {
                let content = ContentHandler.call(this, element, null, { focusable: false });

                fragment.append(content);
            });

            removeChildren(element).append(fragment);
        });

        if (this.hasError) {
            this.element.classList.add("error");
        } else {
            this.element.classList.remove("error");
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

        if (list && !isHTMLElement(this.list)) {
            const { style } = list;

            this.list = createDiv({
                class: ["field--list__list"],
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

            fragment.append(this.list);
        }

        let addSchema = valOrDefault(action.add, actionDefaultSchema.add);
        if (addSchema) {
            const { position = "after", content, help, style } = addSchema;

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

            if (position === "before" && this.list) {
                this.list.before(addElement);
            } else {
                fragment.append(addElement);
            }
        }

        if (this.list) {
            this.source.getValue().forEach((value) => {
                var item = this.createItem(value);
                this.list.append(item);
            });
        }

        StyleHandler.call(this.projection, this.element, style);

        if (fragment.hasChildNodes()) {
            this.element.append(fragment);
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
        this.notify(`Add or remove ${this.source.accept.name}`);
    },
    /**
     * Handles the `space` command
     * @param {HTMLElement} target 
     */
    spaceHandler(target) {
        if (!isHTMLElement(target)) {
            return false;
        }

        if (target.parentElement !== this.list) {
            return false;
        }

        this.createElement();

        return true;
    },
    /**
     * Handles the `delete` command
     * @param {HTMLElement} target 
     */
    deleteHandler(target) {
        if (!isValid.call(this, target) || target.parentElement !== this.list) {
            return false;
        }

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
            this.focus();
            return false;
        }

        const { action, index, component: name } = component.dataset;

        if (action === "add") {
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
    _arrowHandler(dir, target) {
        if (!isHTMLElement(target)) {
            return false;
        }

        // gets the parent list item if target is a children
        let item = getItem.call(this, target);

        if (item) {
            let closestItem = getClosest(item, dir, this.list);

            if (!isHTMLElement(closestItem)) {
                return false;
            }

            this.swapItem(item, closestItem, true);
            item.focus();

            return true;
        }

        return false;
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

        if (parentElement === this.list) {
            let closestElement = getClosest(target, dir, this.list);

            if (!isHTMLElement(closestElement)) {
                return this.arrowHandler(dir, this.list);
            }

            let item = this.environment.resolveElement(closestElement);

            item.focus();

            return true;
        }

        if (parentElement !== this.element) {
            return exit();
        }

        let closestItem = getClosest(target, dir, this.element);

        if (!isHTMLElement(closestItem)) {
            return exit();
        }

        if (closestItem === this.notification) {
            return this.arrowHandler(dir, closestItem);
        }

        if (closestItem === this.list) {
            if (!this.list.hasChildNodes()) {
                return exit();
            }

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
            if(this.projection.listen && !isNullOrUndefined(this.environment.activeReceiver)){
                this.environment.activeReceiver.addItem(value, this, this.schema.list.item.template.tag);
            }else{
                this.addItem(value)
            }
        });

        this.projection.registerHandler("value.removed", (value) => {
            if(this.projection.listen && !isNullOrUndefined(this.environment.activeReceiver)){
                this.environment.activeReceiver.removeItem(value);
            }else{
                this.removeItem(value);
            }            
        });

        this.projection.registerHandler("value.changed", (value) => {
            this.clear();

            if (this.list) {
                this.source.getValue().forEach((value) => {
                    let item = this.createItem(value);
                    this.list.append(item);
                });
            }
        });

        this.projection.registerHandler("value.swapped", (values) => {
            const [value1, value2] = values;

            let item1 = this.getItem(value1);
            let item2 = this.getItem(value2);

            let index1 = +this.getItemIndex(item1);
            let index2 = +this.getItemIndex(item2);

            if (index1 !== value1.index) {
                this.swapItem(item1, item2);
            }
        });
    }
};

export const ListField = Object.assign(
    Object.create(Field),
    BaseListField
);

Object.defineProperty(ListField, 'size', { get() { return this.items.size; } });
Object.defineProperty(ListField, 'hasList', { get() { return isHTMLElement(this.list); } });