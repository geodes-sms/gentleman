import {
    createDocFragment, createH3, createDiv, createParagraph, createSection, createI,
    createButton, removeChildren, valOrDefault, isHTMLElement, isNullOrUndefined,
} from 'zenkai';
import { hide, show, toggle } from '@utils/index.js';


export const EditorHome = {
    /** @type {HTMLElement} */
    container: null,
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
    /** @type {FIleIO} */
    modelFileIO: null,
    /** @type {FIleIO} */
    projectionFileIO: null,

    init(schema) {
        if (schema) {
            this.schema = schema;
        }

        return this;
    },

    get isRendered() { return isHTMLElement(this.container); },

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
    open() {
        this.container.classList.add("open");
        this.show();
        this.isOpen = true;

        return this;
    },
    close() {
        this.container.classList.remove("open");
        this.hide();
        this.isOpen = false;

        return this;
    },

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
        }

        if (!isHTMLElement(this.menu)) {
            this.menu = createMenu.call(this);

            fragment.append(this.menu);
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

        if (!(hasConceptModel && hasProjectionModel)) {
            this.show();
        }

        this.modelFileIO.setFile(hasConceptModel ? "file" : null);
        this.projectionFileIO.setFile(hasProjectionModel ? "file" : null);

        this.btnStart.disabled = !(hasConceptModel && hasProjectionModel);

        return this;
    },

    bindEvents() {

    }
};


/**
 * Creates the model menu section
 * @returns {HTMLElement}
 * @this {EditorHome}
 */
function createMenu() {
    const section = createSection({
        class: ["editor-home-section", "editor-home-section--model"],
    });

    let title = createH3({
        class: ["title", "editor-home-section__title", "font-ui"]
    }, "Modelling activity");

    let content = createDiv({
        class: ["editor-home-section__content", "editor-home-section--model__content"],
    });

    this.modelFileIO = createFileIO.call(this, "model");
    this.projectionFileIO = createFileIO.call(this, "projection");
  

    let modelMenu = createDiv({
        class: ["editor-home-section__menu", "editor-home-section__menu--concept"],
    }, [this.modelFileIO.render()]);

    let projectionMenu = createDiv({
        class: ["editor-home-section__menu", "editor-home-section__menu--projection"],
    }, [this.projectionFileIO.render()]);

    content.append(modelMenu, projectionMenu);

    this.btnStart = createButton({
        class: ["btn", "editor-home-section--model__button", "editor-home-section__button--start"],
        dataset: {
            action: "close",
            context: "home"
        }
    }, "Start");

    section.append(content, this.btnStart);

    return section;
}


/**
 * Verifies that a character is a vowel
 * @param {string} char 
 * @returns {boolean}
 */
const isVowel = (char) => char && ["a", "e", "i", "o", "u"].includes(char.toLowerCase());

/**
 * Creates a drop area
 * @param {string} type 
 * @param {string} [_title] 
 * @returns {FileIO}
 * @this {EditorHome}
 */
function createFileIO(type, _title) {
    const fileIO = Object.create(FileIO, {
        editor: { value: this.editor }
    });
    fileIO.init(type, _title);

    return fileIO;
}

const FileIO = {
    /** @type {*} */
    file: null,
    /** @type {string} */
    type: null,
    /** @type {string} */
    title: null,
    /** @type {string} */
    status: null,

    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLButtonElement} */
    btnLoad: null,
    /** @type {HTMLButtonElement} */
    btnUnload: null,
    /** @type {HTMLButtonElement} */
    btnDownload: null,
    /** @type {HTMLButtonElement} */
    btnReLoad: null,

    init(type, _title) {
        this.type = type;
        this.title = valOrDefault(_title, type);

        return this;
    },

    get hasFile() { return !isNullOrUndefined(this.file); },
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
        } else {
            this.container.classList.remove("empty");
        }
        this.btnReLoad.disabled = !this.hasFile;
        this.btnUnload.disabled = !this.hasFile;
        this.btnDownload.disabled = !this.hasFile;

        return this;
    },
    render() {
        /** @type {HTMLElement} */
        this.container = createDiv({
            class: ["drop-area", "editor-home-section__drop-area", `editor-home-section__drop-area--${this.type}`],
            dataset: {
                type: this.type,
            },
        });

        /** @type {HTMLElement} */
        let fileSection = createDiv({
            class: ["drop-area__file-section"]
        });

        /** @type {HTMLElement} */
        let iconFile = createI({
            class: ["icon", "file-section__icon"]
        }, `${this.type}`);

        let actionBar = createDiv({
            class: ["file-section__actionbar"]
        });

        /** @type {HTMLButtonElement} */
        this.btnUnload = createButton({
            class: ["btn", "file-section__actionbar-button", "file-section__actionbar-button--remove"],
            title: `Unload the ${this.type}`,
            dataset: { action: `unload-${this.type}`, },
        }, `UN.load`);

        /** @type {HTMLButtonElement} */
        this.btnReLoad = createButton({
            class: ["btn", "file-section__actionbar-button", "file-section__actionbar-button--reload"],
            title: `Reload the ${this.type}`,
            dataset: { action: `reload-${this.type}`, },
        }, `RE.load`);

        /** @type {HTMLButtonElement} */
        this.btnDownload = createButton({
            class: ["btn", "file-section__actionbar-button", "file-section__actionbar-button--download"],
            title: `Download the ${this.type}`,
            dataset: { action: `download-${this.type}`, },
        }, `Download`);

        actionBar.append(this.btnUnload, this.btnReLoad, this.btnDownload);
        fileSection.append(iconFile, actionBar);


        /** @type {HTMLButtonElement} */
        this.btnLoad = createButton({
            class: ["btn", "drop-area__button", "drop-area__button--open"],
            title: `Load the ${this.type}`,
            dataset: {
                action: `load-${this.type}`,
            },
        }, `Select ${isVowel(this.title.charAt(0)) ? "an" : "a"} ${this.title}`);

        /** @type {HTMLElement} */
        let instruction = createParagraph({
            class: ["drop-area__instruction"]
        }, [this.btnLoad, "or drop it here"]);

        this.container.append(fileSection, instruction);

        this.bindEvents();

        this.refresh();

        return this.container;
    },

    bindEvents() {
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