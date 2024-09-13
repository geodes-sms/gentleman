import {
    createLabel, createParagraph, createUnorderedList, createListItem, createSpan,
    createDocFragment, isHTMLElement, isNullOrUndefined, createDiv, createInput, valOrDefault, isEmpty, getElement, removeChildren, createI, createButton,
} from "zenkai";
import { hide, show, NotificationType, Primitive } from "@utils/index.js";
import { buildConceptHandler } from "@generator/index.js";
import { getAttr, getValue, hasValue } from "@generator/utils.js";
import { ModelConcept } from "./model-concept.js";


// const TEST__CONCEPT = require('@models/todo-model/concept.json');

var conceptId = 0;
const getConceptId = () => conceptId++;

/**
 * Verifies if a concept's name is a primitive name
 * @param {string} name 
 * @returns {boolean}
 */
const isPrimitive = (name) => Primitive.list().includes(name.toLowerCase());

const getVal = (concept, attr, defValue) => hasValue(concept, attr) ? getValue(concept, attr) : defValue;

export const ConceptEditor = {
    container: null,
    editor: null,

    init(editor) {
        this.editor = editor;

        this.aside = Object.create(ConceptAside).init(null, editor);

        this.editor.attach(this);

        return this;
    },
    show() {
        show(this.container);
    },
    hide() {
        hide(this.container);
    },

    render() {
        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["app-editor"]
            });
        }

        this.container.append(this.aside.render());
        this.container.append(this.editor.container);
        // this.aside.addModel(TEST__CONCEPT);

        return this.container;
    },
    refresh() {

    },
    bindEvents() {

    }
};

export const ProjectionEditor = {
    container: null,
    editor: null,

    init(editor) {
        this.editor = editor;

        this.aside = Object.create(ProjectionAside).init(null, editor);

        this.editor.attach(this);

        return this;
    },
    show() {
        show(this.container);
    },
    hide() {
        hide(this.container);
    },

    render() {
        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["app-editor"]
            });
        }

        this.container.append(this.aside.render());
        this.container.append(this.editor.container);
        // this.aside.addModel(TEST__CONCEPT);

        return this.container;
    },
    refresh() {

    },
    bindEvents() {

    }
};

export const GraphicalEditor = {
    container: null,
    editor: null,

    init(editor) {
        this.editor = editor;

        this.aside = Object.create(ProjectionAside).init(null, editor);

        this.editor.attach(this);

        return this;
    },
    show() {
        show(this.container);
    },
    hide() {
        hide(this.container);
    },

    render() {
        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["app-editor"]
            });
        }

        this.container.append(this.aside.render());
        this.container.append(this.editor.container);
        // this.aside.addModel(TEST__CONCEPT);

        return this.container;
    },
    refresh() {

    },
    bindEvents() {

    }
};


