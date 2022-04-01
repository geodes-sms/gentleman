import { valOrDefault } from "zenkai";
import { ConceptModel } from "./concept-model.js";


const models = [];

export const ConceptModelManager = {
    createModel(schema, environment) {
        var model = Object.create(ConceptModel, {
            schema: { value: valOrDefault(schema, []) },
            environment: { value: environment },
        });

        models.push(model);

        return model;
    }
};