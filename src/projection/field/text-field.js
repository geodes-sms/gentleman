import {
    createSpan, createParagraph, createDiv, createUnorderedList, createListItem,
    createButton, appendChildren, removeChildren, isHTMLElement,
    isNullOrUndefined, isNullOrWhitespace, capitalizeFirstLetter,
} from "zenkai";
import { extend, hide, Key } from "@utils/index.js";
import { Field } from "./field.js";


function createInputField() {
    var input = createSpan({
        class: ["field", "field--textbox", "empty"],
        tabindex: 0,
        editable: true,
        dataset: {
            nature: "field",
            view: "text",
            id: this.id,
            placeholder: this.placeholder
        }
    });

    if (this.concept.hasValue()) {
        input.textContent = this.concept.getValue();
        input.classList.remove("empty");
    }

    return input;
}

export const TextField = extend(Field, {
    /** @type {string} */
    placeholder: null,
    /** @type {HTMLElement} */
    input: null,
    /** @type {string} */
    value: null,    

    init() {
        this.placeholder = this.resolvePlaceholder();
        this.concept.register(this);

        return this;
    },
    /**
     * Resolves the value of the placeholder
     * @returns {string}
     */
    resolvePlaceholder() {
        if (this.schema.placeholder) {
            return this.schema.placeholder;
        }

        if (this.concept) {
            return this.concept.getAlias();
        }

        return "Enter data";
    },
    update(type, value) {
        switch (type) {
            case "value.changed":
                this.input.textContent = value;
                break;
            default:
                console.warn(`The operation '${type}' was not handled`);
                break;
        }
        this.updateUI();
    },

    render() {
        if (!isHTMLElement(this.input)) {
            this.input = createInputField.call(this);
            this.element = this.input;
            this.element.id = this.id;
        }

        this.bindEvents();

        return this.element;
    },

    focusIn() {
        this.value = this.input.textContent;
        this.hasFocus = true;
    },
    focusOut() {
        var response = this.concept.update(this.input.textContent);

        if (!response.success) {
            this.editor.notify(response.message);
            this.errors.push(...response.errors);

            let note = actionNote.call(this, this.element, () => {
                this.input.textContent = this.value;
                this.updateUI();
                this.focusOut();
            });
            this.append(note);

        } else {
            this.value = this.input.textContent;

            this.extras.forEach(element => {
                hide(element);
                removeChildren(element);
                element.remove();
            });
            this.extras = [];
            this.errors = [];

            this.input.blur();
        }

        this.updateUI();
    },
    setValue(value) {
        if (!this.concept.update(value)) {
            this.editor.notify(`${capitalizeFirstLetter(this.concept.getAlias())} could not be updated`);
        }
        this.input.textContent = value;
        this.updateUI();
    },
    updateUI() {
        if (isNullOrWhitespace(this.input.textContent)) {
            this.input.textContent = "";
            this.input.classList.add("empty");
        } else {
            this.input.classList.remove("empty");
        }

        if (this.errors.length > 0) {
            this.element.classList.add('error');
            this.input.classList.add('error');
        } else {
            this.element.classList.remove('error');
            this.input.classList.remove('error');
        }

        if (this.extras.length === 0) {
            this.input.style.minWidth = null;
        }
    },
    spaceHandler() {
        const { name, values } = this.concept;

        var note = null;

        if (isNullOrUndefined(values)) {
            note = messageNote.call(this, this.element, `Enter any ${name}.`);
        } else if (Array.isArray(values)) {
            note = choiceNote.call(this, this.element, values);
        } else {
            throw new TypeError("Bad values");
        }

        this.append(note);
    },
    escapeHandler() {
        this.extra.forEach(element => {
            hide(element);
            removeChildren(element);
            element.remove();
        });
    },
    bindEvents() {
        var lastKey = -1;

        this.element.addEventListener('keydown', (event) => {
            var activeElement = document.activeElement;

            switch (event.key) {
                case Key.backspace:
                    break;
                case Key.left_arrow:
                    break;
                case Key.right_arrow:
                    break;
                case Key.ctrl:
                    event.preventDefault();
                    break;
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
                    if (lastKey === Key.spacebar) {
                        console.log("Complete element");
                    }

                    break;
                case Key.delete:
                    break;
            }
        }, false);

        this.element.addEventListener('input', function (event) {
            if (this.textContent.length > 0) {
                this.classList.remove("empty");
            } else {
                this.classList.add("empty");
            }
        });
    },
    append(element) {
        if (this.element === this.input) {
            this.element = createDiv({
                class: "field-wrapper",
                id: this.input.id,
                tabindex: -1,
                dataset: {
                    nature: "field",
                    view: "text",
                    id: this.id,
                }
            });
            this.input.removeAttribute('id');
            this.input.dataset.nature = "field-component";

            this.input.after(this.element);
            this.element.appendChild(this.input);
        }

        this.element.appendChild(element);
        this.extras.push(element);
        this.input.style.minWidth = `${element.offsetWidth}px`;
    }
});