const ProjectionAside = {
    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    header: null,
    /** @type {HTMLElement} */
    body: null,
    /** @type {HTMLElement} */
    nav: null,
    /** @type {HTMLElement} */
    model: null,
    /** @type {HTMLElement} */
    userConceptSection: null,
    /** @type {HTMLElement} */
    primitiveConceptSection: null,
    /** @type {Editor} */
    editor: null,
    /** @type {HTMLElement} */
    uploader: null,
    /** @type {HTMLButtonElement} */
    btnModel: null,
    /** @type {ModelConcept[]} */
    concepts: null,
    /** @type {ModelConcept} */
    selectedConcept: null,
    /** @type {Map<string,HTMLElement>} */
    tabs: null,
    /** @type {ModelConcept} */
    selectedNav: null,

    init(model, editor) {
        this.model = model;
        this.editor = editor;
        this.tabs = new Map();
        this.concepts = [];

        return this;
    },
    show() {
        show(this.container);
    },
    hide() {
        hide(this.container);
    },
    addModel(schema) {
        this.model = JSON.parse(schema);

        console.log(this.model);
        this.model.concept.forEach(c => {
            let concept = this.createConcept(c).init(c);
            this.concepts.push(concept);

            this.userConceptSection.append(createDiv({
                class: ["app-concept"]
            }, concept.render()));
        });

        Primitive.list().forEach(prim => {
            let concept = this.createConcept(prim).init({
                nature: "primitive",
                name: prim
            });
            this.concepts.push(concept);

            this.primitiveConceptSection.append(createDiv({
                class: ["app-concept"]
            }, concept.render()));
        });

        this.refresh();
    },
    createConcept(name) {
        return Object.create(ModelConcept, {
            parent: { value: this },
            id: { value: getConceptId() },
            editor: { value: this.editor, writable: true },
        });
    },
    clear() {
        this.concepts.forEach(concept => {
            concept.destroy();
        });
        this.concepts = [];
    },
    findConcept(query) {
        if (isNullOrUndefined(query)) {
            return null;
        }

        if (query.parent === this) {
            return query;
        }

        if (isPrimitive(query)) {
            this.notify(`'${query}' is a primitive.`, NotificationType.NORMAL);
            return null;
        }

        return this.concepts.find(c => c.getName() === query);
    },
    selectConcept(_concept) {
        if (isNullOrUndefined(_concept)) {
            return false;
        }

        let concept = this.findConcept(_concept);

        if (isNullOrUndefined(concept)) {
            return false;
        }

        if (this.selectedConcept === concept) {
            return false;
        }

        if (this.selectedConcept) {
            this.selectedConcept.unselect();
        }

        this.selectedConcept = concept;
        this.selectedConcept.select();

        this.refresh();

        return true;
    },
    removeModel() {

    },
    selectTab(key) {
        if (isNullOrUndefined(key)) {
            return false;
        }

        if (this.selectedNav === key) {
            return false;
        }

        if (this.selectedNav) {
            const { tab, window } = this.tabs.get(this.selectedNav);
            tab.classList.remove("selected");
            hide(window);
        }

        const { tab, window } = this.tabs.get(key);

        tab.classList.add("selected");
        this.selectedNav = key;

        show(window);
    },
    update() {

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

        this.header.append(notify);

        setTimeout(() => {
            notify.classList.add(CSS_OPEN);
        }, 50);

        setTimeout(() => {
            notify.classList.remove(CSS_OPEN);
            setTimeout(() => { notify.remove(); }, 500);
        }, time);
    },
    refresh() {
        // if (isNullOrUndefined(this.selectedConcept)) {
        //     this.editor.header.hide("body");
        // } else {
        //     this.editor.header.show("body");
        // }
    },

    render() {
        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["app-editor-aside"]
            });
        }

        const fragment = createDocFragment();

        if (!isHTMLElement(this.header)) {
            this.header = createDiv({
                class: ["app-editor-aside-header"]
            });
            fragment.append(this.header);
        }

        if (!isHTMLElement(this.input)) {
            this.uploader = createLabel({
                class: ["app-uploader"]
            }, [createInput({
                type: "file",
                class: ["app-uploader-input", "hidden"],
                accept: '.json,.jsoncp'
            }), createSpan({
                class: ["app-uploader-label"]
            }, "Upload concepts")]);

            this.header.append(this.uploader);
        }

        if (!isHTMLElement(this.body)) {
            this.body = createDiv({
                class: ["app-editor-aside-body"]
            });

            fragment.append(this.body);
        }

        if (!isHTMLElement(this.nav)) {
            this.nav = createUnorderedList({
                class: ["bare-list", "app-editor-aside-nav"]
            });

            ["User-defined", "Primitive"].forEach(type => {
                this.nav.append(createListItem({
                    class: ["app-editor-aside-nav-item"],
                    dataset: {
                        "type": "nav",
                        "name": type.toLowerCase()
                    }
                }, type));
            });

            this.body.append(this.nav);
        }

        this.userConceptSection = createDiv({
            class: ["app-editor-aside-body-userconcept", "hidden"]
        });

        this.primitiveConceptSection = createDiv({
            class: ["app-editor-aside-body-primitiveconcept", "hidden"]
        });

        this.tabs.set("user-defined", { tab: this.nav.children[0], window: this.userConceptSection });
        this.tabs.set("primitive", { tab: this.nav.children[1], window: this.primitiveConceptSection });

        this.body.append(this.userConceptSection, this.primitiveConceptSection);

        if (isNullOrUndefined(this.selectedNav)) {
            this.selectTab("user-defined");
        }

        if (fragment.hasChildNodes()) {
            this.container.append(fragment);

            this.bindEvents();
        }

        this.refresh();

        return this.container;
    },
    bindEvents() {
        this.uploader.addEventListener('change', (event) => {
            let file = event.target.files[0];

            let reader = new FileReader();
            reader.onload = (event) => {

                const schema = JSON.parse(reader.result);
                this.addModel(schema);
            };

            reader.readAsText(file);
        });

        this.container.addEventListener("click", (event) => {
            const { target } = event;

            const { type, name } = target.dataset;

            if (type === "nav") {
                this.selectTab(name);
            }
        });

        this.editor.actions.set("create-instance", (element) => {
            const { concept: cname } = element.dataset;

            let concept = this.editor.createConcept(cname); console.log(this.selectedConcept.tag);
            let projection = this.editor.createProjection(concept, this.selectedConcept.tag);
            let instance = this.editor.createInstance(concept, projection);

            if (cname === "projection" || cname === "general" || cname === "graphical") {
                let _concept = instance.concept.getAttribute("concept").getTarget();
                let _name = _concept.getAttribute("name").getTarget();
                _name.setValue(this.selectedConcept.getName());
            }

            this.selectedConcept.addInstance(instance);
        });

        this.editor.actions.set("extract-instance", (element) => {
            const cname = element;

            let concept = this.editor.createConcept(cname); console.log(this.selectedConcept.tag);
            let projection = this.editor.createProjection(concept, this.selectedConcept.tag);
            let instance = this.editor.createInstance(concept, projection);

            if (cname === "projection" || cname === "general" || cname === "graphical") {
                let _concept = instance.concept.getAttribute("concept").getTarget();
                let _name = _concept.getAttribute("name").getTarget();
                _name.setValue(this.selectedConcept.getName());
            }

            this.selectedConcept.addInstance(instance);

            return concept.getAttributeByName("element").target.getValue(true);
        });
    }
};


