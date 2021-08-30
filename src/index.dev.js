/* eslint-disable indent */

// Import CSS
import './stylesheets.js';
import '@css/samples/gentleman.css';
import './../demo/todo/assets/style.css';

import { createDiv, getElements, valOrDefault, isNullOrUndefined, isHTMLElement, hasOwn, getElement, isFunction } from "zenkai";
import { Editor } from './environment/index.js';
import { resolveContainer } from './utils/index.js';
import { buildProjectionHandler, buildConceptHandler } from '@generator/index.js';

const Model = {
    DD: "druide",
    MC: "concept",
    MP: "projection",
    MS: "style",
    MM: "mindmap",
    RL: "relis",
    TL: "trafficlight",
    TD: "todo",
};

const modelName = Model.TD;

const MODEL__EDITOR = require(`@models/${modelName}-model/config.json`);
const MODEL__CONCEPT = require(`@models/${modelName}-model/concept.json`);
const MODEL__PROJECTION = require(`@models/${modelName}-model/projection.json`);

const MODEL__TEST = require(`./../.internal/projection-model-test.json`);

const STYLE_CONCEPT = require(`@models/${Model.MS}-model/concept.json`);
const STYLE_PROJECTION = require(`@models/${Model.MS}-model/projection.json`);

const DRUIDE_CONCEPT = require(`@models/${Model.DD}-model/concept.json`);
const DRUIDE_PROJECTION = require(`@models/${Model.DD}-model/projection.json`);

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
    "open-style": function (args) {
        let concept = args[0];
        let projection = this.createProjection(concept, "style");

        let window = this.findWindow("side-instance");
        if (isNullOrUndefined(window)) {
            window = this.createWindow("side-instance");
            window.container.classList.add("model-projection-sideview");
        }

        if (window.instances.size > 0) {
            let instance = Array.from(window.instances)[0];
            instance.delete();
        }

        let instance = this.createInstance(concept, projection, {
            type: "projection",
            close: "DELETE-PROJECTION"
        });

        window.addInstance(instance);
    },
    "open-state": function (args) {
        let concept = args[0];
        let projection = this.createProjection(concept, "state");

        let window = this.findWindow("side-instance");
        if (isNullOrUndefined(window)) {
            window = this.createWindow("side-instance");
            window.container.classList.add("model-projection-sideview");
        }

        if (window.instances.size > 0) {
            let instance = Array.from(window.instances)[0];
            instance.delete();
        }

        let instance = this.createInstance(concept, projection, {
            type: "projection",
            close: "DELETE-PROJECTION"
        });

        window.addInstance(instance);
    },
    "open-option": function (args) {
        let concept = args[0];
        let projection = this.createProjection(concept, "option");

        let window = this.findWindow("side-instance");
        if (isNullOrUndefined(window)) {
            window = this.createWindow("side-instance");
            window.container.classList.add("td-option-sideview");
        }

        if (window.instances.size > 0) {
            let instance = Array.from(window.instances)[0];
            instance.delete();
        }

        let instance = this.createInstance(concept, projection, {
            type: "projection",
            close: "DELETE-PROJECTION"
        });

        window.addInstance(instance);
    },
};

editor.init({
    conceptModel: MODEL__CONCEPT,
    projectionModel: MODEL__PROJECTION,
    config: MODEL__EDITOR,
    handlers: MODEL__HANDLER
});

if (modelName === Model.MP) {
    editor.addConcept(STYLE_CONCEPT);
    editor.addProjection(STYLE_PROJECTION);
}

if (modelName === Model.RL) {
    editor.createInstance("project");
}

const Build = {
    "concept": buildConceptHandler,
    "projection": buildProjectionHandler,
};

let btnBuild = getElement("#btnBuild");

let handler = Build[modelName];

btnBuild.disabled = !isFunction(handler);

btnBuild.addEventListener("click", (event) => {
    handler.call(editor);
});