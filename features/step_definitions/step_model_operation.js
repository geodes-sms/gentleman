const { Given, When, Then, Before } = require('cucumber');
const { expect } = require('chai');
const { MetaModel, ModelElement } = require('../../build/model');

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

Given('a metamodel', function () {
    const KEY_ROOT = '@root';
    let root = metamodel[KEY_ROOT];
    this.metamodel = MetaModel.create(metamodel).init({
        root: JSON.parse(JSON.stringify(metamodel[root]))
    });
});

Given('a source', function () {
    this.source = metamodel.project;
});
When('I try to create a model element', function () {
    this.mElement = this.metamodel.createModelElement(this.source);
});
Then('I should get an instance of ModelElement', function () {
    expect(ModelElement.isPrototypeOf(this.mElement)).to.be.true;
});
When('I try to create a model element as root', function () {
    this.mElement = this.metamodel.createModelElement(this.source, true);
});
Then('the model its root set to the newly created model element', function () {
    expect(this.metamodel).to.have.property('root', this.mElement);
});

Given('a type', function () {
    this.type = metamodel.project.name;
});
When('I try to get a model element', function () {
    this._mElement = this.metamodel.getModelElement(this.type);
});
Then('I should get the structure of the model element', function () {
    expect(this._mElement).to.deep.equal(metamodel.project);
});
When('I try to get a model missing element', function () {
    this._mElement = this.metamodel.getModelElement('missing');
});
Then('I should get undefined', function () {
    expect(this._mElement).to.be.undefined;
});

Given('that we have {int} projection(s)', function (number) {
    for (let i = 0; i < number; i++)
        this.metamodel.projections.push({});
});
When('I try to generate a new identifier', function () {
    this.id = this.metamodel.generateID();
});
Then('I should get the following identifier {string}', function (identifier) {
    expect(this.id).to.equal(identifier);
});

Given('a {string}', function (type) {
    this.type = type;
});
When('I check if it is an element', function () {
    this.isElement = this.metamodel.isElement(this.type);
});
When('I check if it is an enum', function () {
    this.isElement = this.metamodel.isEnum(this.type);
});
When(' check if it is a datatype', function () {
    this.isElement = this.metamodel.isModelDataType(this.type);
});
When('I check if it is a datatype or primitive', function () {
    this.isElement = this.metamodel.isDataType(this.type);
});
When('I check if it is has nested elements', function () {
    this.isElement = this.metamodel.hasComposition(this.type);
});
Then('I should get the following {boolean}', function (isElement) {
    expect(this.isElement).to.equal(isElement);
});

Given('an {string}', function (element) {
    this.element = metamodel[element];
});
When('I try to get the type', function () {
    this.type = this.metamodel.getModelElementType(this.element);
});
Then('I should the following type {string}', function (type) {
    expect(this.type).to.equal(type);
});