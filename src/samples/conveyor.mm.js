export const METAMODEL_APC = {
    "production_system": {
        "attribute": {
            "short_name": { "name": "short name", "type": "string", "id": true },
            "name": { "name": "name", "type": "string" }
        },
        "component": [
            {
                "name": "screening_section",
                "optional": true,
                "attribute": {
                    "screen_action": { "name": "screen_action", "type": "string", "id": true, "optional": true },
                    "screening": { "name": "screening", "type": "screening" }
                },
                "projection": [
                    {
                        "type": "text",
                        "layout": "SCREENING #screen_action #screening"
                    }
                ],
            },
        ],
        "projection": [
            {
                "type": "text",
                "layout": "PROJECT #short_name #name #[screening_section]"
            }
        ],
    },
    "machine": {
        "attribute": {
            "operator": { "name": "short name", "type": "operator" },
            "connected": { "name": "connected to", "type": "conveyor_belt" },
        },
        "projection": [
            {
                "type": "text",
                "layout": "#operator"
            }
        ],
    },
    "conveyor_belt": {
        "attribute": {
            "products": { "name": "unfinished products", "type": "set", "accept": "product" },
            "connected": { "name": "connected to", "type": "conveyor_belt" },
        },
        "constraint": [
            "FORALL<conveyor,c>|COUNT[products] >= SUM[$machine.connected=c]"
        ],
        "projection": [
            {
                "type": "text",
                "layout": "#products"
            }
        ],
    },
    "product": {
        "attribute": {
            "name": { "name": "product name", "type": "string" },
        },
        "projection": [
            {
                "type": "text",
                "layout": "#name"
            }
        ],
    },
    "@root": "production_system",
    "@config": {
        "language": "APC",
        "settings": {
            "autosave": true
        }
    },
};