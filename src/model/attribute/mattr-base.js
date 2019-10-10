import { DataType, UI } from '@src/global/enums.js';
import { createDocFragment, createDiv, addClass, addPath, valOrDefault, isDerivedOf, toBoolean, defProp, hasOwn, isNullOrWhitespace, createListItem } from "zenkai";
import { createButtonDelete, createButtonAdd, createButtonNew } from "@utils/interactive.js";
import { Field, AbstractProjection, EnumProjection, PointerProjection, DataTypeProjection, RawProjection } from '@projection/field';
import { UnimplementedError } from '@src/exception/index.js';
import { ModelElement } from './../concept/model-element.js';
import { events } from '@utils/pubsub.js';

export const ModelAttributeBase = (function () {
    "use strict";

    const ButtonType = {
        Add: 'Add',
        New: 'New'
    };
    const ABSTRACT = 'abstract';

    var pub = {
        /**
         * Constructor
         * @param {Object} values
         * @returns {ModelAttribute}
         */
        create(values) {
            var instance = Object.create(this);

            Object.assign(instance, values, createProjection);
            instance._fnUpdate;
            instance._projections = [];
            instance._elements = [];
            if (isDerivedOf(instance, pub)) {
                instance.init();
            }

            return instance;
        },

        /** @type {ModelElement} */
        get Element() { return this._parent; },
        /** @returns {MetaModel} */
        get MODEL() { return this.Element.model; },
        /** @type {string} */
        get name() { return this._name; },
        /** @type {string} */
        get type() { return this._type; },
        /** @type {string} */
        get description() { return this._description; },
        /** @type {boolean} */
        get isMultiple() { return this._isMultiple; },
        /** @type {boolean} */
        get isOptional() { return this._isOptional; },
        /** @type {string} */
        get path() { return this._path; },
        /** @type {string} */
        get representation() { return this._representation; },
        /** @type {Projection[]} */
        get projections() { return this._projections; },
        /** @type {ModelElement[]} */
        get elements() { return this._elements; },

        get fnUpdate() { return this._fnUpdate; },
        get fnCreateProjection() { return this._fnCreateProjection; },

        /**
         * Renders the HTML representation of the attribute
         * @abstract
         */
        render_attr() {
            if (isDerivedOf(this, pub))
                throw String(UnimplementedError.create('Unimplemented abstract method'));
        },
        handler(attr, val, path) {
            var self = this;
            var isMultiple = hasOwn(attr, 'multiple');
            var type = attr.type;
            var valIndex, newpath;

            if (isMultiple) valIndex = attr.val.indexOf(val);

            var projection;
            // primitive type and enum handler
            if (self.MODEL.isDataType(type) || self.MODEL.isEnum(type)) {
                self.MODEL.path.push(isMultiple ? addPath(path, 'val[' + valIndex + ']') : path);
                projection = self.createProjection(val);

                let IDElement = ModelElement.isPrototypeOf(self.Element.parent) ? self.Element.parent : self.Element;
                if (attr.type === DataType.ID) {
                    self.MODEL.ID.push({
                        projection: projection,
                        type: self.MODEL.getModelElementType(IDElement._source)
                    });
                }

                let result = projection.createInput();
                if (isMultiple) {
                    result.appendChild(createButtonDelete(result, function () {
                        self.remove(self.projections.indexOf(projection));
                        events.emit('model.change', 'ModelElement[l.79]:delete');
                    }));
                }
                return result;
            } else if (self.MODEL.isElement(type)) {
                newpath = addPath(path, isMultiple ? 'val[' + valIndex + ']' : 'val');
                let mElement = self.MODEL.createModelElement(val);
                mElement.parent = self;
                self.elements.push(mElement);

                if (isMultiple) {
                    let item;
                    let isLast = valIndex == attr.val.length - 1;

                    let isInline = toBoolean(attr.inline);
                    if (!self.MODEL.hasComposition(type)) {
                        item = createListItem({ class: 'array-item', prop: "val" });
                        // create an attribute wrapper and put the attributes in it
                        item.dataset.separator = valOrDefault(this.separator, ',');
                        var wrapper = createDiv({ class: ['attr-wrapper', 'multiple'] });
                        wrapper.appendChild(mElement.render(newpath, true));
                        item.appendChild(wrapper);
                        mElement.eHTML = item;
                        mElement.index = valIndex;

                        // add delete button
                        let btnDelete = createButtonDelete(item, function () {
                            self.remove(self.elements.indexOf(mElement));
                            events.emit('model.change', 'ModelElement[l.79]:delete');
                        });
                        item.appendChild(btnDelete);

                        if (!isInline) {
                            addClass(item, "block");
                            if (isLast) {
                                return renderButton(item, ButtonType.New, mElement);
                            }
                        } else {
                            addClass(item, "array-item--inline");
                            if (isLast) {
                                return renderButton(item, ButtonType.Add, mElement);
                            }
                        }
                    } else {
                        item = mElement.render(newpath);

                        if (isLast) return renderButton(item, ButtonType.New);
                    }

                    return item;
                }

                return mElement.render(newpath);
            }

            return null;

            function renderButton(item, btnType, mElement) {
                var fragment = createDocFragment();
                fragment.appendChild(item);

                switch (btnType) {
                    case ButtonType.New:
                        fragment.appendChild(createButtonNew(attr.name, function () {
                            buttonClickHandler(this, mElement);
                        }));
                        break;
                    case ButtonType.Add:
                        fragment.appendChild(createButtonAdd(function () {
                            buttonClickHandler(this, mElement);
                        }));
                        break;
                    default:
                        break;
                }

                return fragment;
            }

            function buttonClickHandler(btn, mElem) {
                if (self.isMultiple)
                    self.add(self.MODEL.createInstance(self.type));
                else
                    self.value = self.MODEL.createInstance(self.type);

                var children = self.handler(self._source, self.value[self.count - 1], self.path);
                var newElem = self.getElement(-1);
                var container = children.children[0];

                var btnDelete = createButtonDelete(container, function () {
                    self.remove(self.elements.indexOf(newElem));
                    events.emit('model.change', 'ModelAttribute[l.162]:delete');
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
            var self = this;

            if (this.elements.length) {
                let output = this.elements.map(function (el) {
                    return toBoolean(self._source.inline) ? el.toString() : '\n' + el.toString();
                }).join(valOrDefault(self.separator, ''));
                return output;
            }

            if (this.projections.length) {
                let arr = this.projections.filter(function (p) { return !isNullOrWhitespace(p.text); });

                let output = arr.map(function (p) {
                    var val = p.text;
                    return self.type === DataType.string ? '"' + val + '"' : val;
                }).join(valOrDefault(self.separator, ''));

                if (arr.length) {
                    if (self.representation)
                        output = self.representation.val.replace('$val', output);
                }
                return output;
            }

            return "";
        }
    };

    defProp(pub, 'value', {
        get() { return this._source.val; },
        set(val) {
            if (this._source.val !== val) {
                this._source.val = val;
                events.emit('model.change', 'ModelAttribute[l.467]:set');
            }
        }
    });

    function createProjection(val) {
        var self = this;
        var M = self.MODEL;

        var element = self.MODEL.getModelElement(self.type);
        var packet = Field.prepare(self.MODEL.generateID(), val, self, self.type, self.fnUpdate);
        var projection;

        // abstract element
        if (val && hasOwn(val, ABSTRACT)) {
            projection = AbstractProjection.create(packet);
            projection.extensions = element.extensions;
        }
        else if (element) {
            let elementType = M.getModelElementType(element);
            if (M.isEnum(elementType)) {
                projection = EnumProjection.create(packet);
                projection.values = element.values;
            } else if (M.isDataType(elementType)) {
                if (elementType === 'raw') {
                    projection = RawProjection.create(packet);
                    projection.struct = element;
                } else {
                    projection = DataTypeProjection.create(packet);
                }
                projection.struct = element;
            } else {
                projection = Field.create(packet);
            }
        } else if (self.type === DataType.IDREF) {
            projection = PointerProjection.create(packet);
            projection.reference = self._source.ref;
        } else {
            projection = Field.create(packet);
        }

        // if (self.fnCreateProjection) self.fnCreateProjection(projection);

        self.projections.push(projection);
        self.MODEL.projections.push(projection);

        return projection;
    }

    return pub;
})();