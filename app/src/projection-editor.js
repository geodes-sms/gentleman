import {
    createLabel, createParagraph, createUnorderedList, createListItem, createSpan,
    createDocFragment, isHTMLElement, isNullOrUndefined, createDiv, createInput,
} from "zenkai";
import { hide, show, NotificationType, Primitive } from "@utils/index.js";
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
        this.model = schema;

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
        if (isNullOrUndefined(this.selectedConcept)) {
            this.editor.header.hide("body");
        } else {
            this.editor.header.show("body");
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

            if (cname === "projection") {
                let _concept = instance.concept.getAttribute("concept").getTarget();
                let _name = _concept.getAttribute("name").getTarget();
                _name.setValue(this.selectedConcept.getName());
            }

            this.selectedConcept.addInstance(instance);
        });
    }
};
