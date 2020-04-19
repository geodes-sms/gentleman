import {
    createDocFragment, createUnorderedList, createListItem,
    insertBeforeElement, insertAfterElement, removeChildren, isHTMLElement
} from "zenkai";
import { extend, Key } from "@utils/index.js";
import { Projection } from "@projection/index.js";
import { Field } from "./field.js";

export const ListField = extend(Field, {
    init() {
        this.validators = [];

        var validator = function () {
            return true;
        };

        this.validators.push(validator);

        return this;
    },
    object: "SET",

    createInput() {
        this.element = createUnorderedList({
            id: this.id,
            class: ['empty', 'bare-list', 'field', 'field--list'],
            data: {
                type: "set",
                nature: "field",
            }
        }, [valueHandler.call(this, this.concept.getElements())]);
        this.element.contentEditable = false;


        this.bindEvents();

        return this.element;
    },
    bindEvents() {
        var lastKey = -1;

        const isChild = (element) => element.parentElement === this.element && isItem;
        const isItem = (element) => isHTMLElement(element) && element.classList.contains('field--list-item');
        const concept = this.concept;

        this.element.addEventListener('click', function () {
        });

        this.element.addEventListener('keydown', (e) => {
            var activeElement = document.activeElement;
            switch (e.key) {
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
                    e.preventDefault();
                    break;
                case Key.delete:
                    if (this.concept.canDelete() && activeElement.classList.contains('field--list-item')) {
                        activeElement.classList.add('delete');
                    } else {
                        this.editor.notify("This element cannot be deleted");
                    }
            }

            lastKey = e.key;
        }, false);

        this.element.addEventListener('keyup', function (e) {
            var activeElement = document.activeElement;
            switch (e.key) {
                case Key.backspace:
                    break;
                case Key.ctrl:
                    e.preventDefault();
                    break;
                case Key.spacebar:
                    if (lastKey === Key.spacebar && isChild(activeElement)) {
                        if (concept.addElement()) {
                            let instance = concept.getLastElement();
                            var container = createListItem({ class: "field--list-item", draggable: true }, [instance.render()]);
                            container.tabIndex = 0;
                            insertAfterElement(activeElement, container);
                            container.focus();
                            e.preventDefault();
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

function valueHandler(value) {
    var fragment = createDocFragment();
    var concept = this.concept;

    if (Array.isArray(value)) {
        value.forEach(val => {
            var container = null;

            container = createListItem({ class: "field--list-item" });
            container.tabIndex = 0;
            container.appendChild(val.render());
            fragment.appendChild(container);
        });
    }

    if (concept.canAddValue) {
        let { projection: projectionConfig, constaint } = concept.getAddAction();
        let container = createListItem({ class: "field--list__add" });

        if (projectionConfig) {
            let projection = Projection.create(projectionConfig, this.concept, this.concept.editor);
            container.appendChild(projection.render());
        }

        container.addEventListener('click', function () {
            if (concept.addElement()) {
                let instance = concept.getLastElement();
                var container = createListItem({ class: "field--list-item", draggable: true }, [instance.render()]);
                container.tabIndex = 0;
                insertBeforeElement(this, container);
            }
        });

        fragment.appendChild(container);
    }

    return fragment;
}