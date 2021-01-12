import {
    createDocFragment, createDiv, createParagraph, createButton, getElement, 
    isHTMLElement, isNullOrWhitespace, isNullOrUndefined, isString, isFunction, isEmpty,
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
    /** @type {HTMLElement} */
    homeContainer: null,
    /** @type {HTMLElement} */
    menu: null,
    /** @type {HTMLElement} */
    homePage: null,
    /** @type {HTMLButtonElement} */
    btnBuild: null,
    /** @type {HTMLButtonElement} */
    btnNew: null,
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
    init(_container) {
        const container = resolveContainer(_container);

        if (!isHTMLElement(container)) {
            throw new TypeError("Bad argument: The container argument could not be resolved to an HTML Element.");
        }

        this.container = container;
        this.container.tabIndex = -1;

        this.bindDOM();
        this.bindEvents();

        return this;
    },
    render() {
        const fragment = createDocFragment();

        if (isNullOrUndefined(this.menu.parentElement)) {
            fragment.append(this.menu);
        }

        if (isNullOrUndefined(this.btnBuild.parentElement)) {
            this.menu.append(this.btnNew, this.btnBuild, this.btnStyle);
        }

        if (fragment.hasChildNodes()) {
            this.container.appendChild(fragment);
        }

        this.refresh();

        return this.container;
    },
    refresh() {
        if (!this.hasEnvironment) {
            this.createEditor().init().open();

            return this;
        }

        let conceptEditor = false;
        let projectionEditor = false;

        for (let i = 0; i < this.editors.length; i++) {
            const editor = this.editors[i];
            if (editor.buildTarget === "gentleman_concept") {
                conceptEditor = true;
            }
            if (editor.buildTarget === "gentleman_projection") {
                projectionEditor = true;
            }
        }

        this.btnBuild.disabled = !(conceptEditor && projectionEditor);

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

        return this.editors.find(env => !env.active);
    },

    /**
     * Creates a new `Editor`
     * @returns {Editor}
     */
    createEditor(model) {
        var editor = Object.create(Editor, {
            object: { value: "environment" },
            type: { value: "editor" },
            name: { value: "editor" },
            id: { value: nextId() },
            manager: { value: this },
            model: { value: model },
            container: { value: createContainer("editor") },
        });
        
        this.container.appendChild(editor.container);

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
        
        this.container.appendChild(explorer.container);

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

        if (!isHTMLElement(this.btnBuild)) {
            this.btnBuild = createButton({
                id: "btnBuildModel",
                class: ["btn", "manager__button", "manager__btn-build"]
            }, "Build");

        }

        if (!isHTMLElement(this.btnNew)) {
            this.btnNew = createButton({
                id: "btnNewEditor",
                class: ["btn", "manager__button", "manager__btn-new"]
            }, "New");
        }

        if (!isHTMLElement(this.btnStyle)) {
            this.btnStyle = createButton({
                id: "btnStyleEditor",
                class: ["btn", "manager__button", "manager__btn-style", "hidden"]
            }, "Style");
        }
    },

    bindEvents() {
        this.menu.addEventListener("click", (event) => {
            const { target } = event;
            if (target === this.btnNew) {
                this.createEditor().init().open();
            }
        });

        this.btnBuild.addEventListener('click', (event) => {
            var json = [];

            for (let i = 0; i < this.editors.length; i++) {
                const editor = this.editors[i];

                if (editor.buildTarget === "gentleman_concept") {
                    json.push(editor.build());
                }

                if (editor.buildTarget === "gentleman_projection") {
                    json.push(editor.build());
                }
            }

            const [concept, projection] = json; console.log(concept, projection);

            this.createEditor("gentleman_concept").init(concept, projection).open();
        });

        this.btnStyle.addEventListener('click', (event) => {
            console.log("change style");
        });
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
 * @returns {HTMLElement}
 */
function createContainer(type) {
    return createDiv({
        class: ["env", `${type}-container`, "close"],
        tabindex: -1
    });
}