import {
    createDocFragment, createSection, createDiv, createParagraph, createAnchor, createInput,
    createAside, createUnorderedList, createListItem, createButton, createI, removeChildren,
    getElement, isHTMLElement, findAncestor, isNullOrWhitespace, isNullOrUndefined, isEmpty,
    isFunction, valOrDefault, copytoClipboard, getElements, shortDateTime, last, formatDate, createSpan,
} from 'zenkai';
import {
    hide, show, toggle, Key, getEventTarget, NotificationType, getClosest, highlight,
    unhighlight, isInputCapable, shake,
} from '@utils/index.js';
import { ConceptModelManager } from '@model/index.js';
import { createProjectionModel } from '@projection/index.js';
import { EditorHome } from './editor-home.js';
import { EditorBreadcrumb } from './editor-breadcrumb.js';
import { EditorFilter } from './editor-filter.js';
import { EditorStyle } from './editor-style.js';
import { EditorLog } from './editor-log.js';
import { EditorSection } from './editor-section.js';
import { EditorInstance, EditorInstanceManager } from './editor-instance.js';
import { EditorWindow, EditorWindowManager } from './editor-window.js';
import { EditorDesign } from './editor-design.js';
import { EditorStatus } from './editor-status.js';


var inc = 0;

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
 * Creates an editor status manager
 * @returns {EditorStatus}
 */
