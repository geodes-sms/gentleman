import {
    createDiv, createButton, createUnorderedList, createListItem, createSpan, createParagraph,
    createI, valOrDefault, removeChildren, isHTMLElement, isNullOrUndefined, createDocFragment,
    createInput, createLabel, toBoolean
} from 'zenkai';
import { hide, show, _b, _i } from '@utils/index.js';


const Nature = {
    PRIMITIVE: "E",
    CONCRETE: "C",
    PROTOTYPE: "P",
    DERIVATIVE: "D",
};

export const FileIO = {
    /** @type {*} */
    file: null,
    /** @type {string} */
    title: null,
    /** @type {string} */
    status: null,

    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    mainView: null,
    /** @type {HTMLElement} */
    infoView: null,
    /** @type {HTMLElement} */
    files: null,
    /** @type {HTMLButtonElement} */
    btnLoad: null,
    /** @type {HTMLButtonElement} */
    btnUnload: null,
    /** @type {HTMLButtonElement} */
    btnDownload: null,
    /** @type {HTMLButtonElement} */
    btnEdit: null,
    /** @type {HTMLElement} */
    selection: null,
    /** @type {Map} */
    concepts: null,
    /** @type {*} */
    selectedConcept: null,
    /** @type {Map} */
    attributes: null,
    /** @type {ConceptFilter} */
    filter: null,

    init() {
        this.concepts = new Map();
        this.attributes = new Map();

        this.filter = Object.create(ConceptFilter, {
            editor: { value: this.editor },
            settings: { value: this }
        }).init([
            { label: "Concrete", nature: "concrete" },
            { label: "Prototype", nature: "prototype" },
            { label: "Derivative", nature: "derivative" },
        ]);

        return this;
    },

    get hasFile() { return this.concepts.size > 0; },
    get hasSelection() { return !isNullOrUndefined(this.selection); },
    getFile() {
        return this.file;
    },
    setFile(file) {
        this.file = file;

        this.refresh();
    },
    refresh() {
        if (!this.hasFile) {
            this.container.classList.add("empty");
            hide(this.files);
        } else {
            this.container.classList.remove("empty");
            show(this.files);
        }
        this.btnUnload.disabled = !this.hasFile;

        if (this.editor.isReady) {
            hide(this.placeholder);
            this.placeholder.classList.remove("error");
        } else if (!this.hasFile) {
            this.placeholder.innerHTML = `Add your ${_b("concepts")} and ${_b("projections")} or load a previously saved ${_b("model")}`;
            this.placeholder.classList.remove("error");
        } else {
            if (!this.editor.hasConceptModel) {
                this.placeholder.innerHTML = `${_b("Missing projections")}`;
            }

            if (!this.editor.hasProjectionModel) {
                this.placeholder.innerHTML = `${_b("Missing projections")}`;
            }

            this.placeholder.classList.add("error");
            show(this.placeholder);
        }

        if (!this.hasSelection) {
            hide(this.infoView);
        } else {
            show(this.infoView);
        }

        return this;
    },
    reload() {
        if (!this.editor.hasConceptModel) {
            return;
        }

        const concepts = this.editor.conceptModel.schema;

        concepts.forEach(c => {
            let item = createListItem({
                class: [`editor-file-concept`],
                dataset: {
                    name: c.name,
                    nature: c.nature,
                    root: valOrDefault(c.root, `false`),
                }
            }, c.name);

            if (c.root) {
                let icoRoot = createI({
                    class: ["editor-file-concept-root"],
                    title: "root concept",
                });
    
                item.append(icoRoot);
            }

            this.concepts.set(c.name, item);

            this.files.append(item);
        });
        

        this.refresh();
    },
    render() {
        /** @type {HTMLElement} */
        this.container = createDiv({
            class: ["editor-file"]
        });

        let actionBar = createDiv({
            class: ["editor-file-actionbar"]
        });

        this.btnLoad = createButton({
            class: ["btn", `editor-file__browse-button`],
            title: `Load file in editor`,
            dataset: {
                action: `load`,
            },
        }, "Browse");

        this.btnImport = createButton({
            class: ["btn", `editor-file__browse-button`],
            title: `Load file in editor`,
            dataset: {
                action: `load`,
            },
        }, "Import");

        this.btnUnload = createButton({
            class: ["btn", "editor-file-actionbar__button", "editor-file-actionbar__btn-remove"],
            title: `Remove all files`,
            dataset: { action: `unload`, },
        });

        actionBar.append(this.btnLoad, this.btnUnload);

        this.mainView = createDiv({
            class: ["editor-file-mainview"]
        });

        /** @type {HTMLElement} */
        this.files = createUnorderedList({
            class: ["bare-list", "editor-file__list"]
        });

        this.infoView = createDiv({
            class: ["detail-area", "editor-file-detail"]
        });



        // let dropArea = createDiv({
        //     class: ["drop-area", "editor-file-main"]
        // });

        this.placeholder = createParagraph({
            class: ["editor-file-placeholder"],
            html: `Add your ${_b("concepts")}, ${_b("projections")} and all other ${_b("resources")}`
        });

        // dropArea.append(this.placeholder);


        this.mainView.append(this.filter.render(), this.files, this.infoView);

        this.container.append(actionBar, this.mainView);

        this.bindEvents();

        this.refresh();

        return this.container;
    },
    clear() {
        removeChildren(this.files);
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
    selectItem(name) {
        let item = this.concepts.get(name);

        if (isHTMLElement(this.selection)) {
            this.selection.classList.remove("selected");
        }

        this.selection = item;
        this.selection.classList.add("selected");
        this.displayInfo(name);

        this.refresh();
    },
    /**
     * Displays the concept info
     * @param {string} cname 
     */
    displayConcept(cname) {
        if (isNullOrUndefined(cname)) {
            return;
        }

        let schema = this.editor.conceptModel.getConceptSchema(cname);

        if (isNullOrUndefined(schema)) {
            return;
        }

        this.selection = cname;

        const { name, nature, attributes } = schema;

        let container = createDiv({
            class: ["app-model-concept"]
        });

        let header = createDiv({
            class: ["app-model-concept-header"]
        });

        let natureElement = createI({
            class: ["app-model-concept-nature"],
            dataset: {
                name: nature
            }
        }, Nature[nature.toUpperCase()]);

        let nameElement = createSpan({
            class: ["app-model-concept-name"]
        }, name);

        header.append(natureElement, nameElement);

        let attributesElement = createUnorderedList({
            class: ["bare-list", "app-model-concept-attributes"]
        });

        if (Array.isArray(attributes)) {
            attributes.forEach(attr => {
                let element = createListItem({
                    class: ["app-model-concept-attribute"],
                    dataset: {
                        name: attr.name,
                        type: "attribute"
                    }
                });

                let header = createDiv({
                    class: ["app-model__attribute-header"]
                });

                let nameElement = createSpan({
                    class: ["app-model__attribute-name"]
                }, attr.name);
        
                if (attr.required) {
                    let requiredElement = createI({
                        class: ["app-model__attribute-required"]
                    }, createSpan({ class: ["help"] }, "required"));
        
                    header.append(requiredElement);
                }

                header.append(nameElement);
        
                let targetElement = createDiv({
                    class: ["app-model__attribute-target"]
                }, targetHandler(attr.target));
        
                let infoElement = createDiv({
                    class: ["app-model__attribute-info"]
                }, [header, targetElement]);
        
                element.append(infoElement);

                this.attributes.set(attr.name, element);

                attributesElement.append(element);
            });
        }

        container.append(header, attributesElement);

        removeChildren(this.infoView);
        this.infoView.append(container);

        this.selectedConcept = schema;


        // let nameElement = createSpan({
        //     class: ["app-model__attribute-name"]
        // }, name);

        // let header = createDiv({
        //     class: ["app-model__attribute-header"]
        // }, [nameElement]);

        // if (required) {
        //     let requiredElement = createI({
        //         class: ["app-model__attribute-required"]
        //     }, createSpan({ class: ["help"] }, "required"));

        //     header.append(requiredElement);
        // }

        // let targetElement = createDiv({
        //     class: ["app-model__attribute-target"]
        // }, targetHandler(target));

        // let infoElement = createDiv({
        //     class: ["app-model__attribute-info"]
        // }, [header, targetElement]);

        // this.body.append(infoElement);

        // this.extras.forEach(element => removeChildren(element).remove());
        // this.extras = [];
        // this.extras.push(infoElement);

        this.refresh();
    },
    selectAttribute(name) {
        if (isNullOrUndefined(name)) {
            return false;
        }

        if (this.selectedAttribute === name) {
            return false;
        }

        if (this.selectedAttribute) {
            let element = this.attributes.get(this.selectedAttribute);
            element.classList.remove("selected");
        }

        if (!this.attributes.has(name)) {
            return false;
        }

        this.selectedAttribute = name;
        let element = this.attributes.get(name);
        element.classList.add("selected");

        this.displayAttribute(name);

        this.refresh();

        return true;
    },
    displayAttribute(attrName) {
     

        this.refresh();
    },

    bindEvents() {
        this.editor.registerHandler("editor.load-concept@post", (args) => {
            this.reload();
        });

        this.editor.registerHandler("editor.unload-concept@post", (args) => {
            this.reload();
        });

        this.editor.registerHandler("editor.unload-projection@post", (args) => {
            this.reload();
        });

        this.container.addEventListener('dragenter', (event) => {
            this.container.classList.add('highlight');

            event.preventDefault();
            event.stopPropagation();
        }, false);

        this.container.addEventListener('dragleave', (event) => {
            this.container.classList.remove('highlight');

            event.preventDefault();
            event.stopPropagation();
        }, false);

        this.container.addEventListener('dragover', (event) => {
            this.container.classList.add('highlight');

            event.preventDefault();
            event.stopPropagation();
        }, false);

        this.container.addEventListener('drop', (event) => {
            this.container.classList.remove('highlight');

            let file = event.dataTransfer.files[0];

            if (!file.name.endsWith('.json')) {
                this.notify("This file is not supported. Please use a .json file");
                return;
            }

            let reader = new FileReader();
            reader.onload = (e) => {
                this.editor.load(reader.result, this.type);
            };
            reader.readAsText(file);

            event.preventDefault();
            event.stopPropagation();
        }, false);

        this.container.addEventListener('click', (event) => {
            const { target } = event;

            const { type, name } = target.dataset;

            this.displayConcept(name);
             
            if (type === "attribute") {
                this.selectAttribute(name);
            } else if (type === "concept") {
                this.parent.selectConcept(name);
            }
        });


    }
};

function targetHandler(target) {
    const fragment = createDocFragment();

    if (isNullOrUndefined(target)) {
        return fragment;
    }

    const { name, accept } = target;

    let nameElement = createSpan({
        class: ["target-name"],
        dataset: {
            type: "concept",
            name: name
        }
    }, name);

    fragment.append(nameElement);

    if (accept) {
        let acceptElement = createDiv({
            class: ["target-accept"]
        });

        if (Array.isArray(accept)) {
            acceptElement.append(...accept.map(schema => targetHandler(schema)));
            acceptElement.classList.add("array");
        } else {
            acceptElement.append(targetHandler(accept));
        }

        fragment.append(acceptElement);
    }

    return fragment;
}

const ConceptFilter = {
    /** @type {HTMLElement} */
    container: null,
    /** @type {*[]} */
    values: null,
    /** @type {Map} */
    filters: null,
    /** @type {*} */
    concepts: null,

    init(values) {
        this.values = valOrDefault(values, []);

        let id = 1;
        this.values.forEach(element => {
            element.id = id++;
        });
        this.filters = new Map();

        return this;
    },
    refresh() {
        this.filters.forEach((checkbox, key) => {
            if (checkbox.checked) {
                checkbox.parentElement.classList.add("checked");
            } else {
                checkbox.parentElement.classList.remove("checked");
            }
        });
    },
    render() {
        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: "concept-filter"
            });
        }

        this.search = createInput({
            class: ["concept-filter-search"]
        });

        this.values.forEach(value => {
            let checkbox = createInput({
                class: ["cf-option-checkbox"],
                type: "checkbox",
                checked: true,
                value: value.id,
            });

            let text = createSpan({
                class: ["cf-option-text"]
            }, value.label);

            let label = createLabel({
                class: "concept-filter-option"
            }, [checkbox, text]);

            this.filters.set(value, checkbox);

            this.container.append(label);
        });

        this.bindEvents();

        this.refresh();

        return this.container;
    },
    filterConcepts() {
        this.settings.concepts.forEach((item, key) => {
            const { nature, root } = item.dataset;

            this.filters.forEach((checkbox, filter) => {
                if (filter.nature === nature) {
                    checkbox.checked ? show(item) : hide(item);
                }

                if (filter.root === toBoolean(root)) {
                    checkbox.checked ? show(item) : hide(item);
                }
            });
        });

        this.refresh();
    },

    bindEvents() {
        this.container.addEventListener('change', (event) => {
            const { target } = event;

            this.filterConcepts();
        });
    }
};