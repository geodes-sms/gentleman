import { createUnorderedList, createListItem, getElement, createSpan, hasOwn, findAncestor, isHTMLElement, isNullOrUndefined, isFunction, } from "zenkai";
import { duplicateTab } from "@utils/index.js";
import { createEditor } from "@src";
import { buildConceptHandler, buildProjectionHandler, buildGraphicalHandler } from "@generator/index.js";
import { ProjectionEditor, ConceptEditor } from "./projection-editor.js";


let CMODEL__CONCEPT = null;
let CMODEL__PROJECTION = null;
/*let PMODEL__CONCEPT = null;
let PMODEL__PROJECTION = null;*/
/*let SMODEL__CONCEPT = null;
let SMODEL__PROJECTION = null;*/
let GMODEL__CONCEPT = null;
let GMODEL__PROJECTION = null;

const CMODEL__EDITOR = require('@models/concept-model/config.json');
const PMODEL__EDITOR = require('@models/projection-model/config.json');
const GMODEL__EDITOR = require('./../../models/graphical-model/config.json');

// const CMODEL__CONCEPT = require('@models/concept-model/concept.json');
// const CMODEL__PROJECTION = require('@models/concept-model/projection.json');

const SMODEL__CONCEPT = require('@models/style-model/concept.json');
const SMODEL__PROJECTION = require('@models/style-model/projection.json');

const PMODEL__CONCEPT = require('@models/projection-model/concept.json');
const PMODEL__PROJECTION = require('@models/projection-model/projection.json');


GMODEL__CONCEPT = require('./../../models/graphical-model/concept.json');
GMODEL__PROJECTION = require('./../../models/graphical-model/projection.json');

var inc = 0;
const nextId = () => `GE${inc++}`;

