import {
    createLink, createDiv, createInput, createLabel,
    createUnorderedList, createListItem, createParagraph, createButton,
    getElement, getElements, appendChildren, preprendChild,
    removeChildren, findAncestor, copytoClipboard, isHTMLElement, cloneObject,
    isEmpty, isNullOrWhitespace, isNullOrUndefined, isNull, windowHeight, windowWidth, createDocFragment
} from 'zenkai';
import { Events, hide, show, Key } from '@utils/index.js';
import { MetaModel, Model } from '@model/index.js';
import { State } from './state.js';
import { ExplorerManager } from './explorer.js';
import { Projection } from '@projection/index.js';

const EditorMode = {
    READ: 'read',
    EDIT: 'edit'
};

/**
 * Resolves the container
 * @param {HTMLElement|string} container 
 * @returns {HTMLElement}
 */
function resolveContainer(container) {
    if (isHTMLElement(container)) {
        return container;
    } else if (!isNullOrWhitespace(container)) {
        return getElement(container);
    }

    return getElement("[data-gentleman-editor]");
}

// Allow responsive design
var mql = window.matchMedia('(max-width: 800px)');

export const Editor = {
    /**
     * Creates an instance of Editor
     * @param {HTMLElement|string} container 
     * @returns {Editor}
     */
    create(container) {
        const instance = Object.create(this);

        instance.container = resolveContainer(container);
        if (!isHTMLElement(instance.container)) {
            throw new TypeError("Bad argument: The container argument could not be resolved to an HTML Element.");
        }

        instance.container.tabIndex = -1;
        instance.body = createDiv({ class: 'editor-body', tabindex: 0 });
        instance.container.appendChild(instance.body);
        instance.fields = new Map();
        instance.state = State.create();

        return instance;
    },

    /** @type {string} */
    workflow: null,
    /** @type {MetaModel} */
    metamodel: null,
    /** @type {Model} */
    model: null,
    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    body: null,
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
    /** @type {HTMLAnchorElement} */
    btnPrint: null,

    init(metamodel, model) {
        if (metamodel) {
            this.loadMetamodel(metamodel);
        } else {
            // TODO - Add the following functionnality:
            // Get Metamodel from Model
            //   else Prompt the user to give the corresponding metamodel
        }

        try {
            this.model = this.metamodel.createModel().init(model);
        } catch (error) {
            this.display(error.toString());
            return;
        }

        // set the initial state
        this.state.init(this.model.schema);
        Events.emit('editor.state.initialized');

        this.render();

        this.bindEvents();
    },

    loadMetamodel(metamodel) {
        this.metamodel = MetaModel.create(metamodel);

        const { resources } = this.metamodel;

        // add stylesheets
        if (Array.isArray(resources)) {
            let dir = '../assets/css/';

            // remove existing (previous) custom stylesheets
            let links = getElements('.gentleman-css');
            for (let i = 0; i < links.length; i++) {
                links.item(i).remove();
            }
            resources.forEach(function (name) {
                document.head.appendChild(createLink.stylesheet(dir + name, { class: 'gentleman-css' }));
            });
        }
    },
    loadModel(model) {
        if (isNullOrUndefined(this.metamodel)) {
            this.display("The metamodel has not been created.");
            return;
        }

        try {
            this.model = this.metamodel.createModel().init(model, this);
        } catch (error) {
            this.display(error.toString());
            return;
        }

        return this;
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
    resize() {
        // TODO: adapt UI to smaller screen
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
    clear() {
        this.fields.clear();
        this.activeField = null;
        this.activeElement = null;
        this.activeConcept = null;
        removeChildren(this.body);

        Events.emit('editor.clear');

        return this;
    },
    notify(message, type) {
        var notify = getElement('.notify:not(.open)', this.container);
        if (!isHTMLElement(notify)) {
            notify = createParagraph({ class: "notify" });
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
            dialog = createDiv({ class: "dialog-container" });
            this.container.appendChild(dialog);
        }
        removeChildren(dialog);
        dialog.appendChild(createParagraph({
            class: "dialog-content"
        }, message));
        dialog.classList.add('open');
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

    render(container) {
        // TODO: Add support for saved projection
        // TODO  HINT: Add getProjection to Model (lookup passed value, saved model)
        const projectionSchema = this.metamodel.getProjectionSchema(this.model.root.name);
        var projection = Projection.create(projectionSchema, this.model.root, this);

        if (isHTMLElement(container)) {
            container.appendChild(projection.render());

            return container;
        }

        var fragment = createDocFragment();

        if (!isHTMLElement(this.infoContainer)) {
            this.infoContainer = createDiv({
                class: ["info-container", "hidden"]
            });
            fragment.appendChild(this.infoContainer);
        }

        if (!isHTMLElement(this.actionContainer)) {
            this.actionContainer = createDiv({
                class: ["action-container", "hidden"]
            });
            fragment.appendChild(this.actionContainer);
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
            this.btnImport = createLabel({
                id: "btnImportModel",
                class: ["btn", "btn-import", "hidden"],
                draggable: true,
                dataset: {
                    "context": "model",
                    "action": "import"
                }
            }, ["Import", createInput({ type: "file", class: "hidden", accept: '.json' })]);

            fragment.appendChild(this.btnImport);
        }

        this.container.appendChild(fragment);

        this.clear().body.appendChild(projection.render());

        return this;
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

        return this;
    },
    bindEvents() {
        var lastKey = null;

        this.body.addEventListener('click', (event) => {
            var target = event.target;
            var object = target.dataset['object'];
            if (isNull(this.activeField) && ['concept', 'component'].includes(object)) {
                this.updateActiveElement(target);
            }
        });

        this.body.addEventListener('dblclick', (event) => {
            console.log(`GIVE THIS ELEMENT (${event.target.name || event.target.id}) MAIN FOCUS`);
        });

        this.body.addEventListener('keydown', (event) => {
            var target = event.target;

            var field = this.getField(target);
            var rememberKey = false;

            switch (event.key) {
                case Key.backspace:
                    break;
                case Key.ctrl:
                    event.preventDefault();
                    rememberKey = true;
                    break;
                case Key.delete:
                    break;
                case Key.alt:
                    rememberKey = true;
                    break;
                case Key.enter:
                    if(this.activeField) {
                        console.log("ENRE");
                        this.activeField.focusOut();
                    }
                    event.preventDefault();

                    break;
                case Key.right_arrow:
                    if (this.activeField.hasElementFocus) {

                        // // get field element
                        // /** @type {HTMLElement} */
                        // let element = this.focusedElement.element;
                        // // lookup near brother
                        // let nextElement = element.nextElementSibling;
                        // console.log(nextElement);
                        // while (nextElement && nextElement.dataset['nature'] !== "attribute") {
                        //     nextElement = nextElement.nextElementSibling;
                        // }
                        // // focus on brother
                        // if (nextElement.dataset['nature'] === "attribute") {
                        //     let field = this.fields[nextElement.id - 1];
                        //     this.focusedElement = field;
                        //     field.focus();
                        // }
                    }
                    break;
                case Key.escape:
                    rememberKey = false;
                    if (field) {
                        field.escapeHandler();
                    } else {
                        this.activeField.focus();
                    }

                    break;
                case Key.tab:

                    break;
                case 'g':
                case 'e':
                    if (lastKey === Key.ctrl) {
                        let explorer = ExplorerManager.getExplorer();
                        explorer.init(this.activeConcept)   // eslint-disable-next-line indent
                            .bind(this)                     // eslint-disable-next-line indent
                            .open();

                        event.preventDefault();
                    }
                    break;
                case "y":
                case "q":
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
            var parent = target.parentElement;
            const { nature } = target.dataset;
            var field = this.getField(target);

            if (lastKey == event.key) lastKey = -1;

            switch (event.key) {
                case Key.spacebar:
                    if (lastKey == Key.ctrl) {
                        if (field) {
                            field.spaceHandler();
                        }
                    }
                    break;
                case Key.delete: // Delete the field->attribute
                    if (lastKey == Key.ctrl) {
                        if (field) {
                            field.delete();
                        }
                    }
                    break;
                case Key.alt:

                    break;
                case 'q': // Query the parent concept/component
                    if (lastKey == Key.ctrl) {
                        if (field) {
                            let parentConcept = field.getParentConcept();
                            let optionalAttributes = parentConcept.getOptionalAttributes();
                            let parentContainer = null;
                            if (parentConcept.object === 'component') {
                                parentContainer = findAncestor(target, (el) => el.classList.contains('component'), 5);
                            } else {
                                parentContainer = findAncestor(target, (el) => el.classList.contains('concept-container'), 5);
                            }
                            parentContainer.classList.add('query');

                            // Create query container
                            let queryContainer = getElement('.query-container', parentContainer);
                            if (!isHTMLElement(queryContainer)) {
                                queryContainer = createDiv({ class: 'query-container' });
                            }

                            // Create query content
                            let queryContent = null;
                            if (isEmpty(optionalAttributes)) {
                                queryContent = createParagraph({ class: 'query-content' }, `No suggestion for this ${parentConcept.object}`);
                            } else {
                                queryContent = createUnorderedList(
                                    { class: ["bare-list", "suggestion-list"] },
                                    optionalAttributes.map(item => createListItem({ class: "suggestion", dataset: { attr: item } }, item))
                                );
                            }
                            queryContainer.appendChild(queryContent);

                            // Bind events
                            queryContainer.addEventListener('click', function (event) {
                                target = event.target;
                                if (target.classList.contains('suggestion')) {
                                    parentConcept.createAttribute(target.dataset['attr']);
                                    parentConcept.rerender();
                                }
                                hide(this);
                                parentContainer.classList.remove('query');
                                field.focus();
                            });
                            queryContainer.addEventListener('keydown', function (event) {
                                target = event.target;
                                switch (event.key) {
                                    case Key.escape:
                                        hide(this);
                                        parentContainer.classList.remove('query');
                                        field.focus();
                                        break;
                                    default:
                                        break;
                                }
                            });
                            parentContainer.appendChild(queryContainer);
                            queryContainer.tabIndex = 0;
                            queryContainer.focus();
                        }
                    }

                    break;
                case 'g':
                    // show actions
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
                    this.activeField = null;
                }
            }
        });

        const focusinHandler = {
            'field': focusinField
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

            // update active element (projection)
            let parentProjection = this.activeField.projection.parent;
            if (parentProjection) {
                this.updateActiveElement(parentProjection.container);
            }

            // update active concept
            let conceptParent = this.activeField.concept.getConceptParent();
            if (conceptParent) {
                this.updateActiveConcept(conceptParent);
            }
        }

        this.btnExport.addEventListener('click', (event) => {
            copytoClipboard(this.model.export());
            this.notify("Model has been copied to clipboard");
        });

        this.btnImport.addEventListener('change', (event) => {
            var uploadInput = event.target;
            var file = uploadInput.files[0];
            var reader = new FileReader();
            if (!file.name.endsWith('.json')) {
                this.notify("File not supported!");
            }

            reader.onload = (e) => this.loadModel(JSON.parse(reader.result)).render();
            reader.readAsText(file);
        });

        this.btnExport.addEventListener('dragstart', (event) => {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("clientX", event.clientX);
            event.dataTransfer.setData("clientY", event.clientY);
            this.body.classList.add("dragging");
            // event.dataTransfer.setData("text/plain", event.target.innerText);
            // event.dataTransfer.setData("text/html", event.target.outerHTML);
            // event.dataTransfer.setData("text/uri-list", event.target.ownerDocument.location.href);
        });

        this.btnExport.addEventListener('dragend', (event) => {
            this.body.classList.remove("dragging");
        });

        this.body.addEventListener('drop', (event) => {
            var prevClientX = event.dataTransfer.getData("clientX");
            var prevClientY = event.dataTransfer.getData("clientY");

            this.btnExport.style.top = `${this.btnExport.offsetTop - (prevClientY - event.clientY)}px`;
            this.btnExport.style.left = `${this.btnExport.offsetLeft - (prevClientX - event.clientX)}px`;
        });

        this.body.addEventListener('dragover', (event) => {
            event.preventDefault();
        });

        Events.on('model.change', (from) => {
            this.save();
        });

        const handleWidthChange = (mql) => this.resize(mql);

        mql.addListener(handleWidthChange);
    }
};