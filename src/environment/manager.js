import {
    createSpan, createDiv, createParagraph, createButton,
    getElement, isHTMLElement, isNullOrWhitespace, isNullOrUndefined,
} from "zenkai";
import { Builder, Editor } from './index.js';
import { Explorer } from "./explorer.js";


const METAMODEL_GENTLEMAN = require('@samples/gentleman.json');
const METAMODEL_RELIS = require('@samples/relis.json');

const builders = [];
const editors = [];
const explorers = [];

var inc = 0;
const nextId = () => `GE${inc++}`;

export const Manager = {
    /** @type {HTMLElement} */
    container: null,

    init(container) {
        var result = resolveContainer(container);

        if (!isHTMLElement(result)) {
            throw new TypeError("Bad argument: The container argument could not be resolved to an HTML Element.");
        }

        this.container = result;
        this.container.tabIndex = -1;

        this.bindEvents();

        return this;
    },
    home() {
        /** @type {HTMLButtonElement} */
        const btnCreateMetaModel = createButton({
            type: "button",
            class: ["btn", "btn-home", "btn-create-metamodel"]
        }, "DESIGN");
        /** @type {HTMLButtonElement} */
        const btnCreateModel = createButton({
            type: "button",
            class: ["btn", "btn-home", "btn-create-model"]
        }, "MODEL");
        /** @type {HTMLButtonElement} */
        const homeContent = createParagraph({
            class: ["home-content"]
        }, [
            createSpan({
                class: ["home-content-title", "font-gentleman"]
            }, "Gentleman")
        ]);
        /** @type {HTMLElement} */
        const homeContainer = createDiv({
            class: ["home-container"]
        }, [
            homeContent,
            btnCreateMetaModel,
            createSpan({
                class: ["btn-home__help"]
            }, "Create a new Gentleman Model"),
            btnCreateModel,
            createSpan({
                class: ["btn-home__help"]
            }, "Create a new Model instance"),
        ]);

        homeContainer.addEventListener('click', (event) => {
            const target = event.target;

            if (target === btnCreateMetaModel) {
                let editor = this.createEditor();
                editor.init(METAMODEL_GENTLEMAN);
            }
            if (target === btnCreateModel) {
                this.init(METAMODEL_RELIS);
            }
        });

        this.container.appendChild(homeContainer);
    },
    /** @returns {Editor} */
    getEditor(id) {
        var editor = getEnvironment.call({ environments: editors }, id, () => this.createEditor());

        return editor;
    },
    /**
     * Creates a new Builder
     * @returns {Editor}
     */
    createEditor() {
        var editor = Object.create(Editor, {
            object: { value: "environment" },
            name: { value: "editor" },
            type: { value: "editor" },
            id: { value: nextId() },
            manager: { value: this },
            container: { value: createContainer("editor") },
        });
        this.container.appendChild(editor.container);

        editors.push(editor);

        return editor;
    },
    /** @returns {Builder} */
    getBuilder(id) {
        var builder = getEnvironment.call({ environments: builders }, id, () => this.createBuilder());

        return builder;
    },
    /**
     * Creates a new Builder
     * @returns {Builder}
     */
    createBuilder() {
        var builder = Object.create(Builder, {
            object: { value: "environment" },
            name: { value: "builder" },
            type: { value: "builder" },
            id: { value: nextId() },
            manager: { value: this },
            container: { value: createContainer("builder") },
        });
        this.container.appendChild(builder.container);

        builders.push(builder);

        return builder;
    },
    /** @returns {Explorer} */
    getExplorer(id) {
        var explorer = getEnvironment.call({ environments: explorers }, id, () => this.createExplorer());

        return explorer;
    },
    /**
     * Creates a new Builder
     * @returns {Explorer}
     */
    createExplorer() {
        var explorer = Object.create(Explorer, {
            object: { value: "environment" },
            name: { value: "explorer" },
            type: { value: "explorer" },
            id: { value: nextId() },
            manager: { value: this },
            container: { value: createContainer("explorer") },
        });
        this.container.appendChild(explorer.container);

        explorers.push(explorer);

        return explorer;
    },
    bindEvents() {

    }
};

/**
 * Gets or creates an environment if not found
 * @param {*[]} lkpList Lookup List
 * @param {Function} createEnvCb Create Environment callback
 * @returns {Environment}
 */
function getEnvironment(id, createEnvCb) {
    if (id) {
        return this.environments.find((env) => env.id === id);
    }

    var environment = this.environments.find((env) => !env.active);

    if (isNullOrUndefined(environment)) {
        environment = createEnvCb();
    }

    return environment;
}

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