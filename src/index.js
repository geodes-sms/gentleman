import { createDiv, getElements, isNullOrWhitespace, valOrDefault, isHTMLElement, getElement, isString } from "zenkai";
import { Editor } from './environment/index.js';

const ENV_EDITOR = "editor";
const ENV_EXPLORER = "explorer";

/**
 * Initiliazes the manager
 * @param {string|HTMLElement} _container
 * @returns {Manager}
 */
export function activateEditor(container) {
    const containers = getContainers();

    const editors = [];

    containers.forEach(container => {
        let env = valOrDefault(container.dataset["gentleman"], ENV_EDITOR);

        switch (env) {
            case ENV_EDITOR:
                editors.push(createEditor(container));
                break;

            default:
                console.warn(`Gentleman does not support env ${env}`);
                break;
        }
    });

    return editors;
}

/**
 * Creates a new `Editor`
 * @param {HTMLElement} [_container]
 * @returns {Editor}
 */
export function createEditor(_container) {
    let container = resolveContainer(_container);

    if (!isHTMLElement(_container)) {
        container = createDiv({
            tabindex: -1
        });
    }

    container.classList.add(`gentleman-${ENV_EDITOR}`);
    container.dataset["gentleman"] = ENV_EDITOR;

    let editor = Object.create(Editor, {
        object: { value: "environment" },
        type: { value: ENV_EDITOR },
        name: { value: `gentleman ${ENV_EDITOR}` },
        container: { value: container },
    });

    return editor;
}

/**
 * Resolves the container
 * @param {string} selector 
 * @param {HTMLElement} [_container] 
 * @returns {HTMLElement[]}
 */
function getContainers(selector, _container) {
    if (!isNullOrWhitespace(selector)) {
        return getElements(selector, _container);
    }

    return getElements("[data-gentleman]", _container);
}

/** Creates a container
 * @param {string|HTMLElement} container
 * @returns {HTMLElement}
 */
function resolveContainer(container) {
    if (isHTMLElement(container)) {
        return container;
    } else if (isString(container) && !isNullOrWhitespace(container)) {
        return getElement(container);
    }

    return null;
}