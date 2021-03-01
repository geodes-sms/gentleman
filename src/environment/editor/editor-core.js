import {
    createDocFragment, createDiv, createSpan, createUnorderedList, createListItem,
    createParagraph, createButton, createAnchor, createInput, createSection,
    getElement, getElements, removeChildren, isHTMLElement, findAncestor,
    isNullOrWhitespace, isNullOrUndefined, isEmpty, hasOwn, copytoClipboard, isFunction, createH3, createHeader, valOrDefault
} from 'zenkai';
import { Events, hide, show, Key, getEventTarget, NotificationType } from '@utils/index.js';
import { buildProjectionHandler } from "../build-projection.js";
import { buildConceptHandler } from "../build-concept.js";
import { ConceptModelManager } from '@model/index.js';
import { createProjectionModel } from '@projection/index.js';
import { ProjectionWindow } from '../projection-window.js';
import { EditorHome } from './editor-home.js';
import { EditorMenu } from './editor-menu.js';
import { EditorStyle } from './editor-style.js';
import { EditorSection } from './editor-section.js';


/**
 * Creates an editor's header
 * @returns {EditorSection}
 */
function createEditorHeader() {
    return Object.create(EditorSection, {
        object: { value: "environment" },
        name: { value: "editor-header" },
        editor: { value: this }
    });
}

/**
 * Creates a projection window
 * @returns {ProjectionWindow}
 */
function createProjectionWindow() {
    return Object.create(ProjectionWindow, {
        object: { value: "environment" },
        name: { value: "projection-window" },
        type: { value: "window" },
        editor: { value: this }
    });
}

/**
 * Creates an editor menu
 * @returns {EditorMenu}
 */
function createEditorMenu() {
    return Object.create(EditorMenu, {
        object: { value: "environment" },
        name: { value: "editor-menu" },
        type: { value: "menu" },
        editor: { value: this }
    });
}

/**
 * Creates an editor home
 * @returns {EditorHome}
 */
function createEditorHome() {
    return Object.create(EditorHome, {
        object: { value: "environment" },
        name: { value: "editor-home" },
        type: { value: "home" },
        editor: { value: this }
    });
}

/**
 * Creates an editor style
 * @returns {EditorStyle}
 */
function createEditorStyle() {
    return Object.create(EditorStyle, {
        object: { value: "environment" },
        name: { value: "editor-style" },
        type: { value: "style" },
        editor: { value: this }
    });
}

/**
 * Create a projection in the editor
 * @param {*} concept 
 * @this {Editor}
 */
function createProjection(concept) {
    const { name } = concept;

    let projection = this.projectionModel.createProjection(concept).init();

    let title = createH3({
        class: ["title", "editor-concept-title"],
    }, name);

    let btnDelete = createButton({
        class: ["btn", "editor-concept-toolbar__btn-delete"],
        title: `Delete ${name.toLowerCase()}`
    });

    let btnCollapse = createButton({
        class: ["btn", "editor-concept-toolbar__btn-collapse"],
        title: `Collapse ${name.toLowerCase()}`
    });

    let btnMaximize = createButton({
        class: ["btn", "editor-concept-toolbar__btn-maximize"],
        title: `Maximize ${name.toLowerCase()}`
    });

    let toolbar = createDiv({
        class: ["editor-concept-toolbar"],
    }, [btnMaximize, btnDelete]);

    let header = createHeader({
        class: ["editor-concept-header"],
    }, [title, toolbar]);

    let modelConceptContainer = createDiv({
        class: ["editor-concept"],
        draggable: false,
        dataset: {
            nature: "concept-container"
        }
    }, [header, projection.render()]);

    btnDelete.addEventListener('click', (event) => {
        if (concept.delete(true)) {
            removeChildren(modelConceptContainer);
            modelConceptContainer.remove();
        }
    });

    btnMaximize.addEventListener('click', (event) => {
        modelConceptContainer.classList.toggle('focus');
    });

    return modelConceptContainer;
}

const CONCEPT_MODEL__CONFIG = require('@include/concept-model/editor-config.json');
const CONCEPT_MODEL__CONCEPT = require('@include/concept-model/concept.json');
const CONCEPT_MODEL__PROJECTION1 = require('@include/concept-model/textual-projection.json');
const CONCEPT_MODEL__PROJECTION2 = require('@include/concept-model/graphical-projection.json');

