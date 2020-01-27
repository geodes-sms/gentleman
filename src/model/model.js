import { cloneObject, hasOwn, valOrDefault, isNullOrUndefined } from "zenkai";
import { MetaModel } from './metamodel.js';
import { ConceptFactory } from "./concept/factory.js";

export const Model = {
    /** 
     * Creates a `Model` instance.
     * @param {MetaModel} metamodel
     * @returns {Model}
     */
    create(metamodel) {
        const instance = Object.create(this);

        instance.metamodel = metamodel;

        return instance;
    },
    schema: null,
    /** @type {MetaModel} */
    metamodel: null,
    /** @type {Concept.BaseConcept} */
    root: null,
    /** @type {Editor} */
    editor: null,

    /**
     * Initialize the model.
     * @param {Object} model 
     * @param {Editor} editor 
     * @param {Object} args 
     */
    init(model, editor) {
        this.schema = !isNullOrUndefined(model) ? model : initSchema(this.metamodel);
        this.editor = editor;
        this.root = ConceptFactory.createConcept(this, this.schema.root['name'], this.schema.root);

        // (?) Uncomment to add optional argument parameters
        // Object.assign(this, args);

        return this;
    },
    /**
     * Creates and returns a model element
     * @param {string} name
     * @returns {Concept}
     */
    createConcept(name) {
        // console.log(`Create concept: ${name}`);
        const schema = this.metamodel.getCompleteModelConcept(name);

        return ConceptFactory.createConcept(this, name, schema);
    },
    /**
     * Create an instance of the model element
     * @param {string} type 
     */
    createInstance(type) {
        const element = this.metamodel.getModelConcept(type);

        return element && !(this.isEnum(type) || this.isDataType(type)) ? cloneObject(element) : "";
    },
    generateId() {
        return UUID.generate();
    },
    export() {
        var model = {};
        Object.assign(model, this.root.export());
        return JSON.stringify(model);
    },
    toString() { return JSON.stringify(this.root.toString()); },
};

/**
 * Fast UUID generator, RFC4122 version 4 compliant.
 * @author Jeff Ward (jcward.com).
 * @license MIT license
 * @link http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
 **/
const UUID = (function () {
    var self = {};

    var lut = [];
    for (let i = 0; i < 256; i++) {
        lut[i] = i < 16 ? '0' + i.toString(16) : i.toString(16);
    }

    self.generate = function () {
        var d0 = Math.random() * 0x100000000 >>> 0;
        var d1 = Math.random() * 0x100000000 >>> 0;
        var d2 = Math.random() * 0x100000000 >>> 0;
        var d3 = Math.random() * 0x100000000 >>> 0;

        return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
            lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
            lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
            lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
    }

    return self;
})();



function initSchema(metamodel) {
    const schema = { "root": metamodel.getCompleteModelConcept(metamodel.root) };

    if (!hasOwn(schema.root, 'name')) {
        schema.root['name'] = metamodel.root;
    }

    return schema;
}