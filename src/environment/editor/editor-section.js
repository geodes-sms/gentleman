import {
    createDocFragment, createDiv, createSpan, createUnorderedList, createListItem,
    createI, createButton, isHTMLElement, findAncestor, removeChildren, hasOwn,
    isNullOrUndefined, isFunction, createH4, createEmphasis, createInput, toBoolean, isEmpty, valOrDefault,
} from 'zenkai';
import { show, hide, Key, Events } from '@utils/index.js';
import { createProjectionSelector } from './projection-selector.js';


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

    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    title: null,

    /** @type {HTMLElement} */
    tabs: null,
    /** @type {HTMLElement} */
    tabConcept: null,
    /** @type {HTMLElement} */
    tabValue: null,
    /** @type {HTMLElement} */
    tabProjection: null,
    /** @type {HTMLElement} */
    tabConceptNotification: null,
    /** @type {HTMLElement} */
    tabValueNotification: null,
    /** @type {HTMLElement} */
    tabProjectionNotification: null,
    /** @type {HTMLElement} */
    activeTab: null,
    /** @type {string} */
    activeTabValue: null,
    /** @type {HTMLElement} */
    menu: null,
    /** @type {HTMLElement} */
    body: null,

    init(editor) {
        if (editor) {
            this.editor = editor;
        }

        this._conceptSelector = createProjectionSelector("concept", this.editor).init(
            () => this.editor.conceptModel ? this.editor.getRoots().map(concept => this.editor.conceptModel.getCompleteModelConcept(concept)) : []
        );

        this._valueSelector = createProjectionSelector("value", this.editor).init(
            () => this.editor.conceptModel ? this.editor.conceptModel.getValues() : []
        );

        this._projectionSelector = createProjectionSelector("projection", this.editor).init(
            () => this.editor.projectionModel ? this.editor.projectionModel.schema.filter(p => p.type !== "template") : []
        );

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

        this.tabs.append(this.tabConcept, this.tabValue, this.tabProjection);

        this.activeTab = this.tabs.children[0];
        this.activeTab.classList.add("selected");
        this.activeTabValue = this.activeTab.dataset.value;


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
            }, [this.title, this.tabs, toolbar]);

            fragment.append(this.menu);
        }

        if (!isHTMLElement(this.body)) {
            this.body = createDiv({
                class: ["editor-header-main"],
            });

            fragment.append(this.body);
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
    },
    hide() {
        hide(this.container);
    },

    bindEvents() {

        this.container.addEventListener("keydown", (event) => {
            const { target } = event;

            switch (event.key) {
                case Key.enter:
                    target.click();

                    break;
                default:
                    break;
            }
        });

        this.tabs.addEventListener('click', (event) => {
            const { target } = event;

            let selector = getSelector.call(this, target);

            this.updateSelector(selector);
        });

        this.body.addEventListener("click", (event) => {
            const { target } = event;

            const { action, id, concept, handler } = target.dataset;

            if (action === "clone") {
                let value = this.editor.conceptModel.getValue(id);

                this.editor.activeConcept.initValue(value);
            } else if (action === "delete") {
                this.editor.conceptModel.removeValue(id);
            } else if (action === "edit") {
                let projection = this.editor.projectionModel.getMetadata(id);
                this.editor.manager.createEditor().init().initProjection([JSON.parse(projection)]).open();
            } else if (action === "create") {
                this.editor.addConcept(concept);
            }
        });

        Events.on("value.added", (value) => {
            this.valueCount++;
            this.refresh();
        });

        Events.on("value.removed", (value) => {
            this.refresh();
        });
    }
};

const SelectorHandler = {
    "concept": SelectorConceptHandler,
    "projection": SelectorProjectionHandler,
    "value": SelectorValueHandler,
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

/**
 * Creates a selector between a root concept and the active concept
 * @param {Concept!} rootConcept 
 * @param {Concept} [activeConcept] 
 * @returns {Node}
 */
function conceptSelectorHandler(rootConcept, activeConcept) {

    if (isNullOrUndefined(rootConcept)) {
        throw new TypeError("Bad argument: rootConcept must be a Concept");
    }

    /**
     * Createa a selector item
     * @param {string} type 
     * @param {Concept} concept 
     * @returns {HTMLElement}
     */
    const createSelectorItem = (type, concept, source = false) => {
        const { name, alias, object, ref } = concept;

        const typeHandler = {
            "root": `${valOrDefault(alias, name)}`,
            "parent": `${valOrDefault(alias, name)}`,
            "ancestor": `${valOrDefault(alias, name)}`,
            "active": `${valOrDefault(ref.name, name)}`,
        };

        const fragment = createDocFragment();

        if (type === "active") {
            fragment.appendChild(createI({
                class: [`selector-concept-nature`]
            }, name));
        }

        /** @type {HTMLElement} */
        var content = createSpan({
            class: ["selector-concept-content"],
        }, typeHandler[type]);

        fragment.appendChild(content);

        if (type === "ancestor") {
            content.classList.add("fit-content");
        }


        /** @type {HTMLElement} */
        var item = createListItem({
            class: ["selector-concept", `selector-concept--${type}`],
            dataset: {
                object: object
            }
        }, fragment);

        if (source) {
            item.classList.add("source");
        }

        return item;
    };

    const fragment = createDocFragment();
    const hasActiveConcept = !isNullOrUndefined(activeConcept);

    fragment.appendChild(createSelectorItem("root", rootConcept, hasActiveConcept));

    if (!hasActiveConcept) {
        return fragment;
    }

    let activeParent = activeConcept.getParent();

    if (activeParent !== rootConcept) {
        let parent = activeParent;
        let parentItem = null;

        parentItem = createSelectorItem("parent", activeParent, true);

        let ancestor = parent.getAncestor().filter(val => val.object === "concept" && val.nature !== "primitive" && val !== rootConcept);

        if (!isEmpty(ancestor)) {
            ancestor = ancestor.reverse();
            let ancestorItem = createListItem({
                class: ["selector-concept", `selector-concept--ancestor`, "source", "collapse"]
            });

            let list = createUnorderedList({
                class: ["bare-list", "selector-ancestor-concepts"]
            });
            ancestor.forEach(concept => {
                list.appendChild(createListItem({
                    class: ["selector-ancestor-concept", "fit-content"],
                }, concept.name));
            });

            ancestorItem.appendChild(list);

            fragment.appendChild(ancestorItem);

            // ancestor.forEach(concept => {
            //     fragment.appendChild(createSelectorItem("ancestor", concept, true));
            // });
        }

        fragment.appendChild(parentItem);
    } else {
        // TODO: mark root as parent
    }

    fragment.appendChild(createSelectorItem("active", activeConcept));

    return fragment;
}