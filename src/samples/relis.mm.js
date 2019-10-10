export const METAMODEL_RELIS = {
    "project": {
        "attribute": {
            "short_name": { "name": "short name", "type": "string", "id": true },
            "name": { "name": "name", "type": "string" }
        },
        "property": {
            "attribute": { "type": "reserved", "extendable": true, "override": false },
            "k1": { "type": "keyword", "value": "PROJECT" },
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
                "encoding": {
                    "type": "text",
                    "k1": { "type": "keyword", "value": "SCREENING" },
                    "value": "$k1 #screen_action #screening"
                }
            },
            {
                "name": "Question/Answer section",
                "optional": true,
                "attribute": {
                    "qa_action": { "name": "qa_action", "type": "ID", "optional": true },
                    "quality_assess": {
                        "name": "quality_assess", "type": "qa",
                        "multiple": { "type": "list", "min": 0 }
                    }
                },
                "encoding": {
                    "type": "text",
                    "k1": { "type": "keyword", "value": "QA" },
                    "value": "$k1 #qa_action #quality_assess"
                }
            },
            {
                "name": "Data extraction section",
                "attribute": {
                    "class_action": { "name": "class_action", "type": "ID", "optional": true },
                    "category": {
                        "name": "category", "type": "category",
                        "multiple": { "type": "array", "min": 1 }, "inline": false, "separator": ""
                    }
                },
                "encoding": {
                    "type": "text",
                    "k1": { "type": "keyword", "value": "DATA EXTRACTION" },
                    "value": "$k1 #class_action #category"
                }
            },
            {
                "name": "Report section",
                "optional": true,
                "attribute": {
                    "reporting": {
                        "name": "reporting", "type": "report",
                        "multiple": { "type": "list" }, "inline": false
                    }
                },
                "encoding": {
                    "type": "text",
                    "k1": { "type": "keyword", "value": "SYNTHESIS" },
                    "value": "$k1 #reporting"
                }
            }
        ],
        "constraint": {
            "PRESENCE": "C[2]=>C[3]"
        },
        "operation": {
            "ADD": "operation description"
        },
        "projection": [
            {
                "type": "text",
                "layout": "PROJECT #short_name #name #[screening_section]"
            }
        ],
        "encoding": {
            "default": {
                "format": "relis",
                "value": "$k1 #short_name #name ##compo ##compo[screening_section] ##compo[1|..|2|4..6]"
            },
            "alternative": {
                "format": "relis",
                "value": "$k1 #short_name #name #!EACH:listing"
            },
            "XML": {
                "format": "xml",
                "value": "<#short_name name='#name'>$composition</$short_name>"
            }
        }
    },
    "screening": {
        "name": "screening",
        "component": [
            {

                "id": "reviews",
                "name": "reviews",
                "keyword": "Reviews",
                "attribute": {
                    "review_per_paper": { "name": "review_per_paper", "type": "number", "value": "2" }
                },
                "projection": [
                    {
                        "type": "text",
                        "layout": "screening #review_per_paper"
                    }
                ],
                "encoding": { "type": "text", "value": "$keyword #review_per_paper" }
            },
            {
                "name": "conflict",
                "keyword": "Conflict",
                "attribute": {
                    "conflict_type": { "name": "conflict_type", "type": "conflictType" },
                    "conflict_resolution": { "name": "conflict_resolution", "type": "conflictResolution", "value": "unanimity" }
                },
                "projection": [
                    {
                        "type": "text",
                        "layout": "Conflict on #conflict_type resolved by #conflict_resolution"
                    }
                ],
                "encoding": { "type": "text", "value": "$keyword on #conflict_type resolved by #conflict_resolution" }
            },
            {
                "name": "criteria",
                "keyword": "Criteria",
                "attribute": {
                    "exclusion_criteria": {
                        "name": "exclusion_criteria", "type": "set", "accept": "string", "min": 1,
                        "projection": [
                            {
                                "type": "text",
                                "layout": "Criteria = [#exclusion_criteria]"
                            },
                            {
                                "type": "table",
                                "disposition": "column",
                                "layout": {
                                    "header": "Title|List of fields|Description",
                                    "cell": "title|fields|description",
                                    "multiple": true
                                }
                            },
                            {
                                "type": "table",
                                "disposition": "column",
                                "layout": {
                                    "cell": [
                                        { "header": "Title", "value": "#title" },
                                        { "header": "List of fields", "value": "#fields" },
                                        { "header": "Description", "value": "#description" },
                                    ],
                                    "multiple": true
                                }
                            }
                        ]
                    }
                },
                "projection": [
                    {
                        "type": "text",
                        "layout": "Criteria = [#exclusion_criteria]"
                    },
                    {
                        "type": "table",
                        "disposition": "column",
                        "layout": {
                            "header": "Title|List of fields|Description",
                            "cell": "title|fields|description",
                            "multiple": true
                        }
                    },
                    {
                        "type": "table",
                        "disposition": "column",
                        "layout": {
                            "cell": [
                                { "header": "Title", "value": "#title" },
                                { "header": "List of fields", "value": "#fields" },
                                { "header": "Description", "value": "#description" },
                            ],
                            "multiple": true
                        }
                    }
                ],
                "encoding": { "type": "text", "value": "$keyword = [#exclusion_criteria]" }
            },
            {
                "name": "sources",
                "keyword": "Sources",
                "optional": true,
                "attribute": {
                    "source_papers": {
                        "name": "source_papers", "type": "set", "accept": "string"
                    }
                },
                "projection": [
                    {
                        "type": "text",
                        "layout": "Sources = [#source_papers]"
                    }
                ],
                "encoding": { "type": "text", "value": "$keyword = [#source_papers]" }
            },
            {
                "name": "strategies",
                "keyword": "Strategies",
                "optional": true,
                "attribute": {
                    "search_strategy": {
                        "name": "search_strategy", "type": "set", "accept": "string"
                    }
                },
                "encoding": { "type": "text", "value": "$keyword = [#search_strategy]" }
            },
            {
                "name": "validation",
                "keyword": "Validation",
                "optional": true,
                "attribute": {
                    "validation_percentage": { "name": "validation_percentage", "type": "integer", "value": "20", "min": 0, "max": 100 },
                    "validation_assignment_mode": { "name": "validation_assignment_mode", "type": "assignmentMode", "value": "normal", "optional": true }
                },
                "encoding": { "type": "text", "value": "$keyword #validation_percentage% #validation_assignment_mode" }
            },
            {
                "name": "phases",
                "keyword": "Phases",
                "optional": true,
                "attribute": {
                    "phases": {
                        "name": "phases", "type": "set", "accept": "phase",
                        "inline": false
                    }
                },
                "projection": [
                    {
                        "type": "text",
                        "layout": "Phases #phases"
                    }
                ],
                "encoding": { "type": "text", "value": "$keyword #phases" }
            }
        ],
        "projection": [
            {
                "type": "text",
                "layout": "#[reviews] #[conflict] #[criteria] #[sources]"
            }
        ],
        "encoding": { "type": "text", "value": "$composition" }
    },
    "phase": {
        "name": "phase",
        "attribute": {
            "title": { "name": "title", "type": "string" },
            "description": { "name": "description", "type": "string", "optional": true },
            "fields": {
                "name": "fields", "type": "field",
                "multiple": { "type": "list", "separator": ',' }
            }
        },
        "projection": [
            {
                "type": "table",
                "disposition": "column",
                "layout": {
                    "header": "Title|List of fields|Description",
                    "cell": "title|fields|description",
                    "multiple": true
                }
            },
            {
                "type": "table",
                "disposition": "column",
                "layout": {
                    "cell": [
                        { "header": "Title", "value": "#title" },
                        { "header": "List of fields", "value": "#fields" },
                        { "header": "Description", "value": "#description" },
                    ],
                    "multiple": true
                }
            }
        ],
        "representation": { "type": "text", "value": "#title #description Fields (#fields)" }
    },
    "qa": {
        "name": "qa",
        "composition": [{
            "name": "questions",
            "keyword": "Questions",
            "position": 1,
            "attribute": {
                "question": {
                    "name": "question", "type": "string",
                    "multiple": { "type": "array", "min": 1 }
                }
            },
            "representation": { "type": "text", "value": "$keyword [#question]" }
        }, {
            "name": "response",
            "keyword": "Response",
            "position": 2,
            "attribute": {
                "response": {
                    "name": "response", "type": "response",
                    "multiple": { "type": "array", "min": 1 },
                    "inline": true
                }
            },
            "representation": { "type": "text", "value": "$keyword [#response]" }
        }, {
            "name": "min_score",
            "keyword": "Min_score",
            "position": 3,
            "attribute": { "min_score": { "name": "min_score", "type": "double" } },
            "representation": { "type": "text", "value": "$keyword #min_score" }
        }],
        "representation": { "type": "text", "value": "$composition" }
    },
    "response": {
        "name": "response",
        "attribute": {
            "title": { "name": "title", "type": "string" },
            "score": { "name": "score", "type": "double" }
        },
        "representation": { "type": "text", "value": "#title:#score" }
    },
    "double": {
        "name": "double",
        "type": "data-type",
        "format": "[0-9]+([.][0-9]+)?"
    },
    "report": {
        "name": "report",
        "attribute": {
            "name": { "name": "name", "type": "ID" },
            "title": { "name": "title", "type": "string", "optional": true },
            "value": { "name": "value", "type": "reference", "ref": "category" },
            "chart": {
                "name": "chart", "type": "graphType",
                "multiple": { "type": "array" }
            }
        },
        "abstract": true,
        "extensions": ["simple_graph", "compare_graph"]
    },
    "simple_graph": {
        "name": "simple_graph",
        "keyword": "Simple",
        "base": "report",
        "representation": { "type": "text", "value": "$keyword #name #title on #value charts(#chart)" }
    },
    "compare_graph": {
        "name": "compare_graph",
        "keyword": "Compare",
        "base": "report",
        "attribute": { "reference": { "name": "reference", "type": "IDREF", "ref": "category" } },
        "representation": {
            "type": "text",
            "value": "$keyword #name #title on #value with #reference charts(#chart)"
        }
    },
    "category": {
        "name": "category",
        "attribute": {
            "name": { "name": "name", "type": "ID" },
            "title": { "name": "title", "type": "string", "optional": true },
            "mandatory": { "name": "mandatory", "type": "boolean", "representation": { "value": "*" }, "value": true },
            "numberOfValues": {
                "name": "numberOfValues", "type": "integer", "optional": true, "value": "1",
                "representation": { "type": "text", "value": "[$val]" }
            },
            "subCategory": {
                "name": "subCategory", "type": "category", "optional": true,
                "multiple": { "type": "list" }, "inline": false,
                "representation": { "type": "text", "value": "{$val}" }
            }
        },
        "named_composition": [{ "name": "subCategory", "type": "category", "multiple": true }],
        "abstract": true,
        "extensions": ["freeCategory", "staticCategory", "independantDynamicCategory", "dependantDynamicCategory"]
    },
    "freeCategory": {
        "name": "freeCategory",
        "keyword": "Simple",
        "base": "category",
        "attribute": {
            "type": { "name": "type", "type": "simpleType", "value": "string" },
            "max_char": {
                "name": "max_char", "type": "integer", "optional": true,
                "representation": { "type": "text", "value": "($val)" }
            },
            "pattern": {
                "name": "pattern", "type": "string", "optional": true,
                "representation": { "type": "text", "value": "style($val)" }
            },
            "initial_value": {
                "name": "initial_value", "type": "string", "optional": true,
                "representation": { "type": "text", "value": "= [$val]" }
            }
        },
        "representation": {
            "type": "text",
            "value": "$keyword #name #title #mandatory #numberOfValues : #type #max_char #pattern #initial_value #subCategory"
        }
    },
    "staticCategory": {
        "name": "staticCategory",
        "keyword": "List",
        "base": "category",
        "attribute": {
            "values": {
                "name": "values", "type": "string",
                "multiple": { "type": "list" }
            }
        },
        "representation": {
            "type": "text",
            "value": "$keyword #name #title #mandatory #numberOfValues = [#values] #subCategory"
        }
    },
    "independantDynamicCategory": {
        "name": "independantDynamicCategory",
        "keyword": "DynamicList",
        "base": "category",
        "attribute": {
            "reference_name": { "name": "reference_name", "type": "string", "optional": true },
            "initial_values": {
                "name": "initial_values", "type": "string",
                "multiple": { "type": "list" }, "optional": true,
                "representation": { "type": "text", "value": "= [$val]" }
            }
        },
        "representation": {
            "type": "text",
            "value": "$keyword #name #title #mandatory #numberOfValues #reference_name #initial_values #subCategory"
        }
    },
    "dependantDynamicCategory": {
        "name": "dependantDynamicCategory",
        "keyword": "DynamicList",
        "base": "category",
        "attribute": { "depends_on": { "name": "depends_on", "type": "IDREF", "ref": "category" } },
        "representation": {
            "type": "text",
            "value": "$keyword #name #title #mandatory #numberOfValues depends on #depends_on #subCategory"
        }
    },
    "simpleType": {
        "name": "simpleType",
        "type": "enum",
        "values": {
            "bool": "bool",
            "date": "date",
            "int": "int",
            "real": "real",
            "string": "string",
            "text": "text"
        }
    },
    "assignmentMode": {
        "name": "assignmentMode",
        "base": "string",
        "values": {
            "info": "Info",
            "normal": "Normal",
            "veto": "Veto"
        }
    },
    "conflictType": {
        "name": "conflictType",
        "base": "string",
        "values": {
            "exclusionCriteria": {
                "projection": { "type": "text", "layout": "Criteria" }
            },
            "includeExclude": "Decision"
        }
    },
    "conflictResolution": {
        "name": "conflictResolution",
        "base": "string",
        "values": ["majority", "unanimity"]
    },
    "graphType": {
        "name": "graphType",
        "type": "enum",
        "values": ["bar", "line", "pie"]
    },
    "field": {
        "name": "field",
        "type": "enum",
        "values": ["abstract", "bibtex", "link", "preview", "title"]
    },
    "@root": "project",
    "@config": {
        "language": "ReLiS",
        "settings": {
            "autosave": true
        },
        "style": {
            "attribute": {
                "inline": true,
                "spacing": { "before": "2px", "after": "2px" }
            },
            "component": {
                "inline": false,
                "size": { "width": "FIT_CONTENT", },
                "spacing": { "before": "5px", "after": "5px" },
                "corner": {  },
                "background": "#f0f0f0",
            },
        }
    },
};