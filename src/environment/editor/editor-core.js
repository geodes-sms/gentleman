import {
    createDocFragment, createDiv, createSpan, createUnorderedList, createListItem,
    createParagraph, createButton, createAnchor, createInput, createI, createSection,
    getElement, getElements, removeChildren, isHTMLElement, findAncestor,
    isNullOrWhitespace, isNullOrUndefined, isEmpty, hasOwn, valOrDefault,
    cloneObject, copytoClipboard
} from 'zenkai';
import { Events, hide, show, Key, getEventTarget } from '@utils/index.js';
import { ConceptModelManager } from '@model/index.js';
import { createProjectionModel } from '@projection/index.js';
import { ProjectionWindow } from '../projection-window.js';
import { StyleWindow } from '../style-window.js';
import { createHome } from './home.js';
import { createEditorMenu } from './editor-menu.js';
import { EditorSection } from './editor-section.js';


/**
 * Creates an editor's header
 * @returns {EditorHeader}
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
 * Create a projection in the editor
 * @param {*} concept 
 * @this {Editor}
 */
function createProjection(concept) {
    let projection = this.projectionModel.createGlobalProjection(concept).init();

    let btnBuild = createButton({
        class: ["btn", "editor-concept-toolbar__btn-build"],
        title: `Build ${name.toLowerCase()}`
    });

    let btnDelete = createButton({
        class: ["btn", "editor-concept-toolbar__btn-delete"],
        title: `Delete ${name.toLowerCase()}`
    });

    let btnMaximize = createButton({
        class: ["btn", "editor-concept-toolbar__btn-maximize"],
        title: `Maximize ${name.toLowerCase()}`
    });

    let toolbar = createDiv({
        class: ["editor-concept-toolbar"],
    }, [btnBuild, btnMaximize, btnDelete]);

    var modelConceptContainer = createDiv({
        class: ["editor-concept"],
        draggable: false,
        dataset: {
            nature: "concept-container"
        }
    }, [toolbar, projection.render()]);



    btnBuild.addEventListener('click', (event) => {
        if (this.buildTarget === "gentleman_concept") {
            try {
                const result = this.conceptModel.buildSingleConcept(concept);

                if (!result.success) {
                    console.log('%c Concept is not valid', 'padding: 4px 6px; color: #fff; font-weight: bold; background: #DC143C;');

                    result.errors.forEach(error => console.error(error));

                    modelConceptContainer.classList.remove("valid");
                    modelConceptContainer.classList.add("not-valid");
                } else {
                    const value = result.message;

                    console.log(`%c Concept '${value.name}' is valid`, 'padding: 4px 6px; color: #fff; font-weight: bold; background: #00AB66;');
                    console.log(value);

                    modelConceptContainer.classList.remove("not-valid");
                    modelConceptContainer.classList.add("valid");
                }
            } catch (error) {
                console.error(error);

                this.notify("There was an unexpected error", "error");
            }
        } else if (this.buildTarget === "gentleman_projection") {
            try {
                const result = this.conceptModel.buildSingleProjection(concept);

                if (!result.success) {
                    console.log('%c Projection is not valid', 'padding: 4px 6px; color: #fff; font-weight: bold; background: #DC143C;');

                    result.errors.forEach(error => console.error(error));

                    modelConceptContainer.classList.remove("valid");
                    modelConceptContainer.classList.add("not-valid");
                } else {
                    const value = result.message;

                    console.log(`%c Projection '${value.name}' is valid`, 'padding: 4px 6px; color: #fff; font-weight: bold; background: #00AB66;');
                    console.log(value);

                    modelConceptContainer.classList.remove("not-valid");
                    modelConceptContainer.classList.add("valid");
                }
            } catch (error) {
                console.error(error);

                this.notify("There was an unexpected error", "error");

                return;
            }
        }
    });

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

const MODEL_GENTLEMAN_CONCEPT = require('@include/gentleman_model.json');
const MODEL_GENTLEMAN_PROJECTION = require('@include/gentleman_projection.json');


export const Editor = {
    _initialized: false,

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
    home: null,
    /** @type {HTMLElement} */
    footer: null,
    /** @type {ProjectionWindow} */
    projectionWindow: null,


    /** @type {HTMLElement} */
    downloadList: null,

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
    /** @type {HTMLElement} */
    activeProjection: null,
    /** @type {Concept} */
    activeConcept: null,

    /** @type {HTMLElement} */
    menu: null,
    /** @type {HTMLAnchorElement} */
    btnPrint: null,
    /** @type {HTMLInputElement} */
    input: null,

    /** @type {string} */
    buildTarget: null,
    /** @type {*} */
    config: null,

    /** @type {boolean} */
    active: false,

    init(conceptModel, projectionModel) {
        if (conceptModel) {
            this.conceptModel = ConceptModelManager.createModel(conceptModel).init();
            this.conceptModel.register(this);
        }

        if (projectionModel) {
            this.projectionModel = createProjectionModel(projectionModel, this).init();
        }

        this.fields = new Map();
        this.statics = new Map();
        this.layouts = new Map();
        this.config = {};

        if (this.config) {
            this.header = createEditorHeader.call(this).init();
        }

        this.projectionWindow = createProjectionWindow.call(this).init();

        this.render();

        this._initialized = true;

        return this;
    },

    changeModel(modelSchema) {
        const { concept, projection, values = [], views = [], editor } = modelSchema;

        if (concept) {
            this.conceptModel = ConceptModelManager.createModel(concept, projection).init(values);
            this.conceptModel.register(this);
        }

        if (projection) {
            this.projectionModel = createProjectionModel(projection, this).init(views);
        }

        if (editor) {
            this.config = editor;
            this.buildTarget = editor.build;
        }

        this.manager.refresh();

        this.clear().refresh();

        views.filter(v => v.root).forEach(view => {
            const { id, name } = view.concept;

            const concept = this.conceptModel.getConcept(id);

            this.conceptSection.appendChild(createProjection.call(this, concept));
        });
    },
    addConcept(name) {
        let concept = this.conceptModel.createConcept({ name: name });

        let projection = createProjection.call(this, concept);

        this.conceptSection.appendChild(projection);
    },
    addProjection(projections) {
        if (Array.isArray(projections)) {
            this.projectionModel.schema.push(...projections);
            console.log(this.projectionModel.schema);
        }

        // const { projection, values = [], views = [], editor } = modelSchema;
    },

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

    undo() {
        this.state.undo();
        this.setState(cloneObject(this.state.current));

        Events.emit('editor.undo', this.state.hasUndo);

        return this;
    },
    redo() {
        this.state.redo();
        this.setState(cloneObject(this.state.current));

        Events.emit('editor.redo', this.state.hasRedo);

        return this;
    },
    save() {
        this.state.set(this.concrete);

        Events.emit('editor.save');

        return this;
    },
    print() {
        const MIME_TYPE = 'application/json';
        window.URL = window.webkitURL || window.URL;

        if (!isNullOrWhitespace(this.btnPrint.href)) {
            window.URL.revokeObjectURL(this.btnPrint.href);
        }

        var bb = new Blob([JSON.stringify(this.conceptModel)], { type: MIME_TYPE });
        Object.assign(this.btnPrint, {
            download: `model_${this.conceptModel.language}_${Date.now()}.json`,
            href: window.URL.createObjectURL(bb),
        });
        this.btnPrint.dataset.downloadurl = [MIME_TYPE, this.btnPrint.download, this.btnPrint.href].join(':');

        this.btnPrint.disabled = true;
        // Need a small delay for the revokeObjectURL to work properly.
        setTimeout(() => {
            window.URL.revokeObjectURL(this.btnPrint.href);
            this.btnPrint.disabled = false;
        }, 1500);
    },

    build() {
        const MIME_TYPE = 'application/json';
        window.URL = window.webkitURL || window.URL;

        /** @type {HTMLAnchorElement} */
        var link = createAnchor({
            class: ["bare-link", "download-item__link"]
        }, `Build ${this.footer.childElementCount + 1}`);

        // if (!isNullOrWhitespace(link.href)) {
        //     window.URL.revokeObjectURL(link.href);
        // }

        var result = null;

        if (this.buildTarget === "gentleman_concept") {
            try {
                result = this.conceptModel.buildConcept();
            } catch (error) {
                console.error(error);
                this.notify("The model is not valid. Please review before the next build.", "error");

                return;
            }
        } else if (this.buildTarget === "gentleman_projection") {
            try {
                result = this.conceptModel.buildProjection();
            } catch (error) {
                console.error(error);
                this.notify("The projection are not valid. Please review before the next build.", "error");

                return;
            }
        }

        var bb = new Blob([result], { type: MIME_TYPE });
        Object.assign(link, {
            download: `model.json`,
            href: window.URL.createObjectURL(bb),
        });

        this.notify("The model has been successfully built. Please download the model.");

        link.dataset.downloadurl = [MIME_TYPE, link.download, link.href].join(':');

        let item = createListItem({
            class: ["download-item", "download-item--build"]
        }, link);

        this.downloadList.append(item);

        // // Need a small delay for the revokeObjectURL to work properly.
        // setTimeout(() => {
        //     window.URL.revokeObjectURL(link.href);
        //     link.remove();
        // }, 1500);

        return JSON.parse(result);
    },
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
            "projection": this.projectionModel.schema,
            "values": this.conceptModel.export(),
            "views": this.projectionModel.export(),
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

    open() {
        show(this.container);
        this.active = true;
        this.container.classList.replace('close', 'open');

        Events.emit('editor.open');

        return this;
    },
    close() {
        hide(this.container);
        this.active = false;
        this.container.classList.replace('open', 'close');

        removeChildren(this.container);
        this.container.remove();

        Events.emit('editor.close');

        return this;
    },
    clear() {
        this.fields.clear();

        if (this.conceptSection) {
            removeChildren(this.conceptSection);
        }

        if (this.home) {
            removeChildren(this.home);
            hide(this.home);
        }

        this.activeField = null;
        this.activeElement = null;
        this.activeConcept = null;

        Events.emit('editor.clear');

        return this;
    },
    openStyle() {
        /** @type {HTMLElement} */
        const container = createDiv({
            class: ["style-container"]
        });

        let btnClose = createButton({
            class: ["btn", "btn-close"]
        });

        const widthControl = StyleWindow.createWidthControl.call(this);
        // const heightControl = createWidthControl.call(this);
        const sizeControl = StyleWindow.createSizeControl.call(this);

        container.append(btnClose, widthControl, sizeControl);

        btnClose.addEventListener('click', (event) => {
            removeChildren(container);
            container.remove();
            this.container.classList.remove("busy");
        });

        this.container.append(container);
        this.container.classList.add("busy");
    },

    notify(message, type) {
        var notify = getElement('.notify:not(.open)', this.container);

        if (!isHTMLElement(notify)) {
            notify = createParagraph({
                class: ["notify"]
            });
            this.container.appendChild(notify);
        }

        notify.textContent = message;
        notify.classList.remove("error");

        if (type) {
            notify.classList.add(type);
        }
        notify.classList.add("open");
        setTimeout(() => {
            notify.classList.remove("open");
        }, 3000);
    },
    display(message, title) {
        var dialog = getElement('.dialog:not(.open)', this.container);
        if (!isHTMLElement(dialog)) {
            dialog = createDiv({
                class: ["dialog-container"]
            });
            this.container.appendChild(dialog);
        }
        removeChildren(dialog);
        dialog.appendChild(createParagraph({
            class: ["dialog-content"]
        }, message));
        dialog.classList.add('open');
    },

    /**
     * Renders the editor in the DOM inside an optional container
     * @param {HTMLElement} [container] 
     */
    render(container) {
        const fragment = createDocFragment();

        if (!isHTMLElement(this.header.container)) {
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

            this.body.appendChild(this.conceptSection);

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

            this.footer.append(this.downloadList);

            fragment.appendChild(this.footer);
        }

        if (!isHTMLElement(this.projectionWindow.container)) {
            fragment.appendChild(this.projectionWindow.render());
        }

        if (!isHTMLElement(this.menu)) {
            this.menu = createEditorMenu.call(this);

            fragment.appendChild(this.menu);
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

        // TODO: Add support for saved projection
        // TODO  HINT: Add getProjection to Model (lookup passed value, saved model)

        this.refresh();

        return this.container;
    },
    refresh() {
        if (isNullOrUndefined(this.conceptModel)) {
            this.header.hide();

            this.container.classList.add("empty");

            this.home = createHome();
            show(this.home);

            hide(this.menu);
            this.body.append(this.home);

            this._initialized = false;

            return;
        }

        show(this.menu);

        this.header.refresh().show();

        this.projectionWindow.show();

        this.container.classList.remove("empty");

        // var modelConceptList = createUnorderedList({
        //     class: ["bare-list", "selector-model-concepts", "font-ui"]
        // });

        // const concreteConcepts = this.conceptModel.schema.filter((concept) => this.projectionModel.hasGlobalProjection(concept));

        // concreteConcepts.forEach(concept => {
        //     var conceptItem = createListItem({
        //         class: ["selector-model-concept", "font-ui"],
        //         title: concept.description,
        //         dataset: {
        //             "concept": concept.name
        //         }
        //     }, concept.name);

        //     modelConceptList.appendChild(conceptItem);
        // });

        this._initialized = true;

        // modelConceptList.addEventListener("click", (event) => {
        //     const { target } = event;

        //     if (hasOwn(target.dataset, "concept")) {
        //         const { concept: name } = target.dataset;

        //         let concept = this.conceptModel.createConcept({ name: name });

        //         this.conceptSection.appendChild(createProjection.call(this, concept));
        //     }
        // });

        // removeChildren(this.header.body).appendChild(modelConceptList);

        // const { name } = this.conceptModel;

        // /** @type {HTMLElement} */
        // let modelSelectorContent = createSpan({
        //     class: ["editor-selector-model-content"]
        // }, name);

        // removeChildren(this.modelSelector).appendChild(modelSelectorContent);

        // /** @type {HTMLElement} */
        // let conceptSelectorContent = createUnorderedList({
        //     class: ["bare-list", "selector-concepts", "font-ui"]
        // });
        // conceptSelectorContent.appendChild(conceptSelectorHandler(this.concept, this.activeConcept));

        // conceptSelectorContent.addEventListener('click', (event) => {
        //     // console.log("SHOW LIST OF CONCEPT");
        // });

        // removeChildren(this.conceptSelector).appendChild(conceptSelectorContent);


        return this;
    },
    /**
     * Updates the editor on model change
     * @param {string} message
     * @param {*} value 
     */
    update(message, value) {
        console.log(message, value);
        switch (message) {
            case "value.added":
                this.header.notify("value.added", value);

                break;
            default:
                console.warn(`The message '${message}' was not handled for editor`);

                break;
        }

        this.refresh();
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


    bindEvents() {
        var lastKey = null;
        var fileHandler = null;

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

            const { action } = target.dataset;

            if (this.activeField) {
                this.activeField.clickHandler(target);
            }

            if (action === "close") {
                this.close();
                this.manager.deleteEditor(this);
                target.blur();
            } else if (action === "new") {
                let editor = this.manager.createEditor().init().open();
                target.blur();
            } else if (action === "style") {
                this.openStyle();
                target.blur();
            } else if (action === "import") {
                let event = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                });
                fileHandler = this.changeModel;

                this.input.dispatchEvent(event);
            } else if (action === "export") {
                this.export();
            } else if (action === "build") {
                this.build(true);
            } else if (action === "import-projection") {
                let event = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                });
                fileHandler = this.addProjection;

                this.input.dispatchEvent(event);
            } else if (action === "open-model") {
                let event = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                });
                fileHandler = this.changeModel;

                this.input.dispatchEvent(event);
            } else if (action === "create-metamodel") {
                this.changeModel(MODEL_GENTLEMAN_CONCEPT);
            } else if (action === "create-projection") {
                this.changeModel(MODEL_GENTLEMAN_PROJECTION);
            }
        }, true);

        this.input.addEventListener('change', (event) => {
            var file = this.input.files[0];

            if (!file.name.endsWith('.json')) {
                this.notify("This file is not supported. Please use a .json file");
            }

            var reader = new FileReader();
            reader.onload = (e) => {
                fileHandler.call(this, JSON.parse(reader.result));
                fileHandler = null;
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
                    }

                    break;
                case Key.insert:
                    if (this.activeField) {
                        console.log("Insert value");

                        event.preventDefault();
                    }

                    break;
                case Key.up_arrow:
                    if (this.activeField) {
                        const handled = this.activeField.arrowHandler("up", target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    } else if (nature === "static") {
                        let element = this.getStatic(target);
                        const handled = element.arrowHandler("up", target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    }

                    break;
                case Key.down_arrow:
                    if (this.activeField) {
                        const handled = this.activeField.arrowHandler("down", target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    } else if (nature === "static") {
                        let element = this.getStatic(target);
                        const handled = element.arrowHandler("down", target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    }

                    break;
                case Key.right_arrow:
                    if (this.activeField) {
                        const handled = this.activeField.arrowHandler("right", target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    } else if (nature === "static") {
                        let element = this.getStatic(target);
                        const handled = element.arrowHandler("right", target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    }

                    break;
                case Key.left_arrow:
                    if (this.activeField) {
                        const handled = this.activeField.arrowHandler("left", target) === true;

                        if (handled) {
                            event.preventDefault();
                        }
                    } else if (nature === "static") {
                        let element = this.getStatic(target);
                        const handled = element.arrowHandler("left", target) === true;

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

                let projectionElement = getProjection(target);

                if (projectionElement) {
                    const { projection: id } = projectionElement.dataset;
                    let projection = this.projectionModel.getProjection(id);

                    // update active concept
                    if (projection.concept) {
                        this.updateActiveConcept(projection.concept);
                    }
                }

                this.activeField = null;
            }

            // update active element (projection)
            let parentProjection = getProjection(target);
            if (parentProjection) {
                this.updateActiveElement(parentProjection);
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

            // update active concept
            let conceptParent = this.activeField.source.getParent();
            if (conceptParent) {
                this.updateActiveConcept(this.activeField.source);
            }
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

        Events.on('model.change', (from) => {
            this.save();
        });
    }
};

/**
 * Creates a selector between a root concept and the active concept
 * @param {Concept!} rootConcept 
 * @param {Concept} [activeConcept] 
 * @returns {Node}
 */
function conceptSelectorHandler(rootConcept, activeConcept) {

    if (isNullOrUndefined(rootConcept)) {
        throw new TypeError("Bad argument: rootConcept must be a Concept");
    }

    /**
     * Createa a selector item
     * @param {string} type 
     * @param {Concept} concept 
     * @returns {HTMLElement}
     */
    const createSelectorItem = (type, concept, source = false) => {
        const { name, alias, object, ref } = concept;

        const typeHandler = {
            "root": `${valOrDefault(alias, name)}`,
            "parent": `${valOrDefault(alias, name)}`,
            "ancestor": `${valOrDefault(alias, name)}`,
            "active": `${valOrDefault(ref.name, name)}`,
        };

        const fragment = createDocFragment();

        if (type === "active") {
            fragment.appendChild(createI({
                class: [`selector-concept-nature`]
            }, name));
        }

        /** @type {HTMLElement} */
        var content = createSpan({
            class: ["selector-concept-content"],
        }, typeHandler[type]);

        fragment.appendChild(content);

        if (type === "ancestor") {
            content.classList.add("fit-content");
        }


        /** @type {HTMLElement} */
        var item = createListItem({
            class: ["selector-concept", `selector-concept--${type}`],
            dataset: {
                object: object
            }
        }, fragment);

        if (source) {
            item.classList.add("source");
        }

        return item;
    };

    const fragment = createDocFragment();
    const hasActiveConcept = !isNullOrUndefined(activeConcept);

    fragment.appendChild(createSelectorItem("root", rootConcept, hasActiveConcept));

    if (!hasActiveConcept) {
        return fragment;
    }

    let activeParent = activeConcept.getParent();

    if (activeParent !== rootConcept) {
        let parent = activeParent;
        let parentItem = null;

        parentItem = createSelectorItem("parent", activeParent, true);

        let ancestor = parent.getAncestor().filter(val => val.object === "concept" && val.nature !== "primitive" && val !== rootConcept);

        if (!isEmpty(ancestor)) {
            ancestor = ancestor.reverse();
            let ancestorItem = createListItem({
                class: ["selector-concept", `selector-concept--ancestor`, "source", "collapse"]
            });

            let list = createUnorderedList({
                class: ["bare-list", "selector-ancestor-concepts"]
            });
            ancestor.forEach(concept => {
                list.appendChild(createListItem({
                    class: ["selector-ancestor-concept", "fit-content"],
                }, concept.name));
            });

            ancestorItem.appendChild(list);

            fragment.appendChild(ancestorItem);

            // ancestor.forEach(concept => {
            //     fragment.appendChild(createSelectorItem("ancestor", concept, true));
            // });
        }

        fragment.appendChild(parentItem);
    } else {
        // TODO: mark root as parent
    }

    fragment.appendChild(createSelectorItem("active", activeConcept));

    return fragment;
}