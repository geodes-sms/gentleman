import { isString, valOrDefault, hasOwn, isNullOrUndefined, isIterable, isObject, isNullOrWhitespace } from "zenkai";
import { AttributeHandler, ObserverHandler } from "@structure/index.js";


const _Concept = {
    /** Reference to parent model */
    model: null,
    /** Cache of the schema describing the concept */
    schema: null,
    /** Link to the concept data source */
    source: null,
    /** @type {int} */
    id: null,
    /** @type {string} */
    name: null,
    /** @type {string} */
    description: null,
    /** @type {string} */
    alias: null,
    /** @type {*} */
    ref: null,
    /** @type {string[]} */
    actions: null,
    /** @type {string[]} */
    operations: null,
    /** @type {string[]} */
    accept: null,
    /** @type {Concept} */
    parent: null,
    /** @type {int[]} */
    references: null,
    /** Concept value */
    value: null,
    /** Possible values for the concept */
    values: null,
    /** Concept actions configuration */
    action: null,
    /** Concept shadow list */
    shadows: null,
    /** Concept value history list */
    history: null,
    kind: "concept",

    init(args = {}) {
        this.accept = args.accept;
        this.parent = args.parent;
        this.ref = args.ref;
        this.values = valOrDefault(args.values, valOrDefault(this.schema.values, []));
        this.alias = valOrDefault(args.alias, this.schema.alias);
        this.description = valOrDefault(args.description, this.schema.description);
        this.min = valOrDefault(args.min, valOrDefault(this.schema.min, 1));
        this.max = valOrDefault(args.max, this.schema.max);


        this.initObserver();
        this.initAttribute();
        this.initValue(args.value);

        return this;
    },
    initValue() { throw new Error("This function has not been implemented"); },

    /**
     * Gets the reference name (attribute) or initial name
     * @returns {string}
     */
    getName() {
        return valOrDefault(this.ref.name, this.name);
    },
    /**
     * Gets the alias or the name
     * @returns {string}
     */
    getAlias() {
        return valOrDefault(this.alias, this.getName());
    },

    getAcceptedValues() {
        if (!isIterable(this.accept) && isNullOrUndefined(this.accept.name)) {
            return "";
        }

        if (isString(this.accept)) {
            return this.accept;
        }

        if (hasOwn(this.accept, "name")) {
            return this.accept.name;
        }

        if (Array.isArray(this.accept)) {
            return this.accept.map(accept => this.getAcceptedValues.call({ accept: accept })).join(" or ");
        }
    },
    getCandidates() {
        this.values.forEach(value => {
            if (isObject(value)) {
                value.type = "value";
            }
        });

        return this.values;
    },
    getStructure() {
        return [...this.listAttributes()];
    },
    /**
     * Gets the value of a build property
     * @param {string} prop 
     */
    getBuildProperty(prop) {
        const { build } = this.schema;

        if (isNullOrUndefined(build) || !hasOwn(build, prop)) {
            return null;
        }

        return build[prop];
    },
    /**
     * Gets the value of a property
     * @param {string} prop 
     */
    getProperty(prop) {
        if (prop === "name") {
            return this.getName();
        }

        return this.schema[prop];
    },

    /**
     * Returns a value indicating whether the concept has a parent
     * @returns {boolean}
     */
    hasParent() {
        return !this.isRoot();
    },
    /**
     * Gets the concept parent if exist
     * @param {string} [name]
     * @returns {Concept}
     */
    getParent(name) {
        if (this.isRoot()) {
            return null;
        }

        if (isNullOrWhitespace(name)) {
            return this.parent;
        }

        const parent = this.parent;

        if (parent.name === name) {
            return parent;
        }

        return parent.getParent(name);
    },
    /**
     * Gets the concept parent if exist
     * @param {string} [name]
     * @returns {Concept}
     */
    getParentWith(prototype) {
        if (this.isRoot()) {
            return null;
        }

        if (isNullOrWhitespace(prototype)) {
            return this.parent;
        }

        const parent = this.parent;

        if (parent.hasPrototype(prototype)) {
            return parent;
        }

        return parent.getParentWith(prototype);
    },
    hasPrototype(name) {
        var prototype = this.model.getConceptSchema(this.schema.prototype);

        while (!isNullOrUndefined(prototype)) {
            if (prototype.name === name) {
                return true;
            }

            let schema = this.model.getConceptSchema(prototype);

            if (schema) {
                prototype = schema['prototype'];
            } else {
                prototype = null;
            }
        }

        return false;
    },
    /**
     * Gets the concept ancestor
     * @param {string} [name]
     * @returns {Concept[]}
     */
    getAncestor(name) {
        const parents = [];

        var parent = this.getParent(name);

        while (parent) {
            parents.push(parent);
            parent = parent.getParent(name);
        }

        return parents;
    },
    /**
     * Gets the children of parent
     * @param {string} [name]
     * @returns {Concept}
     */
    getChildren(name) {
        const children = [];

        if (isNullOrUndefined(name)) {
            this.getAttributes().forEach(attr => {
                children.push(attr.target);
            });
        } else {
            this.getAttributes().forEach(attr => {
                if (attr.target.name === name) {
                    children.push(...attr.target);
                } else {
                    children.push(...attr.target.getChildren(name));
                }
            });
        }

        return children;
    },
    /**
     * Gets the descendants of a concept
     * @param {string} [name]
     * @returns {Concept}
     */
    getDescendant(name) {
        const descendants = [];

        this.getChildren(name).forEach(children => {
            descendants.push(children);
            descendants.push(...children.getDescendant(name));
        });

        return descendants;
    },

    delete(force = false) {
        if (!force) {
            const result = this.getParent().removeAttribute(this.ref.name);

            if (!result.success) {
                return result;
            }
        }

        this.getChildren().forEach(child => {
            child.delete(true);
        });

        this.model.removeConcept(this.id);

        this.notify("delete");

        return {
            message: `The concept '${name}' was successfully deleted.`,
            success: true,
        };
    },

    /** @returns {boolean} */
    isRoot() {
        return isNullOrUndefined(this.parent);
    },

    export() {
        var output = {
            id: this.id,
            root: this.isRoot(),
            name: this.name
        };

        this.getAttributes().forEach(attr => {
            Object.assign(output, attr.export());
        });

        return output;
    },
    toString() {
        var output = {};

        this.attributes.forEach(attr => {
            Object.assign(output, attr.toString());
        });

        return output;
    },
};

export const Concept = Object.assign(
    _Concept,
    ObserverHandler,
    AttributeHandler
);


Object.defineProperty(Concept, 'attributeSchema', { get() { return this.schema.attributes; } });