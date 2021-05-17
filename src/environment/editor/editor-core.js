import {
    createDocFragment, createSection, createDiv, createParagraph, createAnchor, createInput,
    createAside, createUnorderedList, createListItem, createButton, createI, removeChildren,
    isHTMLElement, findAncestor, isNullOrWhitespace, isNullOrUndefined, isEmpty, isFunction,
    valOrDefault, copytoClipboard, getElements, shortDateTime,
} from 'zenkai';
import { hide, show, toggle, Key, getEventTarget, NotificationType, getClosest, highlight, unhighlight } from '@utils/index.js';
import { buildProjectionHandler } from "@generator/build-projection.js";
import { buildConceptHandler } from "@generator/build-concept.js";
import { ConceptModelManager } from '@model/index.js';
import { createProjectionModel } from '@projection/index.js';
import { ProjectionWindow } from '../projection-window.js';
import { EditorHome } from './editor-home.js';
import { EditorBreadcrumb } from './editor-breadcrumb.js';
import { EditorFilter } from './editor-filter.js';
import { EditorMenu } from './editor-menu.js';
import { EditorStyle } from './editor-style.js';
import { EditorLog } from './editor-log.js';
import { EditorSection } from './editor-section.js';
import { EditorInstance } from './editor-instance.js';
import { EditorDesign } from './editor-design.js';


var inc = 0;

const nextInstanceId = () => `instance${inc++}`;
const nextValueId = () => `value${inc++}`;

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
 * Creates an editor breadcrumb
 * @returns {EditorBreadcrumb}
 */
function createEditorBreadcrumb() {
    return Object.create(EditorBreadcrumb, {
        object: { value: "environment" },
        name: { value: "editor-breadcrumb" },
        type: { value: "breadcrumb" },
        editor: { value: this }
    });
}

/**
 * Creates an editor breadcrumb
 * @returns {EditorFilter}
 */
