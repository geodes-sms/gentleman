import { isString, valOrDefault, hasOwn, isNullOrUndefined, isIterable, isEmpty } from "zenkai";
import { AttributeHandler, ComponentHandler, ObserverHandler } from "@structure/index.js";
import { ProjectionHandler } from "@projection/index.js";


const BaseConcept = {
    /**
     * Creates a concept
     * @param {Model} args 
     * @param {*} schema 
     * @returns {Concept}
     */
    create(model, schema) {
        const instance = Object.create(this);

        instance.model = model;
        if (schema) {
            instance.schema = Object.assign(valOrDefault(instance.schema, {}), schema);
        }
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

    init(args = {}) {
        this.accept = args.accept;
        this.action = valOrDefault(args.action, {});
        this.parent = args.parent;
        this.refname = args.refname;
        this.reftype = args.reftype;

        this.values = valOrDefault(args.values, this.schema.values);
        this.alias = args.alias;
        this.min = valOrDefault(args.min, 1);

        if (args.projection) {
            this.schema.projection = args.projection;
        }

        this.initObserver();
        this.initAttribute();
        this.initComponent();
        this.initValue(args.value);
        this.initProjection(valOrDefault(args.projection, this.schema.projection));

        return this;
    },
    initValue() { throw new Error("This function has not been implemented"); },

    getIdRef() { return this.schema['idref']; },
    getName() { return valOrDefault(this.refname, this.name); },
    getAlias() { return valOrDefault(this.alias, this.getName()); },

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
    getStructure() {
        return [...this.listAttributes(), ...this.listComponents()];
    },
    getConceptParent() {
        if (this.isRoot()) {
            return null;
        }

        return this.model.getConcept(this.parent);
    },
    canDelete(name) {
        if (isNullOrUndefined(name)) {
            return isEmpty(this.references) && this.getConceptParent().canDelete(this.refname);
        }

        return !this.isAttributeRequired(name);
    },
    remove(concept) {
        if (!this.removeAttribute(concept.refname)) {
            return false;
        }
        this.model.removeConcept(concept.id);

        return true;
    },
    delete() {
        if (!this.getConceptParent().remove(this)) {
            return false;
        }

        if (this.projection) {
            this.projection.remove();
        }

        return true;
    },

    /** @returns {boolean} */
    isRoot() {
        return this.parent === null;
    },

    export() {
        var output = {};

        var attributes = {};
        this.attributes.forEach(attr => {
            Object.assign(attributes, attr.export());
        });

        var components = [];
        this.components.forEach(comp => {
            components.push(comp.export());
        });

        Object.assign(output, attributes);

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
    BaseConcept,
    ObserverHandler,
    AttributeHandler,
    ComponentHandler,
    ProjectionHandler
);

Object.defineProperty(Concept, 'fullName', { get() { return `${this.name}`; } });
Object.defineProperty(Concept, 'attributeSchema', { get() { return this.schema.attribute; } });
Object.defineProperty(Concept, 'componentSchema', { get() { return this.schema.component; } });