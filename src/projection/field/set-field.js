import { Field } from "./field.js";
import { createUnorderedList, valOrDefault, addAttributes, hasOwn, hasClass, removeChildren, isHTMLElement, addClass } from "zenkai";
import { Key } from "@global/enums.js";

export const SetField = Field.create({
    init() {
        var self = this;

        var validator = function () {
            return true;
        };

        this.validators.push(validator);
    },
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
        });
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

        this.element.addEventListener('keydown', function (e) {
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
                    if (hasClass(activeElement, 'field--set-item')) {
                        addClass(activeElement, 'delete');
                    }
            }

            lastKey = event.key;
        }, false);

        this.element.addEventListener('keyup', function (e) {
            var activeElement = document.activeElement;
            switch (e.key) {
                case Key.backspace:
                    break;
                case Key.ctrl:
                    e.preventDefault();
                    break;
                case Key.delete:
                    if (lastKey === Key.delete && isChild(activeElement)) {
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
        }, false);


    }
});