function createEditorFilter() {
    return Object.create(EditorFilter, {
        object: { value: "environment" },
        name: { value: "editor-filter" },
        type: { value: "filter" },
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

/**
 * 
 * @param {HTMLElement} element 
 * @returns 
 */
const isInputCapable = (element) => isHTMLElement(element, ["input", "textarea"]) || element.contentEditable === "true";


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
    /** @type {EditorInstance} */
    activeInstance: null,

    /** @type {HTMLElement} */
    container: null,
    /** @type {EditorSection} */
    header: null,
    /** @type {HTMLElement} */
    body: null,
    /** @type {HTMLElement} */
    footer: null,
    /** @type {HTMLElement} */
    instanceSection: null,
    /** @type {HTMLElement} */
    designSection: null,
    /** @type {HTMLElement} */
    navigationSection: null,
    /** @type {HTMLElement} */
    valueWindow: null,
    /** @type {HTMLElement} */
    valueList: null,
    /** @type {EditorBreadcrumb} */
    breadcrumb: null,
    /** @type {EditorFilter} */
    filter: null,
    /** @type {EditorMenu} */
    menu: null,
    /** @type {EditorHome} */
    home: null,
    /** @type {EditorStyle} */
    style: null,
    /** @type {EditorLog} */
    logs: null,

    /** @type {HTMLInputElement} */
    input: null,
    copyValue: null,


    /** @type {HTMLElement} */
    activeElement: null,
    /** @type {Set<HTMLElement>} */
    decoratedElements: null,

    /** @type {*} */
    config: null,

    /** @type {boolean} */
    active: false,
    /** @type {boolean} */
    visible: false,
    /** @type {boolean} */
    frozen: false,
    /** @type {Map} */
    handlers: null,
    /** @type {Map<string,EditorInstance>} */
    instances: null,
    /** @type {Map} */
    values: null,
    /** @type {Map<string,File>} */
    resources: null,
    /** @type {Map} */
    models: null,

    init(args = {}) {
        const { conceptModel, projectionModel, config = {}, handlers = {} } = args;

        this.conceptModel = conceptModel;
        this.projectionModel = projectionModel;

        this.config = valOrDefault(config, {});
        this.handlers = new Map();
        this.instances = new Map();
        this.values = new Map();
        this.resources = new Map();
        this.models = new Map();

        this.decoratedElements = new Set();

        for (const key in handlers) {
            const handler = handlers[key];
            this.registerHandler(key, handler);
        }

        this.header = createEditorHeader.call(this).init();
        if (this.config.actions) {
            this.menu = createEditorMenu.call(this).init(this.config);
        }
        this.home = createEditorHome.call(this).init();
        this.breadcrumb = createEditorBreadcrumb.call(this).init();
        this.filter = createEditorFilter.call(this).init();
        this.style = createEditorStyle.call(this).init();
        this.logs = createEditorLog.call(this).init();

        this.render();

        if (this.isReady) {
            this.conceptModel.getRootConcepts().forEach(concept => {
                this.createInstance(concept);
            });
        }

        return this;
    },

    setConfig(schema) {
        if (isNullOrUndefined(schema)) {
            return false;
        }

        this.config = schema;

        if (this.config.actions) {
            if (isNullOrUndefined(this.menu)) {
                this.menu = createEditorMenu.call(this).init(this.config);
                this.container.append(this.menu.render());
            }

            this.menu.update(this.config);
        }

        this.refresh();

        return this;
    },
    getConfig(prop) {
        if (isNullOrUndefined(prop)) {
            return this.config;
        }

        return this.config[prop];
    },
    /**
     * Gets the config name or default
     * @returns {string}
     */
    getName() {
        return valOrDefault(this.config.name, `editor${(new Date().getTime())}`);
    },

    /**
     * Creates a concept instance
     * @param {string} name 
     */
    createInstance(concept, _projection, _options) {
        if (isNullOrUndefined(concept)) {
            this.notify(`The concept is not valid`, NotificationType.ERROR);
            return false;
        }

        let projection = valOrDefault(_projection, this.projectionModel.createProjection(concept).init());

        let instance = Object.create(EditorInstance, {
            id: { value: nextInstanceId() },
            object: { value: "environment" },
            name: { value: "editor-instance" },
            type: { value: "instance" },
            concept: { value: concept },
            projection: { value: projection },
            editor: { value: this }
        });

        const options = Object.assign({
            type: "concept",
            minimize: true,
            resize: true,
            maximize: true,
            close: "DELETE-CONCEPT"
        }, _options);

        instance.init(options);

        return this.addInstance(instance);
    },
    /**
     * Gets an instance in the editor
     * @param {string} id 
     * @returns {EditorInstance}
     */
    getInstance(id) {
        return this.instances.get(id);
    },
    /**
     * Adds instance to editor
     * @param {EditorInstance} instance 
     * @returns {HTMLElement}
     */
    addInstance(instance) {
        if (!instance.isRendered) {
            this.instanceSection.append(instance.render());
            // instance.projection.focus();
        }

        this.instances.set(instance.id, instance);
        this.updateActiveInstance(instance);

        this.refresh();

        return instance;
    },
    /**
     * Removes an instance from the editor
     * @param {string} id 
     * @returns {boolean}
     */
    removeInstance(id) {
        let instance = this.getInstance(id);

        if (isNullOrUndefined(instance)) {
            return false;
        }

        if (instance === this.activeInstance) {
            this.activeInstance = null;
        }

        this.instances.delete(id);

        this.refresh();

        return true;
    },
    moveInstance(item, index) {
        this.instanceSection.children[index].before(item);

        return this;
    },
    swapInstance(item1, item2) {
        let instances = Array.from(this.instanceSection.children);
        const index1 = instances.indexOf(item1);
        const index2 = instances.indexOf(item2);

        this.moveInstance(item2, index1);
        this.moveInstance(item1, index2);

        return this;
    },

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
     * Verifies that the editor has an instance created
     * @returns {boolean} Value indicating whether the editor has an instance created
     */
    get hasInstances() { return this.instances.size > 0; },
    /**
     * Verifies that the editor has a value copied
     * @returns {boolean} Value indicating whether the editor has a value copied
     */
    get hasValues() { return this.values.size > 0; },
    /**
     * Verifies that the editor has both model loaded
     * @returns {boolean} Value indicating whether the editor has both model loaded
     */
    get isReady() { return this.hasConceptModel && this.hasProjectionModel; },
    /**
     * Verifies that the editor has an active concept
     * @returns {boolean} Value indicating whether the editor has an active concept
     */
    get hasActiveConcept() { return !isNullOrUndefined(this.activeConcept); },
    /**
     * Verifies that the editor has an active projection
     * @returns {boolean} Value indicating whether the editor has an active projection
     */
    get hasActiveProjection() { return !isNullOrUndefined(this.activeProjection); },
    /**
     * Verifies that the editor has an active instance
     * @returns {boolean} Value indicating whether the editor has an active instance
     */
    get hasActiveInstance() { return !isNullOrUndefined(this.activeInstance); },

    // Model concept operations

    /**
     * Creates a concept
     * @param {string} name 
     * @returns {Concept}
     */
    createConcept(name) {
        if (isNullOrUndefined(name)) {
            throw new TypeError("Missing argument: The 'name' is required to create a concept");
        }

        if (!this.conceptModel.isConcept(name)) {
            this.notify(`The concept '${name}' is not defined in the model`, NotificationType.ERROR);
            return false;
        }

        let concept = this.conceptModel.createConcept(name);

        return concept;
    },
    /**
     * Adds concepts schema to model
     * @param {Concept[]|Concept} concepts 
     */
    addConcept(concepts) {
        if (Array.isArray(concepts)) {
            this.conceptModel.schema.push(...concepts);
        } else {
            this.conceptModel.schema.push(concepts);
        }

        this.refresh();
    },

    // Model projection operations

    /**
     * Creates a concept
     * @param {Concept} concept 
     * @param {string} [tag] 
     * @returns {Concept}
     */
    createProjection(concept, tag) {
        if (isNullOrUndefined(concept)) {
            throw new TypeError("Missing argument: The 'concept' is required to create a projection");
        }

        if (!this.projectionModel.hasConceptProjection(concept, tag)) {
            this.notify(`The projection for the concept '${concept.name}' is not defined in the model`, NotificationType.ERROR);
            return false;
        }

        let projection = this.projectionModel.createProjection(concept, tag).init();

        return projection;
    },
    /**
     * Adds projections schema to model
     * @param {Projection[]|Projection} projections 
     */
    addProjection(projections) {
        if (Array.isArray(projections)) {
            this.projectionModel.schema.push(...projections);
        } else {
            this.projectionModel.schema.push(projections);
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

        if (!["static", "static-component"].includes(nature)) {
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
            case "static-component":
                projectionElement = this.getStatic(element);
                break;
        }

        if (projectionElement) {
            projectionElement.environment = this;
        }

        return projectionElement;
    },

    // Editor actions

    download(obj, name, type) {
        const MIME_TYPE = 'application/json';
        window.URL = window.webkitURL || window.URL;

        /** @type {HTMLAnchorElement} */
        var link = createAnchor({
            class: ["bare-link", "download-item__link"]
        }, `Download`);

        if (!isNullOrWhitespace(link.href)) {
            window.URL.revokeObjectURL(link.href);
        }

        var bb = new Blob([JSON.stringify(obj)], { type: MIME_TYPE });
        Object.assign(link, {
            download: `${valOrDefault(name, (new Date().getTime()))}.jsoncp`,
            href: window.URL.createObjectURL(bb),
        });

        link.dataset.downloadurl = [MIME_TYPE, link.download, link.href].join(':');
        link.click();

        // Need a small delay for the revokeObjectURL to work properly.
        setTimeout(() => {
            window.URL.revokeObjectURL(link.href);
            link.remove();
        }, 1500);

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
        this.container.append(link);

        if (!isNullOrWhitespace(link.href)) {
            window.URL.revokeObjectURL(link.href);
        }

        const result = {
            "concept": this.conceptModel.schema,
            "values": this.conceptModel.export(),
            "editor": this.config,
            "meta": {
                "date": shortDateTime(),
                "device": navigator.userAgent
            }
        };

        var bb = new Blob([JSON.stringify(result)], { type: MIME_TYPE });
        Object.assign(link, {
            download: `model.jsoncp`,
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

        const CSS_OPEN = "open";

        if (type) {
            notify.classList.add(type);
        }

        this.container.append(notify);

        setTimeout(() => {
            notify.classList.add(CSS_OPEN);
        }, 50);

        setTimeout(() => {
            notify.classList.remove(CSS_OPEN);
            setTimeout(() => { notify.remove(); }, 500);
        }, time);
    },
    /**
     * Adds a resource to the editor
     * @param {File} file 
     * @param {string} [_name] 
     * @returns 
     */
    addResource(file, _name) {
        let name = valOrDefault(_name, file.name.split(".")[0]);
        this.resources.set(name, file);

        let reader = new FileReader();
        reader.onload = (event) => {
            this.addModel(name, reader.result);
        };
        reader.readAsText(file);

        this.refresh();

        return file;
    },
    /**
     * Gets a resource from the register
     * @param {string} name 
     * @returns 
     */
    getResource(name) {
        return this.resources.get(name);
    },
    /**
     * Verifies the presence of a resource in the register
     * @param {string} name 
     * @returns {boolean}
     */
    hasResource(name) {
        return this.resources.has(name);
    },
    /**
     * Removes a resource from the register
     * @param {string} name 
     * @returns 
     */
    removeResource(name) {
        this.resources.delete(name);

        this.triggerEvent({ name: "resource.removed" });

        this.refresh();

        return true;
    },

    /**
     * Gets a model from the register
     * @param {string} name 
     * @returns 
     */
    getModel(name) {
        let schema = this.models.get(name);

        if (isNullOrUndefined(schema)) {
            return null;
        }

        return JSON.parse(schema);
    },
    /**
     * Adds a model to the register
     * @param {string} name 
     * @param {*} schema 
     */
    addModel(name, schema) {
        this.models.set(name, schema);
    },
    /**
     * Removes a model from the register
     * @param {string} name 
     * @returns 
     */
    removeModel(name) {
        this.triggerEvent({ name: "model.remove@pre", args: [name] }, () => {
            this.models.delete(name);

            this.refresh();

            this.triggerEvent({ name: "model.remove@post" });
        }, false);

        return true;
    },
    /**
     * Verifies the presence of a model in the register
     * @param {string} name 
     * @returns {boolean}
     */
    hasModel(name) {
        return this.models.has(name);
    },


    /**
     * Gets a value in the editor
     * @param {string} id 
     * @returns {EditorInstance}
     */
    getValue(id) {
        if (!this.values.has(id)) {
            return;
        }

        return this.values.get(id);
    },
    /**
     * Adds a value to editor
     * @param {EditorInstance} instance 
     * @returns {HTMLElement}
     */
    addValue(value) {
        let id = nextValueId();

        let icoCopy = createI({
            class: ["ico", "ico-copy"]
        });

        let icoDelete = createI({
            class: ["ico", "ico-delete"]
        }, "✖");

        let btnCopy = createButton({
            class: ["btn", "btn-copy", "fit-content"],
            title: `Copy ${value.name}`
        }, [icoCopy, value.name]);

        let btnDelete = createButton({
            class: ["btn", "btn-delete"]
        }, icoDelete);

        let item = createListItem({
            class: ["model-value"],
            dataset: {
                id: id,
            }
        }, [btnCopy, btnDelete]);

        btnCopy.addEventListener('click', (event) => {
            this.copy(value);
        });

        btnDelete.addEventListener('click', (event) => {
            this.removeValue(id);
        });

        if (this.values.size > 5) {
            let { id } = this.valueList.lastChild.dataset;
            this.removeValue(id);
        }

        this.valueList.prepend(item);

        this.values.set(id, {
            element: item,
            value: value,
        });

        this.refresh();

        return value;
    },
    removeValue(id) {
        if (isNullOrUndefined(id) || !this.values.has(id)) {
            return;
        }

        let { element } = this.values.get(id);

        removeChildren(element).remove();

        this.values.delete(id);

        this.refresh();

        return this;
    },

    copy(value, preserve = false) {
        this.copyValue = value;

        if (preserve) {
            this.addValue(value);
        }

        this.notify(`${value.name} copied`, NotificationType.NORMAL);

        return this;
    },
    paste(concept, _value) {
        let value = valOrDefault(_value, this.copyValue);

        concept.initValue(value);

        return this;
    },

    // Editor window actions

    /**
     * Makes the editor visible
     * @returns {Editor}
     */
    show() {
        this.triggerEvent({ name: "editor.show@pre" }, () => {
            show(this.container);
            this.visible = true;

            this.triggerEvent({ name: "editor.show@post" });
        }, false);

        return this;
    },
    /**
     * Hides the editor
     * @returns {Editor}
     */
    hide() {
        this.triggerEvent({ name: "editor.hide@pre" }, () => {
            hide(this.container);
            this.visible = false;

            this.triggerEvent({ name: "editor.hide@post" });
        }, false);

        return this;
    },
    toggle() {
        this.triggerEvent({ name: "editor.toggle@pre" }, () => {
            toggle(this.container);
            this.visible = !this.visible;

            this.triggerEvent({ name: "editor.toggle@post" });
        }, false);

        return this;
    },
    open() {
        this.triggerEvent({ name: "editor.open@pre" }, () => {
            this.show();
            this.active = true;

            if (this.isReady) {
                this.home.close();
            }

            this.triggerEvent({ name: "editor.open@post" });
        }, false);

        return this;
    },
    close() {
        this.triggerEvent({ name: "editor.close@pre" }, () => {
            this.hide();
            this.active = false;

            // cleanup
            this.done();
            this.clear();

            this.triggerEvent({ name: "editor.close@post" });
        }, false);

        return this;
    },
    destroy() {
        this.triggerEvent({ name: "editor.destroy@pre" }, () => {
            this.container.remove();
            this.manager.deleteEditor(this);
        }, false);

        return true;
    },
    freeze() {
        this.triggerEvent({ name: "editor.freeze@pre" }, () => {
            this.frozen = true;

            this.refresh();

            this.triggerEvent({ name: "editor.freeze@post" });
        }, false);

        return this;
    },
    unfreeze() {
        this.frozen = false;

        this.refresh();

        return this;
    },
    done() {
        if (this.conceptModel) {
            this.conceptModel.done();
        }

        if (this.projectionModel) {
            this.projectionModel.done();
        }

        return this;
    },
    highlight(element) {
        if (!isHTMLElement(element)) {
            return this;
        }

        highlight(element);
        this.decoratedElements.add(element);

        return this;
    },
    unhighlight(element) {
        if (!isHTMLElement(element)) {
            this.decoratedElements.forEach(element => unhighlight(element));
            this.decoratedElements.clear();

            return this;
        }

        unhighlight(element);
        this.decoratedElements.delete(element);

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

        this.conceptModel = ConceptModelManager.createModel(schema, this).init(values);

        if (isNullOrUndefined(this.conceptModel)) {
            // TODO: add validation and notify of errors
        }

        if (this.hasProjectionModel) {
            this.projectionModel.done();
        }

        this.triggerEvent({ name: "model.changed" });

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
        this.activeElement = null;
        this.activeInstance = null;
        this.activeConcept = null;
        this.activeProjection = null;


        this.projectionModel = createProjectionModel(schema, this).init(views);

        if (isNullOrUndefined(this.projectionModel)) {
            // TODO: add validation and notify of errors
        }

        this.triggerEvent({ name: "model.changed" });

        this.refresh();

        return this;
    },
    /**
     * Parse and load a file
     * @param {JSON} json 
     * @param {string} type 
     */
    load(file, type, name) {
        let reader = new FileReader();

        if (type === "model") {
            reader.onload = (event) => {
                const schema = JSON.parse(reader.result);

                if (Array.isArray(schema)) {
                    this.loadConceptModel(schema);
                } else {
                    const { concept, values = [], editor } = schema;

                    this.loadConceptModel(concept, values);

                    if (editor) {
                        this.setConfig(editor);
                    }
                }
            };
            reader.readAsText(file);
        } else if (type === "projection") {
            reader.onload = (event) => {
                const schema = JSON.parse(reader.result);

                if (Array.isArray(schema)) {
                    this.loadProjectionModel(schema);
                } else {
                    const { projection, views = [] } = schema;

                    this.loadProjectionModel(projection, views);
                }
            };
            reader.readAsText(file);
        } else if (type === "resource") {
            this.addResource(file, name);
        } else {
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
    /**
     * Clears the editor
     * @returns {Editor}
     */
    clear() {
        this.triggerEvent({ name: "editor.clear@pre" }, () => {
            this.instances.forEach(instance => instance.delete());
            this.instances.clear();
            this.resources.clear();
            this.models.clear();

            this.activeElement = null;
            this.activeInstance = null;
            this.activeConcept = null;
            this.activeProjection = null;

            this.refresh();

            this.triggerEvent({ name: "editor.clear@post" });
        }, false);

        return this;
    },
    design(element, _options) {
        if (isNullOrUndefined(element)) {
            return false;
        }

        /** @type {EditorDesign} */
        let design = Object.create(EditorDesign, {
            id: { value: nextInstanceId() },
            object: { value: "environment" },
            name: { value: "editor-instance" },
            type: { value: "instance" },
            element: { value: element },
            editor: { value: this }
        });

        const options = Object.assign({
            minimize: true,
            close: true
        }, _options);

        design.init(options);

        return this.designSection.append(design.render());
    },

    // Rendering and interaction management

    /**
     * Renders the editor in the DOM inside an optional container
     * @param {HTMLElement} [container] 
     */
    render(container) {
        const fragment = createDocFragment();

        if (!this.home.isRendered) {
            fragment.append(this.home.render());
        }

        if (!this.style.isRendered) {
            fragment.append(this.style.render());
        }

        if (!this.header.isRendered) {
            fragment.append(this.header.render());
        }

        if (!isHTMLElement(this.body)) {
            this.body = createDiv({
                class: ["editor-body"],
                tabindex: 0,
            });

            let mainSection = createDiv({
                class: ["editor-body-main"],
                tabindex: 0,
            });

            this.navigationSection = createSection({
                class: ["model-navigation-section"],
            });

            this.instanceSection = createSection({
                class: ["model-concept-section"],
            });

            mainSection.append(this.navigationSection, this.instanceSection);

            this.designSection = createAside({
                class: ["editor-body-aside", "model-design-section"],
            });

            this.body.append(mainSection, this.designSection);

            fragment.append(this.body);
        }

        if (!isHTMLElement(this.footer)) {
            this.footer = createDiv({
                class: ["editor-footer"],
                tabindex: 0,
            });


            this.valueWindow = createDiv({
                class: ["model-value-window"],
            });

            this.valueList = createUnorderedList({
                class: ["bare-list", "model-value-list"],
            });

            this.valueWindow.append(this.valueList);

            this.footer.append(this.valueWindow);

            if (!this.logs.isRendered) {
                this.footer.append(this.logs.render());
            }

            fragment.append(this.footer);
        }

        if (!this.breadcrumb.isRendered) {
            this.navigationSection.append(this.breadcrumb.render());
        }

        if (!this.filter.isRendered) {
            this.navigationSection.append(this.filter.render());
        }

        if (this.menu && !this.menu.isRendered) {
            fragment.append(this.menu.render());
        }

        if (!isHTMLElement(this.input)) {
            this.input = createInput({
                type: "file",
                class: ["hidden"],
                accept: '.json,.jsoncp'
            });

            fragment.append(this.input);
        }

        if (fragment.hasChildNodes()) {
            this.container.append(fragment);

            this.bindEvents();
        }

        if (isHTMLElement(container)) {
            container.append(this.container);
        }

        this.refresh();

        return this.container;
    },
    refresh(force = false) {
        if (this.frozen && !force) {
            return this;
        }

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

        this.hasValues ? show(this.valueWindow) : hide(this.valueWindow);

        this.header.refresh();
        this.breadcrumb.refresh();
        this.filter.refresh();
        if (this.menu) {
            this.menu.refresh();
        }
        this.home.refresh();
        this.style.refresh();
        this.logs.refresh();

        return this;
    },
    /**
     * Updates the active HTML Element
     * @param {HTMLElement} element 
     */
    updateActiveElement(element) {
        if (this.activeElement && this.activeElement === element) {
            return this;
        }

        this.activeElement = element;

        return this;
    },
    /**
     * Updates the active concept
     * @param {Concept} concept 
     */
    updateActiveConcept(concept) {
        if (this.activeConcept && this.activeConcept === concept) {
            return this;
        }

        this.activeConcept = concept;

        this.refresh();

        return this;
    },
    /**
     * Updates the active projection
     * @param {Projection} projection 
     */
    updateActiveProjection(projection) {
        if (this.activeProjection && this.activeProjection === projection) {
            return this;
        }

        let parents = getElements(".active-parent", this.body);
        for (let i = 0; i < parents.length; i++) {
            parents[i].classList.remove("active-parent");
        }

        this.activeProjection = projection;

        let parent = this.activeProjection.parent;
        while (parent) {
            parent.getContainer().classList.add("active-parent");
            parent = parent.parent;
        }

        this.refresh();

        return this;
    },
    /**
     * Updates the active instance
     * @param {EditorInstance} instance 
     */
    updateActiveInstance(instance) {
        if (this.activeInstance) {
            if (this.activeInstance === instance) {
                return this;
            }

            this.activeInstance.container.classList.remove("active");
        }

        this.activeInstance = instance;
        this.activeInstance.container.classList.add("active");

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
        return valOrDefault(this.handlers.get(name), []);
    },
    /**
     * Triggers an event, invoking the attached handler in the registered order
     * @param {*} event 
     */
    triggerEvent(event, callback, oneach = true) {
        const { name, options, args } = event;

        const handlers = this.getHandlers(name);

        const hasCallback = isFunction(callback);
        let halt = false;

        handlers.forEach((handler) => {
            let result = handler.call(this, args, options);

            if (result === false) {
                halt = true;
                return;
            }

            if (oneach && hasCallback) {
                callback.call(this, result);
            }
        });

        if (halt) {
            return false;
        }

        if (!oneach && hasCallback) {
            callback.call(this);
        }

        return true;
    },
    /**
     * Sets up a function that will be called whenever the specified event is triggered
     * @param {string} name 
     * @param {Function} handler The function that receives a notification
     */
    registerHandler(name, handler) {
        if (!this.hasHanlder(name)) {
            this.handlers.set(name, []);
        }

        this.handlers.get(name).push(handler);

        return true;
    },
    /**
     * Removes an event handler previously registered with `registerHandler()`
     * @param {string} name 
     * @param {Function} handler The function that receives a notification
     */
    unregisterHandler(name, handler) {
        if (!this.hasHanlder(name)) {
            return false;
        }

        let handlers = this.getHandlers(name);
        for (let i = 0; i < handlers.length; i++) {
            if (handlers[i] === handler) {
                handlers.splice(i, 1);

                return true;
            }
        }

        return false;
    },
    hasHanlder(name) {
        return this.handlers.has(name);
    },

    // Default events management

    bindEvents() {
        var lastKey = null;
        var fileType = null;
        var fileName = null;

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
                const { context, id, type } = target.dataset;

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
                        const { alias = "" } = parent.dataset;
                        parent.classList.toggle("collapsed");
                        let collapsed = parent.classList.contains("collapsed");
                        target.dataset.state = collapsed ? "ON" : "OFF";
                        target.title = collapsed ? `Expand ${alias.toLowerCase()}` : `Collapse ${alias.toLowerCase()}`;
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
            "delete:value": (target) => {
                const { id } = target.dataset;

                this.conceptModel.removeValue(id);
                this.header._valueSelector.update();
            },
            "delete:resource": (target) => {
                const { id } = target.dataset;

                this.removeResource(id);
            },

            "style": (target) => { this.style.toggle(); },
            "home": (target) => { this.home.toggle(); },
            "logs": (target) => { this.logs.toggle(); },

            "export": (target) => { this.export(); },
            "export--copy": (target) => { this.export(true); },

            "create-instance": (target) => {
                const { concept } = target.dataset;

                this.createInstance(this.createConcept(concept));
            },
            "copy:value": (target) => {
                const { id } = target.dataset;

                let value = this.conceptModel.getValue(id);
                this.copy(value);
            },



            "load-resource": (target) => {
                const { id } = target.dataset;

                let event = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                });
                fileType = "resource";
                fileName = id;

                this.input.dispatchEvent(event);
            },

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
                const { schema, values } = this.conceptModel;

                this.loadConceptModel(schema, values);
            },
            "download-model": (target) => {
                const { schema, values } = this.conceptModel;

                let name = this.getName().toLowerCase().replace(/\s+/g, " ").replace(" ", "_");

                this.download({
                    "concept": schema
                }, `${name}_model`);
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
            },
            "download-projection": (target) => {
                const { schema, views } = this.projectionModel;

                let name = this.getName().toLowerCase().replace(/\s+/g, " ").replace(" ", "_");

                this.download({
                    projection: schema
                }, `${name}_projection`);
            },
        };

        const dir = {
            [Key.up_arrow]: "up",
            [Key.right_arrow]: "right",
            [Key.down_arrow]: "down",
            [Key.left_arrow]: "left",
        };

        this.container.addEventListener('click', (event) => {
            var target = getEventTarget(event.target);

            const { action, context, id } = target.dataset;

            if (context === "instance") {
                let instance = this.getInstance(id);
                instance.actionHandler(action);
                return;
            }

            if (context === "menu") {
                this.menu.actionHandler(action);
                return;
            }

            if (this.activeElement) {
                this.activeElement.clickHandler(target);
            }

            const actionHandler = ActionHandler[action];

            if (isFunction(actionHandler)) {
                actionHandler(target);
                target.blur();
            } else if (action) {
                this.triggerEvent({ "name": action, });
            }
        }, true);

        this.input.addEventListener('change', (event) => {
            let file = this.input.files[0];
            this.load(file, fileType, fileName);
            fileType = null;
            this.input.value = "";
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
                case Key.shift:
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

                    break;
                case Key.enter:
                    if (this.activeElement) {
                        const handled = this.activeElement.enterHandler(target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    } else if (nature === "concept-container") {
                        this.activeInstance.projection.focus();
                    } else if (nature === "editable") {
                        target.blur();
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
                        } else {
                            this.filter.close();
                        }
                    }

                    break;
                case Key.insert:
                    if (this.activeElement) {
                        event.preventDefault();
                    }

                    break;
                case Key.up_arrow:
                case Key.right_arrow:
                case Key.down_arrow:
                case Key.left_arrow:
                    if (this.activeElement && ![Key.ctrl, Key.shift, Key.alt].includes(lastKey)) {
                        const handled = this.activeElement.arrowHandler(dir[event.key], target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    } else if (nature === "concept-container" && ![Key.ctrl, Key.shift, Key.alt].includes(lastKey)) {
                        let closestInstance = getClosest(target, dir[event.key], this.instanceSection);

                        if (!isHTMLElement(closestInstance)) {
                            return false;
                        }

                        closestInstance.focus();
                    }
                    break;
                case "s":
                    if (lastKey === Key.ctrl) {
                        this.activeConcept.copy();
                        this.header.valueCount++;
                        this.refresh();

                        event.preventDefault();
                    }

                    break;
                case "c":
                    if (lastKey === Key.ctrl) {
                        if (!isInputCapable(target)) {
                            this.copy(this.activeConcept.copy(false), true);

                            event.preventDefault();
                        }
                    }

                    break;
                case "v":
                    if (lastKey === Key.ctrl) {
                        if (!isInputCapable(target)) {
                            this.paste(this.activeConcept);

                            event.preventDefault();
                        }
                    }

                    break;
                case "e":
                    if (lastKey === Key.ctrl && this.activeConcept) {
                        this.createInstance(this.activeConcept, this.activeProjection, {
                            type: "projection",
                            close: "DELETE-PROJECTION"
                        });

                        event.preventDefault();
                    }

                    break;
                case "f":
                    if (lastKey === Key.ctrl) {
                        this.filter.show().focus();

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
            const { nature } = target.dataset;

            switch (event.key) {
                case Key.spacebar:
                    if (this.activeElement && lastKey === Key.ctrl) {
                        this.activeElement._spaceHandler(target);
                    }

                    break;
                case Key.delete:
                    if (this.activeElement && lastKey === Key.ctrl) {
                        this.activeElement.delete(target);
                    }

                    break;
                case Key.alt:
                    if (this.activeElement && lastKey === Key.ctrl) {
                        this.design(this.activeElement);
                    }

                    break;
                case Key.up_arrow:
                case Key.down_arrow:
                case Key.right_arrow:
                case Key.left_arrow:
                    if (this.activeElement && lastKey === Key.ctrl) {
                        const handled = this.activeElement._arrowHandler(dir[event.key], target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    } else if (nature === "concept-container" && lastKey === Key.ctrl) {
                        let closestInstance = getClosest(target, dir[event.key], this.instanceSection);

                        if (!isHTMLElement(closestInstance)) {
                            return false;
                        }

                        this.swapInstance(target, closestInstance, true);
                        target.focus();
                        lastKey = Key.ctrl;
                    }

                    break;

                default:
                    break;
            }

            if (lastKey === event.key) {
                lastKey = -1;
            }
        }, false);

        this.body.addEventListener('focusin', (event) => {
            const { target } = event;

            const element = this.resolveElement(target);
            lastKey = -1;

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

        this.body.addEventListener('dragover', (event) => { event.preventDefault(); });

        this.registerHandler("build-concept", buildConceptHandler);
        this.registerHandler("build-projection", buildProjectionHandler);
        this.registerHandler("export", () => this.export());
        this.registerHandler("copy", () => this.export(true));
        this.registerHandler("load-resource", () => {
            let event = new MouseEvent('click', { view: window, bubbles: true, cancelable: true, });
            fileType = "resource";

            this.input.dispatchEvent(event);
        });
        this.registerHandler("model.changed", () => {
            if (!this.isReady) {
                return;
            }

            this.conceptModel.getRootConcepts().forEach(concept => {
                this.createInstance(concept);
            });
        });
    }
};