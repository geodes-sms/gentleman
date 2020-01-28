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
                    "concepts": { "type": "set", "accept": "concrete" }
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
                    "attributes": { "type": "set", "accept": "attribute" },
                    "components": { "type": "set", "accept": "component" }
                },
                "projection": [
                    {
                        "type": "text",
                        "layout": "#attributes #components"
                    }
                ]
            },
            {
                "name": "concept_projection",
                "attribute": {
                    "projections": { "type": "set", "accept": "projection" }
                },
                "projection": [
                    {
                        "type": "text",
                        "layout": "#projections"
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
                "layout": "DEFINE Prototype #name #[concept_structure] #[concept_projection]"
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
                "layout": "DEFINE Concept #name #[concept_structure] #[concept_projection]"
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
            "attributes": { "type": "set", "accept": "attribute" }
        },
        "projection": [
            {
                "type": "text",
                "layout": "DEFINE Component #name &NL List of attributes: #attributes"
            }
        ],
    },
    "projection": {
        "nature": "concrete",
        "attribute": {
            "type": { "type": "string" },
            "elements": { "type": "set", "accept": "element" }
        },
        "projection": [
            {
                "type": "text",
                "layout": "LAYOUT #type with elements"
            }
        ],
    },
    "element": {
        "nature": "prototype",
        "attribute": {
            "position": { "type": "number" },
            "before": { "type": "reference", "accept": "element" },
            "after": { "type": "reference", "accept": "element" }
        }
    },
    "render": {
        "nature": "concrete",
        "prototype": "element",
        "attribute": {
            "struct": { "type": "reference", "accept": "structure", "scope": "parent" }
        },
        "projection": [
            {
                "type": "text",
                "layout": "Render #struct | before(#before) after(#after)"
            }
        ],
    },
    "group": {
        "nature": "concrete",
        "prototype": "element",
        "attribute": {
            "name": { "type": "string" },
            "elements": { "type": "set", "accept": "element", "scope": "parent" }
        },
        "projection": [
            {
                "type": "text",
                "layout": "Group #name elements | before(#before) after(#after) : #elements"
            }
        ],
    },
    "word": {
        "nature": "concrete",
        "prototype": "element",
        "attribute": {
            "value": { "type": "string" }
        },
        "projection": [
            {
                "type": "text",
                "layout": "#value | before(#before) after(#after)"
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