function createEditorStatus() {
    return Object.create(EditorStatus, {
        object: { value: "environment" },
        name: { value: "editor-status" },
        type: { value: "status" },
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
    /**  */
    activeReceiver: {},
    receivers: {},


    /** @type {HTMLElement} */
    container: null,
    /** @type {EditorSection} */
    header: null,
    /** @type {HTMLElement} */
    body: null,
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
    /** @type {EditorHome} */
    home: null,
    /** @type {EditorStyle} */
    style: null,
    /** @type {EditorLog} */
    logs: null,
    /** @type {EditorStatus} */
    status: null,
    /** @type {EditorGroup} */
    group: null,

    /** @type {HTMLInputElement} */
    input: null,
    /** @type {*} */
    copyValue: null,
    /** @type {*[]} */
    states: null,


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
    /** @type {Map<string,EditorWindow>} */
    windows: null,
    /** @type {Map} */
    values: null,
    /** @type {Map<string,File>} */
    resources: null,
    /** @type {Map} */
    models: null,
    /** @type {*[]} */
    errors: null,

    init(args = {}) {
        const { conceptModel, projectionModel, config = {}, handlers = {} } = args;

        this.config = config;
        this.handlers = new Map();
        this.instances = new Map();
        this.windows = new Map();
        this.values = new Map();
        this.resources = new Map();
        this.models = new Map();
        this.errors = [];
        Object.assign(this, EditorInstanceManager, EditorWindowManager);

        this.states = [];


        this.decoratedElements = new Set();

        for (const key in handlers) {
            const handler = handlers[key];
            this.registerHandler(key, handler);
        }

        this.header = createEditorHeader.call(this).init();
        this.home = createEditorHome.call(this).init();
        this.breadcrumb = createEditorBreadcrumb.call(this).init();
        // this.filter = createEditorFilter.call(this).init();
        this.style = createEditorStyle.call(this).init();
        this.logs = createEditorLog.call(this).init();
        this.status = createEditorStatus.call(this).init();

        this.render();

        if (conceptModel) {
            this.loadConceptModel(conceptModel);
        }

        if (projectionModel) {
            this.loadProjectionModel(projectionModel);
        }

        if (this.isReady) {
            this.conceptModel.getRootConcepts().forEach(concept => {
                this.createInstance(concept);
            });
            this.open();
        }

        return this;
    },

    setConfig(schema) {
        if (isNullOrUndefined(schema)) {
            return false;
        }

        this.config = schema;

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
     * Verifies that the editor has a window created
     * @returns {boolean} Value indicating whether the editor has a window created
     */
    get hasWindows() { return this.windows.size > 0; },
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
    /**
     * Verifies that the editor has errors
     * @returns {boolean} Value indicating whether the editor has an error
     */
    get hasError() { return !isEmpty(this.errors); },

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
    addConcept($schema) {
        let schema = $schema.concept || $schema;

        if (Array.isArray(schema)) {
            this.conceptModel.schema.push(...schema);
        } else {
            this.conceptModel.schema.push(schema);
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
    addProjection($schema) {
        let schema = $schema.projection || $schema;

        if (Array.isArray(schema)) {
            this.projectionModel.schema.push(...schema);
        } else {
            this.projectionModel.schema.push(schema);
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
        if (!isHTMLElement(element) && element.tagName != "path") {
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

    /**
     * Get a the related layout object
     * @param {HTMLElement} element 
     * @returns {Algorithm}
     */
    getAlgo(element) {
        if (!isHTMLElement(element)) {
            console.warn("Algorithm error: Bad argument");
            return null;
        }

        const { id, nature } = element.dataset;

        if (isNullOrUndefined(id)) {
            console.warn("Algorithm error: Missing id attribute on field");
            return null;
        }

        if (!["algorithm", "algorithm-component"].includes(nature)) {
            console.warn("Layout error: Unknown nature attribute on field");
            return null;
        }

        return this.projectionModel.getAlgo(id);
    },

    resolveElement(element) {
        if (!isHTMLElement(element) && element.tagName != "path") {
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
            case "algorithm":
                projectionElement = this.getAlgo(element);
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
    createState(concept, _element) {
        const { id, name } = concept;

        let stateID = nextValueId();
        let value = JSON.stringify(concept.clone());
        let time = formatDate(new Date(), "hh:dd");
        // let size = concept.getDescendant().length;

        let icoDelete = createI({
            class: ["ico", "ico-delete"]
        }, "✖");


        let btnDelete = createButton({
            class: ["btn", "btn-delete"],
            title: `Delete ${name} state`
        }, icoDelete);

        let preview = createDiv({
            class: ["model-state-preview"],
            title: `Preview ${name}`
        }, _element);

        let content = createSpan({
            class: ["model-state-content", "fit-content"]
        }, `${concept.getName()}`);

        let item = createListItem({
            class: ["model-state"],
            title: `Restore ${name} state`,
            dataset: {
                id: stateID,
                concept: id
            }
        }, [btnDelete, content, preview]);

        /**
         * Resolves the target
         * @param {HTMLElement} element 
         * @returns {HTMLElement}
         */
        function resolveTarget(element) {
            const isValid = (el) => el === item || el === btnDelete;
            if (isValid(element)) {
                return element;
            }

            return findAncestor(element, (el) => isValid(el), 5);
        }

        item.addEventListener('click', (event) => {
            let target = resolveTarget(event.target);

            this.unhighlight();
            if (target === btnDelete) {
                this.removeState(stateID);
            } else {
                let concept = this.restore(value);
                this.removeState(stateID);

                let targetProjection = getElement(`.projection[data-concept="${concept.id}"]`, this.body);
                if (targetProjection) {
                    targetProjection.focus();
                }
            }
        });

        let selector = `.projection[data-concept="${id}"]`;

        item.addEventListener("mouseenter", (event) => {
            let targetProjection = getElement(selector, this.body);
            if (targetProjection) {
                this.highlight(targetProjection);
            }
        });

        item.addEventListener("mouseleave", (event) => {
            this.unhighlight();
        });

        if (this.states.length > 8) {
            let { id } = this.stateList.lastChild.dataset;

            this.removeValue(id);
        }

        let state = Object.create({}, {
            id: { value: stateID },
            object: { value: "value" },
            type: { value: "state" },
            element: { value: item },
            concept: { value: concept },
            value: { value: value }
        });

        this.addState(state);

        return state;
    },
    /**
     * Gets a value in the editor
     * @param {string} index 
     * @returns {EditorInstance}
     */
    getState(index) {
        if (isNullOrUndefined(index) || isEmpty(this.states)) {
            return;
        }

        return this.states[index];
    },
    /**
     * Adds a state to editor
     * @param {*} state 
     * @returns {HTMLElement}
     */
    addState(state) {
        this.stateList.append(state.element);

        this.states.push(state);

        this.refresh();

        return state;
    },
    removeState(id) {
        if (isNullOrUndefined(id)) {
            return;
        }


        const index = this.states.findIndex(state => state.id === id);

        if (index === -1) {
            return null;
        }

        let removedState = this.states.splice(index, 1)[0];

        let { element } = removedState;

        removeChildren(element).remove();

        this.refresh();

        return this;
    },
    /**
     * Saves the current model state
     */
    save(concept, element) {
        this.createState(concept, element);

        // this.notify(`${element.name} saved`, NotificationType.NORMAL, 1500);

        this.refresh();
    },
    restore($state) {
        let state = JSON.parse($state);
        let concept = this.conceptModel.getConcept(state.id);
        concept.restore(state);

        this.refresh();

        return concept;
    },
    undo() {
        if (isEmpty(this.states)) {
            this.notify("There are no previous state", NotificationType.NORMAL, 2000);
            return;
        }

        let state = last(this.states);
        this.restore(state.value);
        this.removeState(state.id);
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


    // Resource management

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

    // Error management

    /**
     * Adds a resource to the editor
     * @param {File} file 
     * @param {string} [_name] 
     * @returns 
     */
    addError(error) {
        this.errors.push(error);

        this.refresh();
        shake(this.status.editorstatusBadge);

        return error;
    },
    /**
     * Removes a resource from the register
     * @param {string} name 
     * @returns 
     */
    removeError(name) {
        this.errors.pop();

        this.refresh();

        return true;
    },
    /**
     * Removes a resource from the register
     * @param {string} name 
     * @returns 
     */
    clearError(name) {
        this.errors = [];

        this.refresh();

        return true;
    },


    // Model management

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
        if (isNullOrUndefined(value)) {
            return this;
        }

        this.copyValue = value;
        copytoClipboard(JSON.stringify(value));

        if (preserve) {
            this.addValue(value);
        }

        this.notify(`${value.name} copied`, NotificationType.NORMAL);

        return this;
    },
    paste(concept, _value) {
        let value = valOrDefault(_value, this.copyValue);

        if (isNullOrUndefined(value)) {
            return;
        }

        if (isNullOrUndefined(concept)) {
            let concept = this.createConcept(value.name).init();
            concept.setValue(value);
            this.createInstance(concept);
        } else if (value.nature === "prototype") {
            concept.setValue(value.value);
        } else {
            concept.setValue(value);
        }

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
    /**
     * Toggles the editor
     * @returns {Editor}
     */
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
            // cleanup
            this.hide();
            this.done();
            this.instances.forEach(instance => instance.delete());
            removeChildren(this.container).remove();
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
    /**
     * Highligh an element in the editor
     * @param {HTMLElement} element 
     * @returns {Editor}
     */
    highlight(element) {
        if (!isHTMLElement(element)) {
            return this;
        }

        highlight(element);
        this.decoratedElements.add(element);

        return this;
    },
    /**
     * Unhighligh an element in the editor
     * @param {HTMLElement} element 
     * @returns {Editor}
     */
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
    createWindow() {
        let window = createDiv({
            class: ["editor-window"],
            tabindex: 0,
        });

        this.body.append(window);
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
    loadConceptModel(schema, _values) {
        let concepts = schema.concept || schema;
        let values = valOrDefault(_values, schema.values);

        if (!Array.isArray(concepts)) {
            this.notify("Invalid concept model", NotificationType.ERROR);

            return false;
        }

        if (isEmpty(concepts)) {
            this.notify("The concept model is empty", NotificationType.ERROR);

            return false;
        }

        this.unloadConceptModel();
        this.clear();

        this.conceptModel = ConceptModelManager.createModel(concepts, this).init(values);

        if (isNullOrUndefined(this.conceptModel)) {
            // TODO: add validation and notify of errors
        }

        if (this.hasProjectionModel) {
            this.projectionModel.done();
        }

        this.conceptModel.getRootConcepts().forEach(concept => {
            this.createInstance(concept);
        });

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
    loadProjectionModel(schema, _views) {
        let projections = schema.projection || schema;
        let views = valOrDefault(_views, schema.views);

        if (!Array.isArray(projections)) {
            this.notify("Invalid projection model", NotificationType.ERROR);

            return false;
        }

        if (isEmpty(projections)) {
            this.notify("The projection model is empty", NotificationType.WARNING);

            return false;
        }

        this.unloadProjectionModel();
        this.activeElement = null;
        this.activeInstance = null;
        this.activeConcept = null;
        this.activeProjection = null;

        if (isNullOrUndefined(this.projectionModel)) {
            this.projectionModel = createProjectionModel(projections, this).init(views);
        }

        this.projectionModel.setSchema(projections);

        if (isNullOrUndefined(this.projectionModel)) {
            // TODO: add validation and notify of errors
        }

        this.instances.forEach(instance => {
            instance.projection = this.projectionModel.createProjection(instance.concept).init();
            instance.render();
        });

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
            this.states.forEach(state => state.element.remove());
            this.states = [];

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
            id: { value: this.id },
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
    /**
     * Updates the projection
     * @param {string} message 
     * @param {*} value 
     */
    update(message, value, from) {
        this.triggerEvent({ name: message });
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

        if (!isHTMLElement(this.navigationSection)) {
            this.navigationSection = createSection({
                class: ["model-navigation-section"],
            });

            this.viewSection = createAside({
                class: ["model-view-section"],
            });

            this.navigationSection.append(this.viewSection);

            fragment.append(this.navigationSection);
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

            this.instanceSection = createSection({
                class: ["model-concept-section"],
            });

            mainSection.append(this.instanceSection);

            this.body.append(mainSection);

            fragment.append(this.body);
        }

        if (!isHTMLElement(this.timeline)) {
            this.timeline = createDiv({
                class: ["editor-timeline"],
            });

            this.stateList = createUnorderedList({
                class: ["bare-list", "model-state-list"],
            });

            this.timeline.append(this.stateList);

            fragment.append(this.timeline);
        }

        if (!this.logs.isRendered) {
            fragment.append(this.logs.render());
        }


        if (!this.breadcrumb.isRendered) {
            this.navigationSection.append(this.breadcrumb.render());
        }

        // if (!this.filter.isRendered) {
        //     this.navigationSection.append(this.filter.render());
        // }

        if (!isHTMLElement(this.valueSection)) {
            this.valueSection = createDiv({
                class: ["model-value-window"],
            });

            this.valueList = createUnorderedList({
                class: ["bare-list", "model-value-list"],
            });

            this.valueSection.append(this.valueList);

            this.navigationSection.append(this.valueSection);
        }

        if (!this.status.isRendered) {
            fragment.append(this.status.render());
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
        // this.filter.refresh();
        this.home.refresh();
        this.style.refresh();
        this.logs.refresh();
        this.status.refresh();

        this.instanceSection.dataset.view = this.status.view;

        if (["grid", "row"].includes(this.status.view)) {
            hide(this.viewSection);
        } else if (["tab"].includes(this.status.view)) {
            show(this.viewSection);
        }

        if (isEmpty(this.states)) {
            hide(this.timeline);
        } else {
            show(this.timeline);
            this.states.forEach(state => {
                if (!this.conceptModel.hasConcept(state.concept.id)) {
                    this.removeState(state.id);
                } else if (this.hasActiveConcept && this.activeConcept === state.concept) {
                    state.element.classList.add("active");
                } else {
                    state.element.classList.remove("active");
                }
            });
        }

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

        this.triggerEvent({ name: "editor.element@active:updated" });
        this.activeElement = element;

        return this;
    },
    /**
     * Updates the active concept
     * @param {Concept} concept 
     */
    updateActiveConcept(concept) {
        if (this.hasActiveConcept && this.activeConcept === concept) {
            return this;
        }

        this.activeConcept = concept;


        this.triggerEvent({ name: "editor.concept@active:updated" });
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

        this.triggerEvent({ name: "editor.projection@active:updated" });
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

            let temp = this.activeInstance;
            this.activeInstance.container.classList.remove("active");
        }

        this.activeInstance = instance;
        this.activeInstance.container.classList.add("active");

        this.triggerEvent({ name: "editor.instance@active:updated" });
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

    registerReceiver(proj, rtag) {
        console.log("REGISTERING RECEIVER");
        if (isNullOrUndefined(this.activeReceiver[rtag])) {
            this.activeReceiver[rtag] = proj;
        }

        if (isNullOrUndefined(this.receivers[rtag])) {
            this.receivers[rtag] = {
                root: proj,
                projections: []
            };

            proj.isRoot = true;
        }


        this.receivers[rtag].projections.push(proj);
    },

    getActiveReceiver(rtag) {
        return this.activeReceiver[rtag];
    },

    setActiveReceiver(proj, rtag) {
        this.activeReceiver[rtag] = proj;
    },

    getRootReceiver(rtag) {
        return this.receivers[rtag].root;
    },

    findReceiverInstance(instance, rtag) {
        let candidates = this.receivers[rtag].projections;

        for (let i = 0; i < candidates.length; i++) {
            let res = candidates[i].instances.get(instance);
            if (isHTMLElement(res)) {
                return { container: candidates[i], instance: res };
            }
        }


        alert("Not Found");
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
            "change-view": (target) => {
                const { value } = target.dataset;
                this.status.changeView(value);
            },
            "add-group": (target) => {
                this.status.addGroup();
            },

            "style": (target) => { this.style.toggle(); },
            "home": (target) => { this.home.toggle(); },
            "logs": (target) => { this.logs.toggle(); },

            "export": (target) => { this.export(); },
            "export--copy": (target) => { this.export(true); },

            "create-instance": (target) => {
                const { concept: cname } = target.dataset;

                let concept = this.createConcept(cname);
                this.createInstance(concept);
            },
            "create-instance:value": (target) => {
                const { id } = target.dataset;

                let value = this.conceptModel.getValue(id);
                let concept = this.createConcept(value.name);
                concept.initValue(value);
                this.createInstance(concept);
            },
            "copy:value": (target) => {
                const { id } = target.dataset;

                let value = this.conceptModel.getValue(id);
                this.copy(value);
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
            "save": (target) => {
                this.save();
            },
            "undo": (target) => {
                this.undo();
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

        this.body.addEventListener('copy', (event) => {
            if (!isInputCapable(event.target)) {
                let value = this.activeConcept.copy(false);
                this.copy(value, true);

                event.preventDefault();
            }
        });

        this.body.addEventListener('paste', (event) => {
            if (isNullOrUndefined(event.clipboardData)) {
                this.paste(this.activeConcept);

                event.preventDefault();
                return;
            }

            if (isInputCapable(event.target)) {
                return;
            }

            let paste = event.clipboardData.getData('text');
            paste = JSON.parse(paste);

            this.paste(this.activeConcept, paste);

            event.preventDefault();
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
                        if (!isInputCapable(target)) {
                            const handled = this.activeElement.deleteHandler(target);

                            if (handled) {
                                event.preventDefault();
                            }
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
                            // this.filter.close();
                            let ancestor = findAncestor(target, (el) => el.tabIndex === 0);
                            ancestor.focus();
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
                        let event = new ClipboardEvent("copy");

                        this.body.dispatchEvent(event);
                    }

                    break;
                case "v":
                    if (lastKey === Key.ctrl) {
                        let event = new ClipboardEvent("paste");

                        this.body.dispatchEvent(event);
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
                    // if (lastKey === Key.ctrl) {
                    //     this.filter.show().focus();

                    //     event.preventDefault();
                    // }

                    break;
                case "z":
                    if (lastKey === Key.ctrl) {
                        if (!isInputCapable(target)) {
                            this.undo();

                            event.preventDefault();
                        }
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
                    // if (this.activeElement && lastKey === Key.ctrl) {
                    //     this.design(this.activeElement);
                    // }

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

            if (element) {
                if (this.activeElement && this.activeElement !== element) {
                    this.activeElement.focusOut();
                    this.activeElement = null;
                }

                this.updateActiveElement(element);
                this.activeElement.focusIn(target);
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
            } else {
                this.activeConcept = null;
                this.activeProjection = null;
            }

            this.refresh();
        });

        this.registerHandler("export", () => this.export());
        this.registerHandler("value.changed", () => this.refresh());
        this.registerHandler("value.added", () => this.refresh());
        this.registerHandler("value.removed", () => this.refresh());
        this.registerHandler("open-style", () => console.log("hello"));
        this.registerHandler("load-resource", (args) => {
            let event = new MouseEvent('click', { view: window, bubbles: true, cancelable: true, });
            fileType = "resource";
            fileName = args[0];

            this.input.dispatchEvent(event);
        });
    }
};