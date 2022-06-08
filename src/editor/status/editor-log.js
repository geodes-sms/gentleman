import {
    createDocFragment, createSpan, createDiv, createUnorderedList, createButton,
    createListItem, removeChildren, valOrDefault, isHTMLElement, shortDateTime, isIterable,
} from 'zenkai';
import { hide, show, toggle, LogType } from '@utils/index.js';

var inc = 0;
const nextId = () => `file${inc++}`;


export const EditorLog = {
    /** @type {*} */
    schema: null,
    /** @type {boolean} */
    isOpen: false,
    /** @type {boolean} */
    visible: true,
    /** @type {HTMLButtonElement} */
    btnStart: null,
    /** @type {HTMLElement} */
    logList: null,

    init(schema) {
        if (schema) {
            this.schema = schema;
        }

        return this;
    },

    get isRendered() { return isHTMLElement(this.container); },

    /**
     * Add log
     * @param {*[]} messages 
     * @param {string} title 
     * @param {LogType} level 
     */
    add(messages, title, level = LogType.NORMAL) {
        if (!Array.isArray(messages)) {
            return;
        }

        let content = createUnorderedList({
            class: ["bare-list", "log-item-messages"]
        });

        messages.forEach(msg =>
            content.append(createListItem({
                class: ["log-item-message"]
            }, msg))
        );

        let item = createListItem({
            class: ["log-item", `log-item--${level}`]
        });

        let btnDelete = createButton({
            class: ["btn", "btn-delete"],
            dataset: {
                action: "delete",
                target: "parent"
            }
        }, "✖");

        let titleElement = createSpan({
            class: ["log-item__name"],
            dataset: {
                action: "delete",
                target: "parent"
            }
        }, `${valOrDefault(title, "Log")} (${shortDateTime(Date.now())})`);

        item.append(btnDelete, titleElement, content);

        this.logList.append(item);

        this.refresh();

        return this;
    },

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
                class: ["editor-log"]
            });
        }

        if (!isHTMLElement(this.logList)) {
            this.logList = createUnorderedList({
                class: ["bare-list", "log-list"]
            });

            fragment.append(this.logList);
        }


        if (fragment.hasChildNodes()) {
            this.container.append(fragment);

            this.bindEvents();
        }

        this.refresh();

        return this.container;
    },
    refresh() {
        if (this.logList.hasChildNodes()) {
            this.show();
        } else {
            this.hide();
        }

        return this;
    },

    bindEvents() {

    }
};