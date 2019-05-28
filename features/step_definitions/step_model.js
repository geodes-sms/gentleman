const { Given, When, Then } = require('cucumber');
const { expect } = require('chai');
const { HELPER: _ } = require('@utils');
const { MetaModel: MM } = require('@src/model');
const { Exception } = require('@src/exception');

var metamodel = {
    "project": {
        "name": "project",
        "attr": {
            "short_name": { "name": "short_name", "type": "ID" },
            "name": { "name": "name", "type": "string" }
        },
        "composition": [
            {
                "name": "Screening section",
                "position": 1,
                "optional": true,
                "attr": {
                    "screen_action": { "name": "screen_action", "type": "ID", "optional": true },
                    "screening": {
                        "name": "screening", "type": "screening",
                        "multiple": { "type": "list" }
                    }
                },
                "representation": {
                    "type": "text",
                    "k1": { "type": "keyword", "val": "SCREENING" },
                    "val": "$k1 #screen_action #screening"
                }
            },
            {
                "name": "Question/Answer section",
                "position": 2,
                "optional": true,
                "attr": {
                    "qa_action": { "name": "qa_action", "type": "ID", "optional": true },
                    "quality_assess": {
                        "name": "quality_assess", "type": "qa",
                        "multiple": { "type": "list", "min": 0 }
                    }
                },
                "representation": {
                    "type": "text",
                    "k1": { "type": "keyword", "val": "QA" },
                    "val": "$k1 #qa_action #quality_assess"
                }
            },
            {
                "name": "Data extraction section",
                "position": 3,
                "attr": {
                    "class_action": { "name": "class_action", "type": "ID", "optional": true },
                    "category": {
                        "name": "category", "type": "category",
                        "multiple": { "type": "array", "min": 1 }, "inline": false, "separator": ""
                    }
                },
                "representation": {
                    "type": "text",
                    "k1": { "type": "keyword", "val": "DATA EXTRACTION" },
                    "val": "$k1 #class_action #category"
                }
            },
            {
                "name": "Report section",
                "keyword": "",
                "position": 4,
                "optional": true,
                "attr": {
                    "reporting": {
                        "name": "reporting", "type": "report",
                        "multiple": { "type": "list" }, "inline": false
                    }
                },
                "representation": {
                    "type": "text",
                    "k1": { "type": "keyword", "val": "SYNTHESIS" },
                    "val": "$k1 #reporting"
                }
            }
        ],
        "representation": {
            "type": "text",
            "k1": { "type": "keyword", "val": "PROJECT" },
            "val": "$k1 #short_name #name $composition"
        }
    },
    "screening": {
        "name": "screening",
        "composition": [{
            "name": "reviews",
            "keyword": "Reviews",
            "position": 1,
            "attr": { "review_per_paper": { "name": "review_per_paper", "type": "integer", "val": "2" } },
            "representation": { "type": "text", "val": "$keyword #review_per_paper" }
        }, {
            "name": "conflict",
            "keyword": "Conflict",
            "position": 2,
            "attr": {
                "conflict_type": { "name": "conflict_type", "type": "conflictType" },
                "conflict_resolution": { "name": "conflict_resolution", "type": "conflictResolution", "val": "unanimity" }
            },
            "representation": { "type": "text", "val": "$keyword on #conflict_type resolved by #conflict_resolution" }
        }, {
            "name": "criteria",
            "keyword": "Criteria",
            "position": 3,
            "attr": {
                "exclusion_criteria": {
                    "name": "exclusion_criteria", "type": "string",
                    "multiple": { "type": "list", "min": 1 }
                }
            },
            "representation": { "type": "text", "val": "$keyword = [#exclusion_criteria]" }
        }, {
            "name": "sources",
            "keyword": "Sources",
            "position": 4,
            "optional": true,
            "attr": {
                "source_papers": {
                    "name": "source_papers", "type": "string",
                    "multiple": { "type": "list" }
                }
            },
            "representation": { "type": "text", "val": "$keyword = [#source_papers]" }
        }, {
            "name": "strategies",
            "keyword": "Strategies",
            "position": 5,
            "optional": true,
            "attr": {
                "search_strategy": {
                    "name": "search_strategy", "type": "string",
                    "multiple": { "type": "list" }
                }
            },
            "representation": { "type": "text", "val": "$keyword = [#search_strategy]" }
        }, {
            "name": "validation",
            "keyword": "Validation",
            "position": 6,
            "optional": true,
            "attr": {
                "validation_percentage": { "name": "validation_percentage", "type": "integer", "val": "20", "min": 0, "max": 100 },
                "validation_assignment_mode": { "name": "validation_assignment_mode", "type": "assignmentMode", "val": "normal", "optional": true }
            },
            "representation": { "type": "text", "val": "$keyword #validation_percentage% #validation_assignment_mode" }
        }, {
            "name": "phases",
            "keyword": "Phases",
            "position": 7,
            "optional": true,
            "attr": {
                "phases": {
                    "name": "phases", "type": "phase",
                    "multiple": { "type": "list" },
                    "inline": false
                }
            },
            "representation": { "type": "text", "val": "$keyword #phases" }
        }],
        "representation": { "type": "text", "val": "$composition" }
    },
    "phase": {
        "name": "phase",
        "attr": {
            "title": { "name": "title", "type": "string" },
            "description": { "name": "description", "type": "string", "optional": true },
            "fields": {
                "name": "fields", "type": "field",
                "multiple": { "type": "list", "separator": ',' }
            }
        },
        "representation": { "type": "text", "val": "#title #description Fields (#fields)" }
    },
    "qa": {
        "name": "qa",
        "composition": [{
            "name": "questions",
            "keyword": "Questions",
            "position": 1,
            "attr": {
                "question": {
                    "name": "question", "type": "string",
                    "multiple": { "type": "array", "min": 1 }
                }
            },
            "representation": { "type": "text", "val": "$keyword [#question]" }
        }, {
            "name": "response",
            "keyword": "Response",
            "position": 2,
            "attr": {
                "response": {
                    "name": "response", "type": "response",
                    "multiple": { "type": "array", "min": 1 },
                    "inline": true
                }
            },
            "representation": { "type": "text", "val": "$keyword [#response]" }
        }, {
            "name": "min_score",
            "keyword": "Min_score",
            "position": 3,
            "attr": { "min_score": { "name": "min_score", "type": "double" } },
            "representation": { "type": "text", "val": "$keyword #min_score" }
        }],
        "representation": { "type": "text", "val": "$composition" }
    },
    "response": {
        "name": "response",
        "attr": {
            "title": { "name": "title", "type": "string" },
            "score": { "name": "score", "type": "double" }
        },
        "representation": { "type": "text", "val": "#title:#score" }
    },
    "double": {
        "name": "double",
        "type": "data-type",
        "format": "[0-9]+([.][0-9]+)?"
    },
    "report": {
        "name": "report",
        "attr": {
            "name": { "name": "name", "type": "ID" },
            "title": { "name": "title", "type": "string", "optional": true },
            "value": { "name": "value", "type": "IDREF", "ref": "category" },
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
        "representation": { "type": "text", "val": "$keyword #name #title on #value charts(#chart)" }
    },
    "compare_graph": {
        "name": "compare_graph",
        "keyword": "Compare",
        "base": "report",
        "attr": { "reference": { "name": "reference", "type": "IDREF", "ref": "category" } },
        "representation": {
            "type": "text",
            "val": "$keyword #name #title on #value with #reference charts(#chart)"
        }
    },
    "category": {
        "name": "category",
        "attr": {
            "name": { "name": "name", "type": "ID" },
            "title": { "name": "title", "type": "string", "optional": true },
            "mandatory": { "name": "mandatory", "type": "boolean", "representation": { "val": "*" }, "val": true },
            "numberOfValues": {
                "name": "numberOfValues", "type": "integer", "optional": true, "val": "1",
                "representation": { "type": "text", "val": "[$val]" }
            },
            "subCategory": {
                "name": "subCategory", "type": "category", "optional": true,
                "multiple": { "type": "list" }, "inline": false,
                "representation": { "type": "text", "val": "{$val}" }
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
        "attr": {
            "type": { "name": "type", "type": "simpleType", "val": "string" },
            "max_char": {
                "name": "max_char", "type": "integer", "optional": true,
                "representation": { "type": "text", "val": "($val)" }
            },
            "pattern": {
                "name": "pattern", "type": "string", "optional": true,
                "representation": { "type": "text", "val": "style($val)" }
            },
            "initial_value": {
                "name": "initial_value", "type": "string", "optional": true,
                "representation": { "type": "text", "val": "= [$val]" }
            }
        },
        "representation": {
            "type": "text",
            "val": "$keyword #name #title #mandatory #numberOfValues : #type #max_char #pattern #initial_value #subCategory"
        }
    },
    "staticCategory": {
        "name": "staticCategory",
        "keyword": "List",
        "base": "category",
        "attr": {
            "values": {
                "name": "values", "type": "string",
                "multiple": { "type": "list" }
            }
        },
        "representation": {
            "type": "text",
            "val": "$keyword #name #title #mandatory #numberOfValues = [#values] #subCategory"
        }
    },
    "independantDynamicCategory": {
        "name": "independantDynamicCategory",
        "keyword": "DynamicList",
        "base": "category",
        "attr": {
            "reference_name": { "name": "reference_name", "type": "string", "optional": true },
            "initial_values": {
                "name": "initial_values", "type": "string",
                "multiple": { "type": "list" }, "optional": true,
                "representation": { "type": "text", "val": "= [$val]" }
            }
        },
        "representation": {
            "type": "text",
            "val": "$keyword #name #title #mandatory #numberOfValues #reference_name #initial_values #subCategory"
        }
    },
    "dependantDynamicCategory": {
        "name": "dependantDynamicCategory",
        "keyword": "DynamicList",
        "base": "category",
        "attr": { "depends_on": { "name": "depends_on", "type": "IDREF", "ref": "category" } },
        "representation": {
            "type": "text",
            "val": "$keyword #name #title #mandatory #numberOfValues depends on #depends_on #subCategory"
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
        "type": "enum",
        "values": {
            "info": "Info",
            "normal": "Normal",
            "veto": "Veto"
        }
    },
    "conflictType": {
        "name": "conflictType",
        "type": "enum",
        "values": {
            "exclusionCriteria": "Criteria",
            "includeExclude": "Decision"
        }
    },
    "conflictResolution": {
        "name": "conflictResolution",
        "type": "enum",
        "values": {
            "majority": "Majority",
            "unanimity": "Unanimity"
        }
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
        }
    },
    "@resources": ["relis.css"]
};

const GRAMMAR_WITHOUT_ROOT = {
    "project": {
        "name": "project",
        "attr": {
            "short_name": { "name": "short_name", "type": "ID" },
            "name": { "name": "name", "type": "string" }
        },
        "composition": [
            {
                "name": "Screening section",
                "position": 1,
                "optional": true,
                "attr": {
                    "screen_action": { "name": "screen_action", "type": "ID", "optional": true },
                    "screening": {
                        "name": "screening", "type": "screening",
                        "multiple": { "type": "list" }
                    }
                },
                "representation": {
                    "type": "text",
                    "k1": { "type": "keyword", "val": "SCREENING" },
                    "val": "$k1 #screen_action #screening"
                }
            },
            {
                "name": "Question/Answer section",
                "position": 2,
                "optional": true,
                "attr": {
                    "qa_action": { "name": "qa_action", "type": "ID", "optional": true },
                    "quality_assess": {
                        "name": "quality_assess", "type": "qa",
                        "multiple": { "type": "list", "min": 0 }
                    }
                },
                "representation": {
                    "type": "text",
                    "k1": { "type": "keyword", "val": "QA" },
                    "val": "$k1 #qa_action #quality_assess"
                }
            },
            {
                "name": "Data extraction section",
                "position": 3,
                "attr": {
                    "class_action": { "name": "class_action", "type": "ID", "optional": true },
                    "category": {
                        "name": "category", "type": "category",
                        "multiple": { "type": "array", "min": 1 }, "inline": false, "separator": ""
                    }
                },
                "representation": {
                    "type": "text",
                    "k1": { "type": "keyword", "val": "DATA EXTRACTION" },
                    "val": "$k1 #class_action #category"
                }
            },
            {
                "name": "Report section",
                "keyword": "",
                "position": 4,
                "optional": true,
                "attr": {
                    "reporting": {
                        "name": "reporting", "type": "report",
                        "multiple": { "type": "list" }, "inline": false
                    }
                },
                "representation": {
                    "type": "text",
                    "k1": { "type": "keyword", "val": "SYNTHESIS" },
                    "val": "$k1 #reporting"
                }
            }
        ],
        "representation": {
            "type": "text",
            "k1": { "type": "keyword", "val": "PROJECT" },
            "val": "$k1 #short_name #name $composition"
        }
    },
    "screening": {
        "name": "screening",
        "composition": [{
            "name": "reviews",
            "keyword": "Reviews",
            "position": 1,
            "attr": { "review_per_paper": { "name": "review_per_paper", "type": "integer", "val": "2" } },
            "representation": { "type": "text", "val": "$keyword #review_per_paper" }
        }, {
            "name": "conflict",
            "keyword": "Conflict",
            "position": 2,
            "attr": {
                "conflict_type": { "name": "conflict_type", "type": "conflictType" },
                "conflict_resolution": { "name": "conflict_resolution", "type": "conflictResolution", "val": "unanimity" }
            },
            "representation": { "type": "text", "val": "$keyword on #conflict_type resolved by #conflict_resolution" }
        }, {
            "name": "criteria",
            "keyword": "Criteria",
            "position": 3,
            "attr": {
                "exclusion_criteria": {
                    "name": "exclusion_criteria", "type": "string",
                    "multiple": { "type": "list", "min": 1 }
                }
            },
            "representation": { "type": "text", "val": "$keyword = [#exclusion_criteria]" }
        }, {
            "name": "sources",
            "keyword": "Sources",
            "position": 4,
            "optional": true,
            "attr": {
                "source_papers": {
                    "name": "source_papers", "type": "string",
                    "multiple": { "type": "list" }
                }
            },
            "representation": { "type": "text", "val": "$keyword = [#source_papers]" }
        }, {
            "name": "strategies",
            "keyword": "Strategies",
            "position": 5,
            "optional": true,
            "attr": {
                "search_strategy": {
                    "name": "search_strategy", "type": "string",
                    "multiple": { "type": "list" }
                }
            },
            "representation": { "type": "text", "val": "$keyword = [#search_strategy]" }
        }, {
            "name": "validation",
            "keyword": "Validation",
            "position": 6,
            "optional": true,
            "attr": {
                "validation_percentage": { "name": "validation_percentage", "type": "integer", "val": "20", "min": 0, "max": 100 },
                "validation_assignment_mode": { "name": "validation_assignment_mode", "type": "assignmentMode", "val": "normal", "optional": true }
            },
            "representation": { "type": "text", "val": "$keyword #validation_percentage% #validation_assignment_mode" }
        }, {
            "name": "phases",
            "keyword": "Phases",
            "position": 7,
            "optional": true,
            "attr": {
                "phases": {
                    "name": "phases", "type": "phase",
                    "multiple": { "type": "list" },
                    "inline": false
                }
            },
            "representation": { "type": "text", "val": "$keyword #phases" }
        }],
        "representation": { "type": "text", "val": "$composition" }
    },
    "phase": {
        "name": "phase",
        "attr": {
            "title": { "name": "title", "type": "string" },
            "description": { "name": "description", "type": "string", "optional": true },
            "fields": {
                "name": "fields", "type": "field",
                "multiple": { "type": "list", "separator": ',' }
            }
        },
        "representation": { "type": "text", "val": "#title #description Fields (#fields)" }
    },
    "qa": {
        "name": "qa",
        "composition": [{
            "name": "questions",
            "keyword": "Questions",
            "position": 1,
            "attr": {
                "question": {
                    "name": "question", "type": "string",
                    "multiple": { "type": "array", "min": 1 }
                }
            },
            "representation": { "type": "text", "val": "$keyword [#question]" }
        }, {
            "name": "response",
            "keyword": "Response",
            "position": 2,
            "attr": {
                "response": {
                    "name": "response", "type": "response",
                    "multiple": { "type": "array", "min": 1 },
                    "inline": true
                }
            },
            "representation": { "type": "text", "val": "$keyword [#response]" }
        }, {
            "name": "min_score",
            "keyword": "Min_score",
            "position": 3,
            "attr": { "min_score": { "name": "min_score", "type": "double" } },
            "representation": { "type": "text", "val": "$keyword #min_score" }
        }],
        "representation": { "type": "text", "val": "$composition" }
    },
    "response": {
        "name": "response",
        "attr": {
            "title": { "name": "title", "type": "string" },
            "score": { "name": "score", "type": "double" }
        },
        "representation": { "type": "text", "val": "#title:#score" }
    },
    "double": {
        "name": "double",
        "type": "data-type",
        "format": "[0-9]+([.][0-9]+)?"
    },
    "report": {
        "name": "report",
        "attr": {
            "name": { "name": "name", "type": "ID" },
            "title": { "name": "title", "type": "string", "optional": true },
            "value": { "name": "value", "type": "IDREF", "ref": "category" },
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
        "representation": { "type": "text", "val": "$keyword #name #title on #value charts(#chart)" }
    },
    "compare_graph": {
        "name": "compare_graph",
        "keyword": "Compare",
        "base": "report",
        "attr": { "reference": { "name": "reference", "type": "IDREF", "ref": "category" } },
        "representation": {
            "type": "text",
            "val": "$keyword #name #title on #value with #reference charts(#chart)"
        }
    },
    "category": {
        "name": "category",
        "attr": {
            "name": { "name": "name", "type": "ID" },
            "title": { "name": "title", "type": "string", "optional": true },
            "mandatory": { "name": "mandatory", "type": "boolean", "representation": { "val": "*" }, "val": true },
            "numberOfValues": {
                "name": "numberOfValues", "type": "integer", "optional": true, "val": "1",
                "representation": { "type": "text", "val": "[$val]" }
            },
            "subCategory": {
                "name": "subCategory", "type": "category", "optional": true,
                "multiple": { "type": "list" }, "inline": false,
                "representation": { "type": "text", "val": "{$val}" }
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
        "attr": {
            "type": { "name": "type", "type": "simpleType", "val": "string" },
            "max_char": {
                "name": "max_char", "type": "integer", "optional": true,
                "representation": { "type": "text", "val": "($val)" }
            },
            "pattern": {
                "name": "pattern", "type": "string", "optional": true,
                "representation": { "type": "text", "val": "style($val)" }
            },
            "initial_value": {
                "name": "initial_value", "type": "string", "optional": true,
                "representation": { "type": "text", "val": "= [$val]" }
            }
        },
        "representation": {
            "type": "text",
            "val": "$keyword #name #title #mandatory #numberOfValues : #type #max_char #pattern #initial_value #subCategory"
        }
    },
    "staticCategory": {
        "name": "staticCategory",
        "keyword": "List",
        "base": "category",
        "attr": {
            "values": {
                "name": "values", "type": "string",
                "multiple": { "type": "list" }
            }
        },
        "representation": {
            "type": "text",
            "val": "$keyword #name #title #mandatory #numberOfValues = [#values] #subCategory"
        }
    },
    "independantDynamicCategory": {
        "name": "independantDynamicCategory",
        "keyword": "DynamicList",
        "base": "category",
        "attr": {
            "reference_name": { "name": "reference_name", "type": "string", "optional": true },
            "initial_values": {
                "name": "initial_values", "type": "string",
                "multiple": { "type": "list" }, "optional": true,
                "representation": { "type": "text", "val": "= [$val]" }
            }
        },
        "representation": {
            "type": "text",
            "val": "$keyword #name #title #mandatory #numberOfValues #reference_name #initial_values #subCategory"
        }
    },
    "dependantDynamicCategory": {
        "name": "dependantDynamicCategory",
        "keyword": "DynamicList",
        "base": "category",
        "attr": { "depends_on": { "name": "depends_on", "type": "IDREF", "ref": "category" } },
        "representation": {
            "type": "text",
            "val": "$keyword #name #title #mandatory #numberOfValues depends on #depends_on #subCategory"
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
        "type": "enum",
        "values": {
            "info": "Info",
            "normal": "Normal",
            "veto": "Veto"
        }
    },
    "conflictType": {
        "name": "conflictType",
        "type": "enum",
        "values": {
            "exclusionCriteria": "Criteria",
            "includeExclude": "Decision"
        }
    },
    "conflictResolution": {
        "name": "conflictResolution",
        "type": "enum",
        "values": {
            "majority": "Majority",
            "unanimity": "Unanimity"
        }
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
    "@config": {
        "language": "ReLiS",
        "settings": {
            "autosave": true
        }
    },
    "@resources": ["relis.css"]
};

Given('a grammar', function () {
    this.metamodel = metamodel;
});
When('I try to create a metamodel', function () {
    this.model = MM.create(this.metamodel);
});
Then('I should get an instance of MetaModel', function () {
    expect(MM.isPrototypeOf(this.model)).to.be.true;
});

Given('a model', function () {
    this.metamodel = MM.create(metamodel);
});
When('I try to initialize a model', function () {
    const KEY_ROOT = '@root';
    let root = metamodel[KEY_ROOT];
    this.model = this.metamodel.init({ root: JSON.parse(JSON.stringify(metamodel[root])) });
});
Then('I should get an instance of Model with the model property set', function () {
    expect(MM.isPrototypeOf(this.model)).to.be.true;
    expect(this.model).to.have.ownProperty('root');
});

Given('a grammar without a root', function(){
    this.metamodel = MM.create(GRAMMAR_WITHOUT_ROOT);
});
When('I try to create a model', function () {
    try {
        this.result = this.metamodel.createModel();    
    } catch (error) {
        this.result = error;
    } 
});
Then('I should get an error', function () {
    expect(Exception.InvalidModelError.isPrototypeOf(this.result)).to.be.true;
});

Given('a grammar with a root', function(){
    this.metamodel = MM.create(metamodel);
});
Then('I should get a model', function () {
    expect(this.result).to.have.ownProperty('root');
});