/**
 * Show a note next to a target element
 * @param {HTMLElement} target 
 * @param {string} message 
 * @param {number} [limit] 
 */
function messageNote(target, message, limit) {
    var noteContainer = createDiv({ class: "note-container" });
    var noteContent = createParagraph({ class: "note-content" }, message);
    noteContainer.appendChild(noteContent);

    Object.assign(noteContainer.style, {
        top: `${target.offsetTop + target.offsetHeight}px`
    });

    if (limit) {
        setTimeout(() => {
            removeChildren(noteContainer);
            noteContainer.remove();
        }, limit);
    }

    return noteContainer;
}

/**
 * Show a note next to a target element to take an action
 * @param {HTMLElement} target 
 * @param {Function} callback 
 */
function actionNote(target, callback) {
    var noteContainer = createDiv({ class: "note-container" });
    var noteContent = createParagraph({ class: "note-content" }, "Undo action?");
    noteContainer.appendChild(noteContent);
    var buttonContainer = createDiv({ class: "note-button-container" });
    var btnYes = createButton({ class: ["btn", "btn-action", "btn-action--yes"] }, "Yes");
    var btnNo = createButton({ class: ["btn", "btn-action", "btn-action--no"] }, "No");
    appendChildren(buttonContainer, [btnNo, btnYes]);
    noteContainer.appendChild(buttonContainer);

    Object.assign(noteContainer.style, {
        top: `${target.offsetTop + target.offsetHeight}px`
    });

    btnNo.addEventListener('click', () => {
        this.value = this.input.textContent;

        this.extra.forEach(element => {
            hide(element);
            removeChildren(element);
            element.remove();
        });
    });

    btnYes.addEventListener('click', (event) => {
        callback.call(this);
    });

    return noteContainer;
}

/**
 * Show a note next to a target element
 * @param {HTMLElement} target 
 * @param {string} message 
 * @param {number} [limit] 
 */
function choiceNote(target, choices) {
    /** @type {HTMLElement} */
    var noteContainer = createDiv({ class: "note-container" });
    var noteContent = createParagraph({ class: "note-content" }, "Select a choice");
    noteContainer.appendChild(noteContent);

    Object.assign(noteContainer.style, {
        top: `${target.offsetTop + target.offsetHeight - 1}px`
    });
    var choicesList = createUnorderedList({ class: ["bare-list", "note-choices"] });
    choices.forEach(choice => {
        var item = createListItem({ class: "note-choices-item", dataset: { value: choice.value } }, choice.value);
        choicesList.appendChild(item);
    });
    noteContainer.appendChild(choicesList);

    noteContainer.addEventListener('click', (event) => {
        /** @type {HTMLElement} */
        const target = event.target;

        if (target.classList.contains("note-choices-item")) {
            this.setValue(target.dataset['value']);
        }
    });

    return noteContainer;
}