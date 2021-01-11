import {
    createDocFragment, createDiv, createSpan, createUnorderedList, createListItem,
    createButton, isHTMLElement, hasOwn,
} from 'zenkai';
import { show, hide, getEventTarget } from '@utils/index.js';


export const EditorSection = {
    editor: null,

    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    title: null,
    /** @type {HTMLElement} */
    selectorList: null,
    /** @type {HTMLElement} */
    selectorItem: null,
    /** @type {string} */
    selectorValue: null,
    /** @type {HTMLElement} */
    menu: null,
    /** @type {HTMLElement} */
    body: null,

    init(editor) {
        if (editor) {
            this.editor = editor;
        }

        return this;
    },
    render() {
        const fragment = createDocFragment();

        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["editor-header"]
            });
        }

        if (!isHTMLElement(this.title)) {
            this.title = createSpan({
                class: ["editor-header-title"],
            }, "Editor");
        }

        this.selectorList = createUnorderedList({
            class: ["bare-list", "editor-selector"],
        }, ["model", "concept"].map(item => createListItem({
            class: ["editor-selector-item"],
            tabindex: 0,
            dataset: {
                "value": item,
                "action": `selector-${item}`
            }
        }, item)));
        this.selectorItem = this.selectorList.children[0];
        this.selectorItem.classList.add("selected");
        this.selectorValue = this.selectorItem.dataset.value;


        let btnClose = createButton({
            class: ["btn", "btn-close"],
            dataset: {
                action: "close"
            }
        });

        let btnStyle = createButton({
            class: ["btn", "btn-style", "hidden"],
            dataset: {
                action: "style"
            }
        });

        let toolbar = createDiv({
            class: ["editor-toolbar"],
        }, [btnStyle, btnClose]);

        if (!isHTMLElement(this.menu)) {
            this.menu = createDiv({
                class: ["editor-header-menu"]
            }, [this.title, this.selectorList, toolbar]);

            fragment.append(this.menu);
        }

        if (!isHTMLElement(this.body)) {
            this.body = createDiv({
                class: ["editor-header-main"],
            });

            fragment.append(this.body);
        }

        if (fragment.hasChildNodes()) {
            this.container.appendChild(fragment);

            this.bindEvents();
        }

        this.refresh();

        return this.container;
    },
    refresh() {
        if (hasOwn(this.editor.config, "name")) {
            this.title.textContent = `Editor: ${this.editor.config["name"]}`;
        }
    },

    show() {
        show(this.container);
    },
    hide() {
        hide(this.container);
    },

    bindEvents() {

    }
};