export const App = {
    /** @type {HTMLElement} */
    menu: null,
    /** @type {HTMLElement} */
    editorSection: null,
    /** @type {HTMLElement} */
    btnNew: null,
    /** @type {HTMLElement} */
    tabList: null,
    /** @type {*[]} */
    editors: null,
    /** @type {Map} */
    tabs: null,
    /** @type {Editor} */
    activeEditor: null,
    /** @type {HTMLElement} */
    activeTab: null,

    /**
    * Initiliazes the App
    * @returns {App}
    */
    init() {
        this.editors = [];
        this.tabs = new Map();

        this.bindDOM();
        this.bindEvents();
        this.render();

        return this;
    },
    refresh() {
        // if (this.tabs.size === 0) {
        //     this.createEditor();
        // }

        return this;
    },
    render() {
        this.refresh();
    },

    /**
     * Creates an editor
     * @param {Editor} editor 
     * @returns {Editor}
     */
    createEditor(options) {
        let editor = createEditor().init(options);
        editor.id = nextId();
        this.addEditor(editor);

        return editor;
    },
    /**
     * Adds editor to the App
     * @param {Editor} editor 
     * @returns {App}
     */
    addEditor(editor) {
        this.editors.push(editor);
        this.editorSection.append(editor.container);

        this.refresh();

        return this;
    },
    /**
     * Gets the list of `Editor`
     * @param {Function} pred Predicate
     * @returns {Editor[]} 
     */
    getEditors(pred) {
        const editors = this.editors;

        if (isFunction(pred)) {
            return this.editors.filter(env => pred(env));
        }

        return editors;
    },
    /**
     * Gets an `Editor` matching the id
     * @param {string} id
     * @returns {Editor}
     */
    getEditor(id) {
        return this.editors.find(editor => editor.id === id);
    },
    /**
     * Deletes an editor
     * @param {string} id 
     * @returns {boolean}
     */
    deleteEditor(id) {
        let index = this.editors.findIndex(p => p.id === id);

        if (index === -1) {
            return false;
        }

        let editor = this.getEditor(id);
        editor.destroy();

        this.editors.splice(index, 1);

        this.refresh();

        return true;
    },
    /**
     * Adds tab to the App
     * @param {HTMLElement} tab 
     * @param {Editor} editor 
     * @returns 
     */
    addTab(tab, editor) {
        if (tab.parentElement !== this.tabList) {
            this.tabList.append(tab);
        }

        this.tabs.set(tab, editor);

        editor.registerHandler("editor.close@post", () => this.closeTab(tab));

        return this;
    },
    /**
     * Closes a tab
     * @param {HTMLElement} tab 
     * @returns {boolean}
     */
    closeTab(tab) {
        if (isNullOrUndefined(tab) || !this.tabs.has(tab)) {
            return false;
        }

        let editor = this.tabs.get(tab);
        this.deleteEditor(editor.id);
        this.tabs.delete(tab);

        if (tab === this.activeTab) {
            this.activeTab = null;
            if (this.tabList.hasChildNodes()) {
                this.changeTab(tab.previousElementSibling || tab.nextElementSibling);
            }
        }

        tab.remove();

        this.refresh();

        return true;
    },
    /**
     * Changes tab
     * @param {HTMLElement} tab 
     * @returns {App}
     */
    changeTab(tab) {
        if (isNullOrUndefined(tab)) {
            return;
        }

        if (this.activeTab) {
            if (this.activeTab === tab) {
                return this;
            }

            this.activeTab.classList.remove("selected");
            this.tabs.get(this.activeTab).hide();
        }

        this.activeTab = tab;
        this.activeTab.classList.add("selected");

        this.tabs.get(this.activeTab).show();

        this.refresh();

        return this;
    },

    bindModel() {


        // fetch('https://geodes.iro.umontreal.ca/gentleman/models/concept-model/concept.json')
        //     .then(response => response.json())
        //     .then(data => console.log(data));
    },
    bindDOM() {
        this.menu = getElement(`[data-component="menu"]`);
        this.editorSection = getElement(`[data-component="editor"]`);
        this.tabSection = getElement(`[data-component="nav"]`);
        this.tabList = getElement(`[data-component="nav-list"]`);

        if (!isHTMLElement(this.tabList)) {
            this.tabList = createUnorderedList({
                class: ["bare-list", "app-tabs"]
            });
            this.tabSection.append(this.tabList);
        }

        const Handlers = {
            "concept": createConceptEditor,
            "projection": createProjectionEditor,
            "graphic": createGraphicEditor,
        };

        for (let i = 0; i < this.tabList.childElementCount; i++) {
            const element = this.tabList.children.item(i);
            const { editor } = element.dataset;

            Handlers[editor].call(this)
                .then(editor => {
                    editor.hide();
                    this.addTab(element, editor);
                    if (element.classList.contains("selected")) {
                        this.activeTab = element;
                        this.tabs.get(this.activeTab).show();
                    }
                }).catch((err) => {
                    console.log(err);
                });
        }

        return this;
    },
    bindEvents() {

        /**
         * Resolves the target in a container
         * @param {HTMLElement} element 
         * @returns 
         */
        function resolveTarget(element, container) {
            if (isNullOrUndefined(element) || element === container) {
                return null;
            }

            if (hasOwn(element.dataset, "action")) {
                return element;
            }
            if (element.parentElement === container) {
                return getElement(`[data-action]`, element);
            }

            return findAncestor(element, (el) => hasOwn(el.dataset, "action"), 5);
        }

        /**
         * Resolves a tab in a container
         * @param {HTMLElement} element 
         * @param {HTMLElement} container 
         * @returns 
         */
        function resolveTab(element, container) {
            if (element.parentElement === container) {
                return element;
            }

            return findAncestor(element, (el) => el.parentElement === container);
        }

        this.menu.addEventListener("click", (event) => {
            let target = resolveTarget(event.target, this.menu);

            if (!isHTMLElement(target)) {
                return false;
            }

            const { action } = target.dataset;

            if (action === "new") {
                let tab = createTab.call(this, "EX");
                let config = {
                    toolbar: [
                        { "type": "button", "name": "button-export", "action": "export.model", "class": ["btn", "editor-toolbar__button", "editor-toolbar__button--save"] },
                        { "type": "button", "name": "button-menu", "action": "open.menu", "class": ["btn", "editor-toolbar__button", "editor-toolbar__button--home"] },
                        { "type": "button", "name": "button-close", "action": "close.editor", "class": ["btn", "editor-toolbar__button", "editor-toolbar__button--close"] },
                    ]
                };

                this.addTab(tab, this.createEditor({
                    config: config,
                    handlers: {
                        "export.model": function () { this.export(); },
                        "open.menu": function () { this.home.open(); },
                        "close.editor": function () { this.close(); },
                        "build-concept": function (args) { buildConceptHandler.call(this); },
                        "build-projection": function (args) { buildProjectionHandler.call(this); },
                    }
                }));
                this.changeTab(tab);
            }
        });

        this.tabList.addEventListener("click", (event) => {
            let tab = resolveTab(event.target, this.tabList);

            if (!isHTMLElement(tab)) {
                return false;
            }

            this.changeTab(tab);
        });
    }
};