const ConceptAside = {
    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    header: null,
    /** @type {HTMLElement} */
    body: null,
    /** @type {HTMLElement} */
    model: null,
    /** @type {HTMLElement} */
    placeholder: null,
    /** @type {Editor} */
    editor: null,
    /** @type {HTMLElement} */
    uploader: null,
    /** @type {HTMLButtonElement} */
    btnModel: null,
    /** @type {HTMLButtonElement} */
    btnBuild: null,
    /** @type {Map<string,HTMLElement>} */
    concepts: null,
    /** @type {ModelConcept} */
    selectedConcept: null,

    init(model, editor) {
        this.model = model;
        this.editor = editor;
        this.concepts = new Map();

        return this;
    },
    show() {
        show(this.container);
    },
    hide() {
        hide(this.container);
    },
    addModelConcept(concept) {
        const { id, schema } = concept;
        const nature = concept.getProperty("nature");

        let container = createDiv({
            class: ["outline-concept"],
            dataset: {
                id: id,
                nature: nature
            }
        });

        let header = createDiv({
            class: ["outline-concept-header"]
        });

        let ico = createI({
            class: ["outline-concept-nature", `outline-concept-nature--${nature}`],
            title: nature,
            dataset: {
                name: nature,
            }
        }, nature[0]);

        let name = createSpan({
            class: ["outline-concept-name"],
        }, `Undefined ${nature}`);

        header.append(ico, name);

        let attrs = createUnorderedList({
            class: ["bare-list", "outline-concept-attrs"],
        });

        container.append(header, attrs);

        concept.register(this);
        concept.watch("value.changed", (value, self) => {
            this.updateModelConcept(concept);
        });

        this.concepts.set(id, container);

        this.body.append(container);

        this.refresh();
    },
    removeModelConcept(id) {
        if (!this.concepts.has(id)) {
            console.error("Concept not found");
            return;
        }

        let element = this.concepts.get(id);
        removeChildren(element).remove();

        this.refresh();

        return this;
    },
    updateModelConcept(concept) {
        let container = this.concepts.get(concept.id);

        let name = getElement('.outline-concept-name', container);
        let attrs = getElement('.outline-concept-attrs', container);

        name.textContent = getVal(concept, "name", "Undefined");
        removeChildren(attrs);

        getValue(concept, "attributes").forEach((attribute) => {
            let attr = createListItem({
                class: ["outline-concept-attr"],
            });

            let name = createSpan({
                class: ["outline-concept-name"],
            }, `${getVal(attribute, "name", "Undefined")}`);

            attr.append(name);

            if (hasValue(attribute, "target")) {
                let target = getAttr(attribute, "target").target;

                let targetElement = renderTarget(target);

                attr.append(targetElement);
            }

            attrs.append(attr);
        });
    },
    clear() {
        this.concepts.forEach(concept => {
            concept.destroy();
        });
        this.concepts = [];
    },
    findConcept(query) {
        if (isNullOrUndefined(query)) {
            return null;
        }

        if (query.parent === this) {
            return query;
        }

        if (isPrimitive(query)) {
            this.notify(`'${query}' is a primitive.`, NotificationType.NORMAL);
            return null;
        }

        return this.concepts.find(c => c.getName() === query);
    },
    selectConcept(_concept) {
        if (isNullOrUndefined(_concept)) {
            return false;
        }

        let concept = this.findConcept(_concept);

        if (isNullOrUndefined(concept)) {
            return false;
        }

        if (this.selectedConcept === concept) {
            return false;
        }

        if (this.selectedConcept) {
            this.selectedConcept.unselect();
        }

        this.selectedConcept = concept;
        this.selectedConcept.select();

        this.refresh();

        return true;
    },
    update(message, value, from) {
        if (message === "delete") {
            this.removeModelConcept(from.id);
        }
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

        this.header.append(notify);

        setTimeout(() => {
            notify.classList.add(CSS_OPEN);
        }, 50);

        setTimeout(() => {
            notify.classList.remove(CSS_OPEN);
            setTimeout(() => { notify.remove(); }, 500);
        }, time);
    },
    refresh() {
        if (isEmpty(this.concepts)) {
            show(this.placeholder);
        } else {
            hide(this.placeholder);
        }
    },

    render() {
        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["app-editor-aside"]
            });
        }

        const fragment = createDocFragment();

        if (!isHTMLElement(this.header)) {
            this.header = createDiv({
                class: ["app-editor-aside-header"]
            });
            fragment.append(this.header);
        }

        if (!isHTMLElement(this.input)) {
            let title = createSpan({
                class: ["app-editor-aside-title"]
            }, "Model");

            this.header.append(title);
        }

        if (!isHTMLElement(this.btnBuild)) {
            this.btnBuild = createButton({
                class: ["btn", "app-editor-header__button"],
                dataset: {
                    name: "button-build",
                    action: "build-concept",
                }
            }, "Build");

            this.header.append(this.btnBuild);
        }

        if (!isHTMLElement(this.body)) {
            this.body = createDiv({
                class: ["app-editor-aside-body"]
            });

            fragment.append(this.body);
        }

        if (!isHTMLElement(this.placeholder)) {
            this.placeholder = createParagraph({
                class: ["empty-text"],
                text: "No concept declared yet."
            });

            this.body.append(this.placeholder);
        }

        if (fragment.hasChildNodes()) {
            this.container.append(fragment);

            this.bindEvents();
        }

        this.refresh();

        return this.container;
    },
    bindEvents() {

        this.editor.actions.set("create-instance", (element) => {        
            const { concept: cname } = element.dataset;

            let concept = this.editor.createConcept(cname);
            let projection = this.editor.createProjection(concept);
            let instance = this.editor.createInstance(concept, projection);

            this.addModelConcept(concept);
        });

        this.btnBuild.addEventListener('click', (event) => {
            buildConceptHandler.call(this.editor);
        });
    }
};

function renderTarget(target) {
    let prop = `${target.getProperty("cname")}`;

    if (prop === "concept") {
        return createSpan({
            class: ["outline-concept-type"],
        }, `${getVal(target, "concept", "Undefined")}`);
    }

    return createSpan({
        class: ["outline-concept-type"],
    }, `${prop}`);
}