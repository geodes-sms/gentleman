/// <reference path="model/model.js" />
/// <reference path="helpers/helpers.js" />

var Projection = (function ($, _, ERR) {

    const DATATYPE = {
        ID: "ID",
        IDREF: "IDREF",
        boolean: "boolean",
        enum: "enum",
        integer: "integer",
        real: "real",
        string: "string"
    };

    // State
    const DISABLED = 'disabled';
    const COLLAPSE = 'collapse';

    var BaseProjection = {
        /**
         * Constructor
         * @param {Object} values values  
         * @returns {BaseProjection}
         */
        create: function (values) {
            var instance = Object.create(this);

            Object.assign(instance, values);


            // private members
            instance._validators = [];
            instance._refs = [];
            // instance._prop = el.getAttribute(Attribute.Prop);
            // instance._position = el.getAttribute(Attribute.Position);

            if (!instance.isOptional) {
                instance.validators.push(validateRequired);
            }
            if (Object.getPrototypeOf(instance) !== BaseProjection && BaseProjection.isPrototypeOf(instance)) {
                instance.init();
            }

            return instance;
        },

        prepare: function (id, val, mAttr, type, fnUpdate) {
            return Object.freeze({
                _id: id,
                _val: val,
                _mAttribute: mAttr,
                _type: type,
                _update: fnUpdate,
                _isOptional: mAttr.isOptional,
                _name: mAttr.name
            });
        },
        /**
         * Gets the associated model-attribute
         * @returns {ModelAttribute}
         */
        get modelAttribute() { return this._mAttribute; },

        get value() { return this._input.textContent; },
        set value(val) {
            this._input.textContent = val;
            if (val) {
                $.removeClass(this._input, EMPTY);
            }
            for (let i = 0, len = this.refs.length; i < len; i++) {
                this.modelAttribute.MODEL.projections[this.refs[i]].update();
            }
        },
        get name() { return this._name; },
        get isOptional() { return this._isOptional; },
        get hasError() { return !_.isNullOrWhiteSpace(this.error); },

        get id() { return this._id; },
        /**
         * Returns an element's data-type
         * @param {Element} el element
         */
        get type() { return this._type; },
        /**
         * Returns an element's data error message
         * @param {Element} el element
         */
        get error() { return this._error; },
        set error(val) { this._error = val; },
        /**
         * Returns an element's data position
         * @param {Element} el element
         */
        get position() { return this._position; },
        get validators() { return this._validators; },
        get refs() { return this._refs; },
        index: 0,

        focus() {
            this._input.focus();
        },
        focusIn() {
            var self = this;
            if (self.isOptional) {
                $.removeClass(this._input, COLLAPSE);
            }
        },
        focusOut() {
            var self = this;
            if (self.isOptional) {
                if (_.isNullOrWhiteSpace(this.value)) {
                    $.addClass(this._input, COLLAPSE);
                }
            }
        },
        update() {
            var self = this;
            var attr = this._mAttribute;
            var val = self._input.textContent;

            if (val === "") {
                $.addClass(self._input, EMPTY);
                if ($.hasClass(self._input.parentElement, "attr-wrapper"))
                    $.addClass(self._input.parentElement, EMPTY);
            }
            this.value = val;
            this._update(self.value, self.index);

            if (attr.type === DATATYPE.ID) {
                let src = attr.MODEL.ID.find(function (x) { return x.id == self.id; });
                if (src) {
                    let arr = src.ref;
                    for (let i = 0, len = arr.length; i < len; i++) {
                        let el = $.getElement('#' + arr[i]);
                        el.textContent = src.attr.val;
                        if (_.isNullOrWhiteSpace(src.attr.val)) $.addClass(el, EMPTY);
                        else $.removeClass(el, EMPTY);
                    }
                }
            }
        },
        addReference(projectionId) {
            this.refs.push(projectionId);
        },
        createInput(editable) {
            var self = this;
            var mAttr = this._mAttribute;
            var mElement = this._mAttribute.Element;

            if (mAttr.type === DATATYPE.boolean) {
                var chk = $.createCheckbox({ id: this._id, class: "attr--bool", data: { name: mAttr.name } });
                chk.setAttribute('data-representation', mAttr.representation.val);
                chk.addEventListener('change', function (event) {
                    var checkbox = $.getElement("input", this);
                    if (checkbox.checked) $.addClass(this, 'checked');
                    else $.removeClass(this, 'checked');
                });
                return chk;
            }
            var input = $.createSpan({
                id: this._id,
                class: "attr",
                html: "",
                data: {
                    name: mAttr.name,
                    type: mAttr.type,
                    placeholder: mAttr.name
                }
            });

            if (self._options) $.addAttributes(input, self._options);
            input.contentEditable = _.valOrDefault(editable, true);
            input.tabIndex = 0;
            if (_.isNullOrWhiteSpace(this._val)) $.addClass(input, EMPTY);
            this._input = input;

            if (mAttr.isMultiple && mElement.representation.type == "text") {
                var li = $.createLi({ class: "array-item", data:{ prop: "val"} });
                li.appendChild(input);

                var valIndex = mAttr.value.indexOf(this._val);
                var isLast = valIndex == mAttr.value.length - 1;
                // if (isLast) {
                //     var btnAdd = $.createButton({ class: "btn btn-add", text: "Add" });
                //     btnAdd.tabIndex = -1;
                //     btnAdd.addEventListener('click', function () {
                //         //var path = attr.MODEL.path[input.id];
                //         //var dir = _.getDir(path);
                //         mAttr.value.push("");
                //         mAttr.MODEL.path.push(_.addPath(mAttr.path, 'val[' + mAttr.value.length - 1 + ']'));
                //         let packet = BaseProjection.prepare(mAttr.MODEL.path.length - 1, null, mAttr, self.type);
                //         let projection = BaseProjection.create(packet);
                //         mAttr.MODEL.projections.push(projection);
                //         let input = projection.createInput();
                //         $.insertBeforeElement(this, input);

                //         $.getElement(".attr", input).focus();
                //     });
                //     //li.appendChild(btnAdd);
                //     var fragment = $.createDocFragment();
                //     fragment.appendChild(li);
                //     fragment.appendChild(btnAdd);
                //     return fragment;
                // }
                return li;
            } else {
                if (mAttr.isOptional) {
                    Object.assign(input.dataset, { optional: true });
                }

                if (this._val) {
                    this.value = this._val;
                }

                if (mAttr.representation) {
                    var wrapper = $.createDiv({ class: ['attr-wrapper', EMPTY] });
                    var surround = mAttr.representation.val.split("$val");
                    Object.assign(wrapper.dataset, { before: surround[0], after: surround[1] });
                    wrapper.appendChild(input);
                    return wrapper;
                }

                return input;
            }
        },

        validate() {
            var self = this;

            var isValid = true;
            var validator;
            for (validator of self.validators) {
                if (!validator.call(self)) {
                    return false;
                }
            }

            return self.modelAttribute.validate(this);
        },
        remove() {
            var self = this;
            $.removeChildren(self._input);
            self._input.remove();
        },
        delete() {
            var self = this;
            self.modelAttribute.remove(self.index);
        }
    };

    var AbstractProjection = {
        /**
         * Constructor
         * @param {Object} values values  
         * @returns {BaseProjection}
         */
        create(values) {
            var instance = Object.create(this);

            Object.assign(instance, values);

            return instance;
        },

        prepare(id, val, mAttr, type) {
            return Object.freeze({
                _id: id,
                _val: val,
                _mAttribute: mAttr,
                _type: type
            });
        },
        /**
         * Gets the associated model-attribute
         * @returns {ModelAttribute}
         */
        get modelAttribute() { return this._mAttribute; },

        get value() { return this._input.textContent; },
        get id() { return this._id; },
        /**
         * Returns an element's data-type
         * @param {Element} el element
         */
        get type() { return this._type; },
        /**
         * Returns an element's data error message
         * @param {Element} el element
         */
        get error() { return this._error; },
        /**
         * Returns an element's data position
         * @param {Element} el element
         */
        get position() { return this._position; },

        update: function () {
            // var self = this;
            // var attr = this._mAttribute;
            // if (attr.value !== this.value) {
            //     attr.value = this.value;
            // }
            // if (attr.type === DATATYPE.ID) {
            //     let src = attr.MODEL.ID.find(function (x) { return x.id == self.id; });
            //     let arr = src.ref;
            //     for (let i = 0, len = arr.length; i < len; i++) {
            //         let el = $.getElement('#' + arr[i]);
            //         el.textContent = src.attr.val;
            //         if (_.isNullOrWhiteSpace(src.attr.val)) $.addClass(el, EMPTY);
            //         else $.removeClass(el, EMPTY);
            //     }
            // }
        },
        createInput: function (editable) {
            var self = this;
            var mAttr = this._mAttribute;

            var input = $.createSpan({
                class: ['attr', 'attr--extension', EMPTY],
                id: self._id,
                data: {
                    name: mAttr.name,
                    type: mAttr.type,
                    placeholder: mAttr.name,
                    path: mAttr.path
                }
            });
            input.contentEditable = true;

            self._input = input;

            if (mAttr.isMultiple) {
                // let li = $.createLi({ class: "extension-container" });
                // li.appendChild(input);
                return input;
            }

            return input;

        },
        extensions: [],
        valuesKV() {
            var self = this;
            var KV = [];
            self.extensions.forEach(function (val, index) {
                KV.push({ key: val, val: val });
            });

            return KV;
        },
        implement(type) {
            var self = this;
            var mAttr = self.modelAttribute;
            const MODEL = mAttr.MODEL;
            var instance = MODEL.createInstance(type);
            
            var mElem = MODEL.createModelElement(instance);
            mAttr._source = instance;
            $.insertBeforeElement(self._input, mElem.render());
        },
        focus() {

        },
        focusIn() { },
        focusOut() { },
        validate() { return true; }
    };

    var EnumProjection = BaseProjection.create({
        init() {
            var self = this;
            _.defProp(this, 'value', {
                get() { return this._value; },
                set(val) {
                    this._value = val;
                    if (Array.isArray(this.values)) {
                        this._input.textContent = this.values[val];
                    } else {
                        let e = this.values[val];
                        this._input.textContent = e.val;
                        if (e.representation) {
                            var wrapper = $.createDiv({ class: "attr-wrapper" });
                            var surround = e.representation.val.split("$val");
                            Object.assign(wrapper.dataset, { before: surround[0], after: surround[1] });
                            $.insertBeforeElement(this._input, wrapper);
                            wrapper.appendChild(this._input);
                        } else {
                            if ($.hasClass(this._input.parentElement, 'attr-wrapper')) {
                                $.addClass(this._input.parentElement, EMPTY);
                            }
                        }
                    }

                    $.removeClass(this._input, EMPTY);
                }
            });

            var validator = function () {
                var isValid = Array.isArray(self.values) ? +self.value < self.values.length : self.values.hasOwnProperty(self.value);

                if (!isValid) {
                    let validValues = [];
                    self.valuesKV().forEach(function (prop) { validValues.push(prop.val); });

                    self.error = createSentence([
                        "This value is not valid.",
                        "Valid values: " + validValues.join(", ")]);
                }
                return isValid;
            };

            this.validators.push(validator);
        },
        update() {
            var self = this;
            var val = self._input.textContent;

            if (val === "") {
                $.addClass(self._input, EMPTY);
                if ($.hasClass(self._input.parentElement, "attr-wrapper"))
                    $.addClass(self._input.parentElement, EMPTY);
            }

            self._value = _.valOrDefault(_.find(self.values, val), val);
            self._update(self.value, self.index);
        },
        values: undefined,
        valuesKV() {
            var self = this;
            var KV = [];
            if (Array.isArray(self.values)) {
                self.values.forEach(function (val, index) {
                    KV.push({ key: index, val: val });
                });
            } else {
                for (const [key, value] of Object.entries(self.values)) {
                    KV.push({ key: key, val: value.val });
                }
            }

            return KV;
        }
    });

    var PointerProjection = BaseProjection.create({
        init() {
            var self = this;
            var MODEL = self.modelAttribute.MODEL;

            _.defProp(this, 'value', {
                get() { return this._value; },
                set(val) {
                    if (this.pointsTo) {
                        MODEL.projections[+this.pointsTo].unreference(this.id);
                        this.pointsTo = null;
                    }
                    this._value = val;
                    if (!_.isNullOrWhiteSpace(val) && _.isInt(val)) {
                        var refProjection = MODEL.projections[val];
                        self.pointsTo = +val;
                        this._input.textContent = refProjection.value;
                        refProjection.addReference(self.id);
                        $.removeClass(self._input, EMPTY);
                    }
                }
            });

            var validator = function () {
                //model data-type validation
                return true;
            };

            this.validators.push(validator);
        },
        update() {
            var self = this;
            var refProjection = self.modelAttribute.MODEL.projections[self.value];
            self._input.textContent = refProjection.value;
            self._update(self.value, self.index);
        },
        pointsTo: undefined,
        reference: undefined,
        valuesKV() {
            var self = this;
            // Filter ID list by type and take only those with values
            var projections = self.modelAttribute.MODEL.ID.filter(function (x) {
                if (x.type.split('.').indexOf(self.reference) !== -1) {
                    return !_.isNullOrWhiteSpace(x.projection.value);
                }
                return false;
            });

            var data = projections.map(function (x) { return { key: x.projection.id, val: x.projection.value }; });
            
            return data;
        }
    });

    var DataTypeProjection = BaseProjection.create({
        init() {
            var self = this;

            var validator = function () {
                var format = self.element.format;
                var isValid = RegExp('^' + format + '$').test(self.value);
                if (!isValid) {
                    var friendlyFormat = format.replace(/\[0-9\]\+/gi, "INT")
                        .replace(/[[\]]/gi, "'")
                        .replace("(", " (");
                    this.error = _.valOrDefault(self.element.message, "This value is not valid.<br>Format:" + friendlyFormat);
                }
                return isValid;
            };

            this.validators.push(validator);
        },
        element: undefined
    });

    /**
     * Returns an HTML sentence.
     * @param {Array} sentences 
     */
    function createSentence(sentences) {
        var output = "";
        sentences.forEach(function (val) {
            output += val + "<br>";
        });
        return output;
    }

    /**
     * Required validation
     * @this BaseProjection
     */
    function validateRequired() {
        var isValid = true;
        // required validation
        if (!this.isOptional) {
            
            isValid = !_.isNullOrWhiteSpace(this.value.toString());
            if (!isValid) {
                
                this.error = "This attribute is <strong>required</strong>.";
            }
        }

        return isValid;
    }

    function validateDataType(type) {
        var isValid = true;
        switch (type) {
            case DATATYPE.ID:
                break;
            case DATATYPE.boolean:
                // TODO
                break;
            case DATATYPE.IDREF:
                var typeRef = self.type.split(':')[1];
                var data = self.ID.filter(function (x) {
                    return !_.isNullOrWhiteSpace(x.attr.val) && x.type && x.type.indexOf(typeRef) !== -1;
                });
                data = data.map(function (x) { return x.attr; });

                isValid = data.findIndex(function (value) { return value.val == self.value; }) !== -1;
                if (!isValid) {
                    let validValues = data.map(function (value) { return value.val; }).join(", ");
                    this.error = "This value is not valid reference.<br>Valid values: " + validValues;
                }
                break;
            case "char":
                isValid = this.value.length === 1;
                if (!isValid) {
                    this.error = "Please enter a valid character";
                }
                break;
            case "date":
                // TODO
                break;
            case DATATYPE.integer:
                isValid = /^(-|\+)?[0-9]+$/.test(self.value) && _.isInt(self.value);
                if (!isValid) {
                    this.error = "Please enter a valid number.";
                }
                break;
            case DATATYPE.real:
                isValid = /^(-|\+)?[0-9]+((,|\.)?[0-9]+)?$/.test(self.value);
                if (!isValid) {
                    this.error = "Please enter a valid number.";
                }
                break;
            case "word":
                isValid = /^[A-Za-z-]$/.test(self.value);
                if (!isValid) {
                    this.error = "Please enter a valid word.";
                }
                break;
            default:
                break;
        }

        return isValid;
    }

    return {
        Base: BaseProjection,
        Abstract: AbstractProjection,
        Enum: EnumProjection,
        DataType: DataTypeProjection,
        Pointer: PointerProjection
    };
})(UTIL, HELPER, Exception);