const PROJECTION_MODEL__CONFIG = require('@include/projection-model/editor-config.json');
const PROJECTION_MODEL__CONCEPT = require('@include/projection-model/concept.json');
const PROJECTION_MODEL__PROJECTION1 = require('@include/projection-model/textual-projection.json');
const PROJECTION_MODEL__PROJECTION2 = require('@include/projection-model/graphical-projection.json');

const DEFAULT_CONFIG = {
    "header": {
        "selectors": {},
        "css": ["editor-header"]
    },
    "root": [],
    "body": {
        "concept": {
            "actions": [
                { "name": "build", "triggers": ["click"] }
            ],
            "css": ["model-concept-list"]
        },
        "css": ["editor-body"]
    },
    "menu": {
        "actions": [
            { "name": "export" },
            { "name": "import" }
        ],
        "css": ["editor-menu"]
    }
};


export const Editor = {
    /** @type {ConceptModel} */
    conceptModel: null,
    /** @type {Concept} */
    concept: null,
    /** @type {ProjectionModel} */
    projectionModel: null,
    /** @type {Projection} */
    projection: null,

    /** @type {HTMLElement} */
    container: null,
    /** @type {EditorSection} */
    header: null,
    /** @type {HTMLElement} */
    body: null,
    /** @type {HTMLElement} */
    footer: null,
    /** @type {ProjectionWindow} */
    projectionWindow: null,
    /** @type {EditorMenu} */
    menu: null,
    /** @type {EditorHome} */
    home: null,
    /** @type {EditorStyle} */
    style: null,
    /** @type {HTMLInputElement} */
    input: null,

    /** @type {HTMLElement} */
    downloadList: null,
    /** @type {HTMLElement} */
    modelSection: null,

    /** @type {Map} */
    fields: null,
    /** @type {Map} */
    statics: null,
    /** @type {Map} */
    layouts: null,
    /** @type {Field} */
    activeField: null,
    /** @type {HTMLElement} */
    activeElement: null,

    /** @type {Projection} */
    activeProjection: null,
    /** @type {Concept} */
    activeConcept: null,

    /** @type {*} */
    config: null,

    /** @type {boolean} */
    active: false,
    handlers: null,

    init(args = {}) {
        const { config = DEFAULT_CONFIG } = args;

        this.fields = new Map();
        this.statics = new Map();
        this.layouts = new Map();

        // Editor configuration
        this.config = config;
        this.handlers = {};

        if (this.config) {
            this.header = createEditorHeader.call(this).init();
        }

        this.projectionWindow = createProjectionWindow.call(this).init();

        this.menu = createEditorMenu.call(this).init(this.config.menu);
        this.home = createEditorHome.call(this).init(this.config.home);
        this.style = createEditorStyle.call(this).init(this.config.style);

        this.render();

        return this;
    },

    setConfig(schema) {
        if (isNullOrUndefined(schema)) {
            return false;
        }

        this.config = schema;

        this.menu.update(this.config.menu);
        this.home.update(this.config.home);
        this.style.update(this.config.style);
    },
    getRoots() {
        const { root = [] } = this.config;

        if (isEmpty(root)) {
            return this.conceptModel.getSchema("concrete");
        }

        return root;
    },

    // Model management

    /**
     * Verifies that the editor has a concept model loaded
     * @returns {boolean} Value indicating whether the editor has a concept model loaded
     */
    get hasConceptModel() { return !isNullOrUndefined(this.conceptModel); },
    /**
     * Verifies that the editor has a projection model loaded
     * @returns {boolean} Value indicating whether the editor has a projection model loaded
     */
    get hasProjectionModel() { return !isNullOrUndefined(this.projectionModel); },

    // Model concept management

    addConcept(name) {
        let concept = this.conceptModel.createConcept({ name: name });

        let projection = createProjection.call(this, concept);

        this.conceptSection.appendChild(projection);

        let element = getElement('[data-projection]', projection);
        element.focus();
    },

    // Model projection management

    addProjection(projections) {
        if (Array.isArray(projections)) {
            this.projectionModel.schema.push(...projections);
        }

        // const { projection, values = [], views = [], editor } = modelSchema;
    },
    initProjection(values) {
        // this.changeModel(MODEL_GENTLEMAN_PROJECTION);

        const { concept, projection, views = [], editor } = PROJECTION_MODEL__CONCEPT;

        if (concept) {
            this.conceptModel = ConceptModelManager.createModel(concept, projection).init(values);
        }

        if (projection) {
            this.projectionModel = createProjectionModel(projection, this).init();
        }

        if (editor) {
            this.config = editor;
        }

        this.manager.refresh();

        this.clear().refresh();

        let value = values[0];

        [{ concept: { id: value.id, name: value.name } }].forEach(view => {
            const { id, name } = view.concept;

            const concept = this.conceptModel.getConcept(id);

            this.conceptSection.appendChild(createProjection.call(this, concept));
        });


        return this;
    },


    // Projection elements management

    /**
     * Get a the related field object
     * @param {HTMLElement} element 
     * @returns {Field}
     */
    registerField(field) {
        field.environment = this;
        this.fields.set(field.id, field);

        return this;
    },
    unregisterField(field) {
        var _field = this.fields.get(field.id);

        if (_field) {
            _field.environment = null;
            this.fields.delete(_field.id);
        }

        return this;
    },
    /**
     * Get a the related field object
     * @param {HTMLElement} element 
     * @returns {Field}
     */
    getField(element) {
        if (!isHTMLElement(element)) {
            console.warn("Field error: Bad argument");
            return null;
        }

        const { id, nature } = element.dataset;

        if (isNullOrUndefined(id)) {
            console.warn("Field error: Missing id attribute on field");
            return null;
        }

        if (!["field", "field-component"].includes(nature)) {
            console.warn("Field error: Unknown nature attribute on field");
            return null;
        }

        return this.fields.get(id);
    },

    registerStatic(staticElement) {
        staticElement.environment = this;
        this.statics.set(staticElement.id, staticElement);

        return this;
    },
    unregisterStatic(staticElement) {
        var _static = this.statics.get(staticElement.id);

        if (_static) {
            _static.environment = null;
            this.statics.delete(_static.id);
        }

        return this;
    },
    /**
     * Get a the related static object
     * @param {HTMLElement} element 
     * @returns {Static}
     */
    getStatic(element) {
        if (!isHTMLElement(element)) {
            console.warn("Static error: Bad argument");
            return null;
        }

        const { id, nature } = element.dataset;

        if (isNullOrUndefined(id)) {
            console.warn("Static error: Missing id attribute on field");
            return null;
        }

        if (!["static"].includes(nature)) {
            console.warn("Static error: Unknown nature attribute on field");
            return null;
        }

        return this.statics.get(id);
    },

    registerLayout(layout) {
        layout.environment = this;
        this.layouts.set(layout.id, layout);

        return this;
    },
    /**
     * Removes a layout the cache
     * @param {Layout} layout 
     * @returns {Static}
     */
    unregisterLayout(layout) {
        var _layout = this.layouts.get(layout.id);

        if (_layout) {
            _layout.environment = null;
            this.layouts.delete(_layout.id);
        }

        return this;
    },
    /**
     * Get a the related layout object
     * @param {HTMLElement} element 
     * @returns {Static}
     */
    getLayout(element) {
        if (!isHTMLElement(element)) {
            console.warn("Layout error: Bad argument");
            return null;
        }

        const { id, nature } = element.dataset;

        if (isNullOrUndefined(id)) {
            console.warn("Layout error: Missing id attribute on field");
            return null;
        }

        if (!["layout"].includes(nature)) {
            console.warn("Layout error: Unknown nature attribute on field");
            return null;
        }

        return this.layouts.get(id);
    },
    resolveElement(element) {
        if (!isHTMLElement(element)) {
            return null;
        }

        const { nature } = element.dataset;

        if (isNullOrUndefined(nature)) {
            return null;
        }

        switch (nature) {
            case "field":
            case "field-component":
                return this.getField(element);
            case "layout":
                return this.getLayout(element);
            case "static":
                return this.getStatic(element);
            default:
                return null;
        }
    },

    // Editor actions

    download(obj) {
        const MIME_TYPE = 'application/json';
        window.URL = window.webkitURL || window.URL;

        /** @type {HTMLAnchorElement} */
        var link = createAnchor({
            class: ["bare-link", "download-item__link"]
        }, `Download`);

        // if (!isNullOrWhitespace(link.href)) {
        //     window.URL.revokeObjectURL(link.href);
        // }


        var bb = new Blob([JSON.stringify(obj)], { type: MIME_TYPE });
        Object.assign(link, {
            download: `model.json`,
            href: window.URL.createObjectURL(bb),
        });

        link.dataset.downloadurl = [MIME_TYPE, link.download, link.href].join(':');


        let item = createListItem({
            class: ["download-item", "download-item--build"]
        });

        let btnDelete = createButton({
            class: ["btn", "btn-delete"],
            dataset: {
                action: "delete",
                target: "parent"
            }
        }, "✖");

        let title = createSpan({
            class: ["download-item__name"],
            dataset: {
                action: "delete",
                target: "parent"
            }
        }, `Build ${this.footer.childElementCount + 1}`);

        item.append(btnDelete, title, link);

        this.downloadList.append(item);

        // // Need a small delay for the revokeObjectURL to work properly.
        // setTimeout(() => {
        //     window.URL.revokeObjectURL(link.href);
        //     link.remove();
        // }, 1500);

        return obj;
    },
    /**
     * Exports the current model (save)
     * @param {boolean} copy 
     */
    export(copy = false) {
        const MIME_TYPE = 'application/json';
        window.URL = window.webkitURL || window.URL;

        /** @type {HTMLAnchorElement} */
        var link = createAnchor({});
        this.container.appendChild(link);

        if (!isNullOrWhitespace(link.href)) {
            window.URL.revokeObjectURL(link.href);
        }

        const result = {
            "concept": this.conceptModel.schema,
            "values": this.conceptModel.export(),
        };

        var bb = new Blob([JSON.stringify(result)], { type: MIME_TYPE });
        Object.assign(link, {
            download: `model.json`,
            href: window.URL.createObjectURL(bb),
        });

        link.dataset.downloadurl = [MIME_TYPE, link.download, link.href].join(':');
        if (copy) {
            copytoClipboard(JSON.stringify(result));
            this.notify("Export has been copied to clipboard");
        } else {
            link.click();
            this.notify("The model has been successfully built. Please download the model.");
        }

        // Need a small delay for the revokeObjectURL to work properly.
        setTimeout(() => {
            window.URL.revokeObjectURL(link.href);
            link.remove();
        }, 1500);

        return result;
    },
    /**
     * Diplays a notification message
     * @param {string} message 
     * @param {NotificationType} type 
     */
    notify(message, type) {
        /** @type {HTMLElement} */
        let notify = createParagraph({
            class: ["notify"],
            html: message
        });

        if (type) {
            notify.classList.add(type);
        }

        this.container.appendChild(notify);

        setTimeout(() => {
            notify.classList.add("open");
        }, 50);

        setTimeout(() => {
            notify.classList.remove("open");
            setTimeout(() => { notify.remove(); }, 500);
        }, 4500);
    },

    // Editor window actions

    show() {
        show(this.container);
    },
    hide() {
        hide(this.container);
    },
    open() {
        this.show();
        this.active = true;

        Events.emit('editor.open');

        return this;
    },
    reduce() {
        this.hide();
        this.active = true;

        Events.emit('editor.reduce');

        return this;
    },
    close() {
        this.hide();
        this.active = false;

        // cleanup
        this.clean();
        this.container.remove();

        Events.emit('editor.close');

        return this;
    },

    // Utility actions

    unloadConceptModel() {
        if (this.hasConceptModel) {
            this.conceptModel.done();
            this.conceptModel = null;

            this.refresh();
        }

        return this;
    },
    loadConceptModel(schema, values) {
        if (!Array.isArray(schema)) {
            this.notify("Invalid concept model", NotificationType.ERROR);

            return false;
        }

        this.unloadConceptModel();
        this.clear();

        this.conceptModel = ConceptModelManager.createModel(schema).init(values);

        if (isNullOrUndefined(this.conceptModel)) {
            // TODO: add validation and notify of errors
        }

        if (this.hasProjectionModel) {
            this.projectionModel.done();

            this.conceptModel.getRootConcepts()
                .forEach(concept => {
                    this.conceptSection.appendChild(createProjection.call(this, concept));
                });
        }

        this.refresh();

        return this;
    },
    unloadProjectionModel() {
        if (this.hasProjectionModel) {
            this.projectionModel.done();
            this.projectionModel = null;

            this.refresh();
        }

        return this;
    },
    loadProjectionModel(schema, views) {
        if (!Array.isArray(schema)) {
            this.notify("Invalid projection model", NotificationType.ERROR);

            return false;
        }

        this.unloadProjectionModel();
        this.clear();

        this.projectionModel = createProjectionModel(schema, this).init(views);

        if (isNullOrUndefined(this.projectionModel)) {
            // TODO: add validation and notify of errors
        }

        if (this.hasConceptModel) {
            this.conceptModel.getRootConcepts()
                .forEach(concept => {
                    this.conceptSection.appendChild(createProjection.call(this, concept));
                });
        }

        this.refresh();

        return this;
    },
    unload() {
        this.unloadConceptModel();
        this.unloadProjectionModel();
        this.clear();

        return this;
    },
    clean() {
        if (this.conceptModel) {
            // TODO: Remove all concept listeners
        }

        if (this.projectionModel) {
            // TODO: Unregister all projections and their components
        }

        removeChildren(this.container);

        Events.emit('editor.clean');

        return this;
    },
    clear() {
        this.fields.clear();
        this.layouts.clear();
        this.statics.clear();

        if (this.conceptSection) {
            removeChildren(this.conceptSection);
        }

        this.activeField = null;
        this.activeElement = null;
        this.activeConcept = null;

        Events.emit('editor.clear');

        return this;
    },


    // Rendering and interaction management

    /**
     * Renders the editor in the DOM inside an optional container
     * @param {HTMLElement} [container] 
     */
    render(container) {
        const fragment = createDocFragment();


        if (!this.home.isRendered()) {
            fragment.appendChild(this.home.render());
        }

        if (!this.style.isRendered()) {
            fragment.appendChild(this.style.render());
        }

        if (!this.header.isRendered()) {
            fragment.appendChild(this.header.render());
        }

        if (!isHTMLElement(this.body)) {
            this.body = createDiv({
                class: ["editor-body"],
                tabindex: 0,
            });

            this.conceptSection = createSection({
                class: ["model-concept-section"],
            });

            this.body.append(this.conceptSection);

            fragment.appendChild(this.body);
        }

        if (!isHTMLElement(this.footer)) {
            this.footer = createDiv({
                class: ["editor-footer"],
                tabindex: 0,
            });

            this.downloadList = createUnorderedList({
                class: ["bare-list", "download-list"]
            });

            this.modelSection = createSection({
                class: ["editor-model-section"]
            });

            this.footer.append(this.downloadList);
            this.footer.append(this.modelSection);

            fragment.appendChild(this.footer);
        }

        if (!isHTMLElement(this.projectionWindow.container)) {
            fragment.appendChild(this.projectionWindow.render());
        }

        if (!this.menu.isRendered()) {
            fragment.appendChild(this.menu.render());
        }

        if (!isHTMLElement(this.input)) {
            this.input = createInput({
                type: "file",
                class: ["hidden"],
                accept: '.json'
            });

            fragment.appendChild(this.input);
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
        if (!this.hasConceptModel) {
            this.container.classList.add("no-concept-model");
        } else {
            this.container.classList.remove("no-concept-model");
        }

        if (!this.hasProjectionModel) {
            this.container.classList.add("no-projection-model");
        } else {
            this.container.classList.remove("no-projection-model");
        }

        this.header.refresh();
        this.menu.refresh();
        this.home.refresh();
        this.style.refresh();

        return this;
    },
    /**
     * Updates the active HTML Element
     * @param {HTMLElement} element 
     */
    updateActiveElement(element) {
        if (this.activeElement && this.activeElement !== element) {
            this.activeElement.classList.remove('active');
            Array.from(getElements(".active-parent"))
                .forEach(el => el.classList.remove("active-parent"));
        }

        this.activeElement = element;

        this.activeElement.classList.add('active');


        var parent = this.activeElement.parentElement;

        while (parent) {
            const { nature, view } = parent.dataset;

            if (hasOwn(parent.dataset, 'projection')) {
                parent.classList.add("active-parent");
            }

            if (nature === "field-component") {
                parent.classList.add("active-parent");
            }

            if (nature === "concept-container") {
                parent.classList.add("active-parent");
            }

            parent = parent.parentElement;
        }

        this.projectionWindow.setProjection(this.projectionModel.getProjection(element.dataset.projection));

        return this;
    },
    /**
     * Updates the active concept
     * @param {Concept} concept 
     */
    updateActiveConcept(concept) {
        this.activeConcept = concept;

        this.refresh();

        return this;
    },
    /**
     * Updates the active projection
     * @param {Projection} projection 
     */
    updateActiveProjection(projection) {
        this.activeProjection = projection;

        this.refresh();

        return this;
    },


    // Custom events management

    /**
     * Get Handlers registered to this name
     * @param {string} name 
     * @returns {*[]} List of registered handlers
     */
    getHandlers(name) {
        return valOrDefault(this.handlers[name], []);
    },
    /**
     * Triggers an event, invoking the attached handler in the registered order
     * @param {*} event 
     */
    triggerEvent(event) {
        const { name, downloadable, } = event;

        const handlers = this.getHandlers(name);

        handlers.forEach((handler) => {
            let result = handler.call(this, this.conceptModel);

            if (result === false) {
                return;
            }

            if (downloadable) {
                this.download(result);
            }
        });

        return true;
    },
    /**
     * Sets up a function that will be called whenever the specified event is triggered
     * @param {string} name 
     * @param {Function} handler The function that receives a notification
     */
    registerHandler(name, handler) {
        if (!Array.isArray(this.handlers[name])) {
            this.handlers[name] = [];
        }

        this.handlers[name].push(handler);

        return true;
    },
    /**
     * Removes an event handler previously registered with `registerHandler()`
     * @param {string} name 
     * @param {Function} handler The function that receives a notification
     */
    unregisterHandler(name, handler) {
        if (!hasOwn(this.handlers, name)) {
            return false;
        }

        for (let i = 0; i < this.handlers[name].length; i++) {
            if (this.handlers[name][i] === handler) {
                this.handlers[name].splice(i, 1);

                return true;
            }
        }

        return false;
    },

    // Default events management

    bindEvents() {
        var lastKey = null;
        var fileHandler = null;

        const ActionHandler = {
            "close": (target) => {
                this.close();
                this.manager.deleteEditor(this);
            },
            "collapse": (target) => {
                const { rel, target: actionTarget } = target.dataset;

                if (rel === "parent") {
                    let parent = findAncestor(target, (el) => el.dataset.name === actionTarget);
                    if (isHTMLElement(parent)) {
                        parent.classList.toggle("collapsed");
                    }
                }
            },
            "delete": (target) => {
                const { target: actionTarget } = target.dataset;

                if (actionTarget === "parent") {
                    let parent = target.parentElement;
                    removeChildren(parent);
                    parent.remove();
                }
            },

            "style": (target) => {
                this.style.toggle();
            },
            "open-style": (target) => {
                this.style.open();
            },
            "close-style": (target) => {
                this.style.close();
            },
            "home": (target) => {
                this.home.toggle();
            },
            "open-home": (target) => {
                this.home.open();
            },
            "close-home": (target) => {
                this.home.close();
            },

            "export": (target) => {
                this.export();
            },
            "import-projection": (target) => {
                let event = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                });
                fileHandler = this.addProjection;

                this.input.dispatchEvent(event);
            },

            "load-model": (target) => {
                let event = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                });

                fileHandler = (file) => {
                    if (Array.isArray(file)) {
                        this.loadConceptModel(file);
                    } else {
                        const { concept, values = [] } = file;

                        this.loadConceptModel(concept, values);
                    }
                };

                this.input.dispatchEvent(event);
            },
            "unload-model": (target) => {
                this.unloadConceptModel();
            },
            "reload-model": (target) => {
                const { schema, values } = this.projectionModel;

                this.loadConceptModel(schema, values);
            },
            "load-projection": (target) => {
                let event = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                });
                fileHandler = (file) => {
                    if (Array.isArray(file)) {
                        this.loadProjectionModel(file);
                    } else {
                        const { projection, views = [] } = file;

                        this.loadProjectionModel(projection, views);
                    }
                };

                this.input.dispatchEvent(event);
            },
            "unload-projection": (target) => {
                this.unloadProjectionModel();
            },
            "reload-projection": (target) => {
                const { schema, views } = this.projectionModel;

                this.loadProjectionModel(schema, views);
            },

            "create-metamodel": (target) => {
                const { concept, values = [] } = CONCEPT_MODEL__CONCEPT;
                const { projection, views = [] } = CONCEPT_MODEL__PROJECTION2;
                const { editor: config } = CONCEPT_MODEL__CONFIG;

                this.unload();
                this.setConfig(config);
                this.loadConceptModel(concept, values);
                this.loadProjectionModel(projection, views);
            },
            "create-projection": (target) => {
                const { concept, values = [] } = PROJECTION_MODEL__CONCEPT;
                const { projection, views = [] } = PROJECTION_MODEL__PROJECTION1;
                const { editor: config } = PROJECTION_MODEL__CONFIG;

                this.unload();
                this.setConfig(config);
                this.loadConceptModel(concept, values);
                this.loadProjectionModel(projection, views);
            }
        };

        /**
         * Get the choice element
         * @param {HTMLElement} element 
         */
        function getProjection(element) {
            if (hasOwn(element.dataset, 'projection')) {
                return element;
            }

            return findAncestor(element, (el) => hasOwn(el.dataset, 'projection'));
        }

        this.container.addEventListener('click', (event) => {
            var target = getEventTarget(event.target);

            const { action, handler, downloadable } = target.dataset;

            if (this.activeField) {
                this.activeField.clickHandler(target);
            }

            const actionHandler = ActionHandler[action];

            if (handler && action) {
                this.triggerEvent({
                    "name": action,
                    "downloadable": downloadable,
                });
            } else if (isFunction(actionHandler)) {
                actionHandler(target);
                target.blur();
            }
        }, true);

        this.input.addEventListener('change', (event) => {
            var file = this.input.files[0];

            if (!file.name.endsWith('.json')) {
                this.notify("This file is not supported. Please use a .json file");
            }

            var reader = new FileReader();
            reader.onload = (e) => {
                fileHandler(JSON.parse(reader.result));
                fileHandler = null;
                this.input.value = "";
            };
            reader.readAsText(file);
        });

        this.body.addEventListener('keydown', (event) => {
            const { target } = event;

            const { nature } = target.dataset;

            var rememberKey = false;

            switch (event.key) {
                case Key.backspace:
                    if (this.activeField && lastKey !== Key.ctrl) {
                        const handled = this.activeField.backspaceHandler(target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    }

                    break;
                case Key.ctrl:
                    event.preventDefault();

                    rememberKey = true;
                    break;
                case Key.delete:
                    if (this.activeField && lastKey !== Key.ctrl) {
                        const handled = this.activeField.deleteHandler(target);

                        if (handled) {
                            event.preventDefault();
                        }
                    }

                    break;
                case Key.spacebar:
                    if (this.activeField && lastKey !== Key.ctrl) {
                        const handled = this.activeField.spaceHandler(target);

                        if (handled) {
                            event.preventDefault();
                        }
                    }

                    break;
                case Key.alt:
                    event.preventDefault();

                    var projectionElement = getProjection(target);
                    if (projectionElement) {
                        const { projection: id } = projectionElement.dataset;
                        let projection = this.projectionModel.getProjection(id);
                        projection.changeView();
                    }

                    rememberKey = true;

                    break;
                case Key.enter:
                    if (this.activeField) {
                        const handled = this.activeField.enterHandler(target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    } else if (nature === "layout") {
                        let element = this.getLayout(target);
                        const handled = element.enterHandler(target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    } else {
                        event.preventDefault();
                    }

                    break;
                case Key.escape:
                    if (this.activeField) {
                        const handled = this.activeField.escapeHandler(target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    } else if (nature === "static") {
                        let element = this.getStatic(target);
                        const handled = element.escapeHandler(target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    } else if (nature === "layout") {
                        let element = this.getLayout(target);
                        const handled = element.escapeHandler(target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    }

                    break;
                case Key.insert:
                    if (this.activeField) {
                        event.preventDefault();
                    }

                    break;
                case Key.up_arrow:
                    if (this.activeField) {
                        const handled = this.activeField.arrowHandler("up", target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    } else {
                        let element = this.resolveElement(target);
                        if (element) {
                            const handled = element.arrowHandler("up", target) === true;

                            if (handled) {
                                event.preventDefault();
                            }
                        }
                    }

                    break;
                case Key.down_arrow:
                    if (this.activeField) {
                        const handled = this.activeField.arrowHandler("down", target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    } else {
                        let element = this.resolveElement(target);
                        if (element) {
                            const handled = element.arrowHandler("down", target) === true;

                            if (handled) {
                                event.preventDefault();
                            }
                        }
                    }

                    break;
                case Key.right_arrow:
                    if (this.activeField) {
                        const handled = this.activeField.arrowHandler("right", target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    } else {
                        let element = this.resolveElement(target);

                        if (element) {
                            const handled = element.arrowHandler("right", target) === true;

                            if (handled) {
                                event.preventDefault();
                            }
                        }
                    }

                    break;
                case Key.left_arrow:
                    if (this.activeField) {
                        const handled = this.activeField.arrowHandler("left", target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    } else {
                        let element = this.resolveElement(target);
                        if (element) {
                            const handled = element.arrowHandler("left", target) === true;

                            if (handled) {
                                event.preventDefault();
                            }
                        }
                    }

                    break;

                case "s":
                    if (lastKey === Key.ctrl) {
                        this.activeConcept.copy();

                        event.preventDefault();
                    }

                    break;
                default:
                    break;
            }

            if (rememberKey) {
                lastKey = event.key;
            }

        }, false);

        this.body.addEventListener('keyup', (event) => {
            var target = event.target;

            switch (event.key) {
                case Key.spacebar:
                    if (lastKey === Key.ctrl) {
                        if (this.activeField) {
                            this.activeField._spaceHandler(target);
                        }
                    }

                    break;
                case Key.delete:
                    if (lastKey === Key.ctrl) {
                        if (this.activeField) {
                            this.activeField.delete(target);
                        }
                    }

                    break;
                case Key.ctrl:
                    if (lastKey === Key.ctrl) {
                        if (this.activeField) {
                            this.activeField.controlHandler(target);
                        }
                    }

                    break;
                case Key.alt:

                    break;
                default:
                    break;
            }

            lastKey = -1;
        }, false);

        this.body.addEventListener('focusin', (event) => {
            const target = event.target;

            const { nature } = target.dataset;

            var handler = focusinHandler[nature];

            if (handler) {
                handler.call(this, target);
            } else {
                if (this.activeField) {
                    this.activeField.focusOut(target);
                }

                this.activeField = null;
            }

            let projectionElement = getProjection(target);
            if (isHTMLElement(projectionElement)) {
                this.updateActiveElement(projectionElement);

                const { projection: id } = projectionElement.dataset;
                let projection = this.projectionModel.getProjection(id);

                this.updateActiveProjection(projection);

                // update active concept
                if (projection.concept) {
                    this.updateActiveConcept(projection.concept);
                }
            }
        });

        const focusinHandler = {
            'field': focusinField,
            'field-component': focusinField,
        };

        function focusinField(target) {
            const field = this.getField(target);

            if (this.activeField && this.activeField !== field) {
                this.activeField.focusOut();
                this.activeField = null;
            }

            if (isNullOrUndefined(field) || field === this.activeField) {
                if (this.activeField) {
                    this.activeField._focusIn(target);
                }

                return;
            }

            this.activeField = field;
            this.activeField.focusIn(target);
        }

        var dragElement = null;

        this.container.addEventListener('dragstart', (event) => {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("clientX", event.clientX);
            event.dataTransfer.setData("clientY", event.clientY);
            dragElement = event.target;
            this.body.classList.add("dragging");
        });

        this.container.addEventListener('dragend', (event) => {
            this.body.classList.remove("dragging");
            dragElement = null;
        });

        this.body.addEventListener('drop', (event) => {
            var prevClientX = event.dataTransfer.getData("clientX");
            var prevClientY = event.dataTransfer.getData("clientY");

            dragElement.style.top = `${dragElement.offsetTop - (prevClientY - event.clientY)}px`;
            dragElement.style.left = `${dragElement.offsetLeft - (prevClientX - event.clientX)}px`;
        });

        this.body.addEventListener('dragover', (event) => {
            event.preventDefault();
        });

        this.registerHandler("build-concept", buildConceptHandler);
        this.registerHandler("build-projection", buildProjectionHandler);
        this.registerHandler("export", () => this.export());
    }
};