/**
 * Create a tab item
 * @param {string} name 
 * @returns {HTMLElement}
 */
function createTab(name) {
    let title = createSpan({
        class: ["nav-item-title"]
    }, name);

    let container = createListItem({
        class: ["nav-item", "has-helper"],
    }, [title]);

    return container;
}

const CONCEPT_HANDLERS = {
    "open-constraint": function (args) {
        let concept = args[0];
        let projection = this.createProjection(concept, "constraint");

        let window = this.findWindow("side-instance");
        if (isNullOrUndefined(window)) {
            window = this.createWindow("side-instance");
            window.container.classList.add("concept-constraint-sideview");
        }

        if (window.instances.size > 0) {
            let instance = Array.from(window.instances)[0];
            instance.delete();
        }

        let instance = this.createInstance(concept, projection, {
            type: "projection",
            close: "DELETE-PROJECTION"
        });

        window.addInstance(instance);
    },
    "build-concept": function (args) { buildConceptHandler.call(this); }
}

const PMODEL__HANDLER = {
    "build-projection": function (args) { buildProjectionHandler.call(this); },
    "value.changed": function () {
        if (!this.__previewStarted) {
            return false;
        }
    },
    "value.added": function () {
        if (!this.__previewStarted) {
            return false;
        }
    },
    "value.removed": function () {
        if (!this.__previewStarted) {
            return false;
        }
    },
    "open-style": function (args) {
        let concept = args[0];
        let projection = this.createProjection(concept, "style");

        let window = this.findWindow("side-instance");
        if (isNullOrUndefined(window)) {
            window = this.createWindow("side-instance");
            window.container.classList.add("model-projection-sideview");
        }

        if (window.instances.size > 0) {
            let instance = Array.from(window.instances)[0];
            instance.delete();
        }

        let instance = this.createInstance(concept, projection, {
            type: "projection",
            close: "DELETE-PROJECTION"
        });

        window.addInstance(instance);
    },
    "open-state": function (args) {
        let concept = args[0];
        let projection = this.createProjection(concept, "state");

        let window = this.findWindow("side-instance");
        if (isNullOrUndefined(window)) {
            window = this.createWindow("side-instance");
            window.container.classList.add("model-projection-sideview");
        }

        if (window.instances.size > 0) {
            let instance = Array.from(window.instances)[0];
            instance.delete();
        }

        let instance = this.createInstance(concept, projection, {
            type: "projection",
            close: "DELETE-PROJECTION"
        });

        window.addInstance(instance);
    },
    "open-layout": function (args) {
        let concept = args[0];
        let projection = this.createProjection(concept, "layout");

        let window = this.findWindow("side-instance");
        if (isNullOrUndefined(window)) {
            window = this.createWindow("side-instance");
            window.container.classList.add("model-projection-sideview");
        }

        if (window.instances.size > 0) {
            let instance = Array.from(window.instances)[0];
            instance.delete();
        }

        let instance = this.createInstance(concept, projection, {
            type: "projection",
            close: "DELETE-PROJECTION"
        });

        window.addInstance(instance);
    },

};

