import {
    createDocFragment, createDiv, createSpan, createUnorderedList, createListItem,
    createI, createButton, isHTMLElement, findAncestor, hasOwn, isNullOrUndefined,
    isFunction, isEmpty, valOrDefault,
} from 'zenkai';
import { show, hide, Key, toggle, Events } from '@utils/index.js';
import { createModelSelector } from './model-selector.js';


/**
 * Creates a selector
 * @param {string} type 
 * @returns {HTMLElement}
 */
function createTab(type) {
    let selector = createListItem({
        class: ["tab", "editor-header-tab"],
        tabindex: 0,
        dataset: {
            "value": type,
            "action": `selector-${type}`
        }
    });

    let content = createSpan({
        class: ["editor-header-tab__content"],
    }, type);

    selector.append(content);

    return selector;
}

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

        this._valueSelector = createModelSelector("value", this.editor).init(() => {
            if (!this.editor.hasConceptModel) {
                return [];
            }

            const { conceptModel } = this.editor;

            return conceptModel.getValues();
        });

        this._projectionSelector = createModelSelector("projection", this.editor).init(() => {
            if (!this.editor.hasProjectionModel) {
                return [];
            }

            const { projectionModel } = this.editor;

            return projectionModel.schema.filter(p => p.type !== "template");
        });

        this._resourceSelector = createModelSelector("resource", this.editor).init(() => {
            let resources = this.editor.getConfig("resources");

            if (isNullOrUndefined(resources)) {
                return [];
            }

            return resources;
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

        this.tabs = createUnorderedList({
            class: ["bare-list", "tabs", "editor-header-tabs"],
        });

        this.tabConcept = createTab("concept");
        this.tabConceptNotification = createI({
            class: ["editor-selector__notification", "hidden"],
        });
        this.tabConcept.prepend(this.tabConceptNotification);

        this.tabValue = createTab("value");
        this.tabValueNotification = createI({
            class: ["editor-selector__notification", "hidden"],
        });
        this.tabValue.prepend(this.tabValueNotification);

        this.tabProjection = createTab("projection");
        this.tabProjectionNotification = createI({
            class: ["editor-selector__notification", "hidden"],
        });
        this.tabProjection.prepend(this.tabProjectionNotification);

        this.tabResource = createTab("resource");
        this.tabResourceNotification = createI({
            class: ["editor-selector__notification", "hidden"],
        });
        this.tabResource.prepend(this.tabResourceNotification);

        this.tabs.append(this.tabConcept, this.tabValue, this.tabResource);

        this.activeTab = this.tabs.children[0];
        this.activeTab.classList.add("selected");
        this.activeTabValue = this.activeTab.dataset.value;

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
            }, [this.menu, this.tabs, toolbar]);

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

        if (!isHTMLElement(this._valueSelector.container)) {
            this.body.append(this._valueSelector.render());
        }

        if (!isHTMLElement(this._projectionSelector.container)) {
            this.body.append(this._projectionSelector.render());
        }

        if (!isHTMLElement(this._resourceSelector.container)) {
            this.body.append(this._resourceSelector.render());
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
        let settings = this.editor.getConfig("settings");

        if (name) {
            this.title.textContent = name;
        }

        if (this.editor.hasConceptModel) {
            show(this.tabs);
            show(this.body);
            show(this.btnCollapse);
        } else {
            hide(this.tabs);
            hide(this.body);
            hide(this.btnCollapse);
        }

        this.btnHome.disabled = !this.editor.isReady || !settings;
        this.btnSave.disabled = !this.editor.hasInstances;

        this.editor.getConfig("resources") ? show(this.tabResource) : hide(this.tabResource);

        let handler = SelectorHandler[this.activeTabValue];

        if (isFunction(handler)) {
            handler.call(this);
        }

        if (this.valueCount > 0) {
            this.tabValueNotification.textContent = this.valueCount;
            show(this.tabValueNotification);
        } else {
            hide(this.tabValueNotification);
        }

        if (this.fileCount > 0) {
            this.tabResourceNotification.textContent = this.fileCount;
            show(this.tabResourceNotification);
        } else {
            hide(this.tabResourceNotification);
        }

        return this;
    },
    /**
     * Update the selected selector
     * @param {HTMLElement} selector 
     */
    updateSelector(selector) {
        const { value } = selector.dataset;

        if (this.activeTabValue === value) {
            return;
        }

        if (selector.parentElement !== this.tabs) {
            return;
        }

        this.activeTab.classList.remove("selected");
        this.activeTabValue = value;
        this.activeTab = selector;
        this.activeTab.classList.add("selected");

        this.refresh();
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
        this.tabs.addEventListener("click", (event) => {
            const { target } = event;

            let selector = getSelector.call(this, target);

            this.updateSelector(selector);
        });
        
        this.editor.registerHandler("resource.added", (value) => {
            this.fileCount++;
            this.refresh();
        });

        this.editor.registerHandler("resource.removed", (value) => {
            this.refresh();
        });
    }
};

const SelectorHandler = {
    "concept": SelectorConceptHandler,
    "projection": SelectorProjectionHandler,
    "value": SelectorValueHandler,
    "resource": SelectorResourceHandler,
};

/**
 * Selector handler for model menu item
 * @returns {HTMLElement}
 * @this {EditorSection}
 */
function SelectorConceptHandler() {
    this._conceptSelector.update();

    // update current selector
    this._conceptSelector.show();
    hide(this.tabConceptNotification);

    // update other selectors
    this._valueSelector.hide();
    this._projectionSelector.hide();
    this._resourceSelector.hide();
}

/**
 * Selector handler for value menu item
 * @returns {HTMLElement}
 * @this {EditorSection}
 */
function SelectorValueHandler() {
    this._valueSelector.update();

    this.valueCount = 0;

    // update current selector
    this._valueSelector.show();
    hide(this.tabValueNotification);

    // update other selectors
    this._conceptSelector.hide();
    this._projectionSelector.hide();
    this._resourceSelector.hide();
}

/**
 * Selector handler for model menu item
 * @returns {HTMLElement}
 * @this {EditorSection}
 */
function SelectorProjectionHandler() {
    this._projectionSelector.update();

    // update current selector
    this._projectionSelector.show();
    hide(this.tabProjectionNotification);

    // update other selectors
    this._conceptSelector.hide();
    this._valueSelector.hide();
    this._resourceSelector.hide();
}

/**
 * Selector handler for resource menu item
 * @returns {HTMLElement}
 * @this {EditorSection}
 */
function SelectorResourceHandler() {
    this._resourceSelector.update();

    this.fileCount = 0;

    // update current selector
    this._resourceSelector.show();
    hide(this.tabResourceNotification);

    // update other selectors
    this._conceptSelector.hide();
    this._projectionSelector.hide();
    this._valueSelector.hide();
}


/**
 * Gets an event real target
 * @param {HTMLElement} element 
 * @returns {HTMLElement}
 * @this {EditorSection}
 */
function getSelector(element) {
    /**
     * Check if element is a selector
     * @param {HTMLElement} el 
     */
    const isValid = (el) => el.parentElement === this.tabs;

    if (isValid(element)) {
        return element;
    }

    return findAncestor(element, isValid, 10);
}
