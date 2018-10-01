/// <reference path="pubsub.js" />
/// <reference path="enums.js" />
/// <reference path="model/model.js" />
/// <reference path="helpers/helpers.js" />

var Projection = (function ($, _, ERR) {

    // State
    const EL = UI.Element;

    // ClassName
    const ATTR_WRAPPER = 'attr-wrapper';

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
        /** @returns {ModelAttribute} */
        get modelAttribute() { return this._mAttribute; },

        get value() { return this._input.textContent; },
        set value(val) {
            this._input.textContent = val;
            if (_.isNullOrWhiteSpace(val)) {
                $.addClass(this._input, UI.EMPTY);
            }
            else {
                $.removeClass(this._input, UI.EMPTY);
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
        /** @type {HTMLElement} */
        element: null,
        isDisabled: false,

        focus() { this._input.focus(); },
        focusIn() {
            var self = this;
            if (self.isOptional) {
                $.removeClass(this._input, UI.COLLAPSE);
            }
        },
        focusOut() {
            var self = this;
            if (self.isOptional) {
                if (_.isNullOrWhiteSpace(this.value)) {
                    $.addClass(this._input, UI.COLLAPSE);
                }
            }
        },
        update() {
            var self = this;
            var attr = self._mAttribute;
            var val = self._input.textContent;

            if (val === "") {
                $.addClass(self._input, UI.EMPTY);
            }

            this.value = val;
            // update attribute
            self._update(self.value, self.index);

            if (attr.type === DataType.ID) {
                let src = attr.MODEL.ID.find(function (x) { return x.id == self.id; });
                if (src) {
                    let arr = src.ref;
                    for (let i = 0, len = arr.length; i < len; i++) {
                        let el = $.getElement('#' + arr[i]);
                        el.textContent = src.attr.val;
                        if (_.isNullOrWhiteSpace(src.attr.val)) $.addClass(el, UI.EMPTY);
                        else $.removeClass(el, UI.EMPTY);
                    }
                }
            }
        },
        addReference(projectionId) { this.refs.push(projectionId); },
        createInput(editable) {
            var self = this;
            var mAttr = self._mAttribute;
            var mElement = self._mAttribute.Element;
            var inputProjection;

            if (mAttr.type === DataType.boolean) {
                var chk = $.createCheckbox({ id: this._id, class: "attr--bool", data: { name: mAttr.name } });
                chk.setAttribute('data-representation', mAttr.representation.val);
                chk.addEventListener(EventType.CHANGE, function (e) {
                    var checkbox = $.getElement('input', this);
                    if (checkbox.checked) $.addClass(this, UI.CHECKED);
                    else $.removeClass(this, UI.CHECKED);
                });
                self._input = chk;
                self.element = chk;
                return chk;
            }

            self._input = $.createSpan({
                id: self._id, class: [EL.ATTRIBUTE],
                html: "",
                data: {
                    name: mAttr.name,
                    type: mAttr.type,
                    placeholder: mAttr.name
                }
            });
            self._input.contentEditable = _.valOrDefault(editable, true);
            self._input.tabIndex = 0;
            if (self._options) {
                $.addAttributes(self._input, self._options);
            }
            if (mAttr.isOptional) {
                Object.assign(self._input.dataset, { optional: true });
            }
            self.value = self._val;

            inputProjection = self._input;

            if (mAttr.isMultiple && mElement.representation.type == 'text') {
                var li = $.createLi({ class: 'array-item', data: { prop: 'val', separator: mAttr.separator } });
                li.appendChild(inputProjection);
                inputProjection = li;
            }
            self.element = inputProjection;

            return inputProjection;
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

            if (self.modelAttribute.validate(self)) {
                self.error = "";
                return true;
            }

            return false;
        },
        remove() {
            var self = this;
            $.removeChildren(self._input);
            self._input.remove();
            $.removeChildren(self.element);
            self.element.remove();
        },
        delete() {
            var self = this;
            self.modelAttribute.remove(self.index);
        },
        disable() {
            var self = this;
            self._input.contentEditable = false;
            self._input.tabIndex = -1;
            self.isDisabled = true;
        },
        enable() {
            var self = this;
            self._input.contentEditable = true;
            self._input.tabIndex = 0;
            self.isDisabled = false;
        }
    };

    var AbstractProjection = {
        /**
         * Constructor
         * @param {Object} values values  
         * @returns {AbstractProjection}
         */
        create(values) {
            var instance = Object.create(this);

            Object.assign(instance, values);

            return instance;
        },

        prepare(id, mAttr, type) {
            return Object.freeze({
                _id: id,
                _mAttribute: mAttr,
                _type: type
            });
        },

        get value() { return this._input.textContent; },
        get id() { return this._id; },
        get modelAttribute() { return this._mAttribute; },
        /** @returns {string} an element's data-type */
        get type() { return this._type; },
        /** @returns {string} an element's data error message */
        get error() { return this._error; },
        /** @returns {int} an element's data position */
        get position() { return this._position; },

        update: function () { },
        createInput: function (editable) {
            var self = this;
            var mAttr = self._mAttribute;

            var input = $.createSpan({
                id: self._id, class: [EL.ATTRIBUTE_ABSTRACT, UI.EMPTY],
                data: {
                    name: mAttr.name,
                    type: mAttr.type,
                    placeholder: mAttr.name,
                    path: mAttr.path
                }
            });
            input.contentEditable = true;

            self._input = input;

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

            var output = self.modelElement.implement(type);
            var parent = self._input.parentElement;
            self._input.parentNode.insertBefore(output, self._input);
            self._input.remove();

            return parent;
        },
        focus() { },
        focusIn() { },
        focusOut() { },
        validate() { return true; },
        remove() {
            var self = this;
            $.removeChildren(self._input);
            self._input.remove();
        },
        delete(index) {
            var self = this;
            index = _.valOrDefault(index, self.index);
            self.modelAttribute.remove(index);
        },
        disable() {
            var self = this;
            self._input.contentEditable = false;
            self.isDisabled = true;
        },
        enable() {
            var self = this;
            self._input.contentEditable = true;
            self.isDisabled = false;
        }
    };

    var EnumProjection = BaseProjection.create({
        init() {
            var self = this;
            _.defProp(this, 'value', {
                get() { return this._value; },
                set(val) {
                    this._value = val;

                    if (_.isNullOrWhiteSpace(val) && !Number.isInteger(val)) {
                        this._input.textContent = "";
                        $.addClass(this._input, UI.EMPTY);
                    }
                    else {
                        let elEnum = this.values[val];
                        this._input.textContent = Array.isArray(this.values) ? elEnum : _.valOrDefault(elEnum.val, elEnum);
                        $.removeClass(this._input, UI.EMPTY);
                    }
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

            if (_.isNullOrWhiteSpace(val)) {
                $.addClass(self._input, UI.EMPTY);
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
                    KV.push({ key: key, val: _.valOrDefault(value.val, value) });
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
                    if (_.isNullOrWhiteSpace(val)) {
                        $.addClass(this._input, UI.EMPTY);
                    } else if (_.isInt(val)) {
                        var refProjection = MODEL.projections[val];
                        this.pointsTo = +val;
                        this._input.textContent = refProjection.value;
                        refProjection.addReference(self.id);
                        $.removeClass(this._input, UI.EMPTY);
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
                var format = self.struct.format;
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
        struct: undefined
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
            case DataType.ID:
                break;
            case DataType.boolean:
                // TODO
                break;
            case DataType.IDREF:
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
            case 'char':
                isValid = this.value.length === 1;
                if (!isValid) {
                    this.error = "Please enter a valid character";
                }
                break;
            case 'date':
                // TODO
                break;
            case DataType.integer:
                isValid = /^(-|\+)?[0-9]+$/.test(self.value) && _.isInt(self.value);
                if (!isValid) {
                    this.error = "Please enter a valid number.";
                }
                break;
            case DataType.real:
                isValid = /^(-|\+)?[0-9]+((,|\.)?[0-9]+)?$/.test(self.value);
                if (!isValid) {
                    this.error = "Please enter a valid number.";
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