const GMODEL__HANDLER = {
    "build-graphical": function (args) { return buildGraphicalHandler.call(this); },
    "open-state": function (args) {
        let concept = args[0];
        let projection = this.createProjection(concept, "state");

        let window = this.findWindow("side-instance");
        if (isNullOrUndefined(window)) {
            window = this.createWindow("side-instance");
            window.container.classList.add("model-projection-sideview");
        }

        if (window.instances.size > 0) {
            let instance = Array.from(window.instances)[0];
            instance.delete();
        }

        let instance = this.createInstance(concept, projection, {
            type: "projection",
            close: "DELETE-PROJECTION"
        });

        window.addInstance(instance);
    },
    "open-sibling": function (args) {
        let concept = args[0];
        let projection = this.createProjection(concept, "sibling");

        let window = this.findWindow("side-instance");
        if (isNullOrUndefined(window)) {
            window = this.createWindow("side-instance");
            window.container.classList.add("model-projection-sideview");
        }

        if (window.instances.size > 0) {
            let instance = Array.from(window.instances)[0];
            instance.delete();
        }

        let instance = this.createInstance(concept, projection, {
            type: "projection",
            close: "DELETE-PROJECTION"
        });

        window.addInstance(instance);
    },
    "open-style": function (args) {
        let concept = args[0];
        let projection = this.createProjection(concept, "style");

        let window = this.findWindow("side-instance");
        if (isNullOrUndefined(window)) {
            window = this.createWindow("side-instance");
            window.container.classList.add("model-projection-sideview");
        }

        if (window.instances.size > 0) {
            let instance = Array.from(window.instances)[0];
            instance.delete();
        }

        let instance = this.createInstance(concept, projection, {
            type: "projection",
            close: "DELETE-PROJECTION"
        });

        window.addInstance(instance);
    },
    "open-area": function(args) {
        let concept = args[0];
        let projection = this.createProjection(concept, "area");

        let window = this.findWindow("side-instance");
        if (isNullOrUndefined(window)) {
            window = this.createWindow("side-instance");
            window.container.classList.add("model-projection-sideview");
        }

        if (window.instances.size > 0) {
            let instance = Array.from(window.instances)[0];
            instance.delete();
        }

        let instance = this.createInstance(concept, projection, {
            type: "projection",
            close: "DELETE-PROJECTION"
        });

        window.addInstance(instance);
    },
    "open-draw": function(args) {
        let concept = args[0];
        let projection = this.createProjection(concept, "draw");

        let window = this.findWindow("side-instance");
        if (isNullOrUndefined(window)) {
            window = this.createWindow("side-instance");
            window.container.classList.add("model-projection-sideview");
        }

        if (window.instances.size > 0) {
            let instance = Array.from(window.instances)[0];
            instance.delete();
        }

        let instance = this.createInstance(concept, projection, {
            type: "projection",
            close: "DELETE-PROJECTION"
        });

        window.addInstance(instance);
    },
    "open-layout": function (args) {

        let concept = args[0];
        let projection = this.createProjection(concept, "layout");

        let window = this.findWindow("side-instance");
        if (isNullOrUndefined(window)) {
            window = this.createWindow("side-instance");
            window.container.classList.add("model-projection-sideview");
        }

        if (window.instances.size > 0) {
            let instance = Array.from(window.instances)[0];
            instance.delete();
        }

        let instance = this.createInstance(concept, projection, {
            type: "projection",
            close: "DELETE-PROJECTION"
        });

        window.addInstance(instance);
    },
};


/**
 * 
 * @param {*} conceptModel 
 * @param {*} projectionModel 
 * @returns {Promise}
 */
function createConceptEditor() {
    if (isNullOrUndefined(CMODEL__CONCEPT)) {
        return Promise.all([
            fetch("https://geodes.iro.umontreal.ca/gentleman/models/concept-model/concept.json"),
            fetch("https://geodes.iro.umontreal.ca/gentleman/models/concept-model/projection.json"),
        ]).then(async ([CM_CONCEPT, CM_PROJECTION]) => {
            CMODEL__CONCEPT = await CM_CONCEPT.json();
            CMODEL__PROJECTION = await CM_PROJECTION.json();

            let editor = this.createEditor({
                conceptModel: CMODEL__CONCEPT,
                projectionModel: CMODEL__PROJECTION,
                config: CMODEL__EDITOR,
                handlers: CONCEPT_HANDLERS
            });

            let wrapper = Object.create(ConceptEditor).init(editor);
            this.editorSection.append(wrapper.render());

            return editor;
        });
    } else {
        return new Promise(() => this.createEditor({
            conceptModel: CMODEL__CONCEPT,
            projectionModel: CMODEL__PROJECTION,
            config: CMODEL__EDITOR,
            handlers: CONCEPT_HANDLERS
        }));
    }
}

/**
 * 
 * @param {*} conceptModel 
 * @param {*} projectionModel 
 * @returns {Promise}
 */
