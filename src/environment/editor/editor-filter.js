import {
    createDocFragment, createDiv, createSpan, createInput, createButton,
    isHTMLElement, isNullOrWhitespace, createI,
} from 'zenkai';
import { show, hide, toggle, NotificationType } from '@utils/index.js';



export const EditorFilter = {
    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    title: null,
    /** @type {boolean} */
    visible: false,
    /** @type {boolean} */
    isOpen: false,
    /** @type {HTMLInputElement} */
    searchInput: null,
    /** @type {HTMLElement} */
    conceptList: null,
    /** @type {HTMLElement} */
    header: null,
    /** @type {HTMLElement} */
    body: null,

    get isRendered() { return isHTMLElement(this.container); },

    init(args = {}) {
        this.schema = args;

        return this;
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
    update() {

    },
    /**
     * Filters the list of instance using a query
     * @param {string} query 
     */
    filter(query) {
        const { instances } = this.editor;

        if (isNullOrWhitespace(query)) {
            instances.forEach(instance => {
                instance.show();
            });

            return;
        }

        let parts = query.trim().toLowerCase().replace(/\s+/g, " ").split(' ');

        instances.forEach(instance => {
            let value = instance.title.textContent.toLowerCase();
            let _value = value.replace(/[_-]+/g, " ").replace(/\s+/g, "").trim();

            let match = parts.some(q => value.includes(q) || _value.includes(q));

            if (match) {
                instance.show();
            } else {
                instance.hide();
            }
        });

        return true;
    },
    refresh() {
        return this;
    },
    render() {
        const fragment = createDocFragment();

        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["editor-filter"]
            });
        }

        if (!isHTMLElement(this.notification)) {
            this.notification = createDiv({
                class: ["notification", "filter-notification"]
            });

            fragment.append(this.notification);
        }

        let header = createDiv({
            class: ["editor-filter-header"],
        });

        const title = createSpan({
            class: ["filter-title"],
            dataset: {
                "ignore": "all",
            }
        }, "Filter");

        if (!isHTMLElement(this.btnClose)) {
            this.btnClose = createButton({
                class: ["btn", "editor-filter__btn-close"],
                title: `Close filter`,
                dataset: {
                    action: `close`,
                    context: this.type,
                    id: this.id
                }
            }, createI({
                class: ["ico", "ico-delete", "btn-content"],
                dataset: {
                    ignore: "all",
                }
            }, "✖"));
        }

        header.append(title, this.btnClose);

        this.searchInput = createInput({
            class: ["filter-input"],
            type: "search"
        });

        fragment.append(header, this.searchInput);

        if (fragment.hasChildNodes()) {
            this.container.append(fragment);

            this.bindEvents();
        }

        if (!this.isOpen) {
            this.close();
        }

        this.update();
        this.refresh();

        return this.container;
    },


    bindEvents() {
        this.container.addEventListener('input', (event) => {
            this.filter(this.searchInput.value);
        });
    }
};