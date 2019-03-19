import { DataType, EventType, UI, RepresentationType, ModelAttributeProperty as MAttrProp } from '@src/enums';
import { UTILS as $, HELPER as _ } from '@utils/index.js';

const EL = UI.Element;

export const BaseProjection = {
    /**
     * Constructor
     * @param {Object} values values  
     * @returns {BaseProjection}
     */
    create: function (values) {
        var instance = Object.create(this);

        Object.assign(instance, values);

        // console.log(Object.getPrototypeOf(instance) !== BaseProjection && BaseProjection.isPrototypeOf(instance));
        // private members
        instance._validators = [];
        instance._refs = [];

        if (!instance.isOptional) {
            instance.validators.push(validateRequired);
        }
        if (_.isDerivedOf(instance, BaseProjection)) {
            instance.init();
        }

        return instance;
    },
    object: "BASE",
    prepare: function (id, val, mAttr, type, fnUpdate) {
        return Object.freeze({
            _id: id,
            _val: val,
            _mAttribute: mAttr,
            _type: type,
            _update: fnUpdate,
            _isOptional: mAttr.isOptional,
            _name: mAttr.name,
            _description: mAttr.description
        });
    },
    /** @returns {ModelAttribute} */
    get modelAttribute() { return this._mAttribute; },

    get text() {
        if (this.modelAttribute.type === DataType.boolean) {
            let chk = this._input.firstChild;
            return chk.checked ? this._input.dataset.representation : '';
        }
        return this._input.textContent;
    },
    get value() {
        return this._input.textContent;
    },
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
    get description() { return this._description; },
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
    /**
     * @returns {string[]}
     */
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
    removeReference(projectionId) {
        var index = this.refs.findIndex(function (val) { return val === projectionId; });
        this.refs.splice(index, 1);
    },
    createInput(editable) {
        var self = this;
        var mAttr = self._mAttribute;
        var mElement = self._mAttribute.Element;
        var inputProjection;

        if (mAttr.type === DataType.boolean) {
            var chk = $.createCheckbox({ id: this._id, class: EL.ATTRIBUTE_BOOLEAN, data: { name: mAttr.name } });
            chk.dataset[MAttrProp.REPRESENTATION] = mAttr.representation.val;
            chk.addEventListener(EventType.CHANGE, function (e) {
                var checkbox = $.getElement('input', this);
                if (checkbox.checked) $.addClass(this, UI.CHECKED);
                else $.removeClass(this, UI.CHECKED);
            });
            this._input = chk;
            this.element = chk;
            return chk;
        }

        this._input = $.createSpan({
            id: this._id, class: [EL.ATTRIBUTE],
            html: "",
            data: {
                name: mAttr.name,
                type: mAttr.type,
                placeholder: mAttr.name
            }
        });
        this._input.contentEditable = _.valOrDefault(editable, true);
        this._input.tabIndex = 0;
        if (this._options) {
            $.addAttributes(this._input, this._options);
        }
        if (mAttr.isOptional) {
            Object.assign(self._input.dataset, { optional: true });
        }
        this.value = this._val;

        inputProjection = this._input;

        if (mAttr.isMultiple && mElement.representation.type == RepresentationType.TEXT) {
            var li = $.createLi({ class: 'array-item array-item--single', data: { prop: MAttrProp.VAL, separator: mAttr.separator } });
            li.appendChild(inputProjection);
            inputProjection = li;
        }
        this.element = inputProjection;

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

var baseProjection = BaseProjection.create();

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