import {
    createDocFragment, createHeader, createSection, createH3, createDiv,
    createParagraph, createButton, createAnchor, createInput, removeChildren,
    isHTMLElement, findAncestor, isNullOrWhitespace, isNullOrUndefined, isEmpty,
    hasOwn, isFunction, valOrDefault, copytoClipboard
} from 'zenkai';
import { Events, hide, show, Key, getEventTarget, NotificationType, LogType, EditorMode } from '@utils/index.js';
import { buildProjectionHandler } from "../build-projection.js";
import { buildConceptHandler } from "../build-concept.js";
import { ConceptModelManager } from '@model/index.js';
import { createProjectionModel } from '@projection/index.js';
import { ProjectionWindow } from '../projection-window.js';
import { EditorHome } from './editor-home.js';
import { EditorMenu } from './editor-menu.js';
import { EditorStyle } from './editor-style.js';
import { EditorFile } from './editor-file.js';
import { EditorLog } from './editor-log.js';
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
 * Creates an editor file manager
 * @returns {EditorFile}
 */
function createEditorFile() {
    return Object.create(EditorFile, {
        object: { value: "environment" },
        name: { value: "editor-file" },
        type: { value: "file" },
        editor: { value: this }
    });
}

/**
 * Creates an editor log manager
 * @returns {EditorLog}
 */
function createEditorLog() {
    return Object.create(EditorLog, {
        object: { value: "environment" },
        name: { value: "editor-log" },
        type: { value: "log" },
        editor: { value: this }
    });
}

