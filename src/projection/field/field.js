import { createI, removeChildren, isDerivedOf, isEmpty } from 'zenkai';
import { shake } from '@utils/index.js';


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
        instance.extras = [];
        instance.errors = [];

        return instance;
    },
    init() {
        return this;
    },
    /** @type {string} */
    id: null,
    /** @type {Editor} */
    editor: null,
    /** @type {Projection} */
    projection: null,
    /** @type {Concept} */
    concept: null,
    /** @type {*} */
    schema: null,
    /** @type {HTMLElement} */
    element: null,
    /** @type {HTMLElement[]} */
    extras: null,
    /** @type {string[]} */
    errors: null,
    /** @type {boolean} */
    hasFocus: false,
    /** @type {boolean} */
    isDisabled: false,
    
    get hasError() { return !isEmpty(this.errors); },
    get hasExtra() { return !isEmpty(this.extras); },

    focus() {
        this.element.contentEditable = false;
        this.element.focus();
        this.hasFocus = true;
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
        removeChildren(this.input);
        this.input.remove();

        removeChildren(this.element);
        this.element.remove();
    },
    delete() {
        if (this.concept.canDelete()) {
            this.concept.delete();
            removeChildren(this.element);
            this.element.replaceWith(createI({ class: "attribute--optional", dataset: { object: "attribute", id: this.concept.parent.name } }));
        } else {
            this.editor.notify("This element cannot be deleted");
            shake(this.element);
        }
    },
    enable() {
        this.input.contentEditable = true;
        this.input.tabIndex = 0;
        this.isDisabled = false;
    },
    disable() {
        this.input.contentEditable = false;
        this.input.tabIndex = -1;
        this.isDisabled = true;
    },
};