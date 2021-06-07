import { valOrDefault } from "zenkai";


export const BaseStructure = {
    create(concept, schema) {
        const instance = Object.create(this);

        instance.concept = concept;
        instance.schema = schema;

        return instance;
    },
    /** Reference to parent model */
    model: null,
    /** Cache of the schema describing the concept */
    schema: null,
    /** Link to the concept data source */
    source: null,
    /** @type {string} */
    id: null,
    /** @type {*[]} */
    value: null,
    /** @type {string} */
    object: "structure",

    init(value) {
        throw new Error("This function has not been implemented");
    }
};


Object.defineProperty(BaseStructure, 'model', { get() { return this.concept.model; } });
Object.defineProperty(BaseStructure, 'name', { get() { return this.schema.name; } });
Object.defineProperty(BaseStructure, 'description', { get() { return this.schema.description; } });
Object.defineProperty(BaseStructure, 'required', { get() { return valOrDefault(this.schema.required, true); } });