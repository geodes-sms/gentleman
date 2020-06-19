import {
    createDocFragment, createUnorderedList, createListItem,
    insertBeforeElement, insertAfterElement, removeChildren, isHTMLElement,
    valOrDefault
} from "zenkai";
import { extend, Key } from "@utils/index.js";
import { Projection } from "@projection/index.js";
import { Field } from "./field.js";


function createInputField() {
    var element = createUnorderedList({
        id: this.id,
        class: ["bare-list", "field", "field--list", this.orientation, "empty"],
        tabindex: -1,
        dataset: {
            nature: "field",
            view: "list",
            id: this.id
        }
    });

    if (this.concept.hasValue()) {
        element.classList.remove("empty");
    }

    return element;
}


export const ListField = extend(Field, {
    init() {
        this.orientation = valOrDefault(this.schema.orientation, "horizontal");
        this.concept.register(this);

        return this;
    },

    orientation: null,
    update(message, value) {
        switch (message) {
            case "value.added":
                var projection = Projection.create(valOrDefault(value.protoSchema, value.schema.projection), value, this.editor);
                var container = createListItem({
                    class: "field--list-item",
                    tabindex: 0,
                    dataset: {
                        nature: "field-component",
                        id: this.id
                    }
                }, [projection.render()]);

                this.element.lastChild.before(container);

                break;
            default:
                console.warn(`List Field not updated for operation '${message}'`);
                break;
        }
        // this.updateUI();
    },

    render() {
        if (!isHTMLElement((this.element))) {
            this.element = createInputField.call(this);
        }

        removeChildren(this.element);

        var fragment = createDocFragment();

        this.concept.getElements().forEach(value => {
            var projection = Projection.create(value.schema.projection, value, this.editor);
            var container = createListItem({
                class: "field--list-item",
                tabindex: 0,
                dataset: {
                    nature: "field-component",
                    id: this.id
                }
            }, [projection.render()]);

            fragment.appendChild(container);
        });

        var actionContainer = actionHandler.call(this);

        fragment.appendChild(actionContainer);

        this.element.appendChild(fragment);

        this.bindEvents();

        return this.element;
    },
    focusIn() {
        this.hasFocus = true;
    },
    focusOut() {
        console.log("focusing out of list field...");
        this.hasFocus = false;
    },
    createElement() {
        return this.concept.createElement();
    },
    bindEvents() {
        var lastKey = -1;

        const isChild = (element) => element.parentElement === this.element && isItem;
        const isItem = (element) => isHTMLElement(element) && element.classList.contains('field--list-item');
        const concept = this.concept;

        this.element.addEventListener('keydown', (event) => {
            var activeElement = document.activeElement;

            switch (event.key) {
                case Key.backspace:
                    break;
                case Key.left_arrow:
                    if (isChild(activeElement)) {
                        let previousElement = activeElement.previousElementSibling;
                        if (isItem(previousElement)) {
                            previousElement.focus();
                        }
                    }
                    break;
                case Key.right_arrow:
                    if (isChild(activeElement)) {
                        let nextElement = activeElement.nextElementSibling;
                        if (isItem(nextElement)) {
                            nextElement.focus();
                        }
                    }
                    break;
                case Key.ctrl:
                    event.preventDefault();
                    break;
                case Key.delete:
                    if (this.concept.canDelete() && activeElement.classList.contains('field--list-item')) {
                        activeElement.classList.add('delete');
                    } else {
                        this.editor.notify("This element cannot be deleted");
                    }
            }

            lastKey = event.key;
        }, false);

        this.element.addEventListener('keyup', (event) => {
            var activeElement = document.activeElement;

            switch (event.key) {
                case Key.backspace:
                    break;
                case Key.ctrl:
                    event.preventDefault();
                    break;
                case Key.spacebar:
                    if (lastKey === Key.spacebar && isChild(activeElement)) {
                        if (concept.addElement()) {
                            let instance = concept.getLastElement();
                            var container = createListItem({ class: "field--list-item", draggable: true }, [instance.render()]);
                            container.tabIndex = 0;
                            insertAfterElement(activeElement, container);
                            container.focus();
                            event.preventDefault();
                        }
                    }

                    break;
                case Key.delete:
                    if (lastKey === Key.delete && isChild(activeElement) && activeElement.classList.contains('delete')) {
                        if (concept.removeElementAt(Array.from(this.children).indexOf(activeElement))) {
                            removeChildren(activeElement);
                            let nextElement = activeElement.nextElementSibling;
                            let previousElement = activeElement.previousElementSibling;
                            if (isChild(nextElement)) {
                                nextElement.focus();
                            }
                            else if (isChild(previousElement)) {
                                previousElement.focus();
                            }
                            activeElement.remove();
                        }
                    }

                    break;
            }
        }, false);
    }
});

const actionDefaultSchema = {
    add: {
        projection: [{
            layout: {
                "type": "wrap",
                "disposition": ["Add an element"]
            }
        }]
    }
};

function actionHandler() {
    const { concept, editor, schema } = this;

    const action = valOrDefault(schema.action, actionDefaultSchema);

    var { projection: projectionSchema, constraint } = action.add;

    var projection = Projection.create(projectionSchema, concept, editor);

    var addContainer = createListItem({
        class: "field--list__add",
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