const CONCEPT_MODEL__CONFIG = require('@include/concept-model/editor-config.json');
const CONCEPT_MODEL__CONCEPT = require('@include/concept-model/concept.json');
const CONCEPT_MODEL__PROJECTION = require('@include/concept-model/textual-projection.json');

const PROJECTION_MODEL__CONFIG = require('@include/projection-model/editor-config.json');
const PROJECTION_MODEL__CONCEPT = require('@include/projection-model/concept.json');
const PROJECTION_MODEL__PROJECTION = require('@include/projection-model/textual-projection.json');

const EDITOR_CONFIG = {
    "root": [],
    "mode": "design",
    "header": {
        "css": ["editor-header"]
    },
    "body": {
        "css": ["editor-body"]
    },
    "menu": {
        "actions": [
            { "name": "export" },
            { "name": "import" }
        ],
        "css": ["editor-menu"]
    }
};

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
    }
};

window.GENTLEMAN_CONFIG = {
    editor: {
        config: EDITOR_CONFIG,
        handlers: EDITOR_HANDLER
    }
};