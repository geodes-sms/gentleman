import {
    createDocFragment, createDiv, createH2, createUnorderedList, createListItem,
    createParagraph, createButton, createHeader, createAnchor, createInput, createSpan,
    getElement, getElements, removeChildren, isHTMLElement, hasOwn,
    isNullOrWhitespace, isNullOrUndefined, isNull, copytoClipboard, cloneObject,
    valOrDefault, isEmpty, createI, findAncestor,
} from 'zenkai';
import { show, hide, Events } from '@utils/index.js';
import { MetaModel, ConceptModel } from '@model/index.js';
import { ProjectionFactory } from '@projection/index.js';
import { Loader, LoaderFactory } from './loader.js';
import { StackLayout } from './builder-ui/stack-layout.js';
import { TableLayout } from './builder-ui/table-layout.js';
import { WrapLayout } from './builder-ui/wrap-layout.js';


var inc = 0;

const nextFieldId = () => `ExplorerField${inc++}`;
const nextLayoutId = () => `BuilderLayout${inc++}`;

export const Builder = {
    /** @type {Editor} */
    editor: null,
    /** @type {MetaModel} */
    metamodel: null,
    /** @type {Model} */
    model: null,
    /** @type {Model} */
    concept: null,
    /** @type {*[]} */
    data: null,
    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    header: null,
    /** @type {HTMLElement} */
    body: null,
    /** @type {HTMLElement} */
    footer: null,
    /** @type {HTMLElement[]} */
    selectors: null,
    /** @type {Map} */
    fields: null,
    /** @type {HTMLElement} */
    dragElement: null,

    /** @type {boolean} */
    active: false,

    init(metamodel, concept) {
        this.metamodel = metamodel;

        this.concept = concept;

        this.fields = new Map();

        this.loader = LoaderFactory.create({
            afterLoadMetaModel: (metamodel) => {
                this.init(metamodel);
            }
        }).init(this);

        this.render();

        if (this.concept) {
            this.createProjection(this.concept);
        }

        return this;
    },

    registerField(field) {
        field.editor = this;
        this.fields.set(field.id, field);

        return this;
    },
    unregisterField(field) {
        var _field = this.fields.get(field.id);

        if (_field) {
            _field.editor = null;
            this.fields.delete(_field.id);
        }

        return this;
    },
    reset() {
        this.active = false;

        return this;
    },
    /**
     * Creates a layout element and appends it to the body
     * @param {string} type 
     */
    createLayout(type) {
        var layout = null;
        switch (type) {
            case "stack":
                layout = Object.create(StackLayout).init();
                break;
            case "wrap":
                layout = Object.create(WrapLayout).init();
                break;
            case "table":
                layout = Object.create(TableLayout).init();
                break;
            default:
                break;
        }

        if (layout) {
            layout.id = nextLayoutId();

            let container = createDiv({
                class: ["projection-container"]
            });
            container.appendChild(layout.render());
            this.append(container);
            layout.builder = this;
        }

        return layout;
    },
    update(message, value) {
        this.refresh();
    },
    /**
     * Appends an element to the field container
     * @param {HTMLElement} element 
     */
    append(element) {
        this.body.appendChild(element);

        return this;
    },
    /**
     * Renders the builder in a container
     * @param {HTMLElement} container 
     */
    render(container) {
        var fragment = createDocFragment();


        if (!isHTMLElement(this.header)) {
            this.header = createDiv({
                class: ["builder-header"]
            });

            let btnClose = createButton({
                class: ["btn", "btn-close"],
                dataset: {
                    action: "close"
                }
            });
            let toolbar = createDiv({
                class: ["builder-toolbar"]
            }, [btnClose]);

            this.header.appendChild(toolbar);

            fragment.appendChild(this.header);
        }

        if (!isHTMLElement(this.body)) {
            this.body = createDiv({
                class: ["builder-body"]
            });
            fragment.appendChild(this.body);
        }

        if (!isHTMLElement(this.footer)) {
            this.footer = createDiv({
                class: ["builder-footer", "hidden"]
            });
            fragment.appendChild(this.footer);
        }

        if (!isHTMLElement(this.selectors)) {
            this.selectors = buildSelector.call(this);
            this.footer.appendChild(this.selectors);
        }

        if (fragment.hasChildNodes()) {
            this.container.appendChild(fragment);
            this.bindEvents();
        }

        if (isHTMLElement(container)) {
            container.appendChild(this.container);
        }

        this.refresh();

        return this.container;
    },
    refresh() {
        if (isNullOrUndefined(this.concept)) {
            this.displayConcept();
        } else if (this.body.childElementCount === 0) {
            this.body.classList.add("empty");
            this.displayHome();
        } else {
            this.body.classList.remove("empty");
        }
    },
    clear() {
        removeChildren(this.body);

        Events.emit('builder.clear');

        return this;
    },
    open() {
        this.active = true;
        show(this.container);
        this.container.classList.replace('close', 'open');

        Events.emit('builder.open');

        return this;
    },
    close() {
        this.container.classList.replace('open', 'close');
        hide(this.container);
        this.active = false;

        Events.emit('builder.close');

        return this;
    },
    displayHome() {
        /** @type {HTMLLIElement} */
        const stackSelector = createListItem({
            class: ["builder-selector", "builder-selector--layout", "builder-selector--stack"],
            draggable: true,
            dataset: {
                selector: "stack"
            },
        }, "Stack");
        /** @type {HTMLLIElement} */
        const wrapSelector = createListItem({
            class: ["builder-selector", "builder-selector--layout", "builder-selector--wrap"],
            draggable: true,
            dataset: {
                selector: "wrap"
            },
        }, "Wrap");
        // /** @type {HTMLLIElement} */
        // const relativeSelector = createListItem({
        //     class: ["builder-selector", "builder-selector--layout", "builder-selector--wrap"],
        //     draggable: true,
        //     dataset: {
        //         selector: "relative"
        //     },
        // }, "Relative");
        /** @type {HTMLLIElement} */
        const tableSelector = createListItem({
            class: ["builder-selector", "builder-selector--layout", "builder-selector--table"],
            draggable: true,
            dataset: {
                selector: "table"
            },
        }, "Table");

        var fragment = createDocFragment();

        const heading = createParagraph({
            class: ["font-gentleman"]
        }, "Select a layout to begin your projection");
        /** @type {HTMLUListElement} */
        const selectors = createUnorderedList({
            class: ["bare-list", "builder-selector-list"]
        }, [stackSelector, wrapSelector, tableSelector]);

        fragment.append(heading, selectors);

        selectors.addEventListener('click', (event) => {
            const target = event.target;
            const { selector } = target.dataset;
            if (selector) {
                this.createLayout(selector);
                removeChildren(selectors);
                show(this.footer);
                selectors.remove();
            }
        });

        this.clear();
        this.append(fragment);

        return this;
    },
    displayConcept() {
        const fragment = createDocFragment();

        var concepts = this.model.getConcepts("concrete_concept");

        /** @type {HTMLParagraphElement} */
        const heading = createParagraph({
            class: ["font-gentleman"]
        }, isEmpty(concepts) ? "Create a concept first to start building a projection" : "Please select one of the following concepts to begin working on a projection");

        /** @type {HTMLUListElement} */
        const selectors = createUnorderedList({
            class: ["bare-list", "builder-selector-list"]
        });

        concepts.forEach(concept => {
            var projection = ProjectionFactory.createProjection(concreteConceptSchema, concept, this).init();
            var item = createListItem({
                class: ["builder-selector", "builder-selector--concept"],
                dataset: {
                    concept: concept.id
                }
            }, projection.render());
            selectors.appendChild(item);
        });

        fragment.append(heading, selectors);

        /**
         * Get the choice element
         * @param {HTMLElement} element 
         */
        const getItem = (element) => element.parentElement === selectors ? element : findAncestor(element, (el) => el.parentElement === selectors);

        selectors.addEventListener('click', (event) => {
            const { target } = event;

            const item = getItem(target);
            const { concept: id } = item.dataset;

            if (id) {
                let concept = this.model.getConcept(id);
                this.concept = concept;
                this.header.appendChild(createDiv({
                    class: ["builder-header-concept"],
                }, [item.firstChild]));

                this.clear();
                this.refresh();
            }
        });

        this.clear();
        this.append(fragment);

        return this;
    },
    bindEvents() {
        var lastKey = null;
        var index = 0;

        this.container.addEventListener('click', (e) => {
            if (e.target.dataset.action === "close") {
                this.close();
            }
        });

        this.container.addEventListener('dragstart', (event) => {
            this.dragElement = event.target;
            this.body.classList.add("dragging");
        });

        this.container.addEventListener('dragend', (event) => {
            var areas = getElements('.drop-area', this.container);
            Array.from(areas).forEach(area => area.classList.remove('highlight'));
        });

        this.container.addEventListener('drop', (event) => {
            this.dragElement = null;
        });
    }
};

