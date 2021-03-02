import {
    createDocFragment, createSpan, createDiv, createAnchor, createUnorderedList, createButton,
    createListItem, removeChildren, valOrDefault, isHTMLElement, isNullOrUndefined,
} from 'zenkai';
import { hide, show, toggle } from '@utils/index.js';

var inc = 0;
const nextId = () => `file${inc++}`;


export const EditorFile = {
    /** @type {HTMLElement} */
    container: null,
    /** @type {*} */
    schema: null,
    /** @type {boolean} */
    isOpen: false,
    /** @type {boolean} */
    visible: true,
    /** @type {HTMLButtonElement} */
    btnStart: null,
    /** @type {HTMLElement} */
    downloadList: null,
    /** @type {Map} */
    files: null,

    init(schema) {
        if (schema) {
            this.schema = schema;
        }
        this.files = new Map();

        return this;
    },

    get isRendered() { return isHTMLElement(this.container); },

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
    toggle() {
        toggle(this.container);
        this.visible = !this.visible;

        return this;
    },
    open() {
        this.container.classList.add("open");
        this.show();
        this.isOpen = true;

        return this;
    },
    close() {
        this.container.classList.remove("open");
        this.hide();
        this.isOpen = false;

        return this;
    },

    addFile(obj) {
        const MIME_TYPE = 'application/json';
        window.URL = window.webkitURL || window.URL;

        /** @type {HTMLAnchorElement} */
        var link = createAnchor({
            class: ["bare-link", "download-item__link"]
        }, `Download`);

        // if (!isNullOrWhitespace(link.href)) {
        //     window.URL.revokeObjectURL(link.href);
        // }


        var bb = new Blob([JSON.stringify(obj)], { type: MIME_TYPE });
        Object.assign(link, {
            download: `model.json`,
            href: window.URL.createObjectURL(bb),
        });

        link.dataset.downloadurl = [MIME_TYPE, link.download, link.href].join(':');

        let item = createListItem({
            class: ["download-item", "download-item--build"]
        });

        let btnDelete = createButton({
            class: ["btn", "btn-delete"],
            dataset: {
                action: "delete",
                target: "parent"
            }
        }, "✖");

        let title = createSpan({
            class: ["download-item__name"],
            dataset: {
                action: "delete",
                target: "parent"
            }
        }, `Build ${nextId()}`);

        item.append(btnDelete, title, link);

        this.downloadList.append(item);

        // // Need a small delay for the revokeObjectURL to work properly.
        // setTimeout(() => {
        //     window.URL.revokeObjectURL(link.href);
        //     link.remove();
        // }, 1500);
    },

    clear() {
        removeChildren(this.container);

        return this;
    },
    update() {

    },
    render() {
        const fragment = createDocFragment();

        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["editor-file"]
            });
        }

        if (!isHTMLElement(this.downloadList)) {
            this.downloadList = createUnorderedList({
                class: ["bare-list", "download-list"]
            });

            fragment.append(this.downloadList);
        }


        if (fragment.hasChildNodes()) {
            this.container.append(fragment);

            this.bindEvents();
        }

        this.refresh();

        return this.container;
    },
    refresh() {
        if (this.downloadList.hasChildNodes()) {
            this.show();
        } else {
            this.hide();
        }
        
        return this;
    },

    bindEvents() {

    }
};