import {
    createDocFragment, createSpan, createButton, createListItem, removeChildren,
    valOrDefault, isHTMLElement, shortDateTime, isNullOrUndefined,
} from 'zenkai';
import { hide, show, toggle, LogType } from '@utils/index.js';

var inc = 0;
const nextId = () => `file${inc++}`;


export const EditorResource = {
    /** @type {HTMLElement} */
    container: null,
    /** @type {*} */
    schema: null,
    /** @type {boolean} */
    isOpen: false,
    /** @type {boolean} */
    visible: true,
    /** @type {HTMLElement} */
    resourceList: null,
    /** @type {HTMLElement} */
    btnAdd: null,
    /** @type {Map} */
    resources: null,

    init(schema) {
        if (schema) {
            this.schema = schema;
        }
        this.resources = new Map();

        return this;
    },

    /**
     * Add log
     * @param {*[]} messages 
     * @param {string} title 
     * @param {string} type 
     */
    addResource(file, title, type) {
        let item = createListItem({
            class: ["resource-item", `resource-item--${type}`],
            title: valOrDefault(title, file.name),
        });

        let btnDelete = createButton({
            class: ["btn", "btn-delete"],
            dataset: {
                action: "delete",
                target: "parent"
            }
        }, "✖");

        let titleElement = createSpan({
            class: ["resource-item__name", "fit-content"]
        }, `${valOrDefault(title, file.name)}`);

        item.append(titleElement, btnDelete);

        this.resources.set(file.name, file);
    },

    clear() {
        removeChildren(this.container);

        return this;
    },
    update(schema) {
        if (isNullOrUndefined(schema)) {
            return;
        }

        this.schema = schema;

        const { files } = this.schema;

        this.schema = schema;
    },
    refresh() {
        return this;
    },

    bindEvents() {

    }
};