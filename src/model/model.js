/// <reference path="../enums.js" />
/// <reference path="../utils/utils.js" />
/// <reference path="../exception.js" />
/// <reference path="../projection.js" />

var MetaModel = (function ($, _, ELEM, ERR) {
    "use strict";

    const COMPOSITION = 'composition';

    var pub = {
        create(metamodel, model) {
            var instance = Object.create(this);

            // private members
            instance._model = model;
            instance._metamodel = metamodel;
            instance.ID = [];      // list of IDs declared in the concrete model
            instance.path = [];    // list of paths,
            instance.options = [];
            instance.projections = [];
            instance.root = undefined;

            return instance;
        },
        init(model) {
            var self = this;

            // private members
            self._model = model;
            self.ID = [];      // list of IDs declared in the concrete model
            self.path = [];    // list of paths,
            self.options = [];
            self.projections = [];
            self.root = undefined;
        },

        get concrete() { return this._model; },
        get MM() { return this._metamodel; },

        /**
         * Creates and returns a model element
         * @param {Object} el
         * @param {boolean} origin
         * @returns {ModelElement}
         */
        createModelElement(el, origin) {
            origin = _.valOrDefault(origin, false);
            var mElement = ELEM.create(this, el);
            if (origin) {
                this.root = mElement;
            }

            return mElement;
        },
        addModelElement(attr) {
            var instance = this.createInstance(attr.type);
            attr.val.push(instance);

            return instance;
        },
        /**
         * Remove an element from the model
         * @param {Object} parent element's parent
         * @param {Object} el element
         * @param {HTMLElement} eHTML HTML element
         */
        removeElement(parent, el, prop) {
            var arr = parent[prop];
            arr.splice(arr.indexOf(el), 1);

            if (el.optional && !el.multiple) arr.options.push(el);

            return arr;
        },
        /**
         * Gets a model element by type
         * @param {string} type 
         */
        getModelElement(type) { return this.isElement(type) ? JSON.parse(JSON.stringify(this.MM[type])) : undefined; },
        /**
         * Returns an element in a model using its path
         * @param {string} path  
         */
        findModelElement(path) {
            var components = path.split('.');
            var me = this.concrete;

            var dir, match, index, prop, name;
            for (var i = 0; i < components.length; i++) {
                dir = components[i];
                if (/\[\d+\]/.test(dir)) {
                    match = dir.match(/\[\d+\]/g);
                    index = +match[0].match(/\d+/g);
                    prop = dir.substring(0, dir.indexOf('['));
                    me = me[prop][index];
                } else if (/\[\w+\]/.test(dir)) {
                    match = dir.match(/\[\w+\]/g);
                    name = match[0].match(/\w+/g);
                    prop = dir.substring(0, dir.indexOf('['));
                    me = me[prop].find(function (x) {
                        return x.name == name;
                    });
                } else {
                    me = me[dir];
                }
            }

            return me;
        },

        generateID() { return this.projections.length.toString(); },

        /**
         * Create an instance of the model element
         * @param {string} type 
         */
        createInstance(type) {
            var element = this.getModelElement(type);
            return element && !(this.isEnum(type) || this.isDataType(type)) ? _.cloneObject(element) : "";
        },

        /**
         * Gets a value indicating whether this type is declared in the model
         * @param {string} type 
         * @returns {boolean}
         */
        isElement(type) { return this.MM[type] !== undefined; },
        /**
         * Gets a value indicating whether the element is of type "ENUM"
         * @param {string} type 
         * @returns {boolean}
         */
        isEnum(type) { return this.isElement(type) && this.MM[type].type == ModelType.ENUM; },
        /**
         * Gets a value indicating whether the element is of type "PRIMITIVE" or "DATATYPE"
         * @param {string} type 
         * @returns {boolean}
         */
        isDataType(type) { return DataType.hasOwnProperty(type.split(':')[0]) || this.isModelDataType(type); },
        /**
         * Gets a value indicating whether the element is of type "DATATYPE"
         * @param {string} type 
         * @returns {boolean}
         */
        isModelDataType(type) { return this.isElement(type) && this.MM[type].type === ModelType.DATATYPE; },
        /**
         * Gets a value indicating whether the element has a composition
         * @param {string} type 
         * @returns {boolean}
         */
        hasComposition(type) { return this.isElement(type) && this.MM[type].hasOwnProperty(COMPOSITION); },

        /**
         * Gets a model element type
         * @param {Object} el element
         */
        getModelElementType(el) {
            if (!el.hasOwnProperty('base')) return el.name;

            return this.getModelElementType(this.getModelElement(el.base)) + "." + el.name;
        },

        toString() { return this.root.toString(); }
    };

    return pub;
})(UTIL, HELPER, ModelElement, Exception);