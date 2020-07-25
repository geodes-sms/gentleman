import { isString, valOrDefault, hasOwn, isNullOrUndefined, isIterable, isEmpty, isFunction, isObject, isNullOrWhitespace } from "zenkai";
import { AttributeHandler, ComponentHandler, ObserverHandler } from "@structure/index.js";


const _Concept = {
    /**
     * Creates a concept
     * @param {Model} args 
     * @param {*} schema 
     * @returns {Concept}
     */
    create(model, schema) {
        const instance = Object.create(this);

        instance.model = model;
        instance.metamodel = model.metamodel;
        instance.schema = schema;

        instance.references = [];

        return instance;
    },

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
    /** @type {string} */
    refname: null,
    /** @type {string} */
    reftype: null,
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
    /** Object nature */
    object: "concept",
    kind: "concept",

    init(args = {}) {
        this.accept = args.accept;
        this.parent = args.parent;
        this.refname = args.refname;
        this.reftype = args.reftype;
        this.values = valOrDefault(args.values, valOrDefault(this.schema.values, []));
        this.alias = valOrDefault(args.alias, this.schema.alias);
        this.description = valOrDefault(args.description, this.schema.description);
        this.min = valOrDefault(args.min, 1);

        if (args.projection) {
            this.schema.projection = args.projection;
        }

        this.initObserver();
        this.initAttribute();
        this.initComponent();
        this.initValue(args.value);

        if (isFunction(this.init.post)) {
            this.init.post(args);
        }

        return this;
    },
    initValue() { throw new Error("This function has not been implemented"); },

    /**
     * Gets the reference name (attribute) or initial name
     * @returns {string}
     */
    getName() {
        return valOrDefault(this.refname, this.name);
    },
    /**
     * Gets the alias or the name
     * @returns {string}
     */
    getAlias() {
        return valOrDefault(this.alias, this.getName());
    },

    getAcceptedValues() {
        if (!isIterable(this.accept) && isNullOrUndefined(this.accept.type)) {
            return "";
        }

        if (isString(this.accept)) {
            return this.accept;
        }

        if (hasOwn(this.accept, "type")) {
            return this.accept.type;
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
        return [...this.listAttributes(), ...this.listComponents()];
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

        var parent = this.parent;

        while (parent) {
            if (parent.name === name) {
                return parent;
            }

            parent = parent.getParent();
        }

        return null;
    },
    /**
     * Gets the concept ancestor
     * @param {string} [name]
     * @returns {Concept[]}
     */
    getAncestor(name) {
        if (this.isRoot()) {
            return null;
        }

        const parents = [];

        var parent = this.parent;

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
            this.getComponents().forEach(comp => {
                children.push(...comp.getChildren());
            });
        } else {
            this.getAttributes().forEach(attr => {
                if (attr.target.name === name) {
                    children.push(...attr.target);
                } else {
                    children.push(...attr.target.getChildren(name));
                }
            });
            this.getComponents().forEach(comp => {
                console.log(comp);
                children.push(...comp.getChildren(name));
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
            descendants.push(...children);
            children.forEach(child => {
                descendants.push(child.getDescendant(name));
            });
        });

        return descendants;
    },

    /**
     * Verifies that a child concept can be deleted
     * @param {string} name 
     * @returns {boolean}
     */
    canDelete(name) {
        if (isNullOrUndefined(name)) {
            return isEmpty(this.references) && this.getParent().canDelete(this.refname);
        }

        return !this.isAttributeRequired(name);
    },
    /**
     * Removes a child concept
     * @param {Concept} concept 
     * @returns {boolean} Value indicating the success of the operation
     */
    remove(concept) {
        var result = this.removeAttribute(concept.refname);

        return result;
    },
    delete() {
        var result = this.getParent().remove(this);
        if (!result.success) {
            return result;
        }

        this.model.removeConcept(this.id);

        this.notify("delete");

        return {
            message: `The concept '${name}' was successfully deleted.`,
            success: true,
        };
    },

    /** @returns {boolean} */
    isRoot() {
        return this.parent === null;
    },

    export() {
        var output = {
            id: this.id,
            name: this.name
        };

        this.attributes.forEach(attr => {
            Object.assign(output, attr.export());
        });

        this.components.forEach(comp => {
            Object.assign(output, comp.export());
        });

        return output;
    },
    toString() {
        var output = {};

        this.attributes.forEach(attr => {
            Object.assign(output, attr.toString());
        });
        this.components.forEach(comp => {
            Object.assign(output, {
                // [`${comp.name}@component`]: comp.toString()
                [`component.${comp.name}`]: comp.toString()
            });
        });

        return output;
    },
};

export const Concept = Object.assign(
    _Concept,
    ObserverHandler,
    AttributeHandler,
    ComponentHandler
);


Object.defineProperty(Concept, 'attributeSchema', { get() { return this.schema.attribute; } });
Object.defineProperty(Concept, 'componentSchema', { get() { return this.schema.component; } });