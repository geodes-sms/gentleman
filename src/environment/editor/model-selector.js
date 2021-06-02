import {
    createDocFragment, createDiv, createSpan, createUnorderedList, createListItem,
    createH4, createButton, createI, createHeader, createEmphasis, removeChildren,
    isNullOrUndefined, isHTMLElement,
} from 'zenkai';
import { show, hide } from '@utils/index.js';


/**
 * Creates a selector
 * @param {string} type 
 * @param {Editor} editor
 * @returns {ProjectionSelector}
 */
export function createModelSelector(type, editor, model) {
    return Object.create(EditorSelector, {
        object: { value: "selector" },
        model: { value: model },
        type: { value: type },
        editor: { value: editor },
    });
}

export const EditorSelector = {
    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    list: null,
    /** @type {Editor} */
    editor: null,
    /** @type {*[]} */
    dataList: null,
    /** @type {Function} */
    fetch: null,

    init(fetchHandler) {
        this.fetch = fetchHandler;

        return this;
    },

    render() {
        const fragment = createDocFragment();

        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["container", "container--editor-selectors"]
            });
        }

        if (!isHTMLElement(this.list)) {
            this.list = createUnorderedList({
                class: ["bare-list", "editor-selectors", "font-ui"]
            });

            fragment.append(this.list);
        }

        if (fragment.hasChildNodes()) {
            this.container.append(fragment);

            this.bindEvents();
        }

        this.refresh();

        return this.container;
    },
    refresh() {

        return this;
    },
    update() {
        this.dataList = this.fetch();

        removeChildren(this.list);

        this.dataList.forEach(data => {
            // Create header
            const { concept, accept } = data;

            // Create header
            let title = createH4({
                class: ["title", "editor-selector__title"],
                title: data.description,
            }, `${data.name || data.type}`);

            if (concept) {
                title.append(createSpan({
                    class: ["editor-selector__title-concept"]
                }, (concept.name || concept.prototype).replace(" ", "-").toLowerCase()));
            }

            if (accept) {
                title.append(createSpan({
                    class: ["editor-selector__title-accept"]
                }, accept.name));
            }

            /** @type {HTMLButtonElement} */
            let btnInfo = createButton({
                class: ["btn", "editor-selector__header-button", "editor-selector__header-button--info"],
                title: `View ${data.name || data.type} info`,
                dataset: {
                    action: "collapse",
                    rel: "parent",
                    target: "selector"
                }
            }, "i");

            let header = createHeader({
                class: ["title", "editor-selector__header"],
                title: `Expand/Collapse ${this.type}`
            }, [title, btnInfo]);

            // Create preview
            let previewHandler = PreviewHandler[this.type];
            let preview = createDiv({
                class: ["editor-selector__preview"]
            }, previewHandler.call(this, data));


            // Create action bar
            let actionHandler = ActionHandler[this.type];
            let actionBar = createDiv({
                class: ["editor-selector__action-bar"]
            }, actionHandler.call(this, data));

            // Create item container
            let item = createListItem({
                class: ["editor-selector", "collapsed", "font-ui"],
                tabindex: 0,
                dataset: {
                    type: this.type,
                    alias: `${data.name || data.type}`,
                    name: "selector",
                    projection: data.id
                }
            }, [header, preview, actionBar]);

            this.list.append(item);
        });

        this.refresh();

        return this;
    },

    show() {
        show(this.container);

        return this;
    },
    hide() {
        hide(this.container);

        return this;
    },

    bindEvents() {
    }
};

