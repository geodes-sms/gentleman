import {
    createDocFragment, createDiv, createSpan, createUnorderedList, createListItem,
    createI, createButton, isHTMLElement, findAncestor, removeChildren, hasOwn,
    isNullOrUndefined, isFunction, createH4, createEmphasis, createInput, toBoolean,
} from 'zenkai';
import { show, hide, Key } from '@utils/index.js';


/**
 * Creates a selector
 * @param {string} type 
 * @returns {HTMLElement}
 */
function createSelector(type) {
    let selector = createListItem({
        class: ["editor-selector-item"],
        tabindex: 0,
        dataset: {
            "value": type,
            "action": `selector-${type}`
        }
    });

    let content = createSpan({
        class: ["editor-selector-item__content"],
    }, type);

    selector.append(content);

    return selector;
}

export const EditorSection = {
    /** @type {Editor} */
    editor: null,
    valueCount: 0,

    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    title: null,
    /** @type {HTMLElement} */
    selectorList: null,
    /** @type {HTMLElement} */
    modelSelector: null,
    /** @type {HTMLElement} */
    valueSelector: null,
    /** @type {HTMLElement} */
    projectionSelector: null,
    /** @type {HTMLElement} */
    modelConceptNotification: null,
    /** @type {HTMLElement} */
    modelValueNotification: null,
    /** @type {HTMLElement} */
    modelProjectionNotification: null,
    /** @type {HTMLElement} */
    selectorItem: null,
    /** @type {string} */
    selectorValue: null,
    /** @type {HTMLElement} */
    modelConceptList: null,
    /** @type {HTMLElement} */
    modelValueList: null,
    /** @type {HTMLElement} */
    modelProjectionList: null,
    /** @type {HTMLElement} */
    modelActiveList: null,
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
        });

        this.modelSelector = createSelector("model");
        this.modelConceptNotification = createI({
            class: ["editor-selector__notification", "hidden"],
        });
        this.modelSelector.prepend(this.modelConceptNotification);

        // this.modelSelector = createSelector("concept");
        // this.modelValueNotification = createI({
        //     class: ["editor-selector__notification"],
        // });
        // this.modelSelector.prepend(this.modelConceptNotification);

        this.valueSelector = createSelector("value");
        this.modelValueNotification = createI({
            class: ["editor-selector__notification", "hidden"],
        });
        this.valueSelector.prepend(this.modelValueNotification);

        this.projectionSelector = createSelector("projection");
        this.modelProjectionNotification = createI({
            class: ["editor-selector__notification", "hidden"],
        });
        this.projectionSelector.prepend(this.modelProjectionNotification);

        this.selectorList.append(this.modelSelector, this.valueSelector, this.projectionSelector);

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

        if (!isHTMLElement(this.modelConceptList)) {
            this.modelConceptList = createUnorderedList({
                class: ["bare-list", "selector-model-concepts", "font-ui", "hidden"]
            });

            this.body.append(this.modelConceptList);
        }

        if (!isHTMLElement(this.modelValueList)) {
            this.modelValueList = createUnorderedList({
                class: ["bare-list", "selector-model-values", "font-ui", "hidden"]
            });

            this.body.append(this.modelValueList);
        }

        if (!isHTMLElement(this.modelProjectionList)) {
            this.modelProjectionList = createUnorderedList({
                class: ["bare-list", "selector-model-projections", "font-ui", "hidden"]
            });

            this.body.append(this.modelProjectionList);
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

        let handler = SelectorHandler[this.selectorValue];

        if (isFunction(handler)) {
            handler.call(this);
        }

        if (this.valueCount > 0) {
            this.modelValueNotification.textContent = this.valueCount;
            show(this.modelValueNotification);
        } else {
            hide(this.modelValueNotification);
        }

        return this;
    },
    /**
     * Update the selected selector
     * @param {HTMLElement} selector 
     */
    updateSelector(selector) {
        const { value } = selector.dataset;

        if (this.selectorValue === value) {
            return;
        }

        if (selector.parentElement !== this.selectorList) {
            return;
        }

        this.selectorItem.classList.remove("selected");
        this.selectorValue = value;
        this.selectorItem = selector;
        this.selectorItem.classList.add("selected");

        this.refresh();
    },

    show() {
        show(this.container);
    },
    hide() {
        hide(this.container);
    },
    notify(message, value) {
        switch (message) {
            case "value.added":
                this.valueCount++;

                break;
            default:
                console.warn(`The message '${message}' was not handled for editor`);

                break;
        }
    },

    bindEvents() {

        this.container.addEventListener("keydown", (event) => {
            const { target } = event;

            switch (event.key) {
                case Key.enter:
                    console.log(target);
                    target.click();

                    break;
                default:
                    break;
            }
        });

        this.selectorList.addEventListener('click', (event) => {
            const { target } = event;

            let selector = getSelector.call(this, target);

            this.updateSelector(selector);
        });

        this.body.addEventListener("click", (event) => {
            const { target } = event;

            const { action, type, id, concept } = target.dataset;

            if (action === "clone") {
                let value = this.editor.conceptModel.getValue(id);

                this.editor.activeConcept.initValue(value);
            } else if (action === "delete") {
                this.editor.conceptModel.removeValue(id);
            } else if (action === "edit") {
                this.editor.manager.createEditor().init().open();
            } else if (type === "concept") {
                this.editor.addConcept(concept);
            }
        });

        this.body.addEventListener('change', (event) => {
            const { target } = event;

            const { action, type, id, concept } = target.dataset;

            if (action === "global") {
                let value = this.editor.projectionModel.changeProjection({ global: target.checked });
            }
        });
    }
};

