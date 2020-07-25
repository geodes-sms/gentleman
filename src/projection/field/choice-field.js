import {
    createDocFragment, createSpan, createDiv, createI, createUnorderedList,
    createListItem, appendChildren, findAncestor, isHTMLElement, removeChildren,
    isNullOrUndefined, isNullOrWhitespace, isDerivedOf, isEmpty, valOrDefault, createInput,
} from "zenkai";
import { hide, show } from "@utils/index.js";
import { Concept } from "@concept/index.js";
import { Field } from "./field.js";
import { StyleHandler } from "./../style-handler.js";
import { ProjectionManager } from "./../projection.js";


function createMessageElement() {
    if (!isHTMLElement(this.messageElement)) {
        this.messageElement = createI({
            class: ["field-message", "hidden"],
            dataset: {
                nature: "field-component",
                view: "choice",
                id: this.id,
            }
        });
        this.notification.appendChild(this.messageElement);
    }

    return this.messageElement;
}

function createChoice(choice) {
    var container = createListItem({
        class: ["field--choice__choice"],
        tabindex: 0,
        dataset: {
            nature: "field-component",
            view: "choice",
            id: this.id,
            value: resolveChoiceValue(choice)
        }
    });

    const { before, style, projection, after } = valOrDefault(this.schema.choice, {});

    if (before) {
        let projection = ProjectionManager.createProjection(before.projection, this.source, this.editor).init();
        container.appendChild(projection.render());
    }

    const defSchema = choice.schema.projection.filter(p => p.tags && p.tags.includes("choice"));
    const projectionSchema = valOrDefault(projection, defSchema);
    var choiceProjection = ProjectionManager.createProjection(projectionSchema, this.source, this.editor).init();
    container.appendChild(choiceProjection.render());

    if (after) {
        let projection = ProjectionManager.createProjection(after.projection, this.source, this.editor).init();
        container.appendChild(projection.render());
    }

    this.items.set(choice.name, container);

    return container;
}

