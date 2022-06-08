import {
    createDiv, createButton, createUnorderedList, createListItem, createSpan, createParagraph,
    createI, valOrDefault, removeChildren, isHTMLElement, isNullOrUndefined, createDocFragment
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
    cache: null,

    init() {
        this.cache = new Map();

        return this;
    },

    get hasFile() { return this.cache.size > 0; },
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
    render() {
        /** @type {HTMLElement} */
        this.container = createDiv({
            class: ["editor-file"]
        });

        let actionBar = createDiv({
            class: ["editor-file-actionbar"]
        });

        /** @type {HTMLButtonElement} */
        this.btnUnload = createButton({
            class: ["btn", "editor-file-actionbar__button", "editor-file-actionbar__btn-remove"],
            title: `Remove all files`,
            dataset: { action: `unload`, },
        });

        actionBar.append(this.btnUnload);

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

        this.mainView.append(this.files, this.infoView);

        let dropArea = createDiv({
            class: ["drop-area", "editor-file-main"]
        });

        this.placeholder = createParagraph({
            class: ["editor-file-placeholder"],
            html: `Add your ${_b("concepts")}, ${_b("projections")} and all other ${_b("resources")}`
        });

        let browse = createDiv({
            class: ["editor-file__browse"],
        });
        let instruction = createSpan({
            class: ["editor-file__browse-instruction"],
        }, "Upload your files");

        this.btnLoad = createButton({
            class: ["btn", `editor-file__browse-button`],
            title: `Load file in editor`,
            dataset: {
                action: `load`,
            },
        }, "Browse");

        browse.append(instruction, this.btnLoad);
        dropArea.append(this.placeholder, browse);

        this.container.append(actionBar, this.mainView, dropArea);

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
        if (!this.cache.has(name)) {
            return null;
        }
        let item = this.cache.get(name);

        if (isHTMLElement(this.selection)) {
            this.selection.classList.remove("selected");
        }

        this.selection = item;
        this.selection.classList.add("selected");
        this.displayInfo(name);

        this.refresh();
    },
    addFile(type, name, file) {
        let item = createListItem({
            class: ["editor-file__list-item", `editor-file__list-item--${type}`],
            dataset: {
                context: "menu",
                action: `open-${type}`,
                status: "active"
            }
        });
        let icoFile = createI({
            class: ["ico", "ico-file", "editor-file__list-item-icon"]
        });
        let title = createSpan({
            class: ["editor-file__list-item-type"]
        }, valOrDefault(name, type));

        let btnRemove = createButton({
            class: ["editor-file__list-item__btn-remove"],
            dataset: {
                action: `unload-${type}`,
            }
        }, createI({
            class: ["ico", "ico-delete"],
            dataset: {
                "ignore": "all",
            }
        }, "✖"));
        item.append(icoFile, title, btnRemove);

        // this.files.append(item);

        if (type === "concept") {
            let cfile = JSON.parse(file);
            cfile.concept.filter(c => c.nature !== "prototype").forEach(c => {
                let item = createListItem({
                    class: [`editor-file-concept`],
                    dataset: {
                        name: c.name
                    }
                }, c.name);

                this.files.append(item);
            });
        }

        this.cache.set(type, item);

        this.refresh();
    },
    removeFile(type, c) {
        if (!this.cache.has(type)) {
            return;
        }

        let item = this.cache.get(type);
        removeChildren(item).remove();
        this.cache.delete(type);

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
                }, attr.name);

                // this.attributes.set(attr.name, element);

                attributesElement.append(element);
            });
        }

        container.append(header, attributesElement);

        this.infoView.append(container);


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
    bindEvents() {
        this.editor.registerHandler("editor.load@post", (args) => {
            if (!this.editor.hasConceptModel) {
                return;
            }

            if (!this.editor.hasProjectionModel) {
                return;
            }
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

            const { name } = target.dataset;

            this.displayConcept(name);
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