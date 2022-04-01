import {
    createDocFragment, createDiv, createH3, createButton, createParagraph, removeChildren,
    isHTMLElement, valOrDefault, isNullOrWhitespace, isNullOrUndefined,
} from 'zenkai';
import { show, hide, toggle, NotificationType, } from '@utils/index.js';


var inc = 0;
const nextInstanceId = () => `instance${inc++}`;

export const EditorGroupManager = {
    /**
     * Creates a concept instance
     * @param {string} name 
     */
    createGroup(instances) {
        let group = Object.create(EditorGroup, {
            id: { value: nextInstanceId() },
            object: { value: "environment" },
            name: { value: "editor-group" },
            type: { value: "group" },
            editor: { value: this }
        });

        group.init(instances);

        return this.addGroup(group);
    },
    /**
     * Gets an instance in the editor
     * @param {string} id 
     * @returns {EditorInstance}
     */
    getGroup(id) {
        return this.instances.get(id);
    },
    /**
     * Adds instance to editor
     * @param {EditorInstance} instance 
     * @returns {HTMLElement}
     */
    addGroup(instance) {
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
    removeGroup(id) {
        let instance = this.getGroup(id);

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
    moveGroup(item, index) {
        this.instanceSection.children[index].before(item);

        return this;
    },
    swapGroup(item1, item2) {
        let instances = Array.from(this.instanceSection.children);
        const index1 = instances.indexOf(item1);
        const index2 = instances.indexOf(item2);

        this.moveGroup(item2, index1);
        this.moveGroup(item1, index2);

        return this;
    }
};

export const EditorGroup = {
    /** @type {HTMLElement} */
    container: null,
    /** @type {HTMLElement} */
    title: null,
    /** @type {boolean} */
    visible: true,
    /** @type {boolean} */
    isOpen: true,

    /** @type {HTMLElement} */
    body: null,
    /** @type {HTMLButtonElement} */
    btnClose: null,
    /** @type {*} */
    schema: null,

    get isRendered() { return isHTMLElement(this.container); },

    init(args = {}) {
        this.ctype = valOrDefault(args.type, "concept");
        this.schema = args;

        return this;
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
    open() {
        this.container.classList.add("open");
        this.show();
        this.isOpen = true;

        return this;
    },
    close() {
        this.container.classList.remove("open");
        this.isOpen = false;

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

        if (this.fullscreen) {
            this.btnCollapse.disabled = true;
        } else {
            this.btnCollapse.disabled = false;
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
                title: this.schema.type === "concept" ? `Instance of "${_name}"` : `Linked instance of "${_name}"`,
                dataset: {
                    nature: "concept-container",
                    type: this.ctype,
                    size: 1,
                }
            });
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

        this.title = createH3({
            class: ["title", "editor-concept-title", "fit-content"],
            editable: true,
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

        this.refresh();

        return this.container;
    },



    actionHandler(name) {
        switch (name) {
            case "close":
                this.delete();
                break;

            default:
                break;
        }
    },

    delete() {
        removeChildren(this.container).remove();

        this.editor.removeInstance(this.id);
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