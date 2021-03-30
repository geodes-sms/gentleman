/* eslint-disable indent */

// Import CSS
import './stylesheets.js';
import '@css/samples/gentleman.css';
import '@css/samples/projection.css';

import { Manager } from '@environment/index.js';


const CONCEPT_MODEL__CONFIG = require('@include/concept-model/editor-config.json');
const CONCEPT_MODEL__CONCEPT = require('@include/concept-model/concept.json');
const CONCEPT_MODEL__PROJECTION = require('@include/concept-model/projection.json');

const PROJECTION_MODEL__CONFIG = require('@include/projection-model/editor-config.json');
const PROJECTION_MODEL__CONCEPT = require('@include/projection-model/concept.json');
const PROJECTION_MODEL__PROJECTION = require('@include/projection-model/projection.json');

const EDITOR_HANDLER = {
    "create-metamodel": function (target) {
        const { concept, values = [] } = CONCEPT_MODEL__CONCEPT;
        const { projection, views = [] } = CONCEPT_MODEL__PROJECTION;
        const { editor: config } = CONCEPT_MODEL__CONFIG;

        this.unload();
        this.setConfig(config);
        this.loadConceptModel(concept, values);
        this.loadProjectionModel(projection, views);
        this.home.close();
    },
    "create-projection": function (target) {
        const { concept, values = [] } = PROJECTION_MODEL__CONCEPT;
        const { projection, views = [] } = PROJECTION_MODEL__PROJECTION;
        const { editor: config } = PROJECTION_MODEL__CONFIG;

        this.unload();
        this.setConfig(config);
        this.loadConceptModel(concept, values);
        this.loadProjectionModel(projection, views);
        this.home.close();
    },
    "preview-projection": function (target) {
        if (!this.hasResource("metamodel")) {
            this.notify("<strong>Metamodel not found</strong>: The <em>metamodel</em> might have not been loaded yet.<br> Add it in the resource tab and try again.", "error", 4000);

            return false;
        }

        this.triggerEvent({ "name": "build-projection", options: { download: false } }, (pmodel) => {
            if (!pmodel) {
                return;
            }

            let reader = new FileReader();
            this.resources.forEach((val, key) => {
                reader.onload = (event) => {
                    const schema = JSON.parse(reader.result);

                    this.manager.createEditor()
                        .init()
                        .hide()
                        .loadConceptModel(schema.concept || schema)
                        .loadProjectionModel(pmodel)
                        .show();
                };
                reader.readAsText(val);
            });
        });
    },
};

Manager.init({
    editor: {
        config: null,
        handlers: EDITOR_HANDLER
    }
});
