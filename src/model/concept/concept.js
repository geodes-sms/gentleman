export const Concept = {
    create: function (args) {
        var instance = Object.create(this);
        Object.assign(instance, args);

        instance.attributes = [];
        instance.components = [];

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
    path: null,
    parent: null,
    /** @type {Attribute[]} */
    attributes: null,
    /** @type {Concept[]} */
    components: null,

    getAttribute: (id) => this.attributes[id],
    getComponent: (index) => this.components[index],
    isRoot: () => this.parent === null
};