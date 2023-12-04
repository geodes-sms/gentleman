/* eslint-disable indent */

// Import CSS
import './stylesheets.js';
import '@css/samples/gentleman.css';
import '@css/samples/projection.css';
import '@css/samples/style.css';
// import './../demo/relis/assets/style.css';
import './../demo/todo/assets/style.css';

import { createDiv, getElements, isNullOrUndefined, isHTMLElement, hasOwn } from "zenkai";
import { NotificationType, resolveContainer } from '@utils/index.js';
import { buildProjectionHandler, buildProjection, buildConceptHandler } from '@generator/index.js';
import { createProjectionModel } from '@projection/projection-model.js';
import { ConceptModelManager } from '@model/model-manager.js';
import { Editor } from '@editor/index.js';

const Model = {
    MC: "concept",
    MP: "projection",
    MS: "style",
    MM: "mindmap",
    RL: "relis",
    TD: "todo",
    TL: "trafficlight",
};

const modelName = Model.TD;

const MODEL__EDITOR = require(`@models/${modelName}-model/config.json`);
const MODEL__CONCEPT = require(`@models/${modelName}-model/concept.json`);
const MODEL__PROJECTION = require(`@models/${modelName}-model/projection.json`);

const ENV_EDITOR = "editor";

const isValid = (element) => isHTMLElement(element) && hasOwn(element.dataset, 'gentleman');

const isEditor = (element) => isValid(element) && element.dataset.gentleman === ENV_EDITOR;

/**
 * Activates the `editor` found in the container (optional)
 * @param {string|HTMLElement} [_container]
 * @returns {Editor[]} Editors found in the container
 */
function activateEditor(_container) {
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
    "open-layout": function (args) {
        let concept = args[0];
        let projection = this.createProjection(concept, "layout");

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
    "open-constraint": function (args) {
        let concept = args[0];
        let projection = this.createProjection(concept, "constraint");

        let window = this.findWindow("side-instance");
        if (isNullOrUndefined(window)) {
            window = this.createWindow("side-instance");
            window.container.classList.add("concept-constraint-sideview");
        }

        if (window.instances.size > 0) {
            let instance = Array.from(window.instances)[0];
            instance.delete();
        }

        let attr = concept.getParent("attribute");
        let name = attr.getAttribute("name");
        let title = name.hasValue() ? `Context: «${name.getValue()}» attribute` : `Context: attribute`;

        let instance = this.createInstance(concept, projection, {
            type: "projection",
            close: "DELETE-PROJECTION",
            title: title
        });

        window.addInstance(instance);
    },
    "edit-projection": function (args) {
        let concept = args[0];
        let projection = this.createProjection(concept, "edit");

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
    "preview-projection": function (args) {
        let concept = args[0];
        let { success, message: projectionSchema } = buildProjection.call(this, concept);
        if (!success) {
            this.notify("The projection contains some error.", NotificationType.ERROR, 3000);
            return;
        }

        let cname = projectionSchema.concept.name;
        let conceptSchema = createConceptSchema(projectionSchema);

        let cmodel = ConceptModelManager.createModel([conceptSchema], this).init();
        let pmodel = createProjectionModel({ "projection": [projectionSchema] }, this).init();

        let window = this.findWindow("preview-window");
        if (isNullOrUndefined(window)) {
            window = this.createWindow("preview-window");
            window.container.classList.add("preview-window");
        }

        let fakeconcept = cmodel.createConcept(cname);
        let projection = pmodel.createProjection(fakeconcept).init();
        let instance = this.createInstance(fakeconcept, projection, {
            type: "projection",
            close: "DELETE-PROJECTION",
            title: `Preview (${cname} concept)`
        });

        concept.watch("value.changed", updatePreview.bind(this, instance));

        window.addInstance(instance);
    },

    "export.model": function () { this.exporter.open(); },
    "open.menu": function () { this.home.open(); },
    "close.editor": function () { this.close(); },
    "build-concept": function (args) { buildConceptHandler.call(this); },
    "build-projection": function (args) { buildProjectionHandler.call(this); },
};

function createConceptSchema(pSchema) {
    let cname = pSchema.concept.name;
    let attributes = getAttributeFromContainer(pSchema.container);

    return {
        "name": cname,
        "nature": "concrete",
        "attributes": attributes
    };
}

function getAttributeFromContainer(container) {
    let attributes = [];

    container.content.forEach(c => {
        if (c.type === "field") {
            if (c.field.type === "text") {
                attributes.push({ "name": c.field.source, "target": { "name": "string" } });
            } else if (c.field.type === "binary") {
                attributes.push({ "name": c.field.source, "target": { "name": "boolean" } });
            } else if (c.field.type === "choice") {
                attributes.push({ "name": c.field.source, "target": { "name": "string" } });
            } else if (c.field.type === "list") {
                attributes.push({ "name": c.field.source, "target": { "name": "set", "accept": { name: "string" } } });
            }
        } else if (c.type === "dynamic") {
            attributes.push({ "name": c.dynamic.name, "target": { "name": "string" } });
        } else if (c.type === "layout") {
            attributes.push(...getAttributeFromContainer(c.layout));
        } else if (c.type === "container") {
            attributes.push(...getAttributeFromContainer(c.container));
        }
    });

    return attributes;
}

function updatePreview(instance, value, concept) {
    let { success, message: projectionSchema } = buildProjection.call(this, concept);
    if (!success) {
        this.notify("The projection contains some error.", NotificationType.ERROR, 3000);
        return;
    }

    let cname = projectionSchema.concept.name;
    let conceptSchema = createConceptSchema(projectionSchema);

    let cmodel = ConceptModelManager.createModel([conceptSchema], this).init();
    let pmodel = createProjectionModel({ "projection": [projectionSchema] }, this).init();

    if (instance.concept) {
        instance.concept.delete(true);
    }

    if (instance.projection) {
        instance.projection.delete();
    }

    instance.concept = cmodel.createConcept(cname);
    instance.projection = pmodel.createProjection(instance.concept).init();
    instance.render();
}

editor.init({
    config: MODEL__EDITOR,
    handlers: MODEL__HANDLER,
    conceptModel: MODEL__CONCEPT,
    projectionModel: MODEL__PROJECTION
});
editor.home.open();

if (modelName === Model.MP) {
    const STYLE_CONCEPT = require(`@models/${Model.MS}-model/concept.json`);
    const STYLE_PROJECTION = require(`@models/${Model.MS}-model/projection.json`);

    editor.loadConcept(STYLE_CONCEPT, "styling concept");
    editor.loadProjection(STYLE_PROJECTION, "styling projection");

    let window = editor.findWindow("side-instance");
    if (isNullOrUndefined(window)) {
        window = editor.createWindow("side-instance");
        window.container.classList.add("model-projection-sideview");
    }

    editor.createInstance("projection");
}

if (modelName === Model.RL) {
    let instance = editor.createInstance("project");
    instance.full();
}

if (modelName === Model.SP) {
    let instance = editor.createInstance("concept");
}

if (modelName === Model.TL) {
    let instance = editor.createInstance("mode");
    let lights = instance.concept.getAttribute("lights").getTarget();
    lights.createElement();
}
