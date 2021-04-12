import { createDiv, getElements, isNullOrWhitespace, isString, isFunction, valOrDefault, isHTMLElement, isNullOrUndefined, getElement, isIterable } from "zenkai";
import { Explorer, Editor } from './environment/index.js';


const ENV_EDITOR = "editor";
const ENV_EXPLORER = "explorer";

const environments = [];

var inc = 0;
const nextId = () => `GE${inc++}`;

export const Manager = {
    get editors() { return environments.filter(env => env.type === ENV_EDITOR); },
    get explorers() { return environments.filter(env => env.type === ENV_EXPLORER); },
    get hasEditor() { return environments.some(env => env.type === ENV_EDITOR); },
    get hasExplorer() { return environments.some(env => env.type === ENV_EXPLORER); },

    /**
     * Initiliazes the manager
     * @param {string|HTMLElement} _container
     * @returns {Manager}
     */
    init() {
        const containers = getContainers();

        containers.forEach(container => {
            let env = valOrDefault(container.dataset["gentleman"], ENV_EDITOR);

            switch (env) {
                case ENV_EDITOR:
                    this.createEditor(container);
                    break;

                case ENV_EXPLORER:
                    this.createExplorer(container);
                    break;

                default:
                    console.warn(`Gentleman does not support env ${env}`);
                    break;
            }
        });

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
     * Gets an `Editor` matching the selector
     * @param {string|HTMLElement} selector
     * @param {HTMLElement|DocumentFragment} [_container] Container queried
     * @returns {Editor}
     */
    getEditor(selector, _container) {
        if (!(isHTMLElement(selector) || isIterable(selector))) {
            return null;
        }

        if (isHTMLElement(selector)) {
            return environments.find(env => env.container === selector);
        }

        if (selector.startsWith("GE")) {
            return environments.find(env => env.id === selector);
        }

        return this.getEditor(getElement(selector, _container));
    },
    /**
     * Creates a new `Editor`
     * @param {HTMLElement} [_container]
     * @returns {Editor}
     */
    createEditor(_container) {
        let init = createInit(ENV_EDITOR);

        let editor = Object.create(Editor, Object.assign(init, {
            manager: { value: this },
            container: { value: resolveContainer.call(init, _container) },
        }));

        environments.push(editor);

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
     * @param {HTMLElement} [_container]
     * @returns {Explorer}
     */
    createExplorer(_container) {
        let init = createInit(ENV_EXPLORER);

        let explorer = Object.create(Explorer, Object.assign(init, {
            manager: { value: this },
            container: { value: resolveContainer.call(init, _container) },
        }));

        environments.push(explorer);

        return explorer;
    }
};

/**
 * Creates init params
 * @param {string} type 
 * @returns 
 */
function createInit(type) {
    return {
        object: { value: "environment" },
        type: { value: type },
        name: { value: type },
        id: { value: nextId() }
    };
}

/**
 * Resolves the container
 * @param {string} selector 
 * @returns {HTMLElement[]}
 */
function getContainers(selector) {
    if (!isNullOrWhitespace(selector)) {
        return getElements(selector);
    }

    return getElements("[data-gentleman]");
}

/** Creates a container
 * @param {string} type
 * @returns {HTMLElement}
 */
function resolveContainer(_container) {
    /** @type {HTMLElement} */
    let container = _container;

    if (!isHTMLElement(_container)) {
        container = createDiv({
            tabindex: -1
        });
    }

    container.classList.add(`gentleman-${this.type.value}`);
    container.dataset["gentleman"] = this.type.value;
    container.dataset["gentlemanId"] = this.id.value;

    return container;
}