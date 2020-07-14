import {
    createDocFragment, createUnorderedList, createListItem,
    removeChildren, isHTMLElement, valOrDefault, isNullOrUndefined
} from "zenkai";
import { Field } from "./field.js";
import { ProjectionManager } from "./../projection.js";
import { StyleHandler } from "./../style-handler.js";
import { shake } from "@utils/index.js";


/**
 * Creates the field main element
 * @returns {HTMLElement}
 * @this {BaseListField}
 */
function createFieldElement() {
    var element = createUnorderedList({
        id: this.id,
        class: ["bare-list", "field", "field--list", this.orientation, "empty"],
        tabindex: -1,
        dataset: {
            nature: "field",
            view: "list",
            id: this.id,
            orientation: this.orientation
        }
    });

    if (this.source.hasValue()) {
        element.classList.remove("empty");
    }

    StyleHandler(element, this.schema.style);

    return element;
}

/**
 * Creates a list field item
 * @param {*} object 
 * @returns {HTMLElement}
 * @this {BaseListField}
 */
function createListFieldItem(object) {
    const { before, style, projection, after } = valOrDefault(this.schema.item, {});

    const container = createListItem({
        class: ["field--list-item"],
        tabindex: 0,
        dataset: {
            nature: "field-component",
            id: this.id,
            index: valOrDefault(object.index, this.items.size)
        }
    });

    if (before && assertCondition.call(this, before.condition)) {
        let beforeProjection = ProjectionManager.createProjection(before.projection, this.source, this.editor).init();
        container.appendChild(beforeProjection.render());
    }

    const projectionSchema = valOrDefault(projection, object.schema.projection);
    var itemProjection = ProjectionManager.createProjection(projectionSchema, object, this.editor).init();
    container.appendChild(itemProjection.render());

    if (after) {
        let projection = ProjectionManager.createProjection(after.projection, this.source, this.editor).init();
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

const BaseListField = {
    orientation: null,
    /** @type {Map} */
    items: null,

    init() {
        this.orientation = valOrDefault(this.schema.orientation, "horizontal");
        this.items = new Map();
        this.source.register(this);

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

                break;
            default:
                console.warn(`List Field not updated for operation '${message}'`);
                break;
        }
        // this.updateUI();
    },

    render() {
        if (!isHTMLElement((this.element))) {
            this.element = createFieldElement.call(this);
        }

        this.clear();

        var fragment = createDocFragment();

        this.source.getValue().forEach((value) => {
            var item = createListFieldItem.call(this, value);
            fragment.appendChild(item);
        });

        var actionContainer = actionHandler.call(this);

        fragment.appendChild(actionContainer);

        this.element.appendChild(fragment);

        this.bindEvents();

        return this.element;
    },
    clear() {
        this.items.clear();
        removeChildren(this.element);
    },
    focusIn() {
        this.hasFocus = true;
    },
    focusOut() {
        this.hasFocus = false;
    },
    createElement() {
        return this.source.createElement();
    },
    getItem(id) {
        return this.items.get(id);
    },
    addItem(value) {
        this.element.lastChild.before(createListFieldItem.call(this, value));
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
    spaceHandler() {
        if (!this.source.addElement()) {
            this.editor.notify("something went wrong");
        }
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

    }
};

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
                "disposition": ["Remove element"]
            }
        }]
    }
};

function actionHandler() {
    const { source: concept, editor, schema } = this;

    const action = valOrDefault(schema.action, actionDefaultSchema);

    var { projection: projectionSchema, constraint } = action.add;

    var projection = ProjectionManager.createProjection(projectionSchema, concept, editor).init();

    var addContainer = createListItem({
        class: ["field--list__add"],
        tabindex: 0,
        dataset: {
            nature: "field-component",
            id: this.id
        }
    }, [projection.render()]);

    addContainer.addEventListener('click', () => {
        var element = this.createElement();
        if (!element) {
            this.editor("Element could not be created");
        }
    });

    return addContainer;
}

export const ListField = Object.assign(
    Object.create(Field),
    BaseListField
);