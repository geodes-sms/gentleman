import { isNullOrUndefined, isEmpty, valOrDefault, isNullOrWhitespace, } from 'zenkai';
import { NotificationType, DocTypeMap } from '@utils/index.js';
import { ConceptModelManager } from '@model/index.js';
import { createProjectionModel } from '@projection/index.js';

export const FnLoad = {
    unloadAllConcept() {
        if (this.hasConceptModel) {
            this.conceptModel.done();
            this.conceptModel = null;

            this.refresh();
        }

        this.triggerEvent({ name: "editor.unload-concept@post" });

        return this;
    },
    unloadAllProjection() {
        if (this.hasProjectionModel) {
            this.projectionModel.done();
            this.projectionModel = null;

            this.refresh();
        }

        this.triggerEvent({ name: "editor.unload-projection@post" });

        return this;
    },
    loadSession() {
        this.conceptModel.getRootConcepts().forEach(concept => {
            this.createInstance(concept);
        });
    },
    loadConcept(schema, name) {
        let concepts = schema.concept || schema;
        let values = schema.values;

        if (!Array.isArray(concepts)) {
            this.notify("Invalid concept schema", NotificationType.ERROR);

            return false;
        }

        if (isEmpty(concepts)) {
            this.notify("The concept schema is empty", NotificationType.ERROR);

            return false;
        }

        if (isNullOrUndefined(this.conceptModel)) {
            this.conceptModel = ConceptModelManager.createModel(null, this).init();
        }
        this.conceptModel.addConceptSchema(concepts);
        this.conceptModel.init(values);

        this.triggerEvent({ name: "editor.load-concept@post", args: [name, JSON.stringify(schema)] });

        this.refresh();

        return this;
    },
    loadProjection(schema, name) {
        this.activeElement = null;
        this.activeInstance = null;
        this.activeConcept = null;
        this.activeProjection = null;

        if (isNullOrUndefined(this.projectionModel)) {
            this.projectionModel = createProjectionModel(schema, this).init();
        }

        this.projectionModel.addSchema(schema);

        if (isNullOrUndefined(this.projectionModel)) {
            // TODO: add validation and notify of errors
        }

        this.instances.forEach(instance => {
            instance.projection = this.projectionModel.createProjection(instance.concept).init();
            instance.render();
        });

        this.triggerEvent({ name: "editor.load-projection@post", args: [name, JSON.stringify(schema)] });

        this.refresh();

        return this;
    },
    /**
     * Parse and load a file
     * @param {File} file 
     * @param {string} type 
     * @param {string} name 
     */
    load(file, name) {
        let type = file.type;
        if (isNullOrWhitespace(type)) {
            let index = file.name.indexOf(".") + 1;
            type = file.name.substring(index);
        } else {
            type = DocTypeMap[type];
        }

        if (type !== "jsoncp" || type !== "json") {
            this.addResource(file, name);
        }

        let reader = new FileReader();
        reader.onload = (event) => {
            const schema = JSON.parse(reader.result);
            const { type } = schema;
            if (type === "concept") {
                this.loadConcept(schema, name);
            } else if (type === "projection") {
                this.loadProjection(schema, name);
            } else if (type === "model") {
                this.loadConcept(schema.concept, "model");
                this.loadProjection(schema.projection, "model");
            }
        };
        reader.readAsText(file);

        return true;
    },
    unload() {
        this.unloadAllConcept();
        this.unloadAllProjection();
        this.clear();

        return this;
    },
};