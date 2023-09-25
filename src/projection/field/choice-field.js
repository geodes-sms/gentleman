import {
    createDocFragment, createDiv, createI, createInput, createUnorderedList,
    createListItem, findAncestor, isHTMLElement, removeChildren, isNullOrUndefined,
    isNullOrWhitespace, isObject, valOrDefault, hasOwn, isEmpty
} from "zenkai";
import {
    getClosest, NotificationType, getVisibleElement, hide, isHidden, show, shake,
    getTopElement, getBottomElement, getRightElement, getLeftElement
} from "@utils/index.js";
import { StyleHandler } from "./../style-handler.js";
import { ContentHandler, resolveValue } from "./../content-handler.js";
import { Field } from "./field.js";



/**
 * Get the choice element
 * @param {HTMLElement} element 
 * @this {BaseChoiceField}
 * @returns {HTMLElement}
 */
function getItem(element) {
    const isValid = (el) => el.parentElement === this.choices;

    if (isValid(element)) {
        return element;
    }

    return findAncestor(element, isValid, 5);
}

/**
 * Get the option type
 * @param {HTMLElement} element 
 * @this {BaseChoiceField}
 * @returns {string}
 */
function getItemType(item) {
    const { type } = item.dataset;

    return type;
}

/**
 * Get the choice element value
 * @param {HTMLElement} item
 * @returns {string} 
 */
function getItemValue(item) {
    const { type, value } = item.dataset;

    if (type === "concept") {
        return this.values.find(val => val.id === value).id;
    }

    if (type === "meta-concept") {
        return this.values.find(val => val.name === value).name;
    }

    if (type === "value") {
        return value;
    }

    if (type === "placeholder") {
        return null;
    }

    return value;
}

const isSame = (val1, val2) => {
    if (val1.type === "concept") {
        return isSame(val1.id, val2);
    }

    if (val2.type === "concept") {
        return isSame(val1, val2.id);
    }

    if (val1.type === "meta-concept") {
        return isSame(val1.name, val2);
    }

    if (val2.type === "meta-concept") {
        return isSame(val1, val2.name);
    }

    return val1 === val2;
};


