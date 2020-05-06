import {
    createI, removeChildren, isDerivedOf
} from 'zenkai';
import { DataType, shake } from '@utils/index.js';


export const Field = {
    /**
     * Constructor
     * @param {Object} values values
     * @returns {BaseProjection}
     */
    create(concept, schema, editor) {
        const instance = Object.create(this);

        instance.concept = concept;
        instance.schema = schema;
        instance.editor = editor;
        instance.validators = [];

        if (isDerivedOf(instance, Field)) {
            instance.init();
        }

        return instance;
    },
    id: null,
    editor: null,
    parentProjection: null,
    concept: null,
    schema: null,

    get error() { return this._error; },
    set error(val) { this._error = val; },
    /** @type {HTMLElement} */
    element: null,
    hasFocus: false,

    createInput() { throw new Error("This function has not been implemented"); },
    focus() {
        this.element.contentEditable = false;
        this.element.focus();
        this.hasFocus = true;
    },
    focusIn() { this.hasFocus = false; },
    focusOut() { this.element.contentEditable = true; },
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
        if (this.concept.canDelete()) {
            this.concept.delete();
            removeChildren(this.element);
            this.element.replaceWith(createI({ class: "attribute--optional", data: { object: "attribute", id: this.concept.parent.name } }));
        } else {
            this.editor.notify("This element cannot be deleted");
            shake(this.element);
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