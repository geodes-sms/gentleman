import { DataType, EventType, UI, RepresentationType, ModelAttributeProperty as MAttrProp } from '@src/global/enums.js';
import { addClass, removeClass, getElement, createLi, createSpan, addAttributes, removeChildren, isDerivedOf, isNullOrWhitespace, valOrDefault } from '@zenkai';

const EL = UI.Element;

export const Field = {
    /**
     * Constructor
     * @param {Object} values values
     * @returns {BaseProjection}
     */
    create: function (args) {
        var instance = Object.create(this);

        Object.assign(instance, args);

        // private members
        instance._validators = [];

        if (!instance.isOptional) {
            instance.validators.push(validateRequired);
        }

        if (isDerivedOf(instance, Field)) {
            instance.init();
        }

        return instance;
    },
    id: null,
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
        if (isNullOrWhitespace(val)) {
            addClass(this._input, UI.EMPTY);
        }
        else {
            removeClass(this._input, UI.EMPTY);
        }
    },
    get name() { return this._name; },
    get description() { return this._description; },
    get isOptional() { return this._isOptional; },
    get hasError() { return !isNullOrWhitespace(this.error); },

    // get id() { return this._id; },
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
    index: 0,
    /** @type {HTMLElement} */
    element: null,
    isDisabled: false,

    createInput(editable) {
        var self = this;
        var mAttr = self._mAttribute;
        var mElement = self._mAttribute.Element;
        var inputProjection;

        // if (mAttr.type === DataType.boolean) {
        //     var chk = createCheckbox({ id: this._id, class: EL.ATTRIBUTE_BOOLEAN, data: { name: mAttr.name } });
        //     chk.dataset[MAttrProp.REPRESENTATION] = mAttr.representation.val;
        //     chk.addEventListener(EventType.CHANGE, function (e) {
        //         var checkbox = getElement('input', this);
        //         if (checkbox.checked) addClass(this, UI.CHECKED);
        //         else removeClass(this, UI.CHECKED);
        //     });
        //     this._input = chk;
        //     this.element = chk;
        //     return chk;
        // }

        this._input = createSpan({
            id: this.id,
            class: ['attr', 'empty'],
            html: "",
            data: {
                name: mAttr.name,
                type: mAttr.type,
                placeholder: mAttr.name
            }
        });
        this._input.contentEditable = valOrDefault(editable, true);
        this._input.tabIndex = 0;
        if (this._options) {
            addAttributes(this._input, this._options);
        }
        // if (mAttr.isOptional) {
        //     Object.assign(self._input.dataset, { optional: true });
        // }
        // this.value = this._val;

        inputProjection = this._input;

        // if (mAttr.isMultiple && mElement.representation.type == RepresentationType.TEXT) {
        //     var li = createLi({ class: 'array-item array-item--single', data: { prop: MAttrProp.VAL, separator: mAttr.separator } });
        //     li.appendChild(inputProjection);
        //     inputProjection = li;
        // }
        this.element = inputProjection;

        return inputProjection;
    },
    focus() { this._input.focus(); },
    focusIn() {
        var self = this;
        if (self.isOptional) {
            removeClass(this._input, UI.COLLAPSE);
        }
    },
    focusOut() {
        var self = this;
        if (self.isOptional) {
            if (isNullOrWhitespace(this.value)) {
                addClass(this._input, UI.COLLAPSE);
            }
        }
    },
    update() {
        var self = this;
        var attr = self._mAttribute;
        var val = self._input.textContent;

        if (val === "") {
            addClass(self._input, UI.EMPTY);
        }

        this.value = val;
        // update attribute
        self._update(self.value, self.index);

        if (attr.type === DataType.ID) {
            let src = attr.MODEL.ID.find(function (x) { return x.id == self.id; });
            if (src) {
                let arr = src.ref;
                for (let i = 0, len = arr.length; i < len; i++) {
                    let el = getElement('#' + arr[i]);
                    el.textContent = src.attr.val;
                    if (isNullOrWhitespace(src.attr.val)) addClass(el, UI.EMPTY);
                    else removeClass(el, UI.EMPTY);
                }
            }
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

        if (self.modelAttribute.validate(self)) {
            self.error = "";
            return true;
        }

        return false;
    },
    remove() {
        var self = this;
        removeChildren(self._input);
        self._input.remove();
        removeChildren(self.element);
        self.element.remove();
    },
    delete() {
        var self = this;
        self.modelAttribute.remove(self.index);
    },
    enable() {
        var self = this;
        self._input.contentEditable = true;
        self._input.tabIndex = 0;
        self.isDisabled = false;
    },
    disable() {
        var self = this;
        self._input.contentEditable = false;
        self._input.tabIndex = -1;
        self.isDisabled = true;
    },
};

var baseProjection = Field.create();

/**
 * Required validation
 * @this BaseProjection
 */
function validateRequired() {
    var isValid = true;
    // required validation
    if (!this.isOptional) {
        isValid = !isNullOrWhitespace(this.value.toString());
        if (!isValid) {
            this.error = "This attribute is <strong>required</strong>.";
        }
    }

    return isValid;
}