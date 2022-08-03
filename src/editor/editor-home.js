import {
    createDocFragment, createDiv, createSection, createButton, createUnorderedList, createListItem,
    createI, createSpan, createH3, createParagraph, createStrong, createEmphasis, getTemplate, cloneTemplate,
    getElements, getElement, removeChildren, isHTMLElement, isNullOrUndefined, createH1, createH2, hasOwn, valOrDefault,
} from 'zenkai';
import { hide, show, toggle } from '@utils/index.js';


export const EditorHome = {
    /** @type {HTMLElement} */
    menu: null,
    /** @type {*} */
    schema: null,
    /** @type {boolean} */
    isOpen: false,
    /** @type {boolean} */
    visible: true,
    /** @type {HTMLButtonElement} */
    btnStart: null,
    /** @type {FileIO} */
    fileIO: null,
    /** @type {FileConfig} */
    config: null,
    /** @type {Settings} */
    settings: null,

    init(schema) {
        if (schema) {
            this.schema = schema;
        }

        return this;
    },

    get isRendered() { return isHTMLElement(this.container); },

    clear() {
        removeChildren(this.container);

        return this;
    },
    update() {

    },
    render() {
        const fragment = createDocFragment();

        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["editor-home"]
            });

            let title = createH2({
                class: ["editor-title"]
            }, "Settings");

            this.container.append(title);
        }

        if (!isHTMLElement(this.menu)) {
            this.menu = createMenu.call(this);

            fragment.append(this.menu);
        }

        if (!isHTMLElement(this.btnStart)) {
            this.btnStart = createButton({
                class: ["btn", "editor-home-section--model__button", "editor-home-section__button--start"],
                dataset: {
                    action: "close",
                    context: "home"
                }
            }, "Done");

            fragment.append(this.btnStart);
        }

        if (fragment.hasChildNodes()) {
            this.container.append(fragment);

            this.bindEvents();
        }

        this.refresh();

        return this.container;
    },
    refresh() {
        const { hasConceptModel, hasProjectionModel } = this.editor;

        this.btnStart.disabled = !(hasConceptModel && hasProjectionModel);

        return this;
    },


    /**
     * 
     * @param {string} name 
     * @param {HTMLElement} element 
     */
    actionHandler(name, element) {
        const { concept } = element.dataset;

        if (name === "open-concept") {
            this.config.selectItem(concept);
            this.config.showInfo(concept);
        }
    },

    bindEvents() {
        this.editor.registerHandler("editor.load-concept@post", (args) => {
            if (!this.editor.hasConceptModel) {
                return;
            }

            this.fileIO.addFile("concept", args[0], args[1]);
        });

        this.editor.registerHandler("editor.load-projection@post", (args) => {
            if (!this.editor.hasConceptModel) {
                return;
            }

            this.fileIO.addFile("projection", args[0], args[1]);
        });

        this.editor.registerHandler("editor.unload-concept@post", (args) => {
            this.fileIO.removeFile("concept");
            this.config.clear();
        });

        this.editor.registerHandler("editor.unload-projection@post", (args) => {
            this.fileIO.removeFile("projection");
        });

        this.editor.registerHandler("concept-model.updated", () => {
            this.config.clear();

            if (!this.editor.hasConceptModel) {
                return;
            }

            this.editor.conceptModel.schema
                .filter(c => c.root)
                .forEach(c => {
                    this.config.addItem(c);
                });
        });
    }
};

/**
 * Creates the model menu section
 * @returns {HTMLElement}
 * @this {EditorHome}
 */
function createMenu() {
    const section = createSection({
        class: ["editor-home-menu"],
    });

    let fileContainer = createDiv({
        class: ["editor-home-menu-section", "editor-home-menu-section--file"],
    });

    let configContainer = createDiv({
        class: ["editor-home-menu-section", "editor-home-menu-section--config"],
    });

    this.fileIO = createFileIO.call(this);
    this.config = createFileConfig.call(this);

    fileContainer.append(this.fileIO.render(), createMenuTitle("Files"));
    configContainer.append(this.config.render(), createMenuTitle("Configuration"));

    section.append(fileContainer, configContainer);

    return section;
}

