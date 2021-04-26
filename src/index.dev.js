/* eslint-disable indent */

// Import CSS
import './stylesheets.js';
import '@css/samples/gentleman.css';

import { Manager } from './manager.js';
import { getElement, getElements, isNullOrUndefined } from 'zenkai';

const CMODEL__EDITOR = require('@models/concept-model/editor-config.json');
const CMODEL__CONCEPT = require('@models/concept-model/concept.json');
const CMODEL__PROJECTION = require('@models/concept-model/projection.json');

const PMODEL__EDITOR = require('@models/projection-model/editor-config.json');
const PMODEL__CONCEPT = require('@models/projection-model/concept.json');
const PMODEL__PROJECTION = require('@models/projection-model/projection.json');

const Models = new Map();

Models.set("concept-model", Object.assign({}, CMODEL__EDITOR, CMODEL__CONCEPT, CMODEL__PROJECTION));
Models.set("projection-model", Object.assign({}, PMODEL__EDITOR, PMODEL__CONCEPT, PMODEL__PROJECTION));

Manager.init();

const EDITOR_HANDLER = {
    "preview-projection": function (target) {
        const RESOURCE_NAME = "metamodel";

        if (!this.hasResource(RESOURCE_NAME)) {
            this.notify("<strong>Metamodel not found</strong>: The <em>metamodel</em> might have not been loaded yet.<br> Add it in the resource tab and try again.", "error", 4000);

            return false;
        }

        this.triggerEvent({ "name": "build-projection", options: { download: false, notify: "error" } }, (pmodel) => {
            if (!pmodel) {
                return;
            }

            let model = this.getModel(RESOURCE_NAME);

            const editor = getPreviewEditor.call(this);

            let values = [];
            if (editor.conceptModel) {
                values = editor.conceptModel.export();
            }
            
            setTimeout(() => {
                editor.unload()
                .loadConceptModel(model.concept || model, values)
                .loadProjectionModel(pmodel)
                .open();
            }, 10);
        });
    },
};

function initApp(container) {
    let menu = getElement(".app-menu", container);
    let editor = Manager.getEditor(".app-editor", container);
    editor.init({
        handlers: EDITOR_HANDLER
    });

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
}

let previewEditor = null;
function getPreviewEditor() {
    if (isNullOrUndefined(previewEditor)) {
        let modelHanlder = {
            update: (message) => {
                if (message === "value.changed") {
                    this.triggerEvent({ name: "preview-projection" });
                }
            }
        };
        this.conceptModel.register(modelHanlder);

        previewEditor = Manager.createEditor().init({
            handlers: {
                "editor.close@post": () => {
                    this.conceptModel.unregister(modelHanlder);
                    previewEditor.destroy();
                    previewEditor = null;
                }
            }
        });

        let app = getElement(".app-body");
        app.append(previewEditor.container);
    }
    return previewEditor;
}

(function init() {
    const applications = getElements(".app");

    for (let i = 0; i < applications.length; i++) {
        const appContainer = applications[i];
        initApp(appContainer);
    }
})();