function resolveChoiceValue(choice) {
    if (choice.type === "concept") {
        return choice.name;
    } else if (choice.type === "concept-metamodel") {
        return choice.value;
    } else if (choice.type === "concept-model") {
        return choice.name;
    } else if (choice.type === "value") {
        return choice.value;
    }

    return choice;
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

function resolveValue(object) {
    if (isDerivedOf(object, Concept)) {
        if (object.hasValue()) {
            return object.getValue();
        }

        return "";
    }

    return object;
}

/**
 * Get the choice element
 * @param {HTMLElement} element 
 * @this {BaseChoiceField}
 */
function getItem(element) {
    return element.parentElement === this.choices ? element : findAncestor(element, (el) => el.parentElement === this.choices, 5);
}

/**
 * Get the choice element value
 * @param {HTMLElement} element
 * @returns {string} 
 */
function getItemValue(item) {
    return item.dataset.value;
}


const BaseChoiceField = {
    /** @type {string} */
    value: null,
    /** @type {HTMLElement} */
    choices: null,
    /** @type {HTMLElement} */
    input: null,
    /** @type {Map} */
    items: null,
    selection: null,
    /** @type {string} */
    kind: "choice",

    init() {
        this.source.register(this);
        this.items = new Map();

        return this;
    },

    update(message, value) {
        switch (message) {
            case "value.changed":
                if (value.object === "concept") {
                    let projection = ProjectionManager.createProjection(value.schema.projection, value, this.editor).init();
                    this.setChoice(value.name);
                    hide(this.choices);
                    hide(this.input);
                    this.element.appendChild(projection.render());
                }
                break;
            default:
                console.warn(`The message '${message}' was not handled for choice field`);
                break;
        }
    },
    /**
     * Verifies that the field has a changes
     * @returns {boolean}
     */
    hasChanges() {
        return this.value !== this.selected;
    },
    /**
     * Verifies that the field has a value
     * @returns {boolean}
     */
    hasValue() {
        return !isNullOrUndefined(this.selection);
    },
    /**
     * Gets the input value
     * @returns {boolean}
     */
    getValue() {
        return this.selection;
    },
    setValue(value) {
        var response = this.source.setValue(value);

        if (!response.success) {
            this.editor.notify(response.message);
            this.errors.push(...response.errors);
        } else {
            this.errors = [];
        }

        this.value = value;

        this.refresh();
    },

    render() {
        const fragment = createDocFragment();

        const { before, input, after } = this.schema;

        if (!isHTMLElement(this.element)) {
            this.element = createDiv({
                id: this.id,
                class: ["field", "field--choice"],
                tabindex: -1,
                dataset: {
                    nature: "field",
                    view: "choice",
                    id: this.id,
                }
            });

            StyleHandler(this.element, this.schema.style);
        }

        if (!isHTMLElement(this.notification)) {
            this.notification = createDiv({
                class: ["field-notification"],
                dataset: {
                    nature: "field-component",
                    view: "choice",
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
                    view: "choice",
                    id: this.id,
                }
            });
            this.notification.appendChild(this.statusElement);
        }

        if (!isHTMLElement(this.input)) {
            this.input = createInput({
                type: "text",
                class: ["field--choice__input"],
                dataset: {
                    nature: "field-component",
                    view: "choice",
                    id: this.id,
                }
            });
            fragment.appendChild(this.input);
        }

        if (before) {
            let projection = ProjectionManager.createProjection(before.projection, this.source, this.editor).init();
            fragment.appendChild(projection.render());
        }

        if (!isHTMLElement(this.choices)) {
            this.choices = createUnorderedList({
                class: ["bare-list", "field--choice__choices"],
                tabindex: -1,
                dataset: {
                    nature: "field-component",
                    view: "choice",
                    id: this.id
                }
            });

            fragment.appendChild(this.choices);
        }

        removeChildren(this.choices);

        this.source.getCandidates().forEach(value => {
            this.choices.appendChild(createChoice.call(this, value));
        });
        if (this.source.hasValue()) {
            let concept = resolveValue(this.source);
            concept.schema.projection = concept.schema.projection.filter(p => p.layout.view === "editor");
            let projection = ProjectionManager.createProjection(concept.schema.projection, concept, this.editor).init();

            this.element.appendChild(projection.render());
        }

        if (after) {
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
    focusIn() {
        this.focused = true;
        this.element.classList.add("active");
    },
    focusOut() {
        console.log("FOCUS OUT");
        if (this.readonly) {
            return;
        }

        if (isNullOrWhitespace(this.input.value)) {
            this.input.value = "";
        }

        if (this.messageElement) {
            hide(this.messageElement);
            removeChildren(this.messageElement);
        }

        if (this.choices) {
            hide(this.choices);
        }

        this.input.blur();
        this.element.classList.remove("active");

        this.focused = false;

        return this;
    },
    enable() {
        this.input.disabled = false;
        this.input.tabIndex = 0;
        this.disabled = false;
    },
    disable() {
        this.input.disabled = true;
        this.input.tabIndex = -1;
        this.disabled = true;
    },
    refresh() {
        // if (this.hasValue()) {
        //     this.input.classList.remove("empty");
        // } else {
        //     this.input.classList.add("empty");
        // }

        if (this.hasChanges()) {
            this.statusElement.classList.add("change");
        } else {
            this.statusElement.classList.remove("change");
        }

        removeChildren(this.statusElement);
        if (this.hasError) {
            console.log(this.errors);
            this.element.classList.add("error");
            this.input.classList.add("error");
            this.statusElement.classList.add("error");
            this.statusElement.appendChild(createNotificationMessage(NotificationType.ERROR, this.errors));
        } else {
            this.element.classList.remove("error");
            this.input.classList.remove("error");
            this.statusElement.classList.remove("error");
        }
    },
    /**
     * Filters the list of choice using a query
     * @param {string} query 
     */
    filterChoice(query) {
        const { children } = this.choices;

        if (isNullOrWhitespace(query)) {
            for (let i = 0; i < children.length; i++) {
                const item = children[i];
                show(item);
            }

            return;
        }

        for (let i = 0; i < children.length; i++) {
            const item = children[i];
            const { value } = item.dataset;

            let parts = query.trim().replace(/\s+/g, " ").split(' ');
            let match = parts.some(q => value.includes(q));

            match ? show(item) : hide(item);
        }

        return true;
    },
    setChoice(value) {
        const { children } = this.choices;

        for (let i = 0; i < children.length; i++) {
            const item = children[i];
            if (getItemValue(item) === value) {
                item.classList.add("selected");
                this.selection = item;
            } else {
                item.classList.remove("selected");
            }
        }

        return;
    },
    /**
     * Assigns the value of the selected item to the input
     * @param {HTMLElement} item 
     */
    selectChoice(item) {
        if (!isHTMLElement(item)) {
            return;
        }

        const value = getItemValue(item);

        let result = this.source.setValue(value);

        hide(this.choices);
        hide(this.input);

        return this;
    },
    /**
     * Handles the `space` command
     * @param {HTMLElement} target 
     */
    spaceHandler(target) {
        const fragment = createDocFragment();

        createMessageElement.call(this);

        this.source.getCandidates().forEach(value => {
            fragment.appendChild(createChoice.call(this, value));
        });

        removeChildren(this.choices).appendChild(fragment);
        this.filterChoice(this.input.value);
        show(this.choices);

        this.messageElement.appendChild(createNotificationMessage(NotificationType.INFO, "Select an element from the list."));
        show(this.messageElement);
    },
    /**
     * Handles the `escape` command
     * @param {HTMLElement} target 
     */
    escapeHandler(target) {
        this.input.focus();

        if (this.messageElement) {
            hide(this.messageElement);
        }
    },
    /**
     * Handles the `enter` command
     * @param {HTMLElement} target 
     */
    enterHandler(target) {
        const item = getItem.call(this, target);

        if (item) {
            this.selectChoice(item);
        }
    },
    /**
     * Handles the `backspace` command
     * @param {HTMLElement} target 
     */
    backspaceHandler(target) {
        const item = getItem.call(this, target);

        if (item) {
            this.input.focus();
        }
    },

    bindEvents() {
        this.choices.addEventListener('click', (event) => {
            const target = event.target;

            const item = getItem.call(this, target);

            if (isHTMLElement(item)) {
                this.selectChoice(item);
            }
        });

        this.element.addEventListener('input', (event) => {
            this.filterChoice(this.input.value);
        });
    },
};


export const ChoiceField = Object.assign(
    Object.create(Field),
    BaseChoiceField
);