const BaseChoiceField = {
    /** @type {string} */
    value: null,
    /** @type {string|boolean} */
    placeholder: null,
    /** @type {boolean} */
    expanded: null,
    /** @type {string} */
    values: null,
    /** @type {HTMLElement} */
    choices: null,
    /** @type {HTMLInputElement} */
    input: null,
    /** @type {Map} */
    items: null,
    /** @type {HTMLElement} */
    selection: null,
    /** @type {HTMLElement} */
    selectList: null,
    /** @type {HTMLElement} */
    selectListValue: null,
    /** @type {HTMLElement} */
    icoToggle: null,


    init(args = {}) {
        Object.assign(this.schema, args);

        const { focusable = true, placeholder = false, expanded = true } = this.schema;

        this.items = new Map();
        this.focusable = focusable;
        this.expanded = expanded;
        this.placeholder = placeholder;
        this.children = [];

        // TODO: Add group support

        if (!hasOwn(this.schema, "choice")) {
            this.schema.choice = {};
        }

        if (!hasOwn(this.schema.choice, "option")) {
            this.schema.choice.option = {};
        }

        return this;
    },

    /**
     * Verifies that the field has a changes
     * @returns {boolean}
     */
    hasChanges() { return this.value != this.source.getValue(); },
    reset() {
        // TODO: Get initial value
        this.source.removeValue();
    },
    /**
     * Verifies that the field has a value
     * @returns {boolean}
     */
    hasValue() { return !isNullOrUndefined(this.value); },
    /**
     * Gets the input value
     * @returns {boolean}
     */
    getValue() { return this.selection; },
    setValue(value, update = false) {
        var response = null;

        if (update) {
            response = this.source.setValue(value);

            if (!response.success) {
                this.environment.notify(response.message, NotificationType.ERROR);
            }

            return true;
        }

        if (isNullOrUndefined(value)) {
            if (this.selection) {
                this.selection.classList.remove("selected");
            }

            if (!this.expanded) {
                removeChildren(this.selectListValue);
            }

            this.selection = null;
        } else {
            this.setChoice(value);
        }

        if (isNullOrUndefined(value)) {
            this.value = null;
        } else if (value.type === "concept") {
            this.value = value.id;
        } else if (value.type === "meta-concept") {
            this.value = value.name;
        } else {
            this.value = value;
        }

        const { template = {} } = this.schema.choice.option;

        if (this.selection && !this.expanded && value) {
            removeChildren(this.selectListValue);

            if (value.type === "meta-concept") {
                let choiceProjectionSchema = this.model.getProjectionSchema(value.concept, valOrDefault(template.tag))[0];

                let type = choiceProjectionSchema.type;
                let schema = {
                    "type": type,
                    [type]: choiceProjectionSchema.content || choiceProjectionSchema.projection,
                };

                let render = ContentHandler.call(this, schema, value.concept, { focusable: false, meta: value.name });

                this.selectListValue.append(render);
            } else if (value.type === "concept") {
                let choiceProjection = this.model.createProjection(value, template.tag).init({ focusable: false });
                choiceProjection.readonly = true;
                choiceProjection.focusable = false;
                choiceProjection.parent = this.projection;

                this.selectListValue.append(choiceProjection.render());
            } else {
                this.selectListValue.append(value.toString());
            }
        }

        this.refresh();
    },


    refresh() {
        if (this.hasValue()) {
            this.element.classList.remove("empty");
            this.element.dataset.value = this.value.name || this.value;
        } else {
            this.element.classList.add("empty");
            this.element.dataset.value = "";

            if (!this.expanded && this.placeholder) {
                removeChildren(this.selectListValue).append(this.placeholder);
            }
        }

        if (this.input) {
            this.element.dataset.input = this.input.value;
        }

        this.element.classList.remove("querying");

        if (this.hasError) {
            this.element.classList.add("error");
            if (this.input) {
                this.input.classList.add("error");
            }
        } else {
            this.element.classList.remove("error");
            if (this.input) {
                this.input.classList.remove("error");
            }
        }

        return this;
    },
    render() {
        const fragment = createDocFragment();

        const { choice, input, style } = this.schema;

        if (!isHTMLElement(this.element)) {
            this.element = createDiv({
                id: this.id,
                class: ["field", "field--choice"],
                tabindex: -1,
                dataset: {
                    nature: "field",
                    view: "choice",
                    input: "",
                    id: this.id,
                }
            });
        }

        if (!isHTMLElement(this.input) && input) {
            const { placeholder = "", type, style } = input;

            let placeholderValue = resolveValue.call(this, placeholder);

            this.input = createInput({
                class: ["field--choice__input"],
                type: valOrDefault(type, "text"),
                placeholder: placeholderValue,
                title: placeholderValue,
                dataset: {
                    nature: "field-component",
                    view: this.type,
                    id: this.id,
                }
            });

            StyleHandler.call(this, this.input, style);

            fragment.append(this.input);
        }

        if (!isHTMLElement(this.choices)) {
            const { style } = choice;

            this.choices = createUnorderedList({
                class: ["bare-list", "field--choice__choices"],
                tabindex: -1,
                dataset: {
                    nature: "field-component",
                    view: "choice",
                    id: this.id
                }
            });

            StyleHandler.call(this, this.choices, style);

            fragment.append(this.choices);
        }

        if (!this.expanded) {
            let wrapper = createDiv({
                class: ["field--choice__select-wrapper"],
                tabindex: -1,
                dataset: {
                    nature: "field-component",
                    view: "choice",
                    id: this.id
                }
            });
            this.selectListValue = createDiv({
                class: ["field--choice__select-value"],
                tabindex: -1,
                dataset: {
                    nature: "field-component",
                    view: "choice",
                    id: this.id
                }
            });

            this.icoToggle = createI({
                class: ["field--choice__select-icon"],
                dataset: {
                    nature: "field-component",
                    view: "choice",
                    id: this.id,
                }
            });

            wrapper.append(this.selectListValue, this.icoToggle);

            this.selectList = createDiv({
                class: ["field--choice__select-list", "hidden"],
                dataset: {
                    nature: "field-component",
                    view: "choice",
                    id: this.id
                }
            });

            if (this.input) {
                this.selectList.append(this.input);
            }

            this.selectList.append(this.choices);

            fragment.append(wrapper);
            fragment.append(this.selectList);
        }

        StyleHandler.call(this, this.element, style);

        if (fragment.hasChildNodes()) {
            this.element.append(fragment);
            this.bindEvents();
        }

        removeChildren(this.choices);

        if (this.placeholder) {
            const { style } = this.schema.choice.option;

            let item = createListItem({
                class: ["field--choice__choice", "field--choice__choice--placeholder"],
                tabindex: 0,
                dataset: {
                    nature: "field-component",
                    view: "choice",
                    id: this.id,
                    type: "placeholder"
                }
            }, this.placeholder);

            this.choices.append(item);

            StyleHandler.call(this, item, style);
        }

        this.values = this.source.getCandidates();
        this.values.forEach(value => {
            this.choices.append(this.createChoiceOption(value));
        });

        if (this.source.hasValue()) {
            this.setValue(this.source.getValue());
        }

        this.refresh();

        return this.element;
    },
    focus(target) {
        if (!this.expanded) {
            if (this.input && !isHidden(this.input)) {
                this.input.focus();
            } else {
                this.selectListValue.focus();
            }
        } else if (this.choices.hasChildNodes()) {
            let firstChild = getVisibleElement(this.choices);
            if (firstChild) {
                firstChild.focus();
            }
        } else if (this.input && !isHidden(this.input)) {
            this.input.focus();
        } else if (this.selection) {
            this.selection.focus();
        }

        this.element.classList.add("active");

        return this;
    },
    navigate(dir, from, to) {
        let target = null;

        if (dir === "up") {
            target = getBottomElement(this.element);
        } else if (dir === "down") {
            target = getTopElement(this.element);
        } else if (dir === "left") {
            target = getRightElement(this.element);
        } else if (dir === "right") {
            target = getLeftElement(this.element);
        }

        if (isNullOrUndefined(target)) {
            return false;
        }

        target.focus();

        return;
    },
    focusIn() {
        this.focused = true;
        this.element.classList.add("active");

        //requery
        const fragment = createDocFragment();

        this.source.getCandidates()
            .filter(val => !this.values.some(value => isSame(value, val)))
            .forEach(value => {
                fragment.append(this.createChoiceOption(value));
                this.values.push(value);
            });

        this.choices.append(fragment);

        if (!this.expanded) {
            show(this.selectList);
            this.selectList.dataset.state = "open";
        }
        
        this.parent.focusChild(this.element);

        return this;
    },

    focusChild(child){
        return;
    },

    focusOut() {
        if (this.readonly) {
            return;
        }

        if (this.input && isNullOrWhitespace(this.input.value)) {
            this.input.value = "";
        }

        if (this.messageElement) {
            hide(this.messageElement);
            removeChildren(this.messageElement);
        }

        if (this.input) {
            this.input.blur();
        }

        this.element.classList.remove("active");
        this.element.classList.remove("querying");

        const { children } = this.choices;
        for (let i = 0; i < children.length; i++) {
            /** @type {HTMLElement} */
            const item = children[i];

            show(item);
            item.hidden = false;
        }

        if (!this.expanded) {
            hide(this.selectList);
            this.selectList.dataset.state = "close";
        }

        this.focused = false;

        return this;
    },
    showChoices() {
        const { children } = this.choices;

        for (let i = 0; i < children.length; i++) {
            /** @type {HTMLElement} */
            const item = children[i];

            show(item);
            item.hidden = false;
        }
    },
    enable() {
        if (this.input) {
            this.input.disabled = false;
            this.input.tabIndex = 0;
        }
        this.disabled = false;

        return this;
    },
    disable() {
        if (this.input) {
            this.input.disabled = true;
            this.input.tabIndex = -1;
        }
        this.disabled = true;

        return this;
    },
    /**
     * Filters the list of choice using a query
     * @param {string} query 
     */
    filterChoice(query) {
        const { children } = this.choices;

        this.element.dataset.input = query.trim();

        if (isNullOrWhitespace(query)) {
            for (let i = 0; i < children.length; i++) {
                const item = children[i];

                show(item);
                item.hidden = false;
            }

            return;
        }

        this.element.classList.add("querying");

        let parts = query.trim().toLowerCase().replace(/\s+/g, " ").split(' ');

        for (let i = 0; i < children.length; i++) {
            const item = children[i];

            let value = item.textContent.toLowerCase();
            let _value = value.replace(/[_-]+/g, " ").replace(/\s+/g, "").trim();

            let match = parts.some(q => value.includes(q) || _value.includes(q));

            if (match) {
                show(item);
                item.hidden = false;
            } else {
                hide(item);
                item.hidden = true;
            }
        }

        return true;
    },
    createChoiceOption(value) {

        const { template = {}, style } = this.schema.choice.option;

        const isConcept = isObject(value);

        const container = createListItem({
            class: ["field--choice__choice"],
            tabindex: 0,
            dataset: {
                nature: "field-component",
                view: "choice",
                id: this.id,
                type: isConcept ? "concept" : "value",
                value: isConcept ? value.id : value,
            }
        });

        StyleHandler.call(this, container, style);

        this.items.set(value.id, container);

        if (value.type === "meta-concept") {
            let choiceProjectionSchema = this.model.getProjectionSchema(value.concept, valOrDefault(template.tag))[0];

            let type = choiceProjectionSchema.type;
            let schema = {
                "type": type,
                [type]: choiceProjectionSchema.content || choiceProjectionSchema.projection,
            };

            let render = ContentHandler.call(this, schema, value.concept, { focusable: false, meta: value.name });
            container.dataset.type = "meta-concept";
            container.dataset.value = value.name;
            container.append(render);
        } else if (isConcept) {
            if (!this.model.hasProjectionSchema(value, template.tag)) {
                return container;
            }

            let choiceProjection = this.model.createProjection(value, template.tag).init({ focusable: false });
            choiceProjection.readonly = true;
            choiceProjection.focusable = false;
            choiceProjection.parent = this.projection;

            container.append(choiceProjection.render());
        } else {
            container.append(value.toString());
        }

        return container;
    },
    setChoice(value) {
        const { children } = this.choices;

        let found = false;
        for (let i = 0; i < children.length; i++) {
            /** @type {HTMLElement} */
            const item = children[i];

            let itemValue = getItemValue.call(this, item);

            if (itemValue && isSame(itemValue, value)) {
                item.classList.add("selected");
                item.dataset.selected = "selected";
                this.selection = item;

                show(item);

                found = true;
            } else {
                item.classList.remove("selected");
                delete item.dataset.selected;
            }
        }

        return this;
    },

    delete() {
        if (this.hasValue()) {
            this.reset();
        } else {
            let result = this.source.delete();

            if (result.success) {
                this.clear();
                removeChildren(this.element);
                this.element.remove();
            } else {
                this.environment.notify(result.message);
                shake(this.element);
            }
        }
    },

    /**
     * Handles the `space` command
     * @param {HTMLElement} target 
     */
    _spaceHandler(target) {
        let candidates = this.source.getCandidates();

        if (isEmpty(candidates)) {
            this.notify("No candidates found.", NotificationType.INFO);

            return;
        }

        const fragment = createDocFragment();

        candidates.forEach(value => {
            fragment.append(this.createChoiceOption(value));
        });

        removeChildren(this.choices);

        if (this.placeholder) {
            const { style } = this.schema.choice.option;

            let item = createListItem({
                class: ["field--choice__choice", "field--choice__choice--placeholder"],
                tabindex: 0,
                dataset: {
                    nature: "field-component",
                    view: "choice",
                    id: this.id,
                    type: "placeholder"
                }
            }, this.placeholder);

            this.choices.append(item);

            StyleHandler.call(this, item, style);
        }

        this.choices.append(fragment);

        this.filterChoice(this.input.value);
        show(this.choices);
        this.element.classList.add("querying");
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

        if (!this.expanded && this.selectList.dataset.state === "open") {
            hide(this.selectList);
            this.selectList.dataset.state = "close";

            return true;
        }

        if (exit) {
            let parent = findAncestor(target, (el) => el.tabIndex === 0);
            let element = this.environment.resolveElement(parent);

            element.focus(parent);

            return true;
        }

        this.focus();
    },
    /**
     * Handles the `enter` command
     * @param {HTMLElement} target 
     */
    enterHandler(target) {
        const item = getItem.call(this, target);

        if (isHTMLElement(item) && this.selection !== item) {
            let type = getItemType(item);

            if (type === "placeholder") {
                this.source.removeValue();
            } else {
                this.setValue(getItemValue.call(this, item), true);
            }

            if (!this.expanded) {
                hide(this.selectList);
                this.selectList.dataset.state = "close";
                this.focus();
            }
        }
    },
    /**
     * Handles the `backspace` command
     * @param {HTMLElement} target 
     */
    backspaceHandler(target) {
        const item = getItem.call(this, target);

        if (item && this.input) {
            this.input.focus();
        }
    },
    /**
     * Handles the `click` command
     * @param {HTMLElement} target 
     */
    clickHandler(target) {
        const item = getItem.call(this, target);

        if (isHTMLElement(item) && this.selection !== item) {
            let type = getItemType(item);

            if (type === "placeholder") {
                this.source.removeValue();
            } else {
                this.setValue(getItemValue.call(this, item), true);
            }

            if (!this.expanded) {
                hide(this.selectList);
                this.selectList.dataset.state = "close";
            }
        } else if (target === this.selectListValue) {
            this.parent.focusChild(this.element);
            show(this.selectList);
            this.selectList.dataset.state = "open";
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

        const { parentElement } = target;

        const exit = () => {
            if (this.parent) {
                return this.parent.arrowHandler(dir, this.element);
            }

            return false;
        };

        if (!this.expanded) {
            if (target === this.selectListValue) {
                return this.arrowHandler(dir, this.selectListValue.parentElement);
            }
        }

        // gets the parent choice item if target is a children
        let item = getItem.call(this, target);

        if (item) {
            let closestItem = getClosest(item, dir, this.choices, false);

            if (!isHTMLElement(closestItem)) {
                return this.arrowHandler(dir, this.choices);
            }

            closestItem.focus();

            return true;
        }

        if (this.expanded && parentElement !== this.element) {
            return exit();
        }

        let closestItem = getClosest(target, dir, parentElement, false);

        if (!isHTMLElement(closestItem)) {
            return exit();
        }

        if (closestItem === this.selectList) {
            closestItem = this.input || this.choices;
        }

        if (closestItem === this.choices && this.choices.hasChildNodes()) {
            if (dir === "up") {
                closestItem = getBottomElement(this.choices);
            } else if (dir === "down") {
                closestItem = getTopElement(this.choices);
            } else if (dir === "left") {
                closestItem = getRightElement(this.choices);
            } else if (dir === "right") {
                closestItem = getLeftElement(this.choices);
            }
        }

        closestItem.focus();

        return true;
    },

    bindEvents() {
        if (isHTMLElement(this.input)) {
            this.element.addEventListener('input', (event) => {
                this.filterChoice(this.input.value);
            });
        }

        this.projection.registerHandler("value.changed", (value, from) => {
            this.setValue(value);
        });
    },
};


export const ChoiceField = Object.assign(
    Object.create(Field),
    BaseChoiceField
);