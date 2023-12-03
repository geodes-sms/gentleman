import {
    createDocFragment, createDiv, createUnorderedList, createButton, createListItem,
    removeChildren, valOrDefault, isHTMLElement, createParagraph, createLabel, createInput,
    isNullOrUndefined, createH4, isNullOrWhitespace,
} from 'zenkai';
import { NotificationType, shake, select, unselect } from '@utils/index.js';


export const EditorExport = {
    /** @type {*} */
    schema: null,
    /** @type {boolean} */
    isOpen: false,
    /** @type {boolean} */
    visible: true,
    /** @type {HTMLButtonElement} */
    btnClose: null,
    /** @type {HTMLButtonElement} */
    btnExport: null,
    /** @type {HTMLElement} */
    outputName: null,
    /** @type {ExportSelector} */
    selector: null,

    init(schema) {
        if (schema) {
            this.schema = schema;
        }

        return this;
    },

    get isRendered() { return isHTMLElement(this.container); },

    clear() {
        removeChildren(this.logList);

        return this;
    },
    update() {

    },
    render() {
        const fragment = createDocFragment();

        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["editor-exporter", "hidden"]
            });
        }

        if (!isHTMLElement(this.btnClose)) {
            this.btnClose = createButton({
                title: "Close window",
                class: ["btn", "btn-collapse"]
            });

            fragment.append(this.btnClose);
        }


        let title = createH4({
            class: ["editor-exporter-title"]
        }, "Export model");

        fragment.append(title);

        if (isNullOrUndefined(this.selector)) {
            let instruction = createParagraph({
                class: ["editor-exporter__instruction"]
            }, "Select the export format");

            this.selector = createSelector(["JSON", "XML"]);
            fragment.append(instruction, this.selector.render());
            this.selector.select("JSON");
        }

        if (!isHTMLElement(this.outputName)) {
            let label = createLabel({
                class: ["editor-exporter-file__label"]
            });
            let value = createLabel({
                class: ["editor-exporter-file__label-value"]
            }, "File");
            this.outputName = createInput({
                placeholder: "File name",
                class: ["editor-exporter-file__input"]
            });

            label.append(value, this.outputName);
            fragment.append(label);
        }

        if (!isHTMLElement(this.btnExport)) {
            this.btnExport = createButton({
                class: ["btn", "btn-export"]
            }, "Export");

            fragment.append(this.btnExport);
        }

        if (fragment.hasChildNodes()) {
            this.container.append(fragment);

            this.bindEvents();
        }

        this.refresh();

        return this.container;
    },
    refresh() {
        return this;
    },
    execute() {
        let value = this.selector.getValue();

        switch (value) {
            case "JSON":
                this.toJSON(this.outputName.value);
                break;
            case "XML":
                this.toXML(this.outputName.value);
                break;
        
            default:
                break;
        }
    },
    toXML() {
        const { conceptModel } = this.editor;

        const result = conceptModel.toXML();

        this.editor.download(result, `${this.outputName.value}.xml`, "XML");
    },
    toJSON() {
        const { conceptModel, projectionModel } = this.editor;

        const result = {
            "type": "model",
            "concept": conceptModel.schema,
            "projection": projectionModel.schema,
            "values": conceptModel.export(),
        };

        this.editor.download(result, `${this.outputName.value}.json`, "JSON");
    },
    isValid() {
        return !isNullOrWhitespace(this.outputName.value);
    },

    bindEvents() {

        this.btnClose.addEventListener("click", (event) => {
            this.close();
        });

        this.btnExport.addEventListener("click", (event) => {
            if (!this.isValid()) {
                shake(this.btnExport);
                this.editor.notify("Enter the file name", NotificationType.ERROR, 3000);

                return;
            }

            this.execute();
        });
    }
};

function createSelector(values) {
    let selector = Object.create(ExportSelector).init(values);
    return selector;
}

const ExportSelector = {
    /** @type {HTMLElement} */
    container: null,
    /** @type {*[]} */
    values: null,
    /** @type {Map} */
    selectors: null,
    /** @type {HTMLElement} */
    selected: null,
    /** @type {string} */
    value: null,

    init(values) {
        this.values = valOrDefault(values, []);
        this.selectors = new Map();

        return this;
    },
    getValue() {
        return this.value;
    },
    refresh() {
        if (isNullOrUndefined(this.value)) {
            this.container.classList.add("empty");
        } else {
            this.container.classList.remove("empty");
        }
    },
    render() {
        let bind = false;

        if (!isHTMLElement(this.container)) {
            this.container = createUnorderedList({
                class: ["bare-list", "export-selector"]
            });

            bind = true;
        }

        this.values.forEach(value => {
            let item = this.createItem(value);
            this.container.append(item);
        });

        if (bind) {
            this.bindEvents();
        }

        return this.container;
    },
    select(value) {
        if (isNullOrUndefined(value)) {
            return;
        }

        if (!this.selectors.has(value)) {
            return;
        }

        let item = this.selectors.get(value);

        this.setSelectedItem(item);
        this.value = value;

        this.refresh();
    },
    createItem(value) {
        let item = createListItem({
            class: ["export-selector-item"],
            dataset: {
                value: value
            }
        });

        let label = createLabel({
            class: ["export-selector-item__label"]
        });

        let radioInput = createInput({
            type: "radio",
            name: "export-choice",
            value: value,
            class: ["export-selector-item__input"]
        });

        label.append(radioInput, value);

        item.append(label);

        this.addItem(value, item);

        return item;
    },
    /**
     * Adds a selector item
     * @param {string} index
     * @param {HTMLElement} item
     */
    addItem(index, item) {
        this.selectors.set(index, item);

        this.refresh();

        return this;
    },
    /**
     * Gets a selector item
     * @param {string} index 
     * @returns {HTMLElement}
     */
    getItem(index) {
        return this.selectors.get(index);
    },
    /**
     * 
     * @param {HTMLElement} item 
     * @returns 
     */
    setSelectedItem(item) {
        if (!isHTMLElement(item) || item.parentElement !== this.container) {
            return false;
        }

        if (this.selected === item) {
            return;
        }

        if (this.selected) {
            unselect(this.selected);
        }

        this.selected = item;
        select(this.selected);

        return true;
    },
    bindEvents() {
        this.container.addEventListener('change', (event) => {
            const { target } = event;

            if (isNullOrUndefined(target.value)) {
                return;
            }

            this.select(target.value);
        });
    }
};