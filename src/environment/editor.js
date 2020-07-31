import {
    createDocFragment, createDiv, createH2, createUnorderedList, createListItem,
    createParagraph, createButton, createHeader, createAnchor, createInput, createSpan,
    getElement, getElements, appendChildren, removeChildren, isHTMLElement, hasOwn,
    isNullOrWhitespace, isNullOrUndefined, isNull, copytoClipboard, cloneObject,
    valOrDefault, isEmpty, createI, findAncestor,
} from 'zenkai';
import { Events, hide, show, Key } from '@utils/index.js';
import { MetaModel, Model } from '@model/index.js';
import { ProjectionManager } from '@projection/index.js';
import { Loader, LoaderFactory } from './loader.js';
import { State } from './state.js';


// Allow responsive design
const MQL = window.matchMedia('(max-width: 800px)');

export const Editor = {
    /** @type {MetaModel} */
    metamodel: null,
    /** @type {Model} */
    model: null,
    /** @type {Concept} */
    concept: null,

    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    header: null,
    /** @type {HTMLElement} */
    body: null,
    /** @type {HTMLElement} */
    footer: null,
    /** @type {HTMLElement} */
    metamodelSelector: null,
    /** @type {HTMLElement} */
    modelSelector: null,
    /** @type {HTMLElement} */
    conceptSelector: null,

    /** @type {Map} */
    fields: null,
    /** @type {Field} */
    activeField: null,
    /** @type {HTMLElement} */
    activeElement: null,
    /** @type {Concept} */
    activeConcept: null,

    /** @type {HTMLButtonElement} */
    btnExport: null,
    /** @type {HTMLButtonElement} */
    btnImport: null,
    /** @type {HTMLButtonElement} */
    btnBuild: null,
    /** @type {HTMLAnchorElement} */
    btnPrint: null,
    /** @type {HTMLInputElement} */
    input: null,
    /** @type {Loader} */
    loader: null,

    /** @type {boolean} */
    active: false,

    init(metamodel, model, concept) {
        if (isNullOrUndefined(metamodel)) {
            return this.menu();
        }

        this.metamodel = metamodel;
        this.model = model ? model : this.metamodel.createModel().init(model);
        this.concept = concept ? concept : this.model.root;
        this.state = State.create();
        this.fields = new Map();

        this.loader = LoaderFactory.create({
            afterLoadMetaModel: (metamodel) => {
                this.init(metamodel);
            }
        }).init(this);

        this.render();

        return this;
    },

    menu() {
        const loader = LoaderFactory.create({
            afterLoadMetaModel: (metamodel) => {
                this.init(metamodel);
                removeChildren(header);
                header.remove();
                loader.close();
            }
        }).init(this);

        var header = createHeader({
            class: ["menu-header"]
        });
        var title = createH2({
            class: ["menu-title"]
        }, "Editor");
        var content = createParagraph({
            class: ["menu-content"]
        }, "Welcome to Gentleman's editor. To begin, please load a metamodel.");
        appendChildren(header, [title, content]);

        appendChildren(this.container, [header, loader.render()]);

        return this;
    },

    changeModel(modelSchema) {
        var model = Loader.loadModel(modelSchema);
        model.render();
    },

    registerField(field) {
        field.editor = this;
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

        var bb = new Blob([JSON.stringify(this.model)], { type: MIME_TYPE });
        Object.assign(this.btnPrint, {
            download: `model_${this.metamodel.language}_${Date.now()}.json`,
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
    preview() {

    },
    build() {
        const MIME_TYPE = 'application/json';
        window.URL = window.webkitURL || window.URL;

        /** @type {HTMLAnchorElement} */
        var link = createAnchor({});
        this.container.appendChild(link);

        if (!isNullOrWhitespace(link.href)) {
            window.URL.revokeObjectURL(link.href);
        }

        var bb = new Blob([this.model.build()], { type: MIME_TYPE });
        Object.assign(link, {
            download: `phone_book.json`,
            href: window.URL.createObjectURL(bb),
        });

        this.notify("The model has been successfully built. Please download the metamodel.");

        link.dataset.downloadurl = [MIME_TYPE, link.download, link.href].join(':');
        link.click();

        // Need a small delay for the revokeObjectURL to work properly.
        setTimeout(() => {
            window.URL.revokeObjectURL(link.href);
            link.remove();
        }, 1500);
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

        Events.emit('editor.close');

        return this;
    },
    clear() {
        this.fields.clear();

        removeChildren(this.body);

        this.activeField = null;
        this.activeElement = null;
        this.activeConcept = null;

        Events.emit('editor.clear');

        return this;
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
        notify.classList.add('open');
        setTimeout(() => {
            notify.classList.remove('open');
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
    append(element) {
        this.body.appendChild(element);

        return this;
    },

    render(container) {
        const fragment = createDocFragment();

        // const  { build, import, export } = this.metamodel.schema["@editor"];

        if (!isHTMLElement(this.header)) {
            this.header = createDiv({
                class: ["editor-header"],
                tabindex: 0,
            });

            this.modelSelector = createDiv({
                class: ["editor-selector-model"],
                tabindex: 0,
            });

            this.conceptSelector = createDiv({
                class: ["editor-selector-concept"],
                tabindex: 0,
            });

            let selector = createDiv({
                class: ["editor-selector"],
                tabindex: 0,
            }, [this.modelSelector, this.conceptSelector]);

            let btnClose = createButton({
                class: ["btn", "btn-close"],
                dataset: {
                    action: "close"
                }
            });
            let toolbar = createDiv({
                class: ["editor-toolbar"],
            }, [btnClose]);

            appendChildren(this.header, [selector, toolbar]);

            fragment.appendChild(this.header);
        }

        if (!isHTMLElement(this.body)) {
            this.body = createDiv({
                class: ["editor-body"],
                tabindex: 0,
            });

            fragment.appendChild(this.body);
        }

        if (!isHTMLElement(this.footer)) {
            this.footer = createDiv({
                class: ["editor-footer"],
                tabindex: 0,
            });

            fragment.appendChild(this.footer);
        }

        if (!isHTMLElement(this.btnExport)) {
            this.btnExport = createButton({
                id: "btnExportModel",
                class: ["btn", "btn-export"],
                draggable: true,
                dataset: {
                    "context": "model",
                    "action": "export",
                }
            }, "Export");

            fragment.appendChild(this.btnExport);
        }

        if (!isHTMLElement(this.btnImport)) {
            this.btnImport = createButton({
                id: "btnImportModel",
                class: ["btn", "btn-import"],
                draggable: true,
                dataset: {
                    "context": "model",
                    "action": "import"
                }
            }, "Import");

            fragment.appendChild(this.btnImport);
        }

        if (!isHTMLElement(this.btnBuild) && this.metamodel.schema["@editor"].build) {
            this.btnBuild = createButton({
                id: "btnBuildModel",
                class: ["btn", "btn-build"],
                draggable: true,
                dataset: {
                    "context": "model",
                    "action": "build"
                }
            }, "Build");

            fragment.appendChild(this.btnBuild);
        }

        if (!isHTMLElement(this.input)) {
            this.input = createInput({
                type: "file",
                class: ["hidden"],
                accept: '.json'
            });

            fragment.appendChild(this.input);
        }


        if (fragment.hasChildNodes) {
            this.container.appendChild(fragment);
        }

        if (isHTMLElement(container)) {
            // container.appendChild(projection.render());
            container.appendChild(this.container);
        }

        // TODO: Add support for saved projection
        // TODO  HINT: Add getProjection to Model (lookup passed value, saved model)

        const projectionSchema = this.metamodel.getProjectionSchema(this.concept.name);
        var projection = ProjectionManager.createProjection(this.concept.schema.projection, this.concept, this).init();

        this.clear().append(projection.render());

        this.bindEvents();

        this.refresh();

        return this.container;
    },
    refresh() {
        const { language } = this.metamodel;

        /** @type {HTMLElement} */
        let modelSelectorContent = createSpan({
            class: ["editor-selector-model-content"]
        }, language);

        removeChildren(this.modelSelector).appendChild(modelSelectorContent);


        /** @type {HTMLElement} */
        let conceptSelectorContent = createUnorderedList({
            class: ["bare-list", "selector-concepts", "font-ui"]
        });
        conceptSelectorContent.appendChild(conceptSelectorHandler(this.concept, this.activeConcept));

        conceptSelectorContent.addEventListener('click', (event) => {
            // console.log("SHOW LIST OF CONCEPT");
        });

        removeChildren(this.conceptSelector).appendChild(conceptSelectorContent);

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
        }

        this.activeElement = element;

        this.activeElement.classList.add('active');

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

        const valueHander = {
            metamodel: metamodelOptionHandler,
            model: modelOptionHandler,
        };

        /**
         * @this {Loader}
         */
        function metamodelOptionHandler() {
            let event = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
            });

            this.input.dispatchEvent(event);
        }

        /**
         * @this {Loader}
         */
        function modelOptionHandler() {
            let event = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
            });
            // loaderCb = this.loader.loadModel;
            this.input.dispatchEvent(event);
        }

        this.container.addEventListener('click', (event) => {
            var target = event.target;
            var object = target.dataset['object'];

            if (target.dataset.action === "close") {
                this.close();
            }
        });

        this.body.addEventListener('dblclick', (event) => {
            // TODO: Give element main focus    
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
                        let projection = ProjectionManager.getProjection(id);
                        projection.changeView();
                    }
                    rememberKey = true;
                    break;
                case Key.enter:
                    if (this.activeField) {
                        this.activeField.enterHandler(target);
                    }
                    event.preventDefault();

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
                        let builder = this.manager.getBuilder();
                        builder.init(this.metamodel, this.model, this.activeConcept).open();

                        event.preventDefault();
                    }
                    break;
                case 'e':
                    if (lastKey === Key.ctrl) {
                        let explorer = this.manager.getExplorer();
                        explorer.init(this.metamodel, this.model, this.activeConcept).open();

                        event.preventDefault();
                    }
                    break;
                case 'i':
                    if (lastKey === Key.ctrl) {
                        let editor = this.manager.getEditor();
                        editor.init(this.metamodel, this.model, this.activeConcept).open();

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

            if (lastKey == event.key) lastKey = -1;

            switch (event.key) {
                case Key.spacebar:
                    if (lastKey == Key.ctrl) {
                        if (this.activeField) {
                            this.activeField.spaceHandler(target);
                        }
                    }
                    break;
                case Key.delete:
                    if (lastKey == Key.ctrl) {
                        if (this.activeField) {
                            this.activeField.delete(target);
                        }
                    }
                    break;
                case Key.alt:

                    break;
                default:
                    break;
            }
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

        this.btnImport.addEventListener('click', (event) => {
            const { target } = event;
            let handler = valueHander['metamodel'];
            handler.call(this);
        });

        this.input.addEventListener('change', (event) => {
            var file = this.input.files[0];

            if (!file.name.endsWith('.json')) {
                this.notify("This file is not supported. Please use a .gen file");
            }

            var reader = new FileReader();
            // reader.onload = (e) => this.loader.loadMetaModel(JSON.parse(reader.result));
            reader.onload = (e) => this.loader.loadMetaModel({
                "directory": {
                    "nature": "concrete",
                    "attribute": {
                        "subscribers": {
                            "target": "set",
                            "accept": "subscriber",
                            "required": true,
                            "projection": [
                                {
                                    "type": "field",
                                    "view": "table",
                                    "orientation": "column",
                                    "header": [
                                        {
                                            "projection": [
                                                {
                                                    "layout": {
                                                        "type": "wrap",
                                                        "style": {
                                                            "box": {
                                                                "space": {
                                                                    "inner": {
                                                                        "top": 2,
                                                                        "right": 5,
                                                                        "left": 5,
                                                                        "bottom": 2
                                                                    }
                                                                }
                                                            }
                                                        },
                                                        "disposition": [
                                                            "Name"
                                                        ]
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            "projection": [
                                                {
                                                    "layout": {
                                                        "type": "wrap",
                                                        "style": {
                                                            "box": {
                                                                "space": {
                                                                    "inner": {
                                                                        "top": 2,
                                                                        "right": 5,
                                                                        "left": 5,
                                                                        "bottom": 2
                                                                    }
                                                                }
                                                            }
                                                        },
                                                        "disposition": [
                                                            "Phone number"
                                                        ]
                                                    }
                                                }
                                            ]
                                        },
                                    ],
                                    "body": [
                                        "#name",
                                        "#phone",
                                    ]
                                }
                            ]
                        }
                    },
                    "component": {},
                    "projection": [
                        {
                            "layout": {
                                "type": "stack",
                                "orientation": "vertical",
                                "disposition": [
                                    "List of subscribers",
                                    "#subscribers"
                                ]
                            }
                        }
                    ]
                },
                "subscriber": {
                    "nature": "concrete",
                    "attribute": {
                        "name": {
                            "target": "string",
                            "alias": "Full name"
                        },
                        "phone": {
                            "target": "string",
                            "alias": "Phone number"
                        }
                    },
                    "component": {},
                    "projection": [{
                        "layout": {
                            "type": "stack",
                            "orientation": "horizontally",
                            "disposition": [
                                "#name",
                                "#phone"
                            ]
                        }
                    }]
                },
                "@root": "directory",
                "@config": {
                    "language": "Phone Book",
                    "settings": {
                        "autosave": true
                    }
                }
            });
            reader.readAsText(file);
        });

        this.btnExport.addEventListener('click', (event) => {
            copytoClipboard(this.model.export());
            this.notify("Export has been copied to clipboard");
        });

        if (this.btnBuild) {
            this.btnBuild.addEventListener('click', (event) => {
                this.build();
            });
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
        const { name, alias, object, refname, reftype } = concept;

        const typeHandler = {
            "root": `${valOrDefault(alias, name)}`,
            "parent": `${valOrDefault(alias, name)}`,
            "ancestor": `${valOrDefault(alias, name)}`,
            "active": `${valOrDefault(refname, name)}`,
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

        if (activeParent.object === "component") {
            parent = activeParent.getParent();

            parentItem = createSelectorItem("parent", parent);

            let componentItem = createDiv({
                class: ["selector-concept__component", "source"]
            }, `${valOrDefault(activeParent.alias, activeParent.name)}`);

            parentItem.appendChild(componentItem);
        } else {
            parentItem = createSelectorItem("parent", activeParent, true);
        }

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