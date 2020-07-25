import {
    createDocFragment, createSpan, createDiv, createI, createUnorderedList,
    createListItem, findAncestor, isHTMLElement, removeChildren, isNullOrUndefined,
    isDerivedOf, isEmpty, valOrDefault, createButton, hasOwn,
} from "zenkai";
import { hide, show, shake } from "@utils/index.js";
import { Concept } from "@concept/index.js";
import { Field } from "./field.js";
import { StyleHandler } from "./../style-handler.js";
import { ProjectionManager } from "./../projection.js";


const actionDefaultSchema = {
    add: {
        projection: [{
            layout: {
                "type": "wrap",
                "disposition": ["Add an element"]
            }
        }]
    },
    remove: {
        projection: [{
            layout: {
                "type": "wrap",
                "disposition": ["Remove"]
            }
        }]
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
    const { before, style, projection, after } = valOrDefault(this.schema.item, {});

    const actionSchema = Object.assign({}, actionDefaultSchema, valOrDefault(this.schema.action, {}));

    const container = createListItem({
        class: ["field--list-item"],
        tabindex: 0,
        dataset: {
            nature: "field-component",
            view: "list",
            id: this.id,
            value: object.id,
            name: object.name,
            index: valOrDefault(object.index, this.items.size)
        }
    });

    const { projection: removeProjectionSchema } = actionSchema.remove;

    var btnRemoveProjection = ProjectionManager.createProjection(removeProjectionSchema, object, this.editor).init();

    var btnRemove = createButton({
        class: ["btn", "btn-remove"],
        dataset: {
            nature: "field-component",
            view: "list",
            id: this.id,
            action: "remove",
            index: container.dataset.index
        }
    }, btnRemoveProjection.render());

    container.appendChild(btnRemove);

    if (before && assertCondition.call(this, before.condition)) {
        let beforeProjection = ProjectionManager.createProjection(before.projection, object, this.editor).init();
        container.appendChild(beforeProjection.render());
    }

    const projectionSchema = valOrDefault(projection, object.schema.projection);
    var itemProjection = ProjectionManager.createProjection(projectionSchema, object, this.editor).init();
    container.appendChild(itemProjection.render());

    if (after) {
        let projection = ProjectionManager.createProjection(after.projection, object, this.editor).init();
        container.appendChild(projection.render());
    }

    this.items.set(object.id, container);

    StyleHandler(container, style);

    return container;
}

/**
 * Evaluates a condition expression
 * @param {*} object 
 * @returns {boolean}
 * @this {BaseListField}
 */
function assertCondition(cond) {
    if (isNullOrUndefined(cond)) {
        return true;
    }

    var result = true;

    for (const key in cond) {
        const rule = cond[key];
        switch (key) {
            case "index":
                var index = this.items.size;
                if (rule.eq) {
                    result &= index == rule.eq;
                }
                if (rule.ne) {
                    result &= index != rule.ne;
                }
                if (rule.gt) {
                    result &= index > rule.gt;
                }
                if (rule.lt) {
                    result &= index < rule.lt;
                }
                if (rule.ge) {
                    result &= index >= rule.ge;
                }
                if (rule.le) {
                    result &= index <= rule.le;
                }
                break;

            default:
                break;
        }
    }

    return result;
}

const NotificationType = {
    INFO: "info",
    ERROR: "error"
};

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


const BaseListField = {
    /** @type {string} */
    orientation: null,
    /** @type {HTMLElement} */
    list: null,
    /** @type {Map} */
    items: null,
    /** @type {HTMLElement} */
    selection: null,

    init() {
        this.source.register(this);
        this.orientation = valOrDefault(this.schema.orientation, "horizontal");
        this.items = new Map();

        return this;
    },

    update(message, value) {
        switch (message) {
            case "value.added":
                this.addItem(value);

                break;
            case "value.removed":
                this.removeItem(value);

                break;
            case "delete":
                this.source.unregister(this);
                removeChildren(this.element);
                this.element.remove();

                break;
            default:
                console.warn(`The message '${message}' was not handled for list field`);
                break;
        }

        this.refresh();
    },

    render() {
        const fragment = createDocFragment();

        const { before = {}, list = {}, after = {} } = this.schema;

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

        if (before.projection) {
            let projection = ProjectionManager.createProjection(before.projection, this.source, this.editor).init();
            fragment.appendChild(projection.render());
        }

        if (!isHTMLElement(this.list)) {
            this.list = createUnorderedList({
                class: ["bare-list", "field--list__list", this.orientation],
                dataset: {
                    nature: "field-component",
                    view: "list",
                    id: this.id,
                    orientation: this.orientation
                }
            });

            if (!this.source.hasValue()) {
                this.list.classList.add("empty");
            }

            StyleHandler(this.list, list.style);

            fragment.appendChild(this.list);
        }

        this.source.getValue().forEach((value) => {
            var item = createListFieldItem.call(this, value);
            this.list.appendChild(item);
        });

        const actionSchema = Object.assign({}, actionDefaultSchema, valOrDefault(this.schema.action, {}));

        var { projection: projectionSchema, position = "last" } = actionSchema.add;

        var addProjection = ProjectionManager.createProjection(projectionSchema, this.source, this.editor).init();

        const createAdd = ["first", "last"].includes(position) ? createListItem : createDiv;

        var addElement = createAdd({
            class: ["field--list__add"],
            tabindex: 0,
            dataset: {
                nature: "field-component",
                view: "list",
                id: this.id,
                action: "add",
            }
        }, [addProjection.render()]);

        switch (position) {
            case "before":
                this.list.before(addElement);
                break;
            case "first":
                this.list.prepend(addElement);
                break;
            case "last":
                this.list.appendChild(addElement);

                break;
            case "after":
                this.list.after(addElement);
                break;
            default:
                console.warn(`This position ${position} is not valid. "last" used instead`);
                this.list.appendChild(addElement);
                break;
        }

        if (after.projection) {
            let projection = ProjectionManager.createProjection(after.projection, this.source, this.editor).init();
            fragment.appendChild(projection.render());
        }

        if (fragment.hasChildNodes()) {
            this.element.appendChild(fragment);
        }

        this.bindEvents();
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
     * Gets the input value
     * @returns {*[]}
     */
    getValue() {
        return this.list.children;
    },
    /**
     * Verifies that the field has a value
     * @returns {boolean}
     */
    hasValue() {
        return this.items.size > 0;
    },
    clear() {
        this.items.clear();
        removeChildren(this.element);
    },
    focusIn(target) {
        this.focused = true;
        this.element.classList.add("active");
    },
    focusOut(target) {
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
            this.list.classList.remove("empty");
        } else {
            this.list.classList.add("empty");
        }

        if (this.hasChanges()) {
            this.statusElement.classList.add("change");
        } else {
            this.statusElement.classList.remove("change");
        }

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
        var item = createListFieldItem.call(this, value);

        if (this.selection) {
            console.log(item);
            this.selection.before(item);
        } else {
            this.list.appendChild(item);
        }
    },
    removeItem(value) {
        let item = this.getItem(value.id);
        if (!isHTMLElement(item)) {
            throw new Error("List error: Item not found");
        }

        this.items.delete(value.id);
        removeChildren(item);
        item.remove();
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
    /**
     * Handles the `space` command
     * @param {HTMLElement} target 
     */
    spaceHandler(target) {
        createMessageElement.call(this);

        removeChildren(this.messageElement);
        this.messageElement.appendChild(createNotificationMessage(NotificationType.INFO, "Enter any text."));

        show(this.messageElement);
    },
    /**
     * Handles the `escape` command
     * @param {HTMLElement} target 
     */
    escapeHandler(target) {
        if (this.messageElement) {
            hide(this.messageElement);
        }
    },
    /**
     * Handles the `enter` command
     * @param {HTMLElement} target 
     */
    enterHandler(target) {
    },
    /**
     * Handles the `backspace` command
     * @param {HTMLElement} target 
     */
    backspaceHandler(target) {
    },
    delete(target) {
        if (target === this.element) {
            this.source.remove();

            return;
        }

        const { index } = target.dataset;

        var result = this.source.removeElementAt(+index);

        if (result) {
            this.editor.notify("The element was successfully deleted");
        } else {
            this.editor.notify("This element cannot be deleted");
            shake(target);
        }
    },
    bindEvents() {
        const isValid = (element) => element.dataset.id === this.id && ["add", "remove"].includes(element.dataset.action);

        const getItem = (element) => isValid(element) ? element : findAncestor(element, (el) => isValid(el), 5);

        this.list.addEventListener('click', (event) => {
            const item = getItem(event.target);

            if (item) {
                const { action, index, name } = item.dataset;

                if (action === "add") {
                    this.selection = item;
                    this.createElement();
                } else if (action === "remove") {
                    this.selection = item.parentElement;
                    this.delete(item.parentElement);
                }
            }

        });
    }
};


export const ListField = Object.assign(
    Object.create(Field),
    BaseListField
);