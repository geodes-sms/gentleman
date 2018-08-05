// This model will be received as a parameter
var MODEL = {
    statement: {
        root: true,
        keyword: "STATEMENT",
        composition: [
            {
                keyword: "SELECT",
                position: 1,
                optional: true,
                multiple: true,
                attr: {
                    columns: { type: "string", multiple: true, min: 1 },
                    table_name: { type: "from", multiple: true },
                    condition: { type: "string", optional: true, representation: { type: "text", val: "WHERE $val" } }
                },
                representation: { type: "text", val: "$keyword #columns FROM #table_name #condition;" }
            },
            {
                keyword: "UPDATE",
                position: 2,
                optional: true,
                multiple: true,
                attr: {
                    table_name: { type: "string" },
                    columns: { type: "column_name_value", multiple: true, min: 1 },
                    condition: { type: "string", optional: true, representation: { type: "text", val: "WHERE $val" } }
                },
                representation: { type: "text", val: "$keyword #table_name SET #columns #condition;" }
            },
            {
                keyword: "DELETE",
                position: 3,
                optional: true,
                multiple: true,
                attr: {
                    table_name: { type: "string" },
                    condition: { type: "string", optional: true, representation: { type: "text", val: "WHERE $val" } }
                },
                representation: { type: "text", val: "$keyword FROM #table_name #condition;" }
            }
        ],
        representation: { type: "text", val: "$keyword #id #name $composition" }
    },
    column_name_value: {
        attr: {
            column_name: { type: "string" },
            value: { type: "string" }
        },
        representation: { type: "text", val: "#column_name = #value" }
    },
    from: {
        name: "from",
        attr: {
            name: { name: "name", type: "ID" },
            // subCategory: {
            //     name: "subCategory", type: "category", multiple: true, min: 1,
            //     representation: { type: "text", val: "{$val}" }
            // }
        },
        abstract: true,
        extension: ["table_name", "innerjoin"]
    },
    innerjoin: {
        name: "innerjoin",
        base: "from",
        keyword: "INNER JOIN",
        attr: {
            table1: { name: "table1", type: "string" },
            table2: { name: "table2", type: "string" },
            col1: { name: "col1", type: "string" },
            col2: { name: "col2", type: "string" }
        },
        representation: { type: "text", val: "#table1 INNER JOIN #table2 ON #col1 = #col2" }
    },
    table_name: {
        name: "table_name",
        keyword: "table's name",
        base: "from",
        attr: {},
        representation: { type: "text", val: "#name" }
    },
    screening: {
        composition: [
            {
                keyword: "Review",
                position: 1,
                attr: [
                    { name: "review_per_page", type: "integer", val: "2" }
                ],
                representation: { type: "text", val: "$keyword #review_per_page" }
            }, {
                keyword: "Conflict",
                position: 2,
                attr: [
                    { name: "conflict_type", type: "conflictType", val: "includeExclude" },
                    { name: "conflict_resolution", type: "conflictResolution", val: "unanimity" }
                ],
                representation: { type: "text", val: "$keyword on #conflict_type resolved by #conflict_resolution" }
            }, {
                keyword: "Exclusion Criteria",
                position: 3,
                attr: [
                    { name: "exclusion_criteria", type: "string", multiple: true, val: [""] }
                ],
                representation: { type: "text", val: "$keyword = [#exclusion_criteria]" }
            }, {
                keyword: "Sources",
                position: 4,
                optional: true,
                attr: [
                    { name: "source_papers", type: "string", multiple: true }
                ],
                representation: { type: "text", val: "$keyword = [#source_papers]" }
            }, {
                keyword: "Strategies",
                position: 5,
                optional: true,
                attr: [
                    { name: "search_strategy", type: "string", multiple: true }
                ],
                representation: { type: "text", val: "$keyword = [ #search_strategy ]" }
            }, {
                keyword: "Validation",
                position: 6,
                optional: true,
                attr: [
                    { name: "validation_percentage", type: "integer", val: "20" },
                    { name: "validation_assignment_mode", type: "assignmentMode", val: "normal", optional: true }
                ],
                representation: { type: "text", val: "$keyword #validation_percentage % #validation_assignment_mode" }
            }, {
                keyword: "Phases",
                position: 7,
                optional: true,
                attr: [{ name: "phases", type: "phase", multiple: true }],
                representation: { type: "text", val: "$keyword #phases" }
            }],
        representation: { type: "text", val: "#test $composition" }
    },
    synthesis: {
        attr: [
            { name: "name", type: "ID" },
            { name: "title", type: "string", optional: true },
            { name: "value", type: "IDREF:category" },
            { name: "chart", type: "graphType", multiple: true }
        ],
        abstract: true,
        extension: ["simple_graph", "compare_graph"]
    },
    simple_graph: {
        keyword: "Simple",
        base: "synthesis",
        representation: { type: "text", val: "$keyword #name #title on #value charts(#chart)" }
    },
    compare_graph: {
        keyword: "Compare",
        base: "synthesis",
        attr: [{ name: "reference", type: "IDREF:category" }],
        representation: { type: "text", val: "$keyword #name #title on #value with #reference charts(#chart)" }
    },
    category: {
        attr: [
            { name: "name", type: "ID" },
            { name: "title", type: "string", optional: true },
            { name: "mandatory", type: "char", val: "false", representation: "*" },
            { name: "numberOfValues", type: "integer", val: "1", validation: "< 0", representation: { type: "text", val: "[$this]" } },
        ],
        composition: [{ name: "subCategory", type: "category", multiple: true }],
        abstract: true,
        extension: ["freeCategory", "staticCategory", "independantDynamicCategory", "dependantDynamicCategory"]
    },
    freeCategory: {
        keyword: "Simple",
        base: "category",
        attr: [
            { name: "type", type: "simpleType", val: "string(20)" },
            { name: "pattern", type: "string", optional: true, representation: { type: "text", val: "style($this)" } },
            { name: "initial_value", type: "string" }
        ],
        representation: { type: "text", val: "Simple #name #title #mandatory #numberOfValues : #type #pattern = [#initial_value] {$composition}" }
    },
    staticCategory: {
        keyword: "List",
        base: "category",
        attr: [
            { name: "values", type: "string", multiple: true },
        ],
        representation: { type: "text", val: "$keyword #name #title #mandatory #numberOfValues = [#values] {$composition}" }
    },
    independantDynamicCategory: {
        keyword: "DynamicList",
        base: "category",
        attr: [
            { name: "reference_name", type: "string" },
            { name: "initial_values", type: "string", multiple: true, min: 1 }
        ],
        representation: { type: "text", val: "$keyword #name #title #mandatory #numberOfValues #reference_name = #initial_values {$composition}" }
    },
    dependantDynamicCategory: {
        keyword: "DynamicList",
        base: "category",
        attr: [
            { name: "depends_on", type: "IDREF:category" }
        ],
        representation: { type: "text", val: "$keyword #name #title #mandatory #numberOfValues depends on #depends_on {$composition}" }
    },
    simpleType: {
        type: "enum",
        values: {
            bool: {
                representation: { type: "text", val: "bool" }
            },
            date: {
                attr: [{ name: "max", type: "date", optional: true, representation: { type: "text", val: "($this)" } }],
                representation: { type: "text", val: "date #max" }
            },
            int: {
                attr: [{ name: "max", type: "integer", optional: true, representation: { type: "text", val: "($this)" } }],
                representation: { type: "text", val: "int #max" }
            },
            real: {
                attr: [{ name: "max", type: "floating-point", optional: true, representation: { type: "text", val: "($this)" } }],
                representation: { type: "text", val: "real #max" }
            },
            string: {
                attr: [{ name: "max", type: "integer", optional: true, representation: { type: "text", val: "($this)" } }],
                representation: { type: "text", val: "string #max" }
            },
            text: {
                attr: [{ name: "max", type: "integer", optional: true, representation: { type: "text", val: "($this)" } }],
                representation: { type: "text", val: "text #max" }
            }
        }
    },
    assignmentMode: {
        type: "enum",
        values: {
            info: { val: "Info" },
            normal: { val: "Normal" },
            veto: { val: "Veto" }
        }
    },
    graphType: {
        bar: 1,
        line: 2,
        pie: 3,
        properties: {
            1: { val: "bar" },
            2: { val: "line" },
            3: { val: "pie" }
        }
    },
    field: {
        type: "enum",
        values: [
            { name: "abstract", val: "abstract" },
            { name: "bibtex", val: "bibtex" },
            { name: "link", val: "link" },
            { name: "preview", val: "preview" },
            { name: "title", val: "title" }
        ]
    },
    "@language": "SQL"
};

// Freeze the model to prevent changes
Object.freeze(MODEL);