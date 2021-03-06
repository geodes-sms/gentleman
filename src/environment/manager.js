import {
    createDocFragment, createDiv, createButton, getElement, isHTMLElement,
    isNullOrWhitespace, isNullOrUndefined, isString, isFunction, isEmpty,
} from "zenkai";
import { Explorer, Editor } from './index.js';


const ENV_EDITOR = "editor";
const ENV_EXPLORER = "explorer";

const environments = [];

var inc = 0;
const nextId = () => `GE${inc++}`;

export const Manager = {
    /** @type {HTMLElement} */
    container: null,
    /** @type {string} */
    containerEnv: null,
    /** @type {HTMLElement} */
    menu: null,
    /** @type {HTMLButtonElement} */
    btnStyle: null,

    get editors() { return environments.filter(env => env.type === ENV_EDITOR); },
    get explorers() { return environments.filter(env => env.type === ENV_EXPLORER); },
    get hasEnvironment() { return !isEmpty(environments); },
    get hasEditor() { return environments.some(env => env.type === ENV_EDITOR); },
    get hasExplorer() { return environments.some(env => env.type === ENV_EXPLORER); },

    /**
     * Initiliazes the manager
     * @param {string|HTMLElement} _container
     * @returns {Manager}
     */
    init(args = {}) {
        const container = resolveContainer(args.container);

        if (!isHTMLElement(container)) {
            throw new TypeError("Bad argument: The container argument could not be resolved to an HTML Element.");
        }

        this.container = container;
        this.container.tabIndex = -1;
        this.containerEnv = this.container.dataset["gentleman"];

        if (this.containerEnv === "editor") {
            this.createEditor().init(args.editor);
        }

        this.bindDOM();
        this.bindEvents();

        this.render();

        return this;
    },
    render() {
        const fragment = createDocFragment();

        if (fragment.hasChildNodes()) {
            this.container.append(fragment);
        }

        this.refresh();

        return this.container;
    },
    refresh() {
        if (!this.hasEnvironment) {
            this.createEditor().init();

            return this;
        }

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

        return editors.filter(env => !env.active);
    },
    /**
     * Gets an `Editor`
     * @param {string} id
     * @returns {Editor}
     */
    getEditor(id) {
        if (id) {
            return environments(env => env.id === id);
        }

        return this.editors[0];
    },
    /**
     * Creates a new `Editor`
     * @returns {Editor}
     */
    createEditor() {
        var editor = Object.create(Editor, {
            object: { value: "environment" },
            type: { value: "editor" },
            name: { value: "editor" },
            id: { value: nextId() },
            manager: { value: this },
            container: { value: createContainer("editor") },
        });

        this.container.append(editor.container);

        environments.push(editor);

        this.refresh();

        return editor;
    },
    deleteEditor(id) {
        var index = -1;

        if (isString(id)) {
            index = environments.findIndex(p => p.id === id);
        } else {
            index = environments.indexOf(id);
        }

        if (index === -1) {
            return false;
        }

        environments.splice(index, 1);

        this.refresh();

        return true;
    },

    /**
     * Gets an explorer
     * @param {string} id
     * @returns {Explorer}
     */
    getExplorer(id) {
        if (id) {
            return environments(env => env.id === id);
        }

        return this.explorers.find(env => !env.active);
    },
    /**
     * Creates a new `Explorer`
     * @returns {Explorer}
     */
    createExplorer() {
        const explorer = Object.create(Explorer, {
            object: { value: "environment" },
            type: { value: "explorer" },
            name: { value: "explorer" },
            id: { value: nextId() },
            manager: { value: this },
            container: { value: createContainer("explorer") },
        });

        this.container.append(explorer.container);

        environments.push(explorer);

        this.refresh();

        return explorer;
    },

    bindDOM() {
        if (!isHTMLElement(this.menu)) {
            this.menu = createDiv({
                class: ["manager-menu"]
            });
        }

        if (!isHTMLElement(this.btnStyle)) {
            this.btnStyle = createButton({
                id: "btnStyleEditor",
                class: ["btn", "manager__button", "manager__btn-style"]
            }, "Style");
        }
    },

    bindEvents() {
    }
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

    return getElement("[data-gentleman]");
}

/** Creates a container
 * @param {string} type
 * @returns {HTMLElement}
 */
function createContainer(type) {
    return createDiv({
        class: ["env", `${type}-container`],
        tabindex: -1
    });
}