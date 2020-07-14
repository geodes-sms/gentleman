import {
    createDocFragment, createUnorderedList, createListItem, createStrong,
    createSpan, createDiv, createButton, createInput, createLabel, findAncestor,
    removeChildren, isHTMLElement, isNullOrWhitespace, isNullOrUndefined,
    capitalize, valOrDefault,
} from 'zenkai';
import { show, hide, Key, Events } from '@utils/index.js';
import { ProjectionManager } from '@projection/index.js';


function getModelConcepts() {
    return this.model.concepts.filter((concept) => this.metamodel.isConcrete(concept.name));
}

export const Explorer = {
    /** @type {MetaModel} */
    metamodel: null,
    /** @type {Model} */
    model: null,
    /** @type {Concept} */
    concept: null,

    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    header: null,
    /** @type {HTMLElement} */
    body: null,
    /** @type {HTMLElement} */
    footer: null,
    /** @type {HTMLElement} */
    selectorElement: null,
    /** @type {HTMLElement} */
    selectorList: null,

    /** @type {HTMLInputElement} */
    input: null,
    /** @type {HTMLUListElement} */
    results: null,

    /** @type {boolean} */
    active: false,
    /** @type {Map} */
    fields: null,

    init(metamodel, model, concept) {
        this.metamodel = metamodel;
        this.model = model;
        this.concept = concept;

        this.fields = new Map();

        this.render();

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

    open() {
        this.active = true;
        show(this.container);
        this.container.classList.replace('close', 'open');
        this.input.focus();

        Events.emit('explorer.open');

        return this;
    },
    close() {
        this.active = false;
        hide(this.container);
        this.container.classList.replace('open', 'close');

        Events.emit('explorer.close');

        return this;
    },
    clear() {
        removeChildren(this.results);
        this.input.value = "";

        return this;
    },
    render(container) {
        const fragment = createDocFragment();

        if (!isHTMLElement(this.header)) {
            this.header = createDiv({
                class: ["explorer-header"],
                tabindex: -1,
            });

            let btnClose = createButton({
                class: ["btn", "btn-close"],
                dataset: {
                    action: "close"
                }
            });
            let toolbar = createDiv({
                class: ["explorer-toolbar"],
            }, [btnClose]);

            this.header.appendChild(toolbar);
            const { refname, name } = this.activeConcept;

            if (this.concept) {
                this.header.appendChild(createDiv({
                    class: ["explorer-header-concept"]
                }, `${refname} (${name})`));
            }

            fragment.appendChild(this.header);
        }

        if (!isHTMLElement(this.body)) {
            this.body = createDiv({
                class: ["explorer-body"],
                tabindex: -1,
            });
            fragment.appendChild(this.body);
        }

        if (!isHTMLElement(this.footer)) {
            this.footer = createDiv({
                class: ["editor-footer"],
                tabindex: -1
            });

            fragment.appendChild(this.footer);
        }

        if (!isHTMLElement(this.selectorElement)) {
            this.selectorElement = createButton({
                class: ["btn", "explorer-header-concept", "hidden"],
            });
            this.header.appendChild(this.selectorElement);
        }

        if (!isHTMLElement(this.selectorList)) {
            this.selectorList = createUnorderedList({
                class: ["bare-list", "explorer-selector-list", "hidden"],
            });
            fragment.appendChild(this.selectorList);
        }

        if (!isHTMLElement(this.input)) {
            this.input = createInput({
                class: ["explorer-input", "hidden"],
                placeholder: "Rechercher..."
            });
            fragment.appendChild(this.input);
        }

        if (!isHTMLElement(this.results)) {
            this.results = createUnorderedList({
                class: ["bare-list", "explorer-results"],
            });
            this.body.appendChild(this.results);
        }

        if (fragment.hasChildNodes) {
            this.container.appendChild(fragment);
        }

        if (isHTMLElement(container)) {
            container.appendChild(this.container);
        }

        this.clear();
        this.refresh();
        this.bindEvents();

        return this.container;
    },
    update(data) {
        const fragment = createDocFragment();

        fragment.appendChild(createListItem({
            class: ["explorer-result-title"]
        }, "Attribute"));
        data.filter(val => val.type === "attribute").forEach(attr => {
            var title = "Target concept";
            var content = `${attr.target}${attr.accept ? `:${attr.accept}` : ""}`;
            fragment.appendChild(createResultItem(attr, title, content));
        });

        fragment.appendChild(createListItem({
            class: ["explorer-result-title"]
        }, "Component"));
        data.filter(val => val.type === "component").forEach(comp => {
            var title = "Attributes";
            var content = comp.attributes.join(", ");
            fragment.appendChild(createResultItem(comp, title, content));
        });

        removeChildren(this.results);
        this.results.appendChild(fragment);

        return this;
    },

    refresh() {
        if (isNullOrUndefined(this.concept)) {
            removeChildren(this.selectorList);

            getModelConcepts.call(this).forEach(concept => {
                var projectionSchema = this.metamodel.getProjectionSchema(concept.name).filter((p) => p.environment === "explorer");
                var projection = ProjectionManager.createProjection(projectionSchema, concept, this).init();
                var item = createListItem({
                    class: ["explorer-selector", "explorer-selector--concept"],
                    dataset: {
                        concept: concept.id
                    }
                }, projection.render());
                this.selectorList.appendChild(item);
            });
            show(this.selectorList);
            hide(this.results);
            hide(this.selectorElement);
        } else {
            show(this.selectorElement);
            hide(this.selectorList);
            show(this.results);
            this.update(this.concept.getStructure());
        }

        return this;
    },
    query(value) {
        var data = this.concept.getStructure().slice(0);

        if (!isNullOrWhitespace(value)) {
            var values = value.trim().replace(/\s+/g, " ").split(' ');
            data = data.filter(val => values.some(q => {
                let found = false;
                if (val.alias) {
                    found = val.alias.includes(q);
                }

                return found || val.name.includes(q);
            }));
        }

        this.update(data);

        return this;
    },
    bindEvents() {
        var lastKey = null;
        var index = 0;

        this.container.addEventListener('keydown', (event) => {
            var rememberKey = false;

            switch (event.key) {
                case Key.backspace:
                    break;
                case Key.ctrl:
                    event.preventDefault();
                    rememberKey = true;
                    break;
                case Key.delete:
                    break;
                case Key.alt:
                    rememberKey = true;
                    break;
                case Key.enter:
                    break;
                case Key.right_arrow:
                    break;
                case Key.up_arrow:
                    if (index > 0) {
                        index--;
                        this.results.children[index].focus();
                    }
                    break;
                case Key.down_arrow:
                    if (index < this.results.childElementCount) {
                        this.results.children[index].focus();
                        index++;
                    }
                    break;
                case Key.escape:
                    rememberKey = false;
                    this.close();
                    break;
                default:
                    break;
            }

            if (rememberKey) {
                lastKey = event.key;
            }

        }, false);

        this.container.addEventListener('click', (e) => {
            if (e.target.dataset.action === "close") {
                this.close();
            }
        });

        this.results.addEventListener('change', (event) => {
            let target = event.target;
            let [name, type] = target.value.split(':');
            var structure = null;

            if (type === "attribute") {
                structure = this.concept.createAttribute(name);
            } else if (type === "component") {
                structure = this.concept.createComponent(name);
            }
            // this.concept.listeners.forEach(listener => {
            //     listener.update(type, structure);
            // });

            target.disabled = true;
        });

        this.input.addEventListener('input', (event) => {
            this.query(this.input.value.trim());
            index = 0;
        });

        this.input.addEventListener('blur', (event) => {
            if (isNullOrWhitespace(this.input.value)) {
                this.input.value = "";
            }
        });


        /**
         * Get the choice element
         * @param {HTMLElement} element 
         */
        const getItem = (element) => element.parentElement === this.selectorList ? element : findAncestor(element, (el) => el.parentElement === this.selectorList);
        this.selectorList.addEventListener('click', (event) => {
            const { target } = event;

            const item = getItem(target);
            const { concept: id } = item.dataset;

            if (id) {
                let concept = this.model.getConcept(id);
                this.concept = concept;
                this.selectorElement.textContent = concept.fullName;

                this.clear();
                this.refresh();
            }
        });

        this.selectorElement.addEventListener('click', (event) => {
            show(this.selectorList);
        });

        // this.container.addEventListener('click', function (e) {
        //     const target = e.target;
        //     const { id, object, name } = this.dataset;
        //     var concept = null;
        //     if (object === "concept") {
        //         concept = self.model.concepts.find((concept) => concept.id === id);
        //     } else if (object === "component") {
        //         let parentConcept = concept = self.model.concepts.find((concept) => concept.id === id);
        //         concept = parentConcept.getComponent(name);
        //     } else {
        //         return;
        //     }
        // });
    }
};

function createResultItem(struct, title, content) {
    const { name, alias, type, created, required } = struct;

    const checkbox = createInput({
        type: "checkbox",
        class: ["explorer-result-item__checkbox"],
        value: `${name}:${type}`,
        disabled: true,
    });
    checkbox.id = `${capitalize(name)}${capitalize(type)}`;
    checkbox.checked = created;
    checkbox.required = required;

    const lblName = createSpan({
        class: ["explorer-result-item__label-name"]
    }, valOrDefault(alias, name));

    const lblInfo = createSpan({
        class: ["explorer-result-item__label-info"]
    }, [
        `${title}: `, createStrong({
            class: ["concept-name"]
        }, `${content}`)
    ]);

    const label = createLabel({
        class: ["explorer-result-item__label"]
    }, [lblName, lblInfo]);
    label.htmlFor = checkbox.id;

    var btnAdd = createButton({
        type: "button",
        class: ["btn", "btn-add", "explorer-result-item__button"],
        disabled: created,
        dataset: {
            action: "add",
        },
    }, "+");
    var btnRemove = createButton({
        type: "button",
        class: ["btn", "btn-remove", "explorer-result-item__button"],
        disabled: required,
        dataset: {
            action: "remove",
        }
    }, "-");

    var result = createListItem({
        class: ["explorer-result-item"],
        dataset: {
            value: name,
            required: required
        }
    }, [checkbox, label, btnAdd, btnRemove]);
    result.tabIndex = -1;

    return result;
}
