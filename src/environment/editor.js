import {
    createDocFragment, createDiv, createH2, createUnorderedList, createListItem,
    createParagraph, createButton, createHeader, createAnchor, createSpan,
    createInput, createLabel, createI, getElement, getElements, removeChildren,
    isHTMLElement, isNullOrWhitespace, isNullOrUndefined, isEmpty, hasOwn,
    copytoClipboard, cloneObject, valOrDefault, findAncestor, createSection,
} from 'zenkai';
import { Events, hide, show, Key } from '@utils/index.js';
import { ConceptModelManager } from '@model/index.js';
import { createProjectionModel } from '@projection/index.js';


const MODEL_GENTLEMAN_CONCEPT = require('@include/gentleman_model.json');
const MODEL_GENTLEMAN_PROJECTION = require('@include/gentleman_projection.json');

// Allow responsive design
const MQL = window.matchMedia('(max-width: 800px)');

/**
 * @returns {HTMLElement}
 */
function createEditorHeader() {
    this.header = createDiv({
        class: ["editor-header"],
    });

    let title = createSpan({
        class: ["editor-header-title"],
    }, "Editor");

    this.selectorList = createUnorderedList({
        class: ["bare-list", "editor-selector"],
    }, ["model", "concept"].map(item => createListItem({
        class: ["editor-selector-item"],
        tabindex: 0,
        dataset: {
            "value": item,
            "action": `selector-${item}`
        }
    }, item)));
    this.selectorItem = this.selectorList.children[0];
    this.selectorItem.classList.add("selected");
    this.selectorValue = this.selectorItem.dataset.value;


    let btnClose = createButton({
        class: ["btn", "btn-close"],
        dataset: {
            action: "close"
        }
    });

    let btnNew = createButton({
        class: ["btn", "btn-new"],
        dataset: {
            action: "new"
        }
    });

    let btnStyle = createButton({
        class: ["btn", "btn-style", "hidden"],
        dataset: {
            action: "style"
        }
    });

    let toolbar = createDiv({
        class: ["editor-toolbar"],
    }, [btnStyle, btnNew, btnClose]);

    let menu = createDiv({
        class: ["editor-header-menu"]
    }, [title, this.selectorList, toolbar]);

    this.headerBody = createDiv({
        class: ["editor-header-main"],
    });

    this.header.append(menu, this.headerBody);

    return this.header;
}

/**
 * @returns {HTMLElement}
 */
function createEditorMenu(options) {
    const menu = createDiv({
        class: ["menu"],
        draggable: true,
        title: "Click to access the import, export and build actions"
    });

    const title = createSpan({
        class: ["menu-title"],
        dataset: {
            "ignore": "all",
        }
    }, "Menu");

    const btnExport = createButton({
        class: ["btn", "btn-export"],
        dataset: {
            "context": "model",
            "action": "export",
        }
    }, "Export");

    const btnImport = createButton({
        class: ["btn", "btn-import"],
        dataset: {
            "context": "model",
            "action": "import"
        }
    }, "Import");

    const btnBuild = createButton({
        class: ["btn", "btn-build"],
        dataset: {
            "context": "model",
            "action": "build"
        }
    }, "Build");

    menu.append(title, btnExport, btnImport, btnBuild);

    menu.addEventListener('click', (event) => {
        menu.classList.toggle("open");
    });

    return menu;
}

/**
 * @returns {HTMLElement}
 */