function createProjectionEditor() {
    if (isNullOrUndefined(CMODEL__CONCEPT)) {
        return Promise.all([
            fetch("https://geodes.iro.umontreal.ca/gentleman/models/projection-model/concept.json"),
            fetch("https://geodes.iro.umontreal.ca/gentleman/models/projection-model/projection.json"),
            fetch("https://geodes.iro.umontreal.ca/gentleman/models/style-model/concept.json"),
            fetch("https://geodes.iro.umontreal.ca/gentleman/models/style-model/projection.json"),
        ]).then(async ([PM_CONCEPT, PM_PROJECTION, SM_CONCEPT, SM_PROJECTION]) => {
            /*PMODEL__CONCEPT = await PM_CONCEPT.json();
            PMODEL__PROJECTION = await PM_PROJECTION.json();*/
            /*SMODEL__CONCEPT = await SM_CONCEPT.json();
            SMODEL__PROJECTION = await SM_PROJECTION.json();*/

            let editor = this.createEditor({
                conceptModel: PMODEL__CONCEPT,
                projectionModel: PMODEL__PROJECTION,
                config: Object.assign({}, PMODEL__EDITOR),
                handlers: PMODEL__HANDLER,
            });

            editor.addConcept(SMODEL__CONCEPT);
            editor.addProjection(SMODEL__PROJECTION);

            let wrapper = Object.create(ProjectionEditor).init(editor);
            this.editorSection.append(wrapper.render());

            return editor;
        });
    } else {
        return new Promise(() => {
            let editor = this.createEditor({
                conceptModel: PMODEL__CONCEPT,
                projectionModel: PMODEL__PROJECTION,
                config: Object.assign({}, PMODEL__EDITOR),
                handlers: PMODEL__HANDLER,
            });

            editor.addConcept(SMODEL__CONCEPT);
            editor.addProjection(SMODEL__PROJECTION);

            let wrapper = Object.create(ProjectionEditor).init(editor);
            this.editorSection.append(wrapper.render());

            return editor;
        });
    }

    // let btnPreview = createMenuButton.call(this, "preview-projection", "Preview", editor);
}

/**
 * 
 * @param {*} conceptModel 
 * @param {*} projectionModel 
 * @returns {Promise}
 */
function createGraphicEditor() {
    if (isNullOrUndefined(CMODEL__CONCEPT)) {
        /*return Promise.all([
            fetch("https://geodes.iro.umontreal.ca/gentleman/models/graphical-model/concept.json"),
            fetch("https://geodes.iro.umontreal.ca/gentleman/models/graphical-model/projection.json"),
        ]).then(async ([GM_CONCEPT, GM_PROJECTION]) => {
            /*GMODEL__CONCEPT = await GM_CONCEPT.json();
            GMODEL__PROJECTION = await GM_PROJECTION.json();*/
            
        return Promise.all([
                fetch("https://geodes.iro.umontreal.ca/gentleman/models/projection-model/concept.json"),
                fetch("https://geodes.iro.umontreal.ca/gentleman/models/projection-model/projection.json"),
                fetch("https://geodes.iro.umontreal.ca/gentleman/models/style-model/concept.json"),
                fetch("https://geodes.iro.umontreal.ca/gentleman/models/style-model/projection.json"),
            ]).then(async ([PM_CONCEPT, PM_PROJECTION, SM_CONCEPT, SM_PROJECTION]) => {
                /*PMODEL__CONCEPT = await PM_CONCEPT.json();
                PMODEL__PROJECTION = await PM_PROJECTION.json();*/

            let editor =  this.createEditor({
                conceptModel: [GMODEL__CONCEPT, PMODEL__CONCEPT, SMODEL__CONCEPT],
                projectionModel: [GMODEL__PROJECTION, PMODEL__PROJECTION, SMODEL__PROJECTION],
                config: Object.assign({}, GMODEL__EDITOR),
                handlers: GMODEL__HANDLER,
            });

            let wrapper = Object.create(ProjectionEditor).init(editor);
            this.editorSection.append(wrapper.render());
            
            return editor;
        });
    } else {
        return new Promise(() => {
            let editor = this.createEditor({
                conceptModel: GMODEL__CONCEPT,
                projectionModel: GMODEL__PROJECTION,
                config: Object.assign({}),
                handlers: GMODEL__HANDLER,
            });

            let wrapper = Object.create(ProjectionEditor).init(editor);
            this.editorSection.append(wrapper.render());

            return editor;
        });
    }

    // let btnPreview = createMenuButton.call(this, "preview-projection", "Preview", editor);
}