import { valOrDefault, isFunction } from "zenkai";

export const Attribute = {
    create: function (concept, schema, args) {
        var instance = Object.create(this);
        instance.concept = concept;
        instance.model = concept.model;
        instance.schema = schema;
        instance.type = schema.type;
        instance.accept = schema.accept;
        instance.action = valOrDefault(schema.action, {});
        instance.min = valOrDefault(schema.min, 1);
        instance.name = schema.name;
        instance.projection = schema.projection;
        instance.required = valOrDefault(instance.schema.required, true);
        instance._use = valOrDefault(instance.schema.use, 'required');
        Object.assign(instance, args);

        return instance;
    },
    init() {
        this.initValue();

        return this;
    },
    initValue() {
        if (this.isRequired()) {
            let concept = this.model.createConcept(this.type);
            concept.parent = this;
            concept.accept = this.accept;
            concept.action = this.action;
            concept.validProjections  =  this.projection;
            concept.min = this.min;
            if (isFunction(concept.init)) {
                concept.init();
            }
            this.value = concept;
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
    /** @type {string} */
    accept: null,
    /** @type {*} */
    value: null,
    /** @type {string} */
    path: null,
    projection: null,
    representation: null,
    container: null,
    object: "attribute",

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
    canDelete() {
        return !this.required;
    },
    delete() {
        return this.concept.removeAttribute(this.name);
    },
    export() {
        return {
            [`${this.name}`]: this.value.export()
        };
    },
    toString() {
        return {
            [`${this.concept.name}@${this.name}`]: this.value.toString()
        };
    }
};