const PreviewHandler = {
    "projection": function (projection) {
        const { concept, tags = [] } = projection;

        const fragment = createDocFragment();

        let conceptSection = createSpan({
            class: ["editor-selector__preview-concept"]
        }, concept.name || concept.prototype);

        let tagList = createUnorderedList({
            class: ["bare-list", "editor-selector__preview-tags"]
        });
        tags.forEach(tag => tagList.append(
            createListItem({
                class: ["editor-selector__preview-tag"]
            }, tag)
        ));

        fragment.append(conceptSection, tagList);

        return fragment;
    },
    "value": function (conceptValue) {
        if (isNullOrUndefined(conceptValue)) {
            return createEmphasis({
                class: ["editor-selector__preview-null"]
            }, "null");
        }

        const { name, nature, value, attributes } = conceptValue;

        if (["string", "number", "boolean"].includes(name)) {
            return createSpan({
                class: ["editor-selector__preview-text"]
            }, value);
        } else if (name === "set") {
            let list = createUnorderedList({
                class: ["bare-list", "editor-selector__preview-list"]
            });

            if (Array.isArray(value)) {
                value.forEach(val => {
                    let item = createListItem({
                        class: ["editor-selector__preview-list-item"]
                    }, PreviewHandler.value(val));

                    list.append(item);
                });
            }

            return list;
        } else if (nature === "prototype") {
            let fragment = createDocFragment();

            let target = createSpan({
                class: ["editor-selector__preview-text"]
            }, value.name);

            fragment.append(target, PreviewHandler.value(value));

            return fragment;
        } else if (attributes) {
            let list = createUnorderedList({
                class: ["bare-list", "editor-selector__preview-attributes"]
            });

            attributes.forEach(attr => {
                const { name, value } = attr;

                let attrElement = createSpan({
                    class: ["editor-selector__preview-text", "editor-selector__preview-text--attribute"]
                }, name);

                let item = createListItem({
                    class: ["editor-selector__preview-attribute"]
                }, [attrElement, PreviewHandler.value(value)]);

                list.append(item);
            });

            return list;
        } else if (value) {
            return PreviewHandler.value(value);
        }

        return conceptValue.toString();
    },
    "concept": function (concept) {
        const fragment = createDocFragment();

        if (Array.isArray(concept.attributes)) {
            let attrList = createUnorderedList({
                class: ["bare-list", "editor-selector__attributes"]
            });

            concept.attributes.forEach(attr => {
                const { name, required, target = {} } = attr;

                let attrElement = createSpan({
                    class: ["editor-selector__preview-text", "editor-selector__preview-text--attribute"]
                }, name);

                let targetElement = createSpan({
                    class: ["editor-selector__preview-text", "editor-selector__preview-text--target"]
                }, target.name);

                if (target.accept && target.accept.name) {
                    targetElement.append(createSpan({
                        class: ["editor-selector__preview-text--target-accept"]
                    }, target.accept.name));
                }

                /** @type {HTMLElement} */
                let item = createListItem({
                    class: ["editor-selector__attribute"]
                }, [attrElement, targetElement]);

                if (required) {
                    item.classList.add("required");

                    let requiredBadge = createI({
                        class: ["editor-selector__badge"],
                    });
                }

                attrList.append(item);
            });

            fragment.append(attrList);
        }

        return fragment;
    },
    "resource": function (resource) {
        const fragment = createDocFragment();

        return fragment;
    }
};

const ActionHandler = {
    "projection": function (projection) {
        const fragment = createDocFragment();

        let btnEdit = createButton({
            class: ["btn", "editor-selector__action-bar-button", "editor-selector__action-bar-button", "editor-selector__action-bar-button--clone"],
            dataset: {
                action: "edit:projection",
                id: projection.id,
            }
        }, "Edit");

        fragment.append(btnEdit);

        return fragment;
    },
    "value": function (value) {
        const fragment = createDocFragment();

        let btnClone = createButton({
            class: ["btn", "editor-selector__action-bar-button", "editor-selector__action-bar-button--clone"],
            dataset: {
                action: "create-instance:value",
                id: value.id,
            }
        }, createI({
            class: ["ico", "ico-plus", "btn-content"],
            dataset: {
                ignore: "all",
            }
        }, "+"));

        let btnCopy = createButton({
            class: ["btn", "editor-selector__action-bar-button", "editor-selector__action-bar-button--clone"],
            dataset: {
                action: "copy:value",
                id: value.id,
            }
        }, createI({
            class: ["ico", "ico-copy", "btn-content"],
            dataset: {
                ignore: "all",
            }
        }));

        let btnDelete = createButton({
            class: ["btn", "editor-selector__action-bar-button", "editor-selector__action-bar-button--delete"],
            dataset: {
                action: "delete:value",
                id: value.id,
            }
        }, createI({
            class: ["ico", "ico-delete", "btn-content"],
            dataset: {
                ignore: "all",
            }
        }, "✖"));

        fragment.append(btnDelete, btnCopy, btnClone);

        return fragment;
    },
    "concept": function (concept) {
        const fragment = createDocFragment();

        let hasProjection = this.editor.projectionModel.hasProjectionSchema(concept);

        /** @type {HTMLButtonElement} */
        let btnCreate = createButton({
            class: ["btn", "editor-selector__action-bar-button", "editor-selector__action-bar-button--clone"],
            disabled: !hasProjection,
            title: `Create an instance of "${concept.name}"`,
            dataset: {
                action: "create-instance",
                concept: concept.name
            }
        }, createI({
            class: ["ico", "ico-plus", "btn-content"],
            dataset: {
                ignore: "all",
            }
        }, "+"));

        if (!hasProjection) {
            btnCreate.title = `The concept ${concept.name} has no projection`;
        }

        fragment.append(btnCreate);

        return fragment;
    },
    "resource": function (rscx) {
        const { name, type, required } = rscx;

        const fragment = createDocFragment();

        let btnAdd = createButton({
            class: ["btn", "editor-selector__action-bar-button", "editor-selector__action-bar-button--add"],
            dataset: {
                action: "load-resource",
                id: name
            }
        }, createI({
            class: ["ico", "ico-plus", "btn-content"],
            dataset: {
                ignore: "all",
            }
        }, "+"));

        let btnDelete = createButton({
            class: ["btn", "editor-selector__action-bar-button", "editor-selector__action-bar-button--delete"],
            dataset: {
                action: "delete:resource",
                id: name,
            }
        }, createI({
            class: ["ico", "ico-delete", "btn-content"],
            dataset: {
                ignore: "all",
            }
        }, "✖"));

        if (this.editor.getResource(name)) {
            fragment.append(btnDelete);
        } else {
            fragment.append(btnAdd);
        }

        return fragment;
    },
};
