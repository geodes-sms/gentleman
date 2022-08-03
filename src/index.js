import { createDiv, getElements, valOrDefault, isHTMLElement, hasOwn } from "zenkai";
import { Editor } from './editor/index.js';
import { resolveContainer } from './utils/index.js';

const ENV_EDITOR = "editor";

const isValid = (element) => isHTMLElement(element) && hasOwn(element.dataset, 'gentleman');

const isEditor = (element) => isValid(element); // TODO - add this: && element.dataset.gentleman === "editor"

/**
 * Activates the `editor` found in the container (optional)
 * @param {string|HTMLElement} [_container]
 * @returns {Editor[]} Editors found in the container
 */
export function activateEditor(_container) {
    const container = resolveContainer(_container);
    const containers = isEditor(container) ? [container] : getElements(`[data-gentleman="${ENV_EDITOR}"]`, container);

    const editors = [];

    containers.forEach(container => {
        editors.push(createEditor(container));
    });

    return editors;
}

/**
 * Creates an `Editor` using an optional container
 * @param {HTMLElement} [_container]
 * @returns {Editor} Editor created
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
