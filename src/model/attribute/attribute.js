import { isInt, isString, valOrDefault } from "@zenkai";
import { ConceptFactory } from "./factory.js";
import { createSpan, createDiv } from "@zenkai";

const COMPONENT_NOT_FOUND = -1;

export const Attribute = {
    create: function (concept, schema, args) {
        var instance = Object.create(this);
        this.concept = concept;
        this.model = concept.model;
        this.schema = schema;
        this.type = schema.type;
        this.name = schema.name;
        this._use = valOrDefault(this.schema.use, 'required');
        Object.assign(instance, args);

        return instance;
    },
    init() {
        this.initValue();

        return this;
    },
    initValue() {
        if (this.isRequired()) {
            this.value = this.model.createConcept(this.type);
            this.value.parent = this;
        }
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
    type: null,
    /** @type {*} */
    value: null,
    /** @type {string} */
    path: null,
    projection: null,
    representation: null,
    container: null,

    isRequired() { return this._use === 'required'; },
    isOptional() { return this._use === 'optional'; },

    render() {
        this.container = null;
        if (Array.isArray(this.value)) {
            return this.value.forEach((item) => item.render());
        } else {
            return this.value.render();
        }
        // if (this.model.metamodel.isElement(this.type)) {
        //     this.container = createDiv({ class: 'wrapper' });
        //     let inherentConcept = this.model.createConcept(this.type);
        //     this.container.appendChild(inherentConcept.render());
        // } else {
        //     this.container = createSpan({ class: 'wrapper' });
        //     let field = Field.create({ _mAttribute: this.schema });
        //     // this.editor.registerField(field);
        //     this.container.appendChild(field.createInput());
        // }
        //this.container.appendChild(this.projection.render());
    },
};