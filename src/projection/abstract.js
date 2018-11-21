import { UTILS, HELPER } from '@utils';
import { UI } from '@src/enums';

export const AbstractProjection = (function ($, _) {
    const EL = UI.Element;

    var pub = {
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

        get text() { return this._input.textContent; },
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

    return pub;
})(UTILS, HELPER);