const concreteConceptSchema = [
    {
        readonly: true,
        "layout": {
            "type": "wrap",
            "disposition": ["#name"]
        }
    }
];

function buildSelector() {
    /** @type {HTMLLIElement} */
    const stackSelector = createListItem({
        class: ["builder-selector", "builder-selector--stack"],
        draggable: true,
        dataset: {
            selector: "stack"
        },
    }, "Stack");
    /** @type {HTMLLIElement} */
    const wrapSelector = createListItem({
        class: ["builder-selector", "builder-selector--wrap"],
        draggable: true,
        dataset: {
            selector: "wrap"
        },
    }, "Wrap");
    /** @type {HTMLLIElement} */
    const tableSelector = createListItem({
        class: ["builder-selector", "builder-selector--table"],
        draggable: true,
        dataset: {
            selector: "table"
        },
    }, "Table");
    /** @type {HTMLLIElement} */
    const textSelector = createListItem({
        class: ["builder-selector", "builder-selector--input"],
        draggable: true,
        dataset: {
            selector: "input"
        },
    }, "Text");
    /** @type {HTMLLIElement} */
    const listSelector = createListItem({
        class: ["builder-selector", "builder-selector--list"],
        draggable: true,
        dataset: {
            selector: "list"
        },
    }, "List");
    /** @type {HTMLLIElement} */
    const linkSelector = createListItem({
        class: ["builder-selector", "builder-selector--link"],
        draggable: true,
        dataset: {
            selector: "link"
        },
    }, "Link");
    /** @type {HTMLLIElement} */
    const choiceSelector = createListItem({
        class: ["builder-selector", "builder-selector--choice"],
        draggable: true,
        dataset: {
            selector: "choice"
        },
    }, "Choice");

    /** @type {HTMLUListElement} */
    const selectors = createUnorderedList({
        class: ["bare-list", "builder-selector-group"]
    }, [
        createListItem({ class: ["builder-selector-group-item"] }, [
            createSpan({ class: ["title", "builder-selector-group-item-title"] }, "LAYOUT"),
            createUnorderedList({
                class: ["bare-list", "builder-selector-list"]
            }, [stackSelector, wrapSelector, tableSelector])]),
        createListItem({ class: ["builder-selector-group-item"] }, [
            createSpan({ class: ["title", "builder-selector-group-item-title"] }, "FIELD"),
            createUnorderedList({
                class: ["bare-list", "builder-selector-list"]
            }, [textSelector, listSelector, linkSelector, choiceSelector])])
    ]);

    selectors.addEventListener('click', (event) => {
        const target = event.target;
        const { selector } = target.dataset;
        if (selector) {
            this.createLayout(selector);
        }
    });

    return selectors;
}