const EDITOR_CONFIG = {
    "root": [],
    "mode": EditorMode.MODEL,
    "header": {
        "css": ["editor-header"]
    },
    "body": {
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
    /** @type {ProjectionModel} */
    projectionModel: null,
    /** @type {Concept} */
    concept: null,
    /** @type {Concept} */
    activeConcept: null,
    /** @type {Projection} */
    activeProjection: null,

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
    /** @type {EditorFile} */
    files: null,
    /** @type {EditorLog} */
    logs: null,
    /** @type {HTMLInputElement} */
    input: null,


    /** @type {HTMLElement} */
    activeElement: null,

    /** @type {*} */
    config: null,

    /** @type {boolean} */
    active: false,
    handlers: null,

    init(args = {}) {
        const { conceptModel, projectionModel, concept, projection, config = EDITOR_CONFIG, handlers = {} } = args;

        this.conceptModel = conceptModel;
        this.projectionModel = projectionModel;
        this.concept = concept;
        this.projection = projection;

        // Editor configuration
        this.config = config;
        this.handlers = {};

        for (const key in handlers) {
            const handler = handlers[key];
            this.registerHandler(key, handler);
        }

        if (this.config) {
            this.header = createEditorHeader.call(this).init();
        }

        this.projectionWindow = createProjectionWindow.call(this).init();

        this.menu = createEditorMenu.call(this).init(this.config.menu);
        this.home = createEditorHome.call(this).init(this.config.home);
        this.style = createEditorStyle.call(this).init(this.config.style);
        this.files = createEditorFile.call(this).init(this.config.files);
        this.logs = createEditorLog.call(this).init(this.config.logs);

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
        this.files.update(this.config.files);
        this.logs.update(this.config.logs);
    },
    getRoots() {
        const { root = [] } = this.config;

        if (isEmpty(root)) {
            return this.conceptModel.getSchema("concrete");
        }

        return root;
    },
    getMode() {
        return valOrDefault(this.config.mode, EditorMode.MODEL);
    },

    /**
     * Creates a concept instance
     * @param {string} name 
     */
    createInstance(name) {
        if (!this.conceptModel.isConcept(name)) {
            this.notify(`The concept '${name}' is not defined in the model`, NotificationType.ERROR);
            return false;
        }

        let concept = this.conceptModel.createConcept(name);

        return this.addInstance(concept);
    },
    /**
     * Creates a projection for a concept instance
     * @param {*} concept 
     * @param {boolean} hasToolbar 
     * @returns {HTMLElement}
     */
    addInstance(concept, schema = {}, hasToolbar = true) {
        if (isNullOrUndefined(concept)) {
            this.notify(`The concept is not valid`, NotificationType.ERROR);
            return false;
        }

        const { name } = concept;

        let projection = this.projectionModel.createProjection(concept, schema.tag).init();

        let title = createH3({
            class: ["title", "editor-concept-title"],
        }, name);

        let header = createHeader({
            class: ["editor-concept-header"],
        }, [title]);

        if (hasToolbar) {
            let btnDelete = createButton({
                class: ["btn", "editor-concept-toolbar__btn-delete"],
                title: `Delete ${name.toLowerCase()}`
            });
            btnDelete.addEventListener('click', (event) => {
                if (concept.delete(true)) {
                    removeChildren(instanceContainer);
                    instanceContainer.remove();
                }
            });

            let btnNew = createButton({
                class: ["btn", "editor-concept-toolbar__btn-new"],
                title: `New ${name.toLowerCase()}`
            });
            btnNew.addEventListener('click', (event) => {
                this.createInstance(name);
            });

            let btnCollapse = createButton({
                class: ["btn", "editor-concept-toolbar__btn-collapse"],
                title: `Collapse ${name.toLowerCase()}`
            });
            btnCollapse.addEventListener('click', (event) => {
                instanceContainer.classList.toggle('collapsed');
            });

            let btnMaximize = createButton({
                class: ["btn", "editor-concept-toolbar__btn-maximize"],
                title: `Maximize ${name.toLowerCase()}`
            });
            btnMaximize.addEventListener('click', (event) => {
                instanceContainer.classList.toggle('focus');
            });

            let toolbar = createDiv({
                class: ["editor-concept-toolbar"],
            }, [btnCollapse, btnMaximize, btnDelete]);

            header.append(btnNew, toolbar);
        }

        let instanceContainer = createDiv({
            class: ["editor-concept"],
            draggable: false,
            dataset: {
                nature: "concept-container"
            }
        }, [header, projection.render()]);

        this.conceptSection.appendChild(instanceContainer);

        projection.focus();

        return instanceContainer;
    },
    initInstance() {
        if (!this.isReady) {
            return;
        }

        if (this.concept) {
            let container = this.addInstance(this.concept, this.projection, false);
            container.classList.add("focus");

            return true;
        }

        this.conceptModel.getRootConcepts().forEach(concept => {
            this.addInstance(concept);
        });

        return this;
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
    /**
     * Verifies that the editor has both model loaded
     * @returns {boolean} Value indicating whether the editor has both model loaded
     */
    get isReady() { return this.hasConceptModel && this.hasProjectionModel; },

    // Model concept operations

    addConcept(concepts) {
        if (Array.isArray(concepts)) {
            this.conceptModel.schema.push(...concepts);
        }

        this.refresh();
    },

    // Model projection operations

    addProjection(projections) {
        if (Array.isArray(projections)) {
            this.projectionModel.schema.push(...projections);
        }

        this.refresh();
    },

    // Projection elements

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

        return this.projectionModel.getField(id);
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

        return this.projectionModel.getStatic(id);
    },
    /**
     * Get a the related layout object
     * @param {HTMLElement} element 
     * @returns {Layout}
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

        if (!["layout", "layout-component"].includes(nature)) {
            console.warn("Layout error: Unknown nature attribute on field");
            return null;
        }

        return this.projectionModel.getLayout(id);
    },
    resolveElement(element) {
        if (!isHTMLElement(element)) {
            return null;
        }

        const { nature } = element.dataset;

        if (isNullOrUndefined(nature)) {
            return null;
        }

        let projectionElement = null;

        switch (nature) {
            case "field":
            case "field-component":
                projectionElement = this.getField(element);
                break;
            case "layout":
            case "layout-component":
                projectionElement = this.getLayout(element);
                break;
            case "static":
                projectionElement = this.getStatic(element);
                break;
        }

        if (projectionElement) {
            projectionElement.environment = this;
        }

        return projectionElement;
    },

    // Editor actions

    download(obj) {
        this.files.addFile(obj);

        this.refresh();

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
            "projection": this.projectionModel.schema,
            "editor": this.config
        };

        var bb = new Blob([JSON.stringify(result)], { type: MIME_TYPE });
        Object.assign(link, {
            download: `model.json`,
            href: window.URL.createObjectURL(bb),
        });

        link.dataset.downloadurl = [MIME_TYPE, link.download, link.href].join(':');
        if (copy) {
            copytoClipboard(JSON.stringify(result));
            this.notify("The model has been copied to clipboard", NotificationType.SUCCESS);
        } else {
            link.click();
            this.notify("The model has been downloaded", NotificationType.SUCCESS);
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
    notify(message, type, time = 4500) {
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
        }, time);
    },
    log(messages, title, type = LogType.NORMAL) {
        this.logs.addLog(messages, title, type);

        this.refresh();
        
        return messages;
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
        this.manager.deleteEditor(this);

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

        if (isEmpty(schema)) {
            this.notify("The concept model is empty", NotificationType.ERROR);

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
        }

        this.initInstance();
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

        if (isEmpty(schema)) {
            this.notify("The projection model is empty", NotificationType.ERROR);

            return false;
        }

        this.unloadProjectionModel();
        this.clear();

        this.projectionModel = createProjectionModel(schema, this).init(views);

        if (isNullOrUndefined(this.projectionModel)) {
            // TODO: add validation and notify of errors
        }

        this.initInstance();
        this.refresh();

        return this;
    },
    /**
     * Parse and load a file
     * @param {JSON} json 
     * @param {string} type 
     */
    load(json, type) {
        const file = JSON.parse(json);

        switch (type) {
            case "model":
                if (Array.isArray(file)) {
                    this.loadConceptModel(file);
                } else {
                    const { concept, values = [], projection = [], editor } = file;

                    this.loadConceptModel(concept, values);


                    if (!isEmpty(projection)) {
                        this.notify("A projection was found in the model.", NotificationType.NORMAL, 2000);

                        this.loadProjectionModel(projection);
                    }

                    if (editor) {
                        this.setConfig(editor);
                    }
                }

                break;
            case "projection":
                if (Array.isArray(file)) {
                    this.loadProjectionModel(file);
                } else {
                    const { projection, views = [] } = file;

                    this.loadProjectionModel(projection, views);
                }

                break;
            default:
                this.notify(`File type '${type}' is not handled`, NotificationType.WARNING);

                return false;
        }

        return true;
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
        if (this.conceptSection) {
            removeChildren(this.conceptSection);
        }

        this.activeElement = null;
        this.activeConcept = null;
        this.activeProjection = null;

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


        if (!this.home.isRendered) {
            fragment.appendChild(this.home.render());
        }

        if (!this.style.isRendered) {
            fragment.appendChild(this.style.render());
        }

        if (!this.header.isRendered) {
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

            if (!this.files.isRendered) {
                this.footer.append(this.files.render());
            }

            if (!this.logs.isRendered) {
                this.footer.append(this.logs.render());
            }

            fragment.appendChild(this.footer);
        }

        if (!isHTMLElement(this.projectionWindow.container)) {
            fragment.appendChild(this.projectionWindow.render());
        }

        if (!this.menu.isRendered) {
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

        this.initInstance();
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
        this.files.refresh();
        this.logs.refresh();
        this.projectionWindow.refresh();

        return this;
    },
    /**
     * Updates the active HTML Element
     * @param {HTMLElement} element 
     */
    updateActiveElement(element) {
        if (this.activeElement && this.activeElement === element) {
            return;
        }

        this.activeElement = element;

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

        // let parent = this.activeElement.parentElement;

        // while (parent) {
        //     if (hasOwn(parent.dataset, 'projection')) {
        //         parent.classList.add("active-parent");
        //     }

        //     parent = parent.parentElement;
        // }

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
        var fileType = null;

        const ActionHandler = {
            "open": (target) => {
                const { context } = target.dataset;

                if (context) {
                    this[context].open();
                } else {
                    this.open();
                }
            },
            "close": (target) => {
                const { context } = target.dataset;

                if (context) {
                    this[context].close();
                } else {
                    this.close();
                }
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

            "style": (target) => { this.style.toggle(); },
            "home": (target) => { this.home.toggle(); },
            "files": (target) => { this.files.toggle(); },
            "logs": (target) => { this.logs.toggle(); },

            "export": (target) => { this.export(); },
            "copy": (target) => { this.export(true); },

            "load-model": (target) => {
                let event = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                });
                fileType = "model";

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
                fileType = "projection";

                this.input.dispatchEvent(event);
            },
            "unload-projection": (target) => {
                this.unloadProjectionModel();
            },
            "reload-projection": (target) => {
                const { schema, views } = this.projectionModel;

                this.loadProjectionModel(schema, views);
            }
        };

        this.container.addEventListener('click', (event) => {
            var target = getEventTarget(event.target);

            const { action, handler, downloadable } = target.dataset;

            if (this.activeElement) {
                this.activeElement.clickHandler(target);
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
            } else if (action) {
                this.triggerEvent({
                    "name": action,
                });
            }
        }, true);

        this.input.addEventListener('change', (event) => {
            let file = this.input.files[0];

            if (!file.name.endsWith('.json')) {
                this.notify("This file is not supported. Please use a .json file");
                return;
            }

            let reader = new FileReader();
            reader.onload = (event) => {
                this.load(reader.result, fileType);
                fileType = null;
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
                    if (this.activeElement && lastKey !== Key.ctrl) {
                        const handled = this.activeElement.backspaceHandler(target) === true;

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
                    if (this.activeElement && lastKey !== Key.ctrl) {
                        const handled = this.activeElement.deleteHandler(target);

                        if (handled) {
                            event.preventDefault();
                        }
                    }

                    break;
                case Key.spacebar:
                    if (this.activeElement && lastKey !== Key.ctrl) {
                        const handled = this.activeElement.spaceHandler(target);

                        if (handled) {
                            event.preventDefault();
                        }
                    }

                    break;
                case Key.alt:
                    event.preventDefault();

                    // if (this.activeProjection && this.activeProjection.hasMultipleViews) {
                    //     this.activeProjection.changeView();
                    // }

                    rememberKey = true;

                    break;
                case Key.enter:
                    if (this.activeElement) {
                        const handled = this.activeElement.enterHandler(target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    } else if (target.tagName === "BUTTON") {
                        target.click();
                        event.preventDefault();
                    } else {
                        event.preventDefault();
                    }

                    break;
                case Key.escape:
                    if (this.activeElement) {
                        const handled = this.activeElement.escapeHandler(target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    }

                    break;
                case Key.insert:
                    if (this.activeElement) {
                        event.preventDefault();
                    }

                    break;
                case Key.up_arrow:
                    if (this.activeElement) {
                        const handled = this.activeElement.arrowHandler("up", target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    }

                    break;
                case Key.down_arrow:
                    if (this.activeElement) {
                        const handled = this.activeElement.arrowHandler("down", target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    }

                    break;
                case Key.right_arrow:
                    if (this.activeElement) {
                        const handled = this.activeElement.arrowHandler("right", target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    }

                    break;
                case Key.left_arrow:
                    if (this.activeElement) {
                        const handled = this.activeElement.arrowHandler("left", target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    }

                    break;

                case "s":
                    if (lastKey === Key.ctrl) {
                        this.activeConcept.copy();

                        event.preventDefault();
                    }

                    break;
                case "e":
                    if (lastKey === Key.ctrl && this.activeConcept) {
                        let editor = this.manager.createEditor().init({
                            conceptModel: this.conceptModel,
                            projectionModel: this.projectionModel,
                            concept: this.activeConcept,
                            projection: this.activeProjection,
                            config: this.config,
                        });

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
                        if (this.activeElement) {
                            this.activeElement._spaceHandler(target);
                        }
                    }

                    break;
                case Key.delete:
                    if (lastKey === Key.ctrl) {
                        if (this.activeElement) {
                            this.activeElement.delete(target);
                        }
                    }

                    break;
                case Key.ctrl:
                    if (lastKey === Key.ctrl) {
                        if (this.activeElement) {
                            this.activeElement.controlHandler(target);
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
            const { target } = event;

            const element = this.resolveElement(target);

            if (element && element.projection.focusable && element.focusable) {
                if (this.activeElement && this.activeElement !== element) {
                    this.activeElement.focusOut();
                    this.activeElement = null;
                }

                if (isNullOrUndefined(element) || element === this.activeElement) {
                    if (this.activeElement) {
                        this.activeElement._focusIn(target);
                    }

                    return;
                }

                this.updateActiveElement(element);
                this.activeElement.focusIn(target);
            } else if (element) {
                // TODO
            } else {
                if (this.activeElement) {
                    this.activeElement.focusOut(target);
                }

                this.activeElement = null;
            }

            if (this.activeElement) {
                let projection = this.activeElement.projection;

                this.updateActiveProjection(projection);
                this.updateActiveConcept(projection.concept);
            }
        });

        /** @type {HTMLElement} */
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

            dragElement.style.top = `${Math.max(dragElement.offsetTop - (prevClientY - event.clientY), 0)}px`;
            dragElement.style.left = `${Math.max(dragElement.offsetLeft - (prevClientX - event.clientX), 0)}px`;
        });

        this.body.addEventListener('dragover', (event) => {
            event.preventDefault();
        });

        this.registerHandler("build-concept", buildConceptHandler);
        this.registerHandler("build-projection", buildProjectionHandler);
        this.registerHandler("export", () => this.export());
        this.registerHandler("copy", () => this.export(true));
    }
};
