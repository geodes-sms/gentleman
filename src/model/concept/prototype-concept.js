import {
    valOrDefault, isNullOrUndefined, createUnorderedList, createListItem,
    createInput, createDiv, appendChildren, isNullOrWhitespace, removeChildren, createDocFragment, insertBeforeElement
} from "zenkai";

export const PrototypeConcept = {
    /**
     * Creates a concept
     * @returns {PrototypeConcept}
     */
    create(model, schema) {
        const instance = Object.create(this);

        instance.model = model;
        instance.schema = schema;
        instance.concretes = schema.concretes;
        instance.references = [];

        return instance;
    },
    /** Reference to parent model */
    model: null,
    /** Cache of the schema describing the concept */
    schema: null,
    /** @type {int} */
    id: null,
    /** @type {string} */
    name: null,
    /** @type {string} */
    refname: null,
    /** @type {string} */
    alias: null,
    /** @type {string} */
    fullName: null,
    /** @type {Concept} */
    parent: null,
    /** @type {int[]} */
    references: null,
    /** @type {Projection[]} */
    projection: null,
    value: null,
    /** Object nature */
    object: "prototype",
    init(args) {
        if (isNullOrUndefined(args)) {
            return this;
        }

        return this;
    },

    getIdRef() { return this.schema['idref']; },
    getName() { return valOrDefault(this.refname, this.name); },
    getAlias() { return valOrDefault(this.alias, this.getName()); },

    getConceptParent() {
        if (this.isRoot()) {
            return null;
        }

        return this.parent.concept;
    },
    render() {
        // Create fields
        var container = createDiv({ class: "choice-container", data: { nature: "choice" } });
        var input = createInput({ class: "choice-input", placeholder: `Choose ${this.name}` });
        var results = createUnorderedList({ class: "bare-list choice-results hidden" });
        results.tabIndex = 0;

        const DATA = this.concretes;
        const createChoice = (value) => createListItem({ class: "choice-result-item", data: { value: value } }, value);
        const getInputValue = () => input.value.trim();
        const filterDATA = (query) => DATA.filter(val => query.some(q => val.name.toLowerCase().includes(q.toLowerCase())));


        // Fill in results
        DATA.forEach(concept => { results.appendChild(createChoice(concept.name)); });

        // Bind events
        results.addEventListener('click', (e) => {
            let target = e.target;
            let { value } = target.dataset;

            if (value) {
                let concept = this.model.createConcept(value);
                container.parentElement.insertBefore(concept.render(), container);
                concept.prototype = this;
                this.value = concept;

                removeChildren(container);
                container.remove();
            }
        });
        input.addEventListener('input', (e) => {
            removeChildren(results);
            var fragment = createDocFragment();
            if (isNullOrWhitespace(getInputValue())) {
                DATA.forEach(concept => { fragment.appendChild(createChoice(concept.name)); });
                results.classList.add('hidden');
            } else {
                let query = getInputValue().split(' ');
                filterDATA(query).forEach(concept => { fragment.appendChild(createChoice(concept.name)); });
                results.classList.remove('hidden');
            }
            results.appendChild(fragment);
        });

        appendChildren(container, [input, results]);

        return container;
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