const SelectorHandler = {
    "model": SelectorModelHandler,
    "concept": SelectorConceptHandler,
    "projection": SelectorProjectionHandler,
    "value": SelectorValueHandler,
};

/**
 * Selector handler for model menu item
 * @returns {HTMLElement}
 * @this {EditorSection}
 */
function SelectorModelHandler() {
    const { conceptModel, projectionModel } = this.editor;

    if (isNullOrUndefined(conceptModel)) {
        return null;
    }

    const concreteConcepts = conceptModel.schema.filter((concept) => projectionModel.hasGlobalProjection(concept));

    removeChildren(this.modelConceptList);

    concreteConcepts.forEach(concept => {
        var conceptItem = createListItem({
            class: ["selector-model-concept", "font-ui"],
            title: concept.description,
            tabindex: 0,
            dataset: {
                type: "concept",
                concept: concept.name
            }
        }, concept.name);

        this.modelConceptList.appendChild(conceptItem);
    });

    // update current selector
    show(this.modelConceptList);
    hide(this.modelConceptNotification);

    // update other selectors
    hide(this.modelValueList);
    hide(this.modelProjectionList);
}

/**
 * Selector handler for model menu item
 * @returns {HTMLElement}
 * @this {EditorSection}
 */
function SelectorProjectionHandler() {
    const { projectionModel } = this.editor;

    if (isNullOrUndefined(projectionModel)) {
        return null;
    }

    const projections = projectionModel.schema.slice();

    removeChildren(this.modelProjectionList);

    projections.forEach(projection => {
        let content = createDiv({
            class: ["selector-model__content", "selector-model-projection__content"]
        });

        let title = createH4({
            class: ["title", "selector-model__title", "selector-model-projection__title"],
            editable: true
        }, `${projection.type}`);

        let preview = createDiv({
            class: ["selector-model__preview", "selector-model-projection__preview"]
        });

        let concept = createSpan({
            class: ["selector-model-projection__concept"]
        }, projection.concept.name || projection.concept.prototype);

        let tagList = createUnorderedList({
            class: ["bare-list", "selector-model-projection__tags"]
        });
        projection.tags.forEach(tag => tagList.append(
            createListItem({
                class: ["selector-model-projection__tag"]
            }, tag)
        ));

        preview.append(concept, tagList);

        content.append(title, preview);

        let actionBar = createDiv({
            class: ["selector-model__action-bar", "selector-model-projection__action-bar"]
        });

        let chkGlobal = createInput({
            type: "checkbox",
            class: ["checkbox", "selector-model-projection__action-bar-checkbox", "selector-model-projection__action-bar-checkbox--global"],
            checked: toBoolean(projection.global),
            dataset: {
                action: "global",
                id: projection.id,
            }
        });

        let btnClone = createButton({
            class: ["btn", "selector-model-projection__action-bar-button", "selector-model-projection__action-bar-button", "selector-model-value__action-bar-button--clone"],
            dataset: {
                action: "edit",
                id: projection.id,
            }
        }, "Edit");

        let btnDelete = createButton({
            class: ["btn", "selector-model-projection__action-bar-button", "selector-model-value__action-bar-button--delete"],
            dataset: {
                action: "delete",
                id: projection.id,
            }
        }, "Delete");

        actionBar.append(chkGlobal, btnDelete, btnClone);

        var projectionItem = createListItem({
            class: ["selector-model-projection", "font-ui"],
            title: projection.description,
            tabindex: 0,
            dataset: {
                type: "projection",
                projection: projection.id
            }
        }, [content, actionBar]);

        this.modelProjectionList.appendChild(projectionItem);
    });

    // update current selector
    show(this.modelProjectionList);
    hide(this.modelProjectionNotification);

    // update other selectors
    hide(this.modelConceptList);
    hide(this.modelValueList);
}

