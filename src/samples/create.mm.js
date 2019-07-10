export const METAMODEL_GENTLEMAN = {
    "grammar": {
        "name": "grammar",
        "attr": {
            "root": {
                "name": "root", "type": "IDREF", "ref": "element", "optional": true,
                "representation": { "type": "text", "val": "root: $val" }
            },
        },
        "composition": [
            {
                "name": "Elements",
                "position": 1,
                "multiple": true,
                "attr": {
                    "base": { "name": "base", "type": "string", "ref": "element" },
                    "rule": {
                        "name": "rule", "type": "element",
                        "multiple": { "type": "list", "min": 1, "separator": " " },
                    }
                },
                "representation": {
                    "type": "text",
                    "val": "Rules &NL #rule"
                }
            },
            {
                "name": "Data Type",
                "position": 2,
                "optional": true,
                "attr": {
                    "datatype": {
                        "name": "datatype", "type": "datatype",
                        "multiple": { "type": "list" }
                    }
                },
                "representation": {
                    "type": "text",
                    "val": "Data types &NL #datatype"
                }
            },
            {
                "name": "Enumeration",
                "position": 3,
                "optional": true,
                "attr": {
                    "enum": {
                        "name": "enum", "type": "enum",
                        "multiple": { "type": "list" }
                    }
                },
                "representation": {
                    "type": "text",
                    "val": "Enums &NL #enum"
                }
            },
            {
                "name": "Configuration",
                "position": 4,
                "attr": {
                    "config": { "name": "config", "type": "config" }
                },
                "representation": {
                    "type": "text",
                    "val": "Configuration &NL #config"
                }
            },
        ],
        "representation": {
            "type": "text",
            "k1": { "type": "keyword", "val": "GRAMMAR DEFINITION" },
            "val": "$k1 &NL Begin with #root $composition"
        }
    },
    "config": {
        "name": "config",
        "attr": {
            "language": {
                "name": "language", "type": "string",
                "description": "The name of the grammar",
                "representation": { "type": "text", "val": "language: $val" }
            }
        },
        "representation": {
            "type": "text",
            "val": "#language"
        }
    },
    "POS": {
        "name": "POS",
        "attr": {
            "id": { "name": "name", "type": "string" },
            "name": { "name": "name", "type": "ID" },
            "description": { "name": "description", "type": "string", "optional": true }
        },
        "abstract": true,
        "extensions": ["type", "attribute"]
    },
    "type": {
        "name": "type",
        "base": "POS",
        "abstract": true,
        "extensions": ["datatype", "baserule", "enum"]
    },
    "attribute": {
        "name": "attribute",
        "attr": {
            "name": { "name": "name", "type": "ID" },
            "type": { "name": "type", "type": "string", "val": "string" },
            "optional": { "name": "optional", "type": "presence", "val": "required" },
            "multiple": { "name": "multiple", "type": "multiplicity", "val": "single" },
            "min": { "name": "min", "type": "integer", "val": "-1" },
            "max": { "max": "min", "type": "integer", "val": "-1" }
        },
        "representation": {
            "type": "text",
            "val": "#name: #type #optional #multiple"
        }
    },
    "element": {
        "name": "element",
        "attr": {
            "name": { "name": "name", "type": "ID" },
            "output": { "name": "output", "type": "raw" }
        },
        "composition": [
            {
                "name": "Attributes",
                "position": 1,
                "attr": {
                    "attributes": {
                        "name": "attributes", "type": "attribute",
                        "multiple": { "type": "list", "min": 1, "separator": " " }
                    },
                },
                "representation": {
                    "type": "text",
                    "k1": { "type": "keyword", "val": "Attributes" },
                    "val": "#attributes"
                }
            },
            {
                "name": "Nested rule",
                "position": 2,
                "optional": true,
                "attr": {
                    "rules": {
                        "name": "rules", "type": "subelement",
                        "multiple": { "type": "list", "min": 1, "separator": " " }
                    },
                },
                "representation": {
                    "type": "text",
                    "k1": { "type": "keyword", "val": "Nested Rules" },
                    "val": "#rules"
                }
            },
        ],
        "representation": {
            "type": "text",
            "val": "#name := #output $composition"
        }
    },
    "subelement": {
        "name": "subelement",
        "attr": {
            "name": { "name": "name", "type": "ID" },
            "output": { "name": "output", "type": "raw" }
        },
        "composition": [
            {
                "name": "Attributes",
                "position": 1,
                "attr": {
                    "attributes": {
                        "name": "attributes", "type": "attribute",
                        "multiple": { "type": "list", "min": 1, "separator": " " }
                    },
                },
                "representation": {
                    "type": "text",
                    "k1": { "type": "keyword", "val": "Attributes" },
                    "val": "#attributes"
                }
            },
        ],
        "representation": {
            "type": "text",
            "val": "../ #output $composition"
        }
    },
    "datatype": {
        "name": "datatype",
        // "base": "type",
        "attr": {
            "format": { "name": "format", "type": "string" },
            "base": {
                "name": "type", "type": "primitive", "val": "string", "optional": true,
                "representation": { "type": "text", "val": "base: $val" }
            }
        },
        "representation": {
            "type": "text",
            "val": "#format #base"
        }
    },
    "baserule": {
        "name": "baserule",
        "base": "type",
        "composition": [
            {
                "name": "Attributes",
                "position": 1,
                "attr": {
                    "attributes": {
                        "name": "attributes", "type": "attribute",
                        "multiple": { "type": "list" }
                    }
                }
            },
            {
                "name": "Nested rules",
                "position": 2,
                "attr": {
                    "rules": {
                        "name": "rules", "type": "nestedrule",
                        "multiple": { "type": "list", "min": 1 }
                    }
                }
            }
        ]
    },
    "enum": {
        "name": "enum",
        // "base": "type",
        "attr": {
            "format": { "name": "format", "type": "string" },
            "base": { "name": "type", "type": "primitive", "val": "string" }
        },
        "composition": [
            {
                "name": "Values",
                "position": 1,
                "multiple": true,
                "attr": {
                    "id": { "name": "id", "type": "string" },
                    "val": { "name": "val", "type": "string" }
                },
                "representation": {
                    "type": "text",
                    "val": "#id: #val"
                }
            }
        ],
        "representation": {
            "type": "text",
            "val": "#format:#base $composition"
        }
    },
    "nestedrule": {
        "name": "nestedrule",
        "base": "POS",
        "attr": {
            "position": { "name": "position", "type": "string" },
            "optional": { "name": "optional", "type": "integer" }
        },
        "composition": [
            {
                "name": "Attributes",
                "position": 1,
                "attr": {
                    "attributes": {
                        "name": "attributes", "type": "attribute",
                        "multiple": { "type": "list" }
                    }
                }
            }
        ]
    },
    "abstractrule": {
        "name": "abstractrule",
        "base": "baserule",
        "attr": {
            "extensions": {
                "name": "extensions", "type": "IDREF", "ref": "concreterule",
                "multiple": { "type": "list" }
            }
        }
    },
    "concreterule": {
        "name": "concreterule",
        "base": "baserule",
        "attr": {
            "base": { "name": "base", "type": "IDREF", "ref": "abstractrule", "optional": true }
        },
        "composition": ["representation"]
    },
    "representation": {
        "name": "representation",
        "attr": {
            "val": { "name": "val", "type": "string" },
            "inline": { "name": "inline", "type": "boolean", "val": "false" }
        },
        "abstract": true,
        "extensions": ["representationText"]
    },
    "representationText": {
        "name": "representationText",
        "base": "representation",
        "attr": {
            "name": { "name": "name", "type": "string" },
            "position": { "name": "position", "type": "integer" }
        },
        "abstract": true,
        "extensions": ["representationTextKeyword", "representationTextAttribute"]
    },
    "representationTextAttribute": {
        "name": "representationTextAttribute",
        "base": "representationText",
        "attr": {
            "attribute": { "name": "attribute", "type": "IDREF", "ref": "attribute" }
        }
    },
    "representationTextKeyword": {
        "name": "representationTextKeyword",
        "base": "representationText",
        "attr": {
            "value": { "name": "value", "type": "string" }
        }
    },
    "output": {
        "name": "output",
        "attr": {
            "name": { "name": "name", "type": "string" },
            "position": { "name": "position", "type": "integer" },
            "attribute": { "name": "attribute", "type": "IDREF", "ref": "attribute" }
        }
    },
    "primitive": {
        "name": "primitive",
        "type": "enum",
        "values": {
            "integer": "integer",
            "string": "string",
            "date": "date",
            "ID": "ID",
            "IDREF": "IDREF",
            "real": "real"
        }
    },
    "multiplicity": {
        "name": "multiplicity",
        "type": "enum",
        "values": {
            "single": "single",
            "multiple": "multiple"
        }
    },
    "presence": {
        "name": "presence",
        "type": "enum",
        "values": {
            "required": "required",
            "optional": "optional"
        }
    },
    "@root": "grammar",
    "@config": {
        "language": "Gentleman",
        "settings": {
            "autosave": true
        }
    }
};