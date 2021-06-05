/* eslint-disable indent */

// Import CSS
import './stylesheets.js';
// import '@css/samples/gentleman.css';
// import '@css/samples/mindmap.css';
import '@css/samples/trafficlight.css';

import { createDiv, getElements, isNullOrWhitespace, valOrDefault, isHTMLElement, getElement, isString, hasOwn, isNullOrUndefined } from "zenkai";
import { Editor } from './environment/index.js';
import { resolveContainer } from './utils/index.js';


const CMODEL__EDITOR = require('@models/concept-model/editor-config.json');
const CMODEL__CONCEPT = require('@models/concept-model/concept.json');
const CMODEL__PROJECTION = require('@models/concept-model/projection.json');

const PMODEL__EDITOR = require('@models/projection-model/editor-config.json');
const PMODEL__CONCEPT = require('@models/projection-model/concept.json');
const PMODEL__PROJECTION = require('@models/projection-model/projection.json');

const XMODEL__EDITOR = require('@models/trafficlight-model/config.json');
const XMODEL__CONCEPT = require('@models/trafficlight-model/metamodel.json');
const XMODEL__PROJECTION = require('@models/trafficlight-model/projection.json');


const ENV_EDITOR = "editor";
const ENV_EXPLORER = "explorer";

const isValid = (element) => isHTMLElement(element) && hasOwn(element.dataset, 'gentleman');

const isEditor = (element) => isValid(element); // TODO - add this: && element.dataset.gentleman === "editor"

/**
 * Activates the `editor` found in the container (optional)
 * @param {string|HTMLElement} [_container]
 * @returns {Editor[]} Editors found in the container
 */
function activateEditor(_container) {
    const container = resolveContainer(_container);
    const containers = isEditor(container) ? [container] : getElements("[data-gentleman]", container);

    const editors = [];

    containers.forEach(container => {
        let env = valOrDefault(container.dataset["gentleman"], ENV_EDITOR);

        switch (env) {
            case ENV_EDITOR:
                editors.push(createEditor(container));
                break;

            default:
                console.warn(`Gentleman does not support this environment ${env}`);
                break;
        }
    });

    return editors;
}

/**
 * Creates an `Editor` using an optional container
 * @param {HTMLElement} [_container]
 * @returns {Editor} Editor created
 */
function createEditor(_container) {
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

let editor = activateEditor(".app-editor")[0];

editor.init({
    conceptModel: XMODEL__CONCEPT,
    projectionModel: XMODEL__PROJECTION,
    config: XMODEL__EDITOR,
});
