export const METAMODEL_PROTO = {
    "model": {
        "nature": "concrete",
        "attribute": {
            "name": { "type": "string" },
            "root": { "type": "reference", "accept": "concrete" }
        },
        "component": [
            {
                "name": "model_concept",
                "attribute": {
                    "concepts": {
                        "type": "set",
                        "accept": "concrete",
                        "action": {
                            "add": {
                                "text": "Add a concept"
                            }
                        }
                    }
                },
                "projection": [
                    {
                        "type": "text",
                        "layout": "#concepts"
                    }
                ]
            }
        ],
        "projection": [
            {
                "type": "text",
                "layout": "MODEL #name begin with #root #[model_concept]"
            }
        ]
    },
    "concept": {
        "nature": "prototype",
        "attribute": {
            "name": { "type": "string" },
            "nature": { "type": "string" },
        },
        "component": [
            {
                "name": "concept_structure",
                "attribute": {
                    "attributes": {
                        "type": "set",
                        "accept": "attribute",
                        "action": {
                            "add": {
                                "text": "Add an attribute"
                            }
                        }
                    },
                    "components": {
                        "type": "set",
                        "accept": "component",
                        "action": {
                            "add": {
                                "text": "Add a component"
                            }
                        }
                    }
                },
                "projection": [
                    {
                        "type": "text",
                        "layout": "#attributes #components"
                    }
                ]
            }
        ]
    },
    "prototype": {
        "nature": "concrete",
        "prototype": "concept",
        "projection": [
            {
                "type": "text",
                "layout": "DEFINE Prototype #name #[concept_structure]"
            }
        ]
    },
    "concrete": {
        "nature": "concrete",
        "idref": "name",
        "prototype": "concept",
        "projection": [
            {
                "type": "text",
                "layout": "DEFINE Concept #name #[concept_structure]"
            }
        ]
    },
    "structure": {
        "nature": "prototype",
        "attribute": {
            "name": { "type": "string" },
            "required": { "type": "boolean" },
        }
    },
    "attribute": {
        "nature": "concrete",
        "prototype": "structure",
        "attribute": {
            "type": { "type": "reference", "accept": "concept" },
            "min": { "type": "number" },
            "max": { "type": "number" }
        },
        "projection": [
            {
                "type": "text",
                "layout": "DEFINE Attribute #name AS #type | min=#min max=#max"
            }
        ],
    },
    "component": {
        "nature": "concrete",
        "prototype": "structure",
        "attribute": {
            "attributes": {
                "type": "set",
                "accept": "attribute",
                "action": {
                    "add": {
                        "text": "Add an attribute"
                    }
                }
            }
        },
        "projection": [
            {
                "type": "text",
                "layout": "DEFINE Component #name &NL List of attributes: #attributes"
            }
        ],
    },
    "@root": "model",
    "@config": {
        "language": "Gentleman demo",
        "settings": {
            "autosave": true
        }
    }
};