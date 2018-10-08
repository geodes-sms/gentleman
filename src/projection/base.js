import { DataType, EventType, UI } from '../enums.js';
import { UTILS, HELPER } from '../utils/index.js';

export const BaseProjection = (function ($, _) {
    const EL = UI.Element;

    var pub = {
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

    return pub;
})(UTILS, HELPER);