import {
    createDocFragment, createH3, createDiv, createParagraph, createSection, createButton,
    removeChildren, valOrDefault, isHTMLElement, isNullOrUndefined, createI,
} from 'zenkai';
import { hide, show, toggle } from '@utils/index.js';


export const EditorHome = {
    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    designMenu: null,
    /** @type {HTMLElement} */
    modelMenu: null,
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

    isRendered() {
        return isHTMLElement(this.container);
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

        if (!isHTMLElement(this.designMenu)) {
            this.designMenu = createDesignMenu.call(this);

            fragment.append(this.designMenu);
        }

        if (!isHTMLElement(this.modelMenu)) {
            this.modelMenu = createModelMenu.call(this);

            fragment.append(this.modelMenu);
        }

        if (fragment.hasChildNodes()) {
            this.container.append(fragment);

            this.bindEvents();
        }

        this.refresh();

        return this.container;
    },
    refresh() {
        const { hasConceptModel, hasProjectionModel} = this.editor;

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
 * Creates the design menu section
 * @returns {HTMLElement}
 * @this {EditorHome}
 */
function createDesignMenu() {
    const section = createSection({
        class: ["editor-home-section", "editor-home-section--design"],
    });

    let title = createH3({
        class: ["title", "editor-home-section__title", "font-ui"]
    }, "Design ");

    let content = createDiv({
        class: ["editor-home-section__content", "editor-home-section--design__content"],
    });

    let btnCreateMetaModel = createMenuButton("metamodel");

    let btnCreateProjection = createMenuButton("projection");

    content.append(btnCreateMetaModel, btnCreateProjection);

    section.append(title, content);

    return section;
}

/**
 * Creates a drop area
 * @param {string} type 
 * @returns {HTMLElement}
 */
function createMenuButton(type) {
    /** @type {HTMLElement} */
    let button = createButton({
        class: ["btn", "editor-home-section__button", "editor-home-section__button--new"],
        dataset: {
            action: `create-${type}`,
        }
    }, `Build a ${type}`);

    return button;
}

/**
 * Creates the model menu section
 * @returns {HTMLElement}
 * @this {EditorHome}
 */
function createModelMenu() {
    const section = createSection({
        class: ["editor-home-section", "editor-home-section--model"],
    });

    let title = createH3({
        class: ["title", "editor-home-section__title", "font-ui"]
    }, "Modelling activity");

    let content = createDiv({
        class: ["editor-home-section__content", "editor-home-section--model__content"],
    });

    this.modelFileIO = createFileIO("model");
    this.projectionFileIO = createFileIO("projection", "interface");

    content.append(this.modelFileIO.render(), this.projectionFileIO.render());

    this.btnStart = createButton({
        class: ["btn", "editor-home-section--model__button", "editor-home-section__button--start"],
        dataset: {
            action: "close-home",
            context: "home"
        }
    }, `Start modelling`);

    section.append(title, content, this.btnStart);

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
    const fileIO = Object.create(FileIO);
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
    btnReLoad: null,

    init(type, _title) {
        this.type = type;
        this.title = valOrDefault(_title, type);

        return this;
    },

    get hasFile() {        return !isNullOrUndefined(this.file);    },
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
        }, `${this.type} {JSON}`);

        let actionBar = createDiv({
            class: ["file-section__actionbar"]
        });

        /** @type {HTMLButtonElement} */
        this.btnUnload = createButton({
            class: ["btn", "file-section__actionbar-button", "file-section__actionbar-button--remove"],
            dataset: { action: `unload-${this.type}`, },
        }, `UN.load`);

        /** @type {HTMLButtonElement} */
        this.btnReLoad = createButton({
            class: ["btn", "file-section__actionbar-button", "file-section__actionbar-button--reload"],
            dataset: { action: `reload-${this.type}`, },
        }, `RE.load`);

        actionBar.append(this.btnUnload, this.btnReLoad);
        fileSection.append(iconFile, actionBar);


        /** @type {HTMLButtonElement} */
        this.btnLoad = createButton({
            class: ["btn", "drop-area__button", "drop-area__button--open"],
            dataset: {
                action: `load-${this.type}`,
            },
        }, `Select ${isVowel(this.title.charAt(0)) ? "an" : "a"} ${this.title}`);

        /** @type {HTMLElement} */
        let instruction = createParagraph({
            class: ["drop-area__instruction"]
        }, [this.btnLoad, "or drop it here"]);

        this.container.append(fileSection, instruction);

        this.refresh();

        return this.container;
    },

    bindEvents() {

    }
};