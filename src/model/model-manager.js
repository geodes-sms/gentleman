import { ConceptModel } from "./concept-model.js";


const MM_Model = {
    "@values": {
        "list_concept_value_0": {
            "name": "list",
            "attribute": {
                "concepts": "set_value_0",
            }
        },
        "set_value_0": {
            "name": "set",
            "accept": "meta_concept",
            "value": [
                "meta_concept_value_0",
                "meta_concept_value_1",
                "meta_concept_value_2",
            ]
        },
        "meta_concept_value_0": {
            "name": "meta_concept",
            "attribute": {
                "name": "string_value_0"
            }
        },
        "meta_concept_value_1": {
            "name": "meta_concept",
            "attribute": {
                "name": "string_value_1"
            }
        },
        "meta_concept_value_2": {
            "name": "meta_concept",
            "attribute": {
                "name": "string_value_2"
            }
        },
        "string_value_0": {
            "name": "string",
            "value": "Model concept"
        },
        "string_value_1": {
            "name": "string",
            "value": "Prototype concept"
        },
        "string_value_2": {
            "name": "string",
            "value": "Concrete concept"
        },
    },
    "list": {
        "attribute": {
            "concepts": {
                "target": "set",
                "accept": "meta_concept"
            }
        },
        "projection": [
            {
                "type": "layout",
                "layout": {
                    "type": "wrap",
                    "disposition": [
                        {
                            "type": "attribute",
                            "name": "concepts"
                        }
                    ]
                }
            }
        ],
    },
    "meta_concept": {
        "attribute": {
            "name": { "target": "string" }
        },
        "projection": [
            {
                "type": "layout",
                "layout": {
                    "type": "wrap",
                    "disposition": [
                        {
                            "type": "attribute",
                            "name": "name"
                        }
                    ]
                }
            }
        ]
    }
};

const models = [];

export const ConceptModelManager = {
    createModel(schema, environment) {
        var model = Object.create(ConceptModel, {
            schema: { value: schema },
            environment: { value: environment },
        });

        models.push(model);

        return model;
    }
};