function createHome() {
    const container = createSection({
        class: ["editor-home"]
    });

    var header = createHeader({
        class: ["menu-header"]
    });

    var title = createH2({
        class: ["editor-home__title"]
    }, "Editor");

    var content = createParagraph({
        class: ["menu-content"],
        html: "Welcome to Gentleman's editor.<br>To begin, please load a model or continue with a previous instance."
    });

    header.append(title, content);

    var body = createDiv({
        class: ["loader-container"],
        tabindex: -1
    });


    var modelOptions = createDiv({
        class: ["loader-options"]
    });

    var modelOptionsTitle = createH2({
        class: ["loader-options-title"]
    }, "Concept");

    var modelOptionsContent = createParagraph({
        class: ["loader-options-content"],
        html: "Create or edit a model."
    });

    var modelOptionsAction = createDiv({
        class: ["loader-options-action"]
    });

    var btnCreateMetaModel = createButton({
        class: ["btn", "loader-option", "loader-option--new"],
        dataset: {
            action: "create-metamodel",
        }
    }, [
        createSpan({
            class: ["loader-option__action"],
            dataset: {
                ignore: "all",
            }
        }, "New"),
        createSpan({
            class: ["loader-option__type"],
            dataset: {
                ignore: "all",
            }
        }, "metamodel")
    ]);

    var btnOpenModel = createButton({
        class: ["btn", "loader-option", "loader-option--open"],
        dataset: {
            action: "open-model",
        },
    }, [
        createSpan({
            class: ["loader-option__action"],
            dataset: {
                ignore: "all",
            }
        }, "Open"),
        createSpan({
            class: ["loader-option__type"],
            dataset: {
                ignore: "all",
            }
        }, "model")
    ]);

    modelOptionsAction.append(btnCreateMetaModel, btnOpenModel);

    modelOptions.append(modelOptionsTitle, modelOptionsContent, modelOptionsAction);


    var projectionOptions = createDiv({
        class: ["loader-options"]
    });

    var projectionOptionsTitle = createH2({
        class: ["loader-options-title"]
    }, "Projection");

    var projectionOptionsContent = createParagraph({
        class: ["loader-options-content"],
        html: "Create or edit a projection."
    });

    var projectionOptionsAction = createDiv({
        class: ["loader-options-action"]
    });

    var btnCreateProjection = createButton({
        class: ["btn", "loader-option", "loader-option--new"],
        dataset: {
            action: "create-projection",
        }
    }, [
        createSpan({
            class: ["loader-option__action"],
            dataset: {
                ignore: "all",
            }
        }, "New"),
        createSpan({
            class: ["loader-option__type"],
            dataset: {
                ignore: "all",
            }
        }, "projection")
    ]);

    var btnOpenProjection = createButton({
        class: ["btn", "loader-option", "loader-option--open"],
        dataset: {
            action: "open-projection",
        }
    }, [
        createSpan({
            class: ["loader-option__action"],
            dataset: {
                ignore: "all",
            }
        }, "Open"),
        createSpan({
            class: ["loader-option__type"],
            dataset: {
                ignore: "all",
            }
        }, "projection")
    ]);

    projectionOptionsAction.append(btnCreateProjection, btnOpenProjection);

    projectionOptions.append(projectionOptionsTitle, projectionOptionsContent, projectionOptionsAction);

    body.append(modelOptions, projectionOptions);

    container.append(header, body);

    return container;
}

function createWidthControl() {
    /** @type {HTMLElement} */
    const controlWrapper = createDiv({
        class: ["control-wrapper", "control-wrapper--width"]
    });

    /** @type {HTMLLabelElement} */
    const labelWR = createLabel({
        class: ["style-label"],
    }, "Width");

    /** @type {HTMLElement} */
    const iconWR = createI({
        class: ["material-icons"],
    }, "height");

    /** @type {HTMLElement} */
    const inputWrapper = createDiv({
        class: ["input-wrapper"]
    });

    /** @type {HTMLInputElement} */
    const rangeWR = createInput({
        class: ["style-input", "style-input--range"],
        type: "range",
        min: 0,
        max: 100,
        step: 1
    });

    /** @type {HTMLInputElement} */
    const numberWR = createInput({
        class: ["style-input", "style-input--number"],
        type: "number",
        min: 0,
        max: 100
    });

    inputWrapper.append(rangeWR, numberWR);

    controlWrapper.append(labelWR, iconWR, inputWrapper);

    controlWrapper.addEventListener('input', (event) => {
        const { target } = event;

        this.container.style.width = `calc(300px + ${target.value}%)`;
        numberWR.value = target.value;
        rangeWR.value = target.value;
    });

    controlWrapper.addEventListener('focusin', (event) => {
        this.container.style.border = "1px solid blue";
    });

    controlWrapper.addEventListener('focusout', (event) => {
        this.container.style.border = null;
    });

    return controlWrapper;
}

