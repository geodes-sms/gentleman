import {
    cloneObject, isEmpty, getElement, getElements, createLink, createDiv,
    appendChildren, createParagraph, insertAfterElement,
    preprendChild, removeChildren, findAncestor, isHTMLElement,
    createUnorderedList, createListItem, createStrong, createButton, copytoClipboard,
    isNullOrWhitespace, createInput, createInputAs, createLabel, isNullOrUndefined
} from 'zenkai';
import { Key } from '@global/enums.js';
import { events, hide, show } from '@utils/index.js';
import { MetaModel, Model } from '@model/index.js';
import { State } from './state.js';


const windowheight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

const EditorMode = {
    READ: 'read',
    EDIT: 'edit'
};

function getContainer(container) {
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

        instance.container = getContainer(container);
        if (!isHTMLElement(instance.container)) {
            throw new Error("Container not found. Gentleman editor could not be created.");
        }

        instance.container.tabIndex = -1;
        instance.body = createDiv({ class: 'body' });
        instance.body.tabIndex = 0;
        instance.fields = [];
        instance.state = State.create();

        return instance;
    },

    /** @type {state} */
    state: null,
    /** @type {Field[]} */
    fields: null,
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
    /** @type {HTMLElement} */
    focusedElement: null,
    /** @type {HTMLElement} */
    activeElement: null,
    /** @type {Concept} */
    activeConcept: null,
    /** @type {HTMLElement} */
    activeConceptContainer: null,
    /** @type {HTMLButtonElement} */
    btnExport: null,
    /** @type {HTMLButtonElement} */
    btnImport: null,
    currentContext: null,

    init(metamodel, model) {
        if (metamodel) {
            this.loadMetamodel(metamodel);
        } else {
            // TODO - Add the following functionnality:
            // Get Metamodel from Model
            //   else Prompt the user to give the corresponding metamodel
        }

        if (model) {
            this.loadModel(model);
        } else {
            try {
                this.model = this.metamodel.createModel().init(model, this);
            } catch (error) {
                this.container.appendChild(createParagraph({ class: 'body', text: error.toString() }));
                return;
            }
        }


        // set the initial state
        this.state.init(this.model.schema);
        events.emit('editor.state.initialized');

        this.btnExport = createButton({
            id: "btnExportModel",
            class: "btn btn-export",
            draggable: true,
            data: {
                "context": "model",
                "action": "export",
            }
        }, "Export");

        this.btnImport = createLabel({
            id: "btnImportModel",
            class: "btn btn-import",
            draggable: true,
            data: { "context": "model", "action": "import" }
        }, ["Import", createInputAs("file", { class: "hidden", accept: '.json' })]);

        this.activeConceptContainer = createDiv({ class: "active-concept-container hidden" });
        appendChildren(this.container, [this.btnExport, this.btnImport, this.activeConceptContainer]);
        preprendChild(this.container, this.body);

        this.render();

        this.bindEvents();
    },
    loadMetamodel(metamodel) {
        this.metamodel = MetaModel.create(metamodel);

        var resources = this.metamodel.resources;

        // add stylesheets
        if (!isEmpty(resources)) {
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
        field.id = this.fields.length + 1;
        field.editor = this;
        this.fields.push(field);
    },
    resize() {
        var self = this;

        // TODO: adapt UI to smaller screen
    },
    undo() {
        this.state.undo();
        this.setState(cloneObject(this.state.current));
        events.emit('editor.undo', this.state.hasUndo);
    },
    redo() {
        this.state.redo();
        this.setState(cloneObject(this.state.current));
        events.emit('editor.redo', this.state.hasRedo);
    },
    save() {
        this.state.set(this.concrete);
        events.emit('editor.save');

        return this;
    },
    clear() {
        this.fields = [];
        this.focusedElement = null;
        this.activeElement = null;
        this.activeConcept = null;
        removeChildren(this.body);
        
        events.emit('editor.clear');

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

    render(container) {
        if (isHTMLElement(container)) {
            container.appendChild(this.model.render());

            return container;
        }

        this.clear();

        this.body.appendChild(this.model.render());
        this.activeElement = this.body;

        if (!isHTMLElement(this.infoContainer)) {
            this.infoContainer = createDiv({ class: 'info-container font-ui hidden' });
            this.container.appendChild(this.infoContainer);
        }

        if (!isHTMLElement(this.actionContainer)) {
            this.actionContainer = createDiv({ class: 'action-container hidden' });
            this.container.appendChild(this.actionContainer);
        }

        return this;
    },
    bindEvents() {
        var lastKey = null;
        const self = this;

        this.body.addEventListener('dblclick', (event) => {
            console.log(`give this element (${event.target.name || event.target.id}) main focus`);
        });

        this.body.addEventListener('click', (event) => {
            var target = event.target;
            var nature = target.dataset['nature'];
        }, false);

        this.container.addEventListener('keydown', (event) => {
            var target = event.target;
            var field = this.fields[target.id - 1];
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
                    // target.blur(); // remove focus
                    event.preventDefault();

                    break;
                case Key.right_arrow:
                    if (this.focusedElement.hasElementFocus) {

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
                    console.log("esc");
                    this.focusedElement.focus();

                    break;
                case Key.tab:

                    break;
                case 'g':
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

        this.container.addEventListener('keyup', (event) => {
            var target = event.target;
            var parent = target.parentElement;
            var field = this.fields[target.id - 1];

            if (lastKey == event.key) lastKey = -1;

            switch (event.key) {
                case Key.spacebar:
                    if (lastKey == Key.ctrl) {
                        field.next();
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
                                    { class: 'bare-list suggestion-list' },
                                    optionalAttributes.map(item => createListItem({ class: "suggestion", data: { attr: item } }, item))
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

        this.body.addEventListener('mouseover', (event) => {
            var target = event.target;
            var nature = target.dataset['nature'];
            if (nature === 'attribute') {
                var field = this.fields[target.id - 1];
                // infoHandler.call(this, field, target);
            }
            if (target.classList.contains('component')) {
                target.classList.add('component--on_mouseover');
            }
        });

        this.body.addEventListener('mouseout', (event) => {
            var target = event.target;

            if (target.classList.contains('component')) {
                target.classList.remove('component--on_mouseover');
            }
        });

        this.activeConceptContainer.addEventListener('click', function (e) {
            const target = e.target;
            const { id, object, name } = this.dataset;
            var concept = null;
            if (object === "concept") {
                concept = self.model.concepts.find((concept) => concept.id === id);
            } else if (object === "component") {
                let parentConcept = concept = self.model.concepts.find((concept) => concept.id === id);
                concept = parentConcept.getComponent(name);
            } else {
                return;
            }

            if (target.tagName === 'BUTTON') {
                let { action } = target.dataset;
                switch (action) {
                    case "option":
                        var data = concept.getOptionalAttributes();
                        var input = getElement(".option-input", this);
                        if (!isHTMLElement(input)) {
                            input = createInput({ class: "option-input", placeholder: "Attribut recherché" });
                            this.appendChild(input);
                        }
                        var results = getElement(".option-results", this);
                        if (!isHTMLElement(results)) {
                            results = createUnorderedList({ class: "bare-list option-results" });
                            this.appendChild(results);
                        }
                        removeChildren(results);
                        data.forEach(attr => {
                            results.appendChild(createListItem({ class: "option-result", data: { value: attr } }, attr));
                        });
                        results.addEventListener('click', (e) => {
                            let target = e.target;
                            if (target.dataset.value) {
                                let attr = concept.createAttribute(e.target.dataset.value);
                                let temp = getElement(`[data-id=${attr.name}]`, concept.container);
                                if (temp) {
                                    temp.replaceWith(attr.render());
                                    temp.remove();
                                    target.remove();
                                } else {
                                    self.notify("This attribute cannot be rendered");
                                }
                            }
                        });
                        input.addEventListener('input', function (e) {
                            if (isNullOrWhitespace(this.value)) {
                                removeChildren(results);
                                data.forEach(attr => {
                                    results.appendChild(createListItem({ class: "option-result", data: { value: attr } }, attr));
                                });
                            } else {
                                let query = this.value.trim().split(' ');
                                let filteredData = data.filter(val => query.some(q => val.includes(q)));
                                removeChildren(results);
                                filteredData.forEach(attr => {
                                    results.appendChild(createListItem({ class: "option-result", data: { value: attr } }, attr));
                                });
                            }
                        });

                        input.focus();
                        break;
                    case "compo":
                        data = concept.getOptionalComponents();
                        input = getElement(".option-input", this);
                        if (!isHTMLElement(input)) {
                            input = createInput({ class: "option-input", placeholder: "Component recherché" });
                            this.appendChild(input);
                        }
                        results = getElement(".option-results", this);
                        if (!isHTMLElement(results)) {
                            results = createUnorderedList({ class: "bare-list option-results" });
                            this.appendChild(results);
                        }
                        removeChildren(results);
                        data.forEach(attr => {
                            results.appendChild(createListItem({ class: "option-result", data: { value: attr } }, attr));
                        });
                        results.addEventListener('click', (e) => {
                            let target = e.target;
                            if (target.dataset.value) {
                                let attr = concept.createComponent(e.target.dataset.value);
                                let temp = getElement(`[data-id=${attr.name}]`, concept.container);
                                if (temp) {
                                    temp.replaceWith(attr.render());
                                    temp.remove();
                                    target.remove();
                                } else {
                                    self.notify("This attribute cannot be rendered");
                                }
                            }
                        });
                        input.addEventListener('input', function (e) {
                            if (isNullOrWhitespace(this.value)) {
                                removeChildren(results);
                                data.forEach(attr => {
                                    results.appendChild(createListItem({ class: "option-result", data: { value: attr } }, attr));
                                });
                            } else {
                                let query = this.value.trim().split(' ');
                                let filteredData = data.filter(val => query.some(q => val.includes(q)));
                                removeChildren(results);
                                filteredData.forEach(attr => {
                                    results.appendChild(createListItem({ class: "option-result", data: { value: attr } }, attr));
                                });
                            }
                        });

                        input.focus();
                        break;

                    case "projection":

                        break;

                    default:
                        break;
                }
            }
        });

        this.body.addEventListener('focusin', (event) => {
            var target = event.target;
            var nature = target.dataset['nature'];

            if (nature === 'attribute') {
                let field = this.fields[target.id - 1];
                this.focusedElement = field;
                field.focusIn();

                // update active element
                let fieldParent = findAncestor(target, (el) => el.dataset['nature'] === 'field');
                if (isHTMLElement(fieldParent) && fieldParent.dataset.type === "set") {
                    this.activeElement = fieldParent;
                    this.activeElement.classList.add('active');
                }

                // update active concept
                let conceptParent = field.concept.getConceptParent();
                if (conceptParent) {
                    this.activeConcept = conceptParent;
                    let { fullName } = this.activeConcept;
                    removeChildren(this.activeConceptContainer);
                    let conceptName = createParagraph({ class: "active-concept-name" }, `${fullName}`);
                    this.activeConceptContainer.dataset['id'] = this.activeConcept.id || this.activeConcept.parentId;
                    this.activeConceptContainer.dataset['object'] = this.activeConcept.object;
                    this.activeConceptContainer.dataset['name'] = this.activeConcept.name;
                    this.activeConceptContainer.appendChild(conceptName);
                    this.activeConceptContainer.appendChild(createDiv({ class: "active-concept-action" }, [
                        createButton({ class: "btn btn-concept btn-concept-options", data: { action: "option" } }, "Attributes"),
                        // createButton({ class: "btn btn-concept btn-concept-options", data: { action: "compo" } }, "Components"),
                        createButton({ class: "btn btn-concept btn-concept-projections", data: { action: "projection" } }, "Projections"),
                    ]));
                    show(this.activeConceptContainer);
                }
            } else if (target.parentElement.classList.contains('field--list')) {
                this.activeElement = target.parentElement;
                this.activeElement.classList.add('active');
            }

            // events.emit('editor.change', field);
        }, false);

        this.body.addEventListener('focusout', (event) => {
            var target = event.target;
            var nature = target.dataset['nature'];

            if (nature === 'attribute') {
                let field = this.fields[target.id - 1];
                this.focusedElement = field;
                field.focusOut();
            }

            this.focusedElement = null;


            if (this.activeElement) {
                this.activeElement.classList.remove('active');
            }
        }, false);

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

        this.btnExport.addEventListener('dragstart', function (e) {
            e.dataTransfer.setData("text/plain", e.target.innerText);
            e.dataTransfer.setData("text/html", e.target.outerHTML);
            e.dataTransfer.setData("text/uri-list", e.target.ownerDocument.location.href);
        });

        this.btnExport.addEventListener('dragend', function (e) {
            this.style.right = `${windowWidth - e.clientX}px`;
            this.style.bottom = `${windowheight - e.clientY}px`;
        });

        events.on('model.change', (from) => {
            this.save();
        });

        function infoHandler(field, target) {
            var info = field.getInfo();
            removeChildren(this.infoContainer);
            this.infoContainer.appendChild(
                createUnorderedList({ class: 'bare-list' }, [
                    createListItem({ class: 'info-type' }, [
                        createStrong(null, "type"), `: ${info.type}`]),
                    createListItem({ class: 'info-value' }, [
                        createStrong(null, "length"), `: ${info.value}`])
                ]));
            insertAfterElement(target, this.infoContainer);
            Object.assign(this.infoContainer.style, {
                left: `${target.offsetLeft}px`
            });
            show(this.infoContainer);
        }

        mql.addListener(handleWidthChange);

        function handleWidthChange(mql) {
            self.resize();
        }
    }
};