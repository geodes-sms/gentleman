import { Field } from "./field.js";
import { createUnorderedList, insertBeforeElement, createDocFragment, createListItem, hasClass, removeChildren, isHTMLElement, addClass } from "zenkai";
import { Key } from "@global/enums.js";

export const SetField = Field.create({
    create(concept) {
        var instance = Object.create(this);

        instance.concept = concept;

        return instance;
    },
    init() {
        var self = this;

        var validator = function () {
            return true;
        };

        this.validators.push(validator);
    },
    concept: null,
    object: "SET",
    struct: undefined,
    /** @type {HTMLElement} */
    element: null,

    createInput(editable) {
        this.element = createUnorderedList({
            id: this.id,
            class: ['empty', 'bare-list', 'field', 'field--set'],
            data: {
                type: "set",
                nature: "field",
            }
        }, [valueHandler.call(this, this.concept.value)]);
        this.element.contentEditable = false;

        this.bindEvents();

        return this.element;
    },
    bindEvents() {
        var lastKey = -1;

        const isChild = (element) => element.parentElement === this.element && isItem;
        const isItem = (element) => isHTMLElement(element) && hasClass(element, 'field--set-item');

        this.element.addEventListener('click', function () {
            console.log('click');
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
                    if (this.concept.canDelete() && hasClass(activeElement, 'field--set-item')) {
                        addClass(activeElement, 'delete');
                    } else {
                        console.log("cannot delete");
                    }
            }

            lastKey = event.key;
        }, false);

        this.element.addEventListener('keyup', (e) => {
            var activeElement = document.activeElement;
            switch (e.key) {
                case Key.backspace:
                    break;
                case Key.ctrl:
                    e.preventDefault();
                    break;
                case Key.delete:
                    if (lastKey === Key.delete && isChild(activeElement) && hasClass(activeElement, 'delete')) {
                        if (this.concept.removeElementAt(Array.from(this.element.children).indexOf(activeElement))) {
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
            }
        }, false);
    }
});

function valueHandler(value) {
    var fragment = createDocFragment();
    var concept = this.concept;

    if (Array.isArray(value)) {
        value.forEach(val => {
            let container = createListItem({ class: "field--set-item", draggable: true });
            container.tabIndex = 0;
            container.appendChild(val.render());
            fragment.appendChild(container);
        });
    }

    if (concept.canAddValue) {
        let addAction = concept.getAddAction();
        let container = createListItem({ class: "field--set__add font-ui" }, addAction.text);
        container.addEventListener('click', function () {
            if (concept.addElement()) {
                var container = createListItem({ class: "field--set-item", draggable: true });
                container.tabIndex = 0;
                var instance = concept.createElement();
                container.appendChild(instance.render());
                insertBeforeElement(this, container);
            }

        });
        fragment.appendChild(container);
    }

    return fragment;
}