function createSizeControl() {
    /** @type {HTMLElement} */
    const controlWrapper = createDiv({
        class: ["control-wrapper", "control-wrapper--size"]
    });

    /** @type {HTMLLabelElement} */
    const labelWR = createLabel({
        class: ["style-label"],
    }, "Size");

    /** @type {HTMLElement} */
    const iconWR = createI({
        class: ["material-icons"],
    }, "format_size");

    /** @type {HTMLElement} */
    const inputWrapper = createDiv({
        class: ["input-wrapper"]
    });

    /** @type {HTMLInputElement} */
    const rangeWR = createInput({
        class: ["style-input", "style-input--range"],
        type: "range",
        min: 0,
        max: 50,
        step: 1
    });

    /** @type {HTMLInputElement} */
    const numberWR = createInput({
        class: ["style-input", "style-input--number"],
        type: "number",
        min: 0,
        max: 50
    });

    inputWrapper.append(rangeWR, numberWR);

    controlWrapper.append(labelWR, iconWR, inputWrapper);

    controlWrapper.addEventListener('input', (event) => {
        const { target } = event;

        this.container.style.fontSize = `${target.value}px`;
        numberWR.value = target.value;
        rangeWR.value = target.value;
    });

    controlWrapper.addEventListener('focusin', (event) => {
        this.container.style.border = "1px solid blue";
    });

    controlWrapper.addEventListener('focusout', (event) => {
        this.container.style.border = null;
    });

    return controlWrapper;
}

function createSpaceControl() {
    /** @type {HTMLElement} */
    const controlWrapper = createDiv({
        class: ["control-wrapper", "control-wrapper--space"]
    });

    /** @type {HTMLLabelElement} */
    const labelWR = createLabel({
        class: ["style-label"],
    }, "Space");

    /** @type {HTMLElement} */
    const iconWR = createI({
        class: ["material-icons"],
    }, "format_size");

    /** @type {HTMLElement} */
    const inputWrapper = createDiv({
        class: ["input-wrapper"]
    });

    /** @type {HTMLInputElement} */
    const rangeWR = createInput({
        class: ["style-input", "style-input--range"],
        type: "range",
        min: 0,
        max: 50,
        step: 1
    });

    /** @type {HTMLInputElement} */
    const numberWR = createInput({
        class: ["style-input", "style-input--number"],
        type: "number",
        min: 0,
        max: 50
    });

    inputWrapper.append(rangeWR, numberWR);

    controlWrapper.append(labelWR, iconWR, inputWrapper);

    controlWrapper.addEventListener('input', (event) => {
        const { target } = event;

        this.container.style.fontSize = `${target.value}px`;
        numberWR.value = target.value;
        rangeWR.value = target.value;
    });

    controlWrapper.addEventListener('focusin', (event) => {
        this.container.style.border = "1px solid blue";
    });

    controlWrapper.addEventListener('focusout', (event) => {
        this.container.style.border = null;
    });

    return controlWrapper;
}