function SelectorConceptHandler() {
    hide(this.modelConceptList);
    hide(this.modelValueList);
    hide(this.modelProjectionList);
}

/**
 * Selector handler for value menu item
 * @returns {HTMLElement}
 * @this {EditorSection}
 */
function SelectorValueHandler() {
    const { conceptModel } = this.editor;

    if (isNullOrUndefined(conceptModel)) {
        return null;
    }

    const values = conceptModel.getValues();

    removeChildren(this.modelValueList);

    values.forEach(value => {
        let content = createDiv({
            class: ["selector-model-value__content"]
        });

        let title = createH4({
            class: ["selector-model-value__title"],
            editable: true
        }, `${value.name}`);

        let preview = createDiv({
            class: ["selector-model-value__preview"]
        }, createPreview(value));

        content.append(title, preview);

        let actionBar = createDiv({
            class: ["selector-model-value__action-bar"]
        });

        let btnClone = createButton({
            class: ["btn", "selector-model-value__action-bar-button", "selector-model-value__action-bar-button--clone"],
            dataset: {
                action: "clone",
                id: value.id,
            }
        }, "Clone");

        let btnDelete = createButton({
            class: ["btn", "selector-model-value__action-bar-button", "selector-model-value__action-bar-button--delete"],
            dataset: {
                action: "delete",
                id: value.id,
            }
        }, "Delete");

        actionBar.append(btnDelete, btnClone);

        let valueItem = createListItem({
            class: ["selector-model-value", "font-ui"],
            dataset: {
                type: "value",
                id: value.id,
            }
        }, [content, actionBar]);

        this.modelValueList.append(valueItem);
    });

    this.valueCount = 0;

    // update current selector
    show(this.modelValueList);
    hide(this.modelValueNotification);

    // update other selectors
    hide(this.modelConceptList);
    hide(this.modelProjectionList);
}

function createPreview(obj) {
    if (isNullOrUndefined(obj)) {
        return createEmphasis({
            class: ["selector-model-value__preview-null"]
        }, "null");
    }

    const { name, value, attributes } = obj;

    if (["string", "number", "boolean"].includes(name)) {
        return createSpan({
            class: ["selector-model-value__preview-text"]
        }, value);
    } else if (name === "set") {
        let list = createUnorderedList({
            class: ["bare-list", "selector-model-value__preview-list"]
        });

        value.forEach(val => {
            let item = createListItem({
                class: ["selector-model-value__preview-list-item"]
            }, createPreview(val));

            list.append(item);
        });

        return list;
    } else if (attributes) {
        let list = createUnorderedList({
            class: ["bare-list", "selector-model-value__preview-attribute-list"]
        });

        attributes.forEach(attr => {
            const { name, value } = attr;

            let attrElement = createSpan({
                class: ["selector-model-value__preview-text", "selector-model-value__preview-text--attribute"]
            }, name);

            let item = createListItem({
                class: ["selector-model-value__preview-attribute-list-item"]
            }, [attrElement, createPreview(value)]);

            list.append(item);
        });

        return list;
    } else if (value) {
        return createPreview(value);
    }

    return obj.toString();
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
    const isValid = (el) => el.parentElement === this.selectorList;

    if (isValid(element)) {
        return element;
    }

    return findAncestor(element, isValid, 10);
}