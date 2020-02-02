export const METAMODEL_PROJECTION = {
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