export const Editor = {
    _initialized: false,
    /** @type {Model} */
    conceptModel: null,
    /** @type {Concept} */
    concept: null,
    /** @type {ProjectionModel} */
    projectionModel: null,
    /** @type {Projection} */
    projection: null,

    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    header: null,
    /** @type {HTMLElement} */
    headerBody: null,
    /** @type {HTMLElement} */
    body: null,
    /** @type {HTMLElement} */
    home: null,
    /** @type {HTMLElement} */
    footer: null,

    /** @type {HTMLElement} */
    selectorList: null,
    /** @type {HTMLElement} */
    selectorItem: null,
    /** @type {string} */
    selectorValue: null,

    /** @type {Map} */
    fields: null,
    /** @type {Field} */
    activeField: null,
    /** @type {HTMLElement} */
    activeElement: null,
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

    /** @type {boolean} */
    active: false,

    init(conceptModel, projectionModel, valueModel) {
        if (conceptModel) {
            this.conceptModel = ConceptModelManager.createModel(conceptModel).init(valueModel);
        }

        if (projectionModel) {
            this.projectionModel = createProjectionModel(projectionModel, this).init();
        }

        this.fields = new Map();

        this.render();

        this._initialized = true;

        return this;
    },

    changeModel(modelSchema) {
        const { concept, projection, values, editor } = modelSchema;

        if (concept) {
            this.conceptModel = ConceptModelManager.createModel(concept, projection).init(values);
        }

        if (projection) {
            this.projectionModel = createProjectionModel(projection, this).init();
        }

        if (editor) {
            this.buildTarget = editor.build;
        }

        this.manager.refresh();

        this.clear().refresh();
    },

    registerField(field) {
        field.environment = this;
        this.fields.set(field.id, field);

        return this;
    },
    unregisterField(field) {
        var _field = this.fields.get(field.id);

        if (_field) {
            _field.editor = null;
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

    build(download = false) {
        const MIME_TYPE = 'application/json';
        window.URL = window.webkitURL || window.URL;

        /** @type {HTMLAnchorElement} */
        var link = createAnchor({});
        this.container.appendChild(link);

        if (!isNullOrWhitespace(link.href)) {
            window.URL.revokeObjectURL(link.href);
        }

        var result = null;
        if (this.buildTarget === "gentleman_concept") {
            try {
                result = this.conceptModel.build();
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
        if (download) {
            link.click();
        }

        // Need a small delay for the revokeObjectURL to work properly.
        setTimeout(() => {
            window.URL.revokeObjectURL(link.href);
            link.remove();
        }, 1500);

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
            "projection": this.projectionModel.schema
            // "values": this.conceptModel.export()
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

        const widthControl = createWidthControl.call(this);
        // const heightControl = createWidthControl.call(this);
        const sizeControl = createSizeControl.call(this);

        container.append(widthControl, sizeControl);

        this.container.after(container);
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

        if (!isHTMLElement(this.header)) {
            createEditorHeader.call(this);

            fragment.appendChild(this.header);
        }

        if (!isHTMLElement(this.body)) {
            this.body = createDiv({
                class: ["editor-body"],
                tabindex: 0,
            });

            this.conceptSection = createUnorderedList({
                class: ["bare-list", "model-concept-list"],
            });

            this.body.appendChild(this.conceptSection);

            fragment.appendChild(this.body);
        }

        if (!isHTMLElement(this.footer)) {
            this.footer = createDiv({
                class: ["editor-footer"],
                tabindex: 0,
            });

            fragment.appendChild(this.footer);
        }

        if (!isHTMLElement(this.menu)) {
            this.menu = createEditorMenu();

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
            hide(this.selectorList);
            hide(this.headerBody);

            this.container.classList.add("empty");

            this.home = createHome();
            show(this.home);

            hide(this.menu);
            this.body.append(this.home);

            this._initialized = false;

            return;
        }

        show(this.menu);
        show(this.selectorList);
        show(this.headerBody);

        this.container.classList.remove("empty");

        var modelConceptList = createUnorderedList({
            class: ["bare-list", "selector-model-concepts", "font-ui"]
        });
        const concreteConcepts = this.conceptModel.schema.filter((concept) => this.projectionModel.hasGlobalProjection(concept));

        concreteConcepts.forEach(concept => {
            var conceptItem = createListItem({
                class: ["selector-model-concept", "font-ui"],
                title: concept.description,
                dataset: {
                    "concept": concept.name
                }
            }, concept.name);

            modelConceptList.appendChild(conceptItem);


            if (!this._initialized) {
                const created = this.conceptModel.getConcepts(concept.name);
                created.forEach(c => {
                    let projection = this.projectionModel.createGlobalProjection(c).init();
                    let btnDelete = createButton({
                        class: ["btn", "model-concept-list-item__btn-delete"]
                    }, `Delete ${name.toLowerCase()}`);

                    var modelConceptListItem = createListItem({
                        class: ["model-concept-list-item"],
                    }, [btnDelete, projection.render()]);

                    btnDelete.addEventListener('click', (event) => {
                        if (c.delete(true)) {
                            removeChildren(modelConceptListItem);
                            modelConceptListItem.remove();
                        }
                    });

                    this.conceptSection.appendChild(modelConceptListItem);
                });
            }
        });

        this._initialized = true;

        modelConceptList.addEventListener("click", (event) => {
            const { target } = event;

            if (hasOwn(target.dataset, "concept")) {
                const { concept: name } = target.dataset;

                let concept = this.conceptModel.createConcept({ name: name });
                let projection = this.projectionModel.createGlobalProjection(concept).init();
                let btnDelete = createButton({
                    class: ["btn", "model-concept-list-item__btn-delete"],
                    title: `Delete ${name.toLowerCase()}`
                });
                let btnMaximize = createButton({
                    class: ["btn", "model-concept-list-item__btn-maximize"],
                    title: `Maximize ${name.toLowerCase()}`
                });

                var modelConceptListItem = createListItem({
                    class: ["model-concept-list-item"],
                    dataset: {
                        nature: "concept-container"
                    }
                }, [btnMaximize, btnDelete, projection.render()]);

                btnDelete.addEventListener('click', (event) => {
                    if (concept.delete(true)) {
                        removeChildren(modelConceptListItem);
                        modelConceptListItem.remove();
                    }
                });
                btnMaximize.addEventListener('click', (event) => {
                    modelConceptListItem.classList.toggle('focus');
                });

                this.conceptSection.appendChild(modelConceptListItem);
            }
        });

        removeChildren(this.headerBody).appendChild(modelConceptList);

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
    // TODO: adapt UI to smaller screen
    resize() {

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
    updateSelector(evalue) {
        const { value } = evalue.dataset;
        // let editor = this.manager.createEditor();
        // editor.init(MODEL_GENTLEMAN_CONCEPT).open();
        if (this.selectorValue === value) {
            return;
        }

        if (evalue.parentElement !== this.selectorList) {
            return;
        }

        this.selectorItem.classList.remove("selected");
        this.selectorValue = value;
        this.selectorItem = evalue;
        this.selectorItem.classList.add("selected");

        this.refresh();
    },

    bindEvents() {
        var lastKey = null;
        var fileHandler = null;

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
            } else if (action === "selector-model") {
                this.updateSelector(target);

                event.preventDefault();
            } else if (action === "selector-concept") {
                this.updateSelector(target);

                event.preventDefault();
            } else if (action === "selector-projection") {
                this.updateSelector(target);

                event.preventDefault();
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

        this.body.addEventListener('keydown', (event) => {
            const { target } = event;

            var projectionElement = getProjection(target);

            var rememberKey = false;

            switch (event.key) {
                case Key.backspace:
                    if (this.activeField) {
                        this.activeField.backspaceHandler(target);
                    }
                    break;
                case Key.ctrl:
                    event.preventDefault();
                    rememberKey = true;
                    break;
                case Key.delete:
                    break;
                case Key.alt:
                    event.preventDefault();
                    if (projectionElement) {
                        const { projection: id } = projectionElement.dataset;
                        let projection = this.projectionModel.getProjection(id);
                        projection.changeView();
                    }
                    rememberKey = true;
                    break;
                case Key.enter:
                    if (this.activeField) {
                        this.activeField.enterHandler(target);
                    } else {
                        event.preventDefault();
                    }

                    break;
                case Key.right_arrow:

                    break;
                case Key.escape:
                    rememberKey = false;
                    if (this.activeField) {
                        this.activeField.escapeHandler(target);
                    }

                    break;
                case Key.tab:

                    break;
                case 'b':
                    if (lastKey === Key.ctrl) {
                        let builder = this.manager.createBuilder();
                        builder.init(this.conceptModel, this.activeConcept).open();

                        event.preventDefault();
                    }
                    break;
                case 'e':
                    if (lastKey === Key.ctrl) {
                        let explorer = this.manager.createExplorer();
                        explorer.init(this.conceptModel, this.activeConcept).open();

                        event.preventDefault();
                    }
                    break;
                case 'i':
                    if (lastKey === Key.ctrl) {
                        let editor = this.manager.createEditor();
                        editor.init(this.conceptModel, this.activeConcept).open();

                        event.preventDefault();
                    }
                    break;
                case "g":
                case "q":
                case "p":
                case "s":
                case "z":
                    if (lastKey == Key.ctrl) {
                        event.preventDefault();
                    }
                    rememberKey = false;
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
                    if (lastKey === Key.ctrl) {
                        if (this.activeField) {
                            this.activeField.spaceHandler(target);
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
                    this.activeField.focusOut();
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

            if (isNullOrUndefined(field)) {
                return;
            }

            this.activeField = field;
            this.activeField.focusIn();

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

        const handleWidthChange = (mql) => this.resize(mql);

        MQL.addListener(handleWidthChange);
    }
};

/**
 * Gets an event real target
 * @param {HTMLElement} element 
 * @returns {HTMLElement}
 */
function getEventTarget(element) {
    const isValid = (el) => !hasOwn(el.dataset, "ignore");

    if (isValid(element)) {
        return element;
    }

    return findAncestor(element, isValid, 10);
}

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