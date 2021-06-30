import {
    createDocFragment, createDiv, createSpan, createUnorderedList, createListItem,
    createI, createButton, isHTMLElement, findAncestor, hasOwn, isNullOrUndefined,
    valOrDefault,
} from 'zenkai';
import { show, hide, Key, toggle, Events } from '@utils/index.js';
import { createModelSelector } from './model-selector.js';


export const EditorSection = {
    /** @type {Editor} */
    editor: null,
    /** @type {number} */
    valueCount: 0,
    /** @type {number} */
    fileCount: 0,

    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    title: null,
    /** @type {boolean} */
    visible: true,

    /** @type {HTMLElement} */
    tabs: null,
    /** @type {HTMLElement} */
    tabConcept: null,
    /** @type {HTMLElement} */
    tabValue: null,
    /** @type {HTMLElement} */
    tabProjection: null,
    /** @type {HTMLElement} */
    tabResource: null,
    /** @type {HTMLElement} */
    tabConceptNotification: null,
    /** @type {HTMLElement} */
    tabValueNotification: null,
    /** @type {HTMLElement} */
    tabProjectionNotification: null,
    /** @type {HTMLElement} */
    tabResourceNotification: null,
    /** @type {HTMLElement} */
    activeTab: null,
    /** @type {string} */
    activeTabValue: null,
    /** @type {HTMLElement} */
    menu: null,
    /** @type {HTMLElement} */
    header: null,
    /** @type {HTMLElement} */
    body: null,
    /** @type {HTMLButtonElement} */
    btnHome: null,
    /** @type {HTMLButtonElement} */
    btnSave: null,

    get isRendered() { return isHTMLElement(this.container); },

    init(editor) {
        if (editor) {
            this.editor = editor;
        }

        this._conceptSelector = createModelSelector("concept", this.editor).init(() => {
            if (!this.editor.isReady) {
                return [];
            }

            const { conceptModel } = this.editor;

            let concepts = this.editor.getConfig("concepts");

            if (isNullOrUndefined(concepts)) {
                concepts = conceptModel.getSchema("concrete");
            }

            return concepts.map(concept => conceptModel.getCompleteModelConcept(concept));
        });

        return this;
    },

    render() {
        const fragment = createDocFragment();

        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["editor-header"],
                dataset: {
                    name: "editor-header",
                    alias: `header`,
                }
            });
        }

        if (!isHTMLElement(this.title)) {
            this.title = createSpan({
                class: ["editor-header-title"],
            }, "Editor");
        }

        if (!isHTMLElement(this.menu)) {
            this.menu = createDiv({
                class: ["editor-header-left"]
            }, [this.title]);
        }


        this.btnSave = createButton({
            class: ["btn", "editor-toolbar__button", "editor-toolbar__button--save"],
            title: "Export your model",
            dataset: {
                action: "export"
            }
        });

        this.btnHome = createButton({
            class: ["btn", "editor-toolbar__button", "editor-toolbar__button--home"],
            title: "Toggle the home menu",
            dataset: {
                action: "home"
            }
        });

        let toolbar = createDiv({
            class: ["editor-toolbar"],
        }, [this.btnSave, this.btnHome]);

        if (!isHTMLElement(this.header)) {
            this.header = createDiv({
                class: ["editor-header-menu"]
            }, [this.menu, toolbar]);

            fragment.append(this.header);
        }

        if (!isHTMLElement(this.body)) {
            this.body = createDiv({
                class: ["editor-header-main"],
            });

            fragment.append(this.body);
        }

        if (!isHTMLElement(this.btnCollapse)) {
            this.btnCollapse = createButton({
                class: ["btn", "editor-header__button", "editor-header__button--collapse"],
                title: `Collapse ${this.container.dataset.alias}`,
                dataset: {
                    action: "collapse",
                    rel: "parent",
                    target: this.container.dataset.name,
                }
            });

            fragment.append(this.btnCollapse);
        }

        if (!isHTMLElement(this._conceptSelector.container)) {
            this.body.append(this._conceptSelector.render());
        }

        this.btnCollapse.dataset.state = this.container.classList.contains("collapsed") ? "ON" : "OFF";

        if (fragment.hasChildNodes()) {
            this.container.append(fragment);

            this.bindEvents();
        }

        this.refresh();

        return this.container;
    },
    refresh() {
        let name = this.editor.getConfig("name");
        let settings = valOrDefault(this.editor.getConfig("settings"), true);

        if (name) {
            this.title.textContent = name;
        }

        if (this.editor.hasConceptModel) {
            this._conceptSelector.update();
            show(this.body);
            show(this.btnCollapse);
        } else {
            hide(this.body);
            hide(this.btnCollapse);
        }

        this.btnHome.disabled = !this.editor.isReady;
        this.btnSave.disabled = !this.editor.hasInstances;

        if (settings === false) {
            hide(this.btnHome);
        }

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

    bindEvents() {
      
    }
};
