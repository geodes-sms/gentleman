/* eslint-disable indent */

// Import CSS
import './stylesheets.js';
import '@css/samples/gentleman.css';
// import './../demo/traffic-light/assets/style.css';

import { createDiv, getElements, valOrDefault, isHTMLElement, hasOwn, getElement } from "zenkai";
import { Editor } from './environment/index.js';
import { resolveContainer } from './utils/index.js';
import { buildProjectionHandler } from '@generator/build-projection.js';

const Model = {
    MP: "projection",
    MC: "concept",
    MS: "style",
    TL: "trafficlight",
    MM: "mindmap",
};
const modelName = Model.MP;

const MODEL__EDITOR = require(`@models/${modelName}-model/config.json`);
const MODEL__CONCEPT = require(`@models/${modelName}-model/concept.json`);
const MODEL__PROJECTION = require(`@models/${modelName}-model/projection.json`);

const STYLE_CONCEPT = require(`@models/${Model.MS}-model/concept.json`);
const STYLE_PROJECTION = require(`@models/${Model.MS}-model/projection.json`);

const ENV_EDITOR = "editor";

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

const MODEL__HANDLER = {
  
};

editor.init({
    conceptModel: MODEL__CONCEPT,
    projectionModel: MODEL__PROJECTION,
    config: MODEL__EDITOR,
    handlers: MODEL__HANDLER
});

editor.addConcept(STYLE_CONCEPT);
editor.addProjection(STYLE_PROJECTION);

let editorWindow = editor.createWindow();
editorWindow.container.classList.add("model-projection-sideview");

let btnBuild = getElement("#btnBuild");

btnBuild.addEventListener("click", (event) => {
    buildProjectionHandler.call(editor);
});