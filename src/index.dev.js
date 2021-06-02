/* eslint-disable indent */

// Import CSS
import './stylesheets.js';
// import '@css/samples/gentleman.css';
import '@css/samples/mindmap.css';

import { Manager } from './manager.js';
import { cloneTemplate, getElement, getTemplate, getUrlParams } from 'zenkai';

const CMODEL__EDITOR = require('@models/concept-model/editor-config.json');
const CMODEL__CONCEPT = require('@models/concept-model/concept.json');
const CMODEL__PROJECTION = require('@models/concept-model/projection.json');

const PMODEL__EDITOR = require('@models/projection-model/editor-config.json');
const PMODEL__CONCEPT = require('@models/projection-model/concept.json');
const PMODEL__PROJECTION = require('@models/projection-model/projection.json');

const XMODEL__EDITOR = require('@models/mindmap-model/mindmap_config.json');
const XMODEL__CONCEPT = require('@models/mindmap-model/mindmap_metamodel.json');
const XMODEL__PROJECTION = require('@models/mindmap-model/mindmap_projection.json');

const Models = new Map();

Models.set("concept-model", Object.assign({}, CMODEL__EDITOR, CMODEL__CONCEPT, CMODEL__PROJECTION));
Models.set("projection-model", Object.assign({}, PMODEL__EDITOR, PMODEL__CONCEPT, PMODEL__PROJECTION));
Models.set("mindmap-model", Object.assign({}, XMODEL__EDITOR, XMODEL__CONCEPT, XMODEL__PROJECTION));

const channel = new BroadcastChannel('app-data');

Manager.init();

const EDITOR_HANDLER = {
    "preview-projection": function (target) {
        const RESOURCE_NAME = "metamodel";

        if (!this.hasResource(RESOURCE_NAME)) {
            this.notify("<strong>Metamodel not found</strong>: Add it in the resource tab and try again.", "error", 3000);

            return false;
        }

        this.triggerEvent({ "name": "build-projection", options: { download: false, notify: "error" } }, (pmodel) => {
            if (!pmodel) {
                return;
            }

            let cmodel = this.getModel(RESOURCE_NAME);

            channel.postMessage({
                concept: cmodel,
                projection: pmodel
            });
        });
    },
    "value.changed": function () {
        this.triggerEvent({ name: "preview-projection" });
    },
    "value.added": function () {
        this.triggerEvent({ name: "preview-projection" });
    },
    "value.removed": function () {
        this.triggerEvent({ name: "preview-projection" });
    }
};


const application = getElement(".app");
const GENTLEMAN_ID = getUrlParams("gentleman-id");
let editor = Manager.getEditor(".app-editor", application);

if (GENTLEMAN_ID) {
    editor.init();

    channel.addEventListener('message', (event) => {
        const { concept: cModel, projection: pModel } = event.data;

        let values = [];
        if (editor.conceptModel) {
            values = editor.conceptModel.export();
        }

        editor.unload()
            .loadConceptModel(cModel.concept || cModel, values)
            .loadProjectionModel(pModel)
            .open();
    });
} else {
    application.prepend(createMenu());

    editor.init({
        handlers: EDITOR_HANDLER
    });
}


function createMenu(selector) {
    let template = getTemplate("#tpl-app-menu");
    let clone = cloneTemplate(template);

    let menu = getElement(".app-menu", clone);

    menu.addEventListener("click", (event) => {
        const { target } = event;

        const { action, name } = target.dataset;

        if (action === "load-model") {
            let model = Models.get(name);
            editor.unload()
                .freeze()
                .setConfig(model.editor)
                .loadConceptModel(model.concept)
                .loadProjectionModel(model.projection)
                .unfreeze()
                .open();
        }
    });

    return menu;
}