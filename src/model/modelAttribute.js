/// <reference path="../enums.js" />

const ModelAttribute = (function ($, _, PN, ERR) {
    "use strict";

    const COMPOSITION = 'composition';
    const ButtonType = {
        Add: 'Add',
        New: 'New'
    };
    const ABSTRACT = 'abstract';
    const VAL = 'val';

    var ModelAttribute = {
        /**
         * Constructor
         * @param {Object} values
         * @returns {ModelAttribute}
         */
        create: function (values) {
            var instance = Object.create(this);

            Object.assign(instance, values, createProjection);
            instance._fnUpdate;
            instance._projections = [];
            instance._elements = [];
            if (Object.getPrototypeOf(instance) !== ModelAttribute && ModelAttribute.isPrototypeOf(instance)) {
                instance.init();
            }

            return instance;
        },

        /**
         * @type {ModelElement}
         */
        get Element() { return this._parent; },
        /**
         * @returns {MetaModel}
         */
        get MODEL() { return this.Element.model; },
        /**
         * @type {string}
         */
        get name() { return this._name; },
        /**
         * @type {string}
         */
        get type() { return this._type; },
        /**
         * @type {boolean}
         */
        get isMultiple() { return this._isMultiple; },
        /**
         * @type {boolean}
         */
        get isOptional() { return this._isOptional; },
        get fnUpdate() { return this._fnUpdate; },
        /**
         * @function createProjection
         */
        get fnCreateProjection() { return this._fnCreateProjection; },
        /**
         * @type {string}
         */
        get path() { return this._path; },
        get representation() { return this._representation; },
        /**
         * @type {Projection[]}
         */
        get projections() { return this._projections; },
        /**
         * @type {ModelElement[]}
         */
        get elements() { return this._elements; },

        render_attr: function () {
            if (Object.getPrototypeOf(this) !== ModelAttribute && ModelAttribute.isPrototypeOf(this))
                throw String(ERR.UnimplementedError.create('Unimplemented abstract method'));
        },
        handler: function (attr, val, path) {
            var self = this;
            var isMultiple = attr.hasOwnProperty('multiple');
            var type = attr.type;
            var valIndex, newpath;

            if (isMultiple) valIndex = attr.val.indexOf(val);

            var projection;
            // primitive type and enum handler
            if (self.MODEL.isDataType(type) || self.MODEL.isEnum(type)) {
                self.MODEL.path.push(isMultiple ? _.addPath(path, 'val[' + valIndex + ']') : path);
                projection = self.createProjection(val);

                if (attr.type === DataType.ID) {
                    self.MODEL.ID.push({
                        projection: projection,
                        type: self.MODEL.getModelElementType(self.Element._source)
                    });
                }

                return projection.createInput();
            } else if (this.MODEL.isElement(type)) {
                newpath = _.addPath(path, isMultiple ? 'val[' + valIndex + ']' : "val");
                let mElement = this.MODEL.createModelElement(val);
                self.elements.push(mElement);

                // abstract element
                if (val.hasOwnProperty(ABSTRACT)) {
                    this.MODEL.path.push(isMultiple ? _.addPath(path, 'val[' + valIndex + ']') : path);
                    projection = self.createProjection(val);

                    return projection.createInput();
                }

                if (isMultiple) {
                    let item;
                    let isLast = valIndex == attr.val.length - 1;
                    let isInline = _.toBoolean(attr.inline);
                    if (!this.MODEL.getModelElement(type).hasOwnProperty(COMPOSITION)) {
                        item = $.createLi({ class: "array-item", prop: "val" });
                        // create an attribute wrapper and put the attributes in it
                        var wrapper = $.createDiv({ class: "attr-wrapper multiple" });
                        wrapper.appendChild(mElement.render(newpath, true));
                        item.appendChild(wrapper);
                        mElement.eHTML = item;

                        if (!isInline) {
                            $.addClass(item, "block");
                            if (isLast) return renderButton(item, ButtonType.New);
                        } else {
                            if (isLast) return renderButton(item, ButtonType.Add);
                        }
                    } else {
                        // create an attribute wrapper and put the attributes in it
                        item = mElement.render(newpath);

                        if (isLast) return renderButton(item, ButtonType.New);
                    }

                    return item;
                }

                return mElement.render(newpath);
            }

            return null;

            function renderButton(item, btnType) {
                var fragment = $.createDocFragment();
                fragment.appendChild(item);

                switch (btnType) {
                    case ButtonType.New:
                        fragment.appendChild($.createButtonNew(attr.name, function () {
                            buttonClickHandler(this);
                        }));
                        break;
                    case ButtonType.Add:
                        fragment.appendChild($.createButtonAdd(function () {
                            buttonClickHandler(this);
                        }));
                        break;
                    default:
                        break;
                }

                return fragment;
            }

            function buttonClickHandler(btn) {
                if (self.isMultiple)
                    self.add(self.MODEL.createInstance(self.type));
                else
                    self.value = self.MODEL.createInstance(self.type);

                var lastIndex = self.count - 1;
                var children = self.handler(self._source, self.value[lastIndex], self.path);
                var container = children.children[0];
                var btnDelete = $.createButtonDelete(container, function () {
                    self.remove(lastIndex);
                });
                container.appendChild(btnDelete);
                btn.parentElement.appendChild(children);
                btn.remove();
            }
        },
        validate(projection) {
            var self = this;
            // constraint validation
            if (self._source.min) {
                if (+projection.value < self._source.min) {
                    projection.error = "Please enter a value greater than or equal to " + self._source.min;
                    return false;
                }
            }
            if (self._source.max) {
                if (+projection.value > self._source.max) {
                    projection.error = "Please enter a value less than or equal to " + self._source.max;
                    return false;
                }
            }

            return true;
        },
        remove() {
            var self = this;
            self.projections.splice(0).forEach(function (projection) {
                projection.remove();
            });
            self.elements.splice(0).forEach(function (el) {
                el.remove();
            });

            // restore the source value to its initial state
            if (self._val !== undefined) {
                self.value = self._val;
            } else {
                delete self._source.val;
            }
        },
        toString() {
            if (this.elements.length) {
                let output = "";
                this.elements.forEach(function (el) {
                    output += el.toString();
                });
                return output;
            }
            return this.value.toString();
        }

    };

    var ModelAttributeSinglevalue = ModelAttribute.create({
        init() {
            var self = this;
            if (!this._source.hasOwnProperty(VAL))
                this._source.val = this.MODEL.createInstance(this._type);

            this._fnUpdate = function (val) { self.value = val; };
        },
        render_attr() {
            var self = this;
            var container = $.createDocFragment();

            container.appendChild(self.handler(self._source, self.value, self.path));

            return container;
        },
        createProjection: createProjection
    });

    var ModelAttributeMultivalue = ModelAttribute.create({
        init() {
            var self = this;
            if (!self._source.hasOwnProperty(VAL)) {
                let min = _.valOrDefault(self._source.multiple.min, 1);
                if (min == 0) {
                    self._source.val = [];
                } else if (min > 0) {
                    self._source.val = [];
                    for (let i = 0; i < min; i++)
                        self._source.val.push(self.MODEL.createInstance(self._type));
                } else {
                    ERR.InvalidModelError.create("Unexpected value for the min property");
                }
            }

            this._isMultiple = true;
            this._represent = "";

            this._fnUpdate = function (val, index) {
                self.set(val, index);
            };
        },
        createProjection: function (val) {
            var self = this;
            var projection = createProjection.call(self, val);
            projection.index = self.count - 1;
            return projection;
        },

        get fnMultiple() { return this._fnMultiple; },
        set fnMultiple(fn) { this._fnMultiple = fn; },

        get represent() { return this._represent; },
        set represent(val) { this._represent = val; },

        multiple_handler() { this.fnMultiple(); },

        render_attr() {
            var self = this;
            var M = self.MODEL;
            var container = $.createDocFragment();

            if (self.fnMultiple) {
                return self.fnMultiple();
            }
            else {
                if (!M.isElement(self.type) || !M.getModelElement(self.type).hasOwnProperty(COMPOSITION)) {
                    var ul = $.createUl({
                        class: "bare-list " + (M.isElement(self.type) && M.getModelElement(self.type).extension ?
                            "list empty" : "array")
                    });
                    if (self._source.inline === false) $.addClass(ul, "block");
                    Object.assign(ul.dataset, { multiple: true });
                    if (self.representation) {
                        var surround = self.representation.val.split("$val");
                        Object.assign(ul.dataset, { before: surround[0], after: surround[1] });
                    }

                    container.appendChild(ul);
                    container = ul;
                }

                if (self.value.length === 0) {
                    // create add button to add more item

                    let btnCreate = $.createButtonNew(self.name, btnCreate_Click);
                    container.appendChild(btnCreate);
                } else {
                    for (let j = 0, len = self.value.length, last = len - 1; j < len; j++) {
                        container.appendChild(self.handler(self._source, self.value[j], self.path, j === len - 1));
                    }
                    if (M.isDataType(self.type) || M.isEnum(self.type)) {
                        var btnadd = $.createButtonAdd(function () {
                            var instance = M.createInstance(self.type);
                            self.add(instance);

                            // render instance
                            var li = $.createLi({ class: "array-item", prop: "val" });
                            li.appendChild(self.handler(self._source, instance, self.path));
                            $.insertBeforeElement(this, li);

                            // focus on first element newly created
                            $.getElement(".attr", li).focus();
                        });
                        container.appendChild(btnadd);
                    }
                }

                return container;
            }

            function btnCreate_Click() {
                self.add(self.MODEL.createInstance(self.type));

                var lastIndex = self.count - 1;
                var children = self.handler(self._source, self.value[lastIndex], self.path);
                this.parentElement.appendChild(children);
                this.remove();
            }
        },
        get(index) { return this._source.val[index]; },
        set(val, index) { this._source.val[index] = val; },
        add(val) { this._source.val.push(val); },
        remove(index) {
            var self = this;

            if (index !== -1) {
                if (self.projections[index]) self.projections.splice(index, 1)[0].remove();
                if (self.elements[index]) self.elements.splice(index, 1)[0].remove();
                self._source.val.splice(index, 1);
            } else {
                self.removeAll();
            }

        },
        removeAll() {
            self.projections.forEach(function (projection) {
                projection.remove();
            });
            self.elements.forEach(function (el) {
                el.remove();
            });

            // restore the source value to its initial state
            if (self._val !== undefined) {
                self.value = self._val;
            } else {
                delete self._source.val;
            }
        }
    });

    _.defProp(ModelAttributeMultivalue, 'count', {
        get() { return this._source.val.length; }
    });
    _.defProp(ModelAttributeMultivalue, 'multiplicity', {
        get() { return this._source.multiple; }
    }
    );
    _.defProp(ModelAttribute, 'value', {
        get() { return this._source.val; },
        set(val) { this._source.val = val; }
    });

    function prepare(el, attr, path) {
        return Object.freeze({
            _parent: el,
            _source: attr,
            _val: attr.val,
            _name: attr.name,
            _path: _.addPath(path, 'attr.' + attr.name),
            _type: attr.type,
            _isOptional: _.toBoolean(attr.optional),
            _representation: attr.representation
        });
    }

    function createProjection(val) {
        var self = this;
        var M = self.MODEL;

        var element = self.MODEL.getModelElement(self.type);
        var packet = PN.Base.prepare(self.MODEL.generateID(), val, self, self.type, self.fnUpdate);
        var projection;

        // abstract element
        if (val && val.hasOwnProperty(ABSTRACT)) {
            projection = PN.Abstract.create(packet);
            projection.extensions = element.extensions;
        }
        else if (element) {
            let elementType = M.getModelElementType(element);
            if (M.isEnum(elementType)) {
                projection = PN.Enum.create(packet);
                projection.values = element.values;
            } else if (M.isDataType(elementType)) {
                projection = PN.DataType.create(packet);
                projection.element = element;
            } else {
                projection = PN.Base.create(packet);
            }
        } else if (self.type === DataType.IDREF) {
            projection = PN.Pointer.create(packet);
            projection.reference = self._source.ref;
        } else {
            projection = PN.Base.create(packet);
        }

        // if (self.fnCreateProjection) self.fnCreateProjection(projection);

        self.projections.push(projection);
        self.MODEL.projections.push(projection);

        return projection;
    }

    return {
        prepare: prepare,
        SingleValueAttribute: ModelAttributeSinglevalue,
        MultiValueAttribute: ModelAttributeMultivalue
    };
})(UTIL, HELPER, Projection, Exception);