/**
 * Creates a menu title
 * @param {string} content 
 * @returns {HTMLElement}
 */
function createMenuTitle(content) {
    return createH3({
        class: ["title", "editor-home-menu-title"],
    }, content);
}

/**
 * Creates a drop area
 * @param {string} type 
 * @param {string} [_title] 
 * @returns {FileIO}
 * @this {EditorHome}
 */
function createFileIO(types) {
    const fileIO = Object.create(FileIO, {
        editor: { value: this.editor }
    });
    fileIO.init();

    return fileIO;
}

const FileIO = {
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
            this.placeholder.innerHTML = `Add your ${b("concepts")} and ${b("projections")} or load a previously saved ${b("model")}`;
            this.placeholder.classList.remove("error");
        } else {
            if (!this.editor.hasConceptModel) {
                this.placeholder.innerHTML = `${b("Missing projections")}`;
            }

            if (!this.editor.hasProjectionModel) {
                this.placeholder.innerHTML = `${b("Missing projections")}`;
            }

            this.placeholder.classList.add("error");
            show(this.placeholder);
        }

        if (!this.hasSelection) {
            hide(this.infoView);
        }

        return this;
    },
    render() {
        /** @type {HTMLElement} */
        this.container = createDiv({
            class: ["editor-file"]
        });

        let dropArea = createDiv({
            class: ["drop-area", "editor-file-main"]
        });

        /** @type {HTMLElement} */
        this.files = createUnorderedList({
            class: ["bare-list", "editor-file__list"]
        });

        this.placeholder = createParagraph({
            class: ["editor-file-placeholder"],
            html: `Add your ${b("concepts")}, ${b("projections")} and all other ${b("resources")}`
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

        let browse = createDiv({
            class: ["editor-file__browse"],
        });
        let instruction = createSpan({
            class: ["editor-file__browse-instruction"],
        }, "Upload your files");
        /** @type {HTMLButtonElement} */
        this.btnLoad = createButton({
            class: ["btn", `editor-file__browse-button`],
            title: `Load file in editor`,
            dataset: {
                action: `load`,
            },
        }, "Browse");

        browse.append(instruction, this.btnLoad);
        dropArea.append(this.files, this.placeholder, browse);

        this.container.append(actionBar, dropArea);

        this.bindEvents();

        this.refresh();

        return this.container;
    },
    clear() {
        removeChildren(this.files);
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


        this.files.append(item);

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
    }
};

/**
 * Creates a bold text
 * @param {string} text 
 * @returns {string}
 */
function b(text) {
    /** @type {HTMLElement} */
    let element = createStrong({
        class: ["text-bf"],
    }, text);

    return element.outerHTML;
}

/**
 * Creates an italic text
 * @param {string} text 
 * @returns {string}
 */
function i(text) {
    /** @type {HTMLElement} */
    let element = createEmphasis({
        class: ["text-it"],
    }, text);

    return element.outerHTML;
}

/**
 * Creates a drop area
 * @returns {FileConfig}
 * @this {EditorHome}
 */
function createFileConfig() {
    const fileConfig = Object.create(FileConfig, {
        editor: { value: this.editor }
    });
    fileConfig.init();

    return fileConfig;
}

const FileConfig = {
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
    conceptList: null,

    /** @type {HTMLElement} */
    selection: null,
    /** @type {HTMLElement} */
    placeholder: null,
    /** @type {Map} */
    cache: null,

    init() {
        this.cache = new Map();

        return this;
    },

    get hasFile() { return this.cache.size > 0; },
    get hasSelection() { return !isNullOrUndefined(this.selection); },

    refresh() {
        if (!this.hasFile) {
            this.container.classList.add("empty");
            show(this.placeholder);
            hide(this.conceptList);
        } else {
            this.container.classList.remove("empty");
            hide(this.placeholder);
            show(this.conceptList);
        }

        if (!this.hasSelection) {
            hide(this.infoView);
        }

        return this;
    },
    render() {
        /** @type {HTMLElement} */
        this.container = createDiv({
            class: ["editor-config"],
        });

        /** @type {HTMLElement} */
        this.mainView = createDiv({
            class: ["editor-config-main"]
        });

        /** @type {HTMLElement} */
        this.infoView = createDiv({
            class: ["editor-config-info"]
        });

        /** @type {HTMLElement} */
        this.conceptList = createUnorderedList({
            class: ["bare-list", "editor-config__list"]
        });

        this.placeholder = createParagraph({
            class: ["editor-config-placeholder"],
            html: `${b("No concept found")}. Please upload your files.`
        });

        this.mainView.append(this.conceptList, this.placeholder);

        this.container.append(this.mainView, this.infoView);

        this.bindEvents();

        this.refresh();

        return this.container;
    },
    clear() {
        removeChildren(this.conceptList);
        removeChildren(this.infoView);
        this.cache.clear();

        this.refresh();
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

        this.refresh();

        return name;
    },
    /**
     * Displays the info for a concept
     * @param {string} name 
     */
    showInfo(name) {
        let schema = this.editor.conceptModel.getCompleteModelConcept(name);

        let info = printSchema(schema, getTemplate("#concept-schema"));

        removeChildren(this.infoView).append(info);
        show(this.infoView);
    },
    addItem(c) {
        /** @type {HTMLElement} */
        let name = createSpan({
            class: ["loaded-element-name", "fit-content"],
        }, c.name);

        /** @type {HTMLLIElement} */
        let item = createListItem({
            class: ["loaded-element", `loaded-element--${this.type}`],
            dataset: {
                context: "menu",
                action: `open-concept`,
                concept: c.name,
                status: "active"
            }
        });

        /** @type {HTMLButtonElement} */
        let btnEdit = createButton({
            class: ["btn", "file-section__actionbar-button", "file-section__actionbar-button--edit"],
            title: `Reload the ${this.type}`,
            dataset: {
                context: "menu",
                action: `open-concept`,
                concept: c.name,
                // action: `edit-${this.type}`, 
            },
        });

        item.append(name, btnEdit);

        this.conceptList.append(item);
        this.cache.set(c.name, item);

        this.refresh();
    },

    bindEvents() {
    }
};

/**
 * Prints a schema using a template
 * @param {*} schema 
 * @param {HTMLTemplateElement} template 
 * @returns {DocumentFragment} document fragment
 */
function printSchema(schema, template) {
    if (isNullOrUndefined(schema)) {
        throw new TypeError("Bad argument: The 'schema' is missing");
    }

    if (!isHTMLElement(template)) {
        throw new TypeError("Bad argument: The given 'template' is not a valid HTML Element");
    }

    const result = cloneTemplate(template);

    /**
     * Resolves a value
     * @param {string} value 
     */
    const resolveValue = (value) => {
        if (value.startsWith("$")) {
            return schema[value.substring(1)];
        }

        return value;
    };

    let ifs = getElements("[data-if]", result);
    ifs.forEach((e, i) => {
        let key = e.dataset["if"];
        if (!hasOwn(schema, key)) {
            e.remove();
        }
    });

    let names = getElements("[data-name]", result);
    names.forEach((e, i) => {
        let key = e.dataset["name"];
        e.textContent = schema[key];
    });

    let attrs = getElements("[data-attr]", result);
    attrs.forEach((e, i) => {
        let value = e.dataset["attr"];
        let [attr, val] = value.split(":");
        let content = resolveValue(val);
        delete e.dataset["attr"];
        e.dataset[attr] = content;
    });

    let binds = getElements("[data-bind]", result);
    binds.forEach((e, i) => {
        let key = e.dataset["bind"];
        if (!hasOwn(schema, key)) {
            return;
        }
        let items = getElement("[data-item]", e);
        let ref = items.dataset["item"];
        let tpl = getTemplate(`#${ref}`);
        schema[key].forEach(item => {
            items.append(printSchema(item, tpl));
        });
    });

    return result;
}