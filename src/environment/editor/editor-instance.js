import {
    createDocFragment, createDiv, createH3, createButton, createHeader,
    removeChildren, isHTMLElement, valOrDefault, isNullOrWhitespace, isNullOrUndefined, createParagraph, no,
} from 'zenkai';
import { show, hide, toggle, collapse, expand, NotificationType, makeResizable } from '@utils/index.js';


var inc = 0;
const nextInstanceId = () => `instance${inc++}`;

export const EditorInstanceManager = {
    /**
     * Creates a concept instance
     * @param {string} name 
     */
    createInstance($concept, _projection, _options) {
        if (isNullOrUndefined($concept)) {
            this.notify(`The concept is not valid`, NotificationType.ERROR);
            return false;
        }

        let concept = $concept.type === "concept" ? $concept : this.createConcept($concept);

        let projection = _projection;
        if (isNullOrUndefined(projection) && this.hasProjectionModel) {
            projection = this.createProjection(concept).init();
        }

        let instance = Object.create(EditorInstance, {
            id: { value: nextInstanceId() },
            object: { value: "environment" },
            name: { value: "editor-instance" },
            type: { value: "instance" },
            concept: { value: concept },
            projection: { value: projection, writable: true },
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

        this.addInstance(instance);

        return instance;
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
        }

        this.instances.set(instance.id, instance);

        if (this.status.view === "tab") {
            this.status.addView(instance);
        }

        this.updateActiveInstance(instance);
        this.refresh();

        return this;
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

        if (instance.view) {
            removeChildren(instance.view).remove();
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
    }
};

export const EditorInstance = {
    window: null,
    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    title: null,
    /** @type {boolean} */
    visible: true,

    /** @type {HTMLElement} */
    menu: null,
    /** @type {HTMLElement} */
    header: null,
    /** @type {HTMLElement} */
    body: null,
    /** @type {HTMLButtonElement} */
    btnCollapse: null,
    /** @type {HTMLButtonElement} */
    btnMaximize: null,
    /** @type {HTMLButtonElement} */
    btnClose: null,
    /** @type {number} */
    size: 1,
    /** @type {boolean} */
    fullscreen: false,
    /** @type {boolean} */
    collapsed: false,
    /** @type {*} */
    schema: null,
    /** @type {string} */
    ctype: null,

    get isRendered() { return isHTMLElement(this.container); },

    init(args = {}) {
        this.ctype = valOrDefault(args.type, "concept");
        this.schema = args;

        return this;
    },
    collapse() {
        collapse(this.container);
        this.collapsed = true;
        this.fullscreen = false;
        this.size = "normal";

        this.refresh();

        return this;
    },
    expand() {
        expand(this.container);
        this.collapsed = false;

        this.refresh();

        return this;
    },
    changeSize(size) {
        this.size = size;

        if (size === "fullscreen") {
            this.fullscreen = true;
            this.container.style.removeProperty("width");
            this.container.style.removeProperty("height");
        } else {
            this.fullscreen = false;
        }

        this.refresh();
    },
    show() {
        show(this.container);
        this.visible = true;

        return this;
    },
    hide() {
        hide(this.container);
        this.visible = false;

        return this;
    },
    toggle() {
        toggle(this.container);
        this.visible = !this.visible;

        return this;
    },
    refresh() {
        this.container.dataset.size = `${this.size}`;

        if (isNullOrUndefined(this.projection)) {
            this.body.textContent = `No projection found`;
        }

        let instances = Array.from(this.editor.instances);
        if (instances.some(instance => instance.fullscreen)) {
            this.editor.instanceSection.classList.add("fullscreen");
        } else {
            this.editor.instanceSection.classList.remove("fullscreen");
        }

        return this;
    },
    render() {
        const fragment = createDocFragment();

        const { name } = this.concept;

        const _name = name.toLowerCase();

        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["editor-concept", `editor-concept--${this.ctype}`],
                tabindex: 0,
                dataset: {
                    nature: "concept-container",
                    type: this.ctype,
                    size: 1,
                }
            });
        }

        if (!isHTMLElement(this.header)) {
            this.header = createHeader({
                title: this.schema.type === "concept" ? `Instance of "${_name}"` : `Linked instance of "${_name}"`,
                class: ["editor-concept-header"],
            });

            fragment.append(this.header);
        }

        if (!isHTMLElement(this.btnClose)) {
            this.btnClose = createButton({
                class: ["btn", "editor-concept-toolbar__btn-delete"],
                title: `Delete the instance "${_name}"`,
                dataset: {
                    action: `close`,
                    context: this.type,
                    id: this.id
                }
            });

            if (this.schema.type === "projection") {
                this.btnClose.title = `Close the linked instance "${_name}"`;
            }
        }

        if (!isHTMLElement(this.btnCollapse)) {
            this.btnCollapse = createButton({
                class: ["btn", "editor-concept-toolbar__btn-collapse"],
                title: `Collapse ${name.toLowerCase()}`,
                dataset: {
                    action: `collapse`,
                    context: this.type,
                    id: this.id
                }
            });
        }

        if (!isHTMLElement(this.btnMaximize)) {
            this.btnMaximize = createButton({
                class: ["btn", "editor-concept-toolbar__btn-maximize"],
                title: `Maximize ${name.toLowerCase()}`,
                dataset: {
                    action: `maximize`,
                    context: this.type,
                    id: this.id
                }
            });
        }

        this.title = createH3({
            class: ["title", "editor-concept-title", "fit-content"],
            // editable: true,
            dataset: {
                nature: "editable",
                id: this.id,
            }
        }, name);

        let toolbar = createDiv({
            class: ["editor-concept-toolbar"],
        }, [this.btnCollapse, this.btnMaximize, this.btnClose]);

        removeChildren(this.header).append(this.title, toolbar);

        if (this.body) {
            this.body.remove();
        }

        if (this.projection) {
            this.body = this.projection.render();
        } else {
            this.body = createParagraph();
        }

        fragment.append(this.body);

        if (fragment.hasChildNodes()) {
            this.container.appendChild(fragment);
            this.bindEvents();
        }

        makeResizable(this.container);

        this.refresh();

        return this.container;
    },



    actionHandler(name) {
        switch (name) {
            case "collapse":
                this.collapsed ? this.expand() : this.collapse();
                break;
            case "maximize":
                this.fullscreen ? this.changeSize("normal") : this.changeSize("fullscreen");
                break;
            case "close":
                this.delete();
                break;

            default:
                break;
        }
    },

    delete() {
        switch (this.schema.close) {
            case "DELETE-CONCEPT":
                if (!this.concept.delete(true)) {
                    this.editor.notify("The concept could not be deleted", NotificationType.ERROR);
                    return this;
                }
                break;
            case "DELETE-PROJECTION":
                if (this.projection && !this.projection.delete()) {
                    this.notify("The projection could not be deleted", NotificationType.ERROR);
                    return this;
                }
                break;

            default:
                break;
        }

        removeChildren(this.container).remove();

        this.editor.removeInstance(this.id);

        if (this.window) {
            this.window.removeInstance(this);
        }
    },

    bindEvents() {
        this.container.addEventListener('focusin', (event) => {
            this.editor.updateActiveInstance(this);
        });

        this.header.addEventListener("focusout", (event) => {
            if (isNullOrWhitespace(this.title.textContent)) {
                this.title.textContent = this.concept.name;
            }
        });
    }
};