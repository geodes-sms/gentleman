import { isString, valOrDefault, hasOwn, isNullOrUndefined, isIterable, defProp, isEmpty } from "zenkai";
import { AttributeHandler, ComponentHandler } from "@structure/index.js";
import { ProjectionHandler } from "@projection/index.js";


const BaseConcept = {
    /**
     * Creates a concept
     * @param {*} args 
     * @returns {Concept}
     */
    create(model, schema) {
        const instance = Object.create(this);

        instance.model = model;
        if (schema) {
            instance.schema = schema;
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
    refname: null,
    /** @type {string} */
    reftype: null,
    /** @type {string} */
    alias: null,
    /** @type {string} */
    path: null,
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
    value: null,
    /** possible values for the concept */
    values: null,
    /** concept actions configuration */
    action: null,
    /** concept shadow list */
    shadows: null,
    /** Object nature */
    object: "concept",
    init(args) {
        this.accept = args.accept;
        this.action = args.action;
        this.parent = args.parent;
        this.refname = args.refname;
        this.reftype = args.reftype;
        this.alias = args.alias;
        this.min = valOrDefault(args.min, 1);

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
        if(!this.removeAttribute(concept.refname)) {
            return false;
        }
        this.model.removeConcept(concept.id);

        return true;
    },
    delete() {
        if(!this.getConceptParent().remove(this)){
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
    AttributeHandler,
    ComponentHandler,
    ProjectionHandler
);

defProp(Concept, 'fullName', { get() { return `${this.name}`; } });
defProp(Concept, 'attributeSchema', { get() { return this.schema.attribute; } });
defProp(Concept, 'componentSchema', { get() { return this.schema.component; } });