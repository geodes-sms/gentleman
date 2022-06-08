import {
    createDiv, createButton, createUnorderedList, createListItem,
    createSpan, createParagraph, getTemplate, cloneTemplate,
    getElements, getElement, removeChildren, isHTMLElement, isNullOrUndefined, hasOwn,
} from 'zenkai';
import { hide, show, _b, _i } from '@utils/index.js';

export const FileConfig = {
    /** @type {*} */
    file: null,
    /** @type {string} */
    title: null,
    /** @type {string} */
    status: null,

    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    mainView: null,
    /** @type {HTMLElement} */
    infoView: null,
    /** @type {HTMLElement} */
    conceptList: null,

    /** @type {HTMLElement} */
    selection: null,
    /** @type {HTMLElement} */
    placeholder: null,
    /** @type {Map} */
    cache: null,

    init() {
        this.cache = new Map();

        return this;
    },

    get hasFile() { return this.cache.size > 0; },
    get hasSelection() { return !isNullOrUndefined(this.selection); },

    refresh() {
        if (!this.hasFile) {
            this.container.classList.add("empty");
            show(this.placeholder);
            hide(this.conceptList);
        } else {
            this.container.classList.remove("empty");
            hide(this.placeholder);
            show(this.conceptList);
        }

        if (!this.hasSelection) {
            hide(this.infoView);
        }

        return this;
    },
    render() {
        /** @type {HTMLElement} */
        this.container = createDiv({
            class: ["editor-config"],
        });

        /** @type {HTMLElement} */
        this.mainView = createDiv({
            class: ["editor-config-main"]
        });

        /** @type {HTMLElement} */
        this.infoView = createDiv({
            class: ["editor-config-info"]
        });

        /** @type {HTMLElement} */
        this.conceptList = createUnorderedList({
            class: ["bare-list", "editor-config__list"]
        });

        this.placeholder = createParagraph({
            class: ["editor-config-placeholder"],
            html: `${_b("No concept found")}. Please upload your files.`
        });

        this.mainView.append(this.conceptList, this.placeholder);

        this.container.append(this.mainView, this.infoView);

        this.bindEvents();

        this.refresh();

        return this.container;
    },
    clear() {
        removeChildren(this.conceptList);
        removeChildren(this.infoView);
        this.cache.clear();

        this.refresh();
    },
    selectItem(name) {
        if (!this.cache.has(name)) {
            return null;
        }
        let item = this.cache.get(name);

        if (isHTMLElement(this.selection)) {
            this.selection.classList.remove("selected");
        }

        this.selection = item;
        this.selection.classList.add("selected");

        this.refresh();

        return name;
    },
    show() {
        show(this.container);
        this.visible = true;

        return this;
    },
    hide() {
        hide(this.container);
        this.visible = false;

        return this;
    },
    /**
     * Displays the info for a concept
     * @param {string} name 
     */
    showInfo(name) {
        let schema = this.editor.conceptModel.getCompleteModelConcept(name);

        let info = printSchema(schema, getTemplate("#concept-schema"));

        removeChildren(this.infoView).append(info);
        show(this.infoView);
    },
    addItem(c) {
        /** @type {HTMLElement} */
        let name = createSpan({
            class: ["loaded-element-name", "fit-content"],
        }, c.name);

        /** @type {HTMLLIElement} */
        let item = createListItem({
            class: ["loaded-element", `loaded-element--${this.type}`],
            dataset: {
                context: "menu",
                action: `open-concept`,
                concept: c.name,
                status: "active"
            }
        });

        /** @type {HTMLButtonElement} */
        let btnEdit = createButton({
            class: ["btn", "file-section__actionbar-button", "file-section__actionbar-button--edit"],
            title: `Reload the ${this.type}`,
            dataset: {
                context: "menu",
                action: `open-concept`,
                concept: c.name,
                // action: `edit-${this.type}`, 
            },
        });

        item.append(name, btnEdit);

        this.conceptList.append(item);
        this.cache.set(c.name, item);

        this.refresh();
    },

    bindEvents() {
    }
};


/**
 * Prints a schema using a template
 * @param {*} schema 
 * @param {HTMLTemplateElement} template 
 * @returns {DocumentFragment} document fragment
 */
function printSchema(schema, template) {
    if (isNullOrUndefined(schema)) {
        throw new TypeError("Bad argument: The 'schema' is missing");
    }

    if (!isHTMLElement(template)) {
        throw new TypeError("Bad argument: The given 'template' is not a valid HTML Element");
    }

    const result = cloneTemplate(template);

    /**
     * Resolves a value
     * @param {string} value 
     */
    const resolveValue = (value) => {
        if (value.startsWith("$")) {
            return schema[value.substring(1)];
        }

        return value;
    };

    let ifs = getElements("[data-if]", result);
    ifs.forEach((e, i) => {
        let key = e.dataset["if"];
        if (!hasOwn(schema, key)) {
            e.remove();
        }
    });

    let names = getElements("[data-name]", result);
    names.forEach((e, i) => {
        let key = e.dataset["name"];
        e.textContent = schema[key];
    });

    let attrs = getElements("[data-attr]", result);
    attrs.forEach((e, i) => {
        let value = e.dataset["attr"];
        let [attr, val] = value.split(":");
        let content = resolveValue(val);
        delete e.dataset["attr"];
        e.dataset[attr] = content;
    });

    let binds = getElements("[data-bind]", result);
    binds.forEach((e, i) => {
        let key = e.dataset["bind"];
        if (!hasOwn(schema, key)) {
            return;
        }
        let items = getElement("[data-item]", e);
        let ref = items.dataset["item"];
        let tpl = getTemplate(`#${ref}`);
        schema[key].forEach(item => {
            items.append(printSchema(item, tpl));
        });
    });

    return result;
}