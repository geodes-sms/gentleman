import { createI, removeChildren, isEmpty, isFunction, valOrDefault } from 'zenkai';
import { ObserverHandler } from '@structure/index.js';
import { shake, show, hide } from '@utils/index.js';
import { Concept } from '@concept/index.js';


const BaseField = {
    create(source, schema, editor) {
        const instance = Object.create(this);

        instance.source = source;
        instance.sourceType = valOrDefault(source.kind, "value");
        instance.schema = schema;
        instance.editor = editor;
        instance.attached = [];
        instance.references = [];
        instance.errors = [];
        instance.readonly = valOrDefault(schema.readonly, false);
        instance.initObserver();

        return instance;
    },
    init() {
        return this;
    },
    /** @type {string} */
    id: null,
    /** @type {Concept|Field} */
    source: null,
    /** @type {string} */
    sourceType: null,
    /** @type {*} */
    schema: null,
    /** @type {Editor} */
    editor: null,
    /** @type {Projection} */
    projection: null,

    /** @type {HTMLElement} */
    element: null,
    /** @type {HTMLElement} */
    statusElement: null,
    /** @type {HTMLElement[]} */
    attached: null,

    /** @type {string[]} */
    errors: null,
    /** @type {string[]} */
    references: null,

    /** @type {boolean} */
    readonly: false,
    /** @type {boolean} */
    visible: false,
    /** @type {boolean} */
    disabled: false,
    /** @type {boolean} */
    active: false,
    /** @type {boolean} */
    focused: false,
    /** Object nature */
    object: "field",
    kind: "field",

    get hasError() { return !isEmpty(this.errors); },
    get hasAttached() { return !isEmpty(this.attached); },
    get hasReference() { return !isEmpty(this.references); },

    attach(element, type) {
        this.attached.push(element);
    },
    detach(element) {
        this.attached.slice(this.attached.indexOf(element), 1);
    },
    getAttached(pred) {
        if (!isFunction(pred)) {
            return this.attached;
        }

        return this.attached.filter(element => pred(element));
    },
    focus() {
        this.element.contentEditable = false;
        this.element.focus();
        this.focused = true;
    },
    remove() {
        removeChildren(this.input);
        this.input.remove();

        removeChildren(this.element);
        this.element.remove();
    },
    delete() {
        var result = this.source.delete();
        
        if (result.success) {
            this.clear();
            removeChildren(this.element);
            /** @type {HTMLElement} */
            let option = createI({
                class: ["attribute--optional"],
                dataset: {
                    object: "attribute",
                    id: this.source.refname
                }
            }, this.source.refname);
            this.element.replaceWith(option);
        } else {
            this.editor.notify(result.message);
            shake(this.element);
        }
    },
    clear() {
        removeChildren(this.element);
    },
    show() {
        show(this.element);
        this.visible = true;
        this.active = true;
    },
    hide() {
        hide(this.element);
        this.visible = false;
    },
    enable() {
        this.disabled = false;
    },
    disable() {
        this.disabled = true;
    },
};


export const Field = Object.assign(
    BaseField,
    ObserverHandler
);