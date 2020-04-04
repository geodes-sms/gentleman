import { valOrDefault, isFunction } from "zenkai";


export const Attribute = {
    create(concept, schema, args) {
        const instance = Object.create(this);

        instance.concept = concept;
        instance.model = concept.model;
        instance.schema = schema;
        instance.alias = schema.alias;
        instance.type = schema.type;
        instance.accept = schema.accept;
        instance.action = valOrDefault(schema.action, {});
        instance.min = valOrDefault(schema.min, 1);
        instance.name = schema.name;
        instance.projection = schema.projection;
        instance.required = valOrDefault(instance.schema.required, true);

        Object.assign(instance, args);

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
    type: null,
    /** @type {string} */
    accept: null,
    /** @type {*} */
    value: null,
    /** @type {string} */
    path: null,
    projection: null,
    object: "attribute",

    init(value) {
        var concept = this.model.createConcept(this.type, {
            value: value,
            parent: this,
            accept: this.accept,
            action: this.action,
            alias: this.alias,
            customProjection: this.projection,
            min: this.min,
        });

        this.value = concept;

        return this;
    },
    render() {
        this.container = null;
        if (Array.isArray(this.value)) {
            return this.value.forEach((item) => item.render());
        } else {
            return this.value.render();
        }
    },

    canDelete() {
        return !this.required;
    },
    delete() {
        if (Array.isArray(this.value)) {
            this.value.forEach((item) => item.delete());
        } else {
            this.value.delete();
        }

        return this.concept.removeAttribute(this.name);
    },

    export() {
        return {
            [`${this.name}`]: this.value.export()
        };
    },
    toString() {
        return {
            [`attribute.${this.name}`]: this.value.toString()
        };
        // return {
        //     [`${this.name}@attribute`]: this.value.toString()
        // };
    }
};