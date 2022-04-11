import {
    createDocFragment, createDiv, createSpan, createButton, isHTMLElement, findAncestor,
    hasOwn, isNullOrUndefined, valOrDefault,
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
    /** @type {HTMLButtonElement} */
    btnClose: null,

    get isRendered() { return isHTMLElement(this.container); },

    init(editor) {
        if (editor) {
            this.editor = editor;
        }

        this._conceptSelector = createModelSelector("concept", this.editor).init(() => {
            if (!this.editor.isReady) {
                return [];
            }

            return this.editor.conceptModel.getSchema("concrete").filter(c => c.root);
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
            }, "Gentleman");
        }

        if (!isHTMLElement(this.menu)) {
            this.menu = createDiv({
                class: ["editor-header-left"]
            }, [this.title]);
        }

        let toolbarConfig = valOrDefault(this.editor.getConfig("toolbar"), []);
        let toolbar = createDiv({
            class: ["editor-toolbar"],
        }, toolbarConfig.map(element =>
            createButton({
                class: valOrDefault(element.class, []),
                dataset: { name: element.name, action: element.action }
            }, element.content)
        ));

        if (!isHTMLElement(this.btnHome)) {
            this.btnHome = createButton({
                class: ["btn", "editor-toolbar__button", "editor-toolbar__button--home"],
                title: `Toggle menu`,
                dataset: {
                    action: "home"
                }
            });

            toolbar.append(this.btnHome);
        }

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

        // if (!isHTMLElement(this.btnCollapse)) {
        //     this.btnCollapse = createButton({
        //         class: ["btn", "editor-header__button", "editor-header__button--collapse"],
        //         title: `Collapse ${this.container.dataset.alias}`,
        //         dataset: {
        //             action: "collapse",
        //             rel: "parent",
        //             target: this.container.dataset.name,
        //         }
        //     });

        //     fragment.append(this.btnCollapse);
        // }

        if (!isHTMLElement(this._conceptSelector.container)) {
            this.body.append(this._conceptSelector.render());
        }

        // this.btnCollapse.dataset.state = this.container.classList.contains("collapsed") ? "ON" : "OFF";

        if (fragment.hasChildNodes()) {
            this.container.append(fragment);

            this.bindEvents();
        }

        this.refresh();

        return this.container;
    },
    refresh() {
        let settings = valOrDefault(this.editor.getConfig("settings"), true);
        let concepts = valOrDefault(this.editor.getConfig("header"), true);

        if (this.editor.hasConceptModel) {
            this._conceptSelector.update();
            show(this.body);
            // show(this.btnCollapse);
        } else {
            hide(this.body);
            // hide(this.btnCollapse);
        }

        // this.btnHome.disabled = !this.editor.isReady;
        // this.btnSave.disabled = !this.editor.hasInstances;

        if (settings === false) {
            hide(this.btnHome);
        }

        if (concepts === false) {
            hide(this.body);
        }

        return this;
    },

    show(el) {
        if (isHTMLElement(this[el])) {
            show(this[el]);
            return;
        }

        show(this.container);
        this.visible = true;

        return this;
    },
    hide(el) {
        if (isHTMLElement(this[el])) {
            hide(this[el]);
            return;
        }

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
