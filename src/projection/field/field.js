import { DataType, UI, ModelAttributeProperty as MAttrProp } from '@src/global/enums.js';
import { createDiv, createUnorderedList, createListItem, appendChildren, insertAfterElement, addClass, removeClass, getElement, createSpan, addAttributes, removeChildren, isDerivedOf, isNullOrWhitespace, valOrDefault, createI } from 'zenkai';

const EL = UI.Element;

export const Field = {
    /**
     * Constructor
     * @param {Object} values values
     * @returns {BaseProjection}
     */
    create(args) {
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
    editor: null,
    parentProjection: null,
    object: "BASE",
    struct: undefined,
    getInfo() {
        return {
            type: this._mAttribute.type,
            value: this._mAttribute.value
        };
    },
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
    // get value() {
    //     return this._input.textContent;
    // },
    // set value(val) {
    //     this._input.textContent = val;
    //     if (isNullOrWhitespace(val)) {
    //         addClass(this._input, UI.EMPTY);
    //     }
    //     else {
    //         removeClass(this._input, UI.EMPTY);
    //     }
    // },
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

    getParentConcept() {
        return this.concept.parent.concept;
    },

    createInput(editable) {
        console.log(editable);
        var inputProjection;

        this._input = createSpan({
            id: this.id,
            class: ['attr', 'empty'],
            html: "",
            data: {
                nature: "attribute",
                type: this.object,
                placeholder: editable
            }
        });
        this._input.contentEditable = true;
        this._input.tabIndex = 0;
        if (this._options) {
            addAttributes(this._input, this._options);
        }

        inputProjection = this._input;

        this.element = inputProjection;

        return inputProjection;
    },
    hasElementFocus: false,
    focus() {
        this.element.contentEditable = false;
        this.element.focus();
        this.hasElementFocus = true;
    },
    focusIn() {
        this.hasElementFocus = false;
        if (this.isOptional) {
            removeClass(this._input, UI.COLLAPSE);
        }
    },
    focusOut() {
        this.element.contentEditable = true;
        if (this.isOptional) {
            if (isNullOrWhitespace(this.value)) {
                addClass(this._input, UI.COLLAPSE);
            }
        }
    },
    next() {

    },
    update() {
        var attr = this._mAttribute;
        var val = this._input.textContent;

        if (val === "") {
            addClass(this._input, UI.EMPTY);
        }

        this.value = val;
        // update attribute
        this._update(this.value, this.index);

        if (attr.type === DataType.ID) {
            let src = attr.MODEL.ID.find((x) => x.id == this.id);
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
        var isValid = true;
        var validator;
        for (validator of this.validators) {
            if (!validator.call(this)) {
                return false;
            }
        }

        if (this.modelAttribute.validate(this)) {
            this.error = "";
            return true;
        }

        return false;
    },
    remove() {
        removeChildren(this._input);
        this._input.remove();
        removeChildren(this.element);
        this.element.remove();
    },
    delete() {
        if (this.concept.parent.canDelete()) {
            this.concept.parent.delete();
            removeChildren(this.element);
            this.element.replaceWith(createI({ class: "attribute--optional", data: { object: "attribute", id: this.concept.parent.name } }));
            // this.element.remove();
        } else {
            if (!this.element.classList.contains('shake')) {
                this.editor.notify("This element cannot be deleted");
                this.element.classList.add('shake');
                setTimeout(() => {
                    this.element.classList.remove('shake');
                }, 1000);
            }
        }
    },
    enable() {
        this._input.contentEditable = true;
        this._input.tabIndex = 0;
        this.isDisabled = false;
    },
    disable() {
        this._input.contentEditable = false;
        this._input.tabIndex = -1;
        this.isDisabled = true;
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