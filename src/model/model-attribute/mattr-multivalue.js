import { ModelAttributeBase } from './mattr-base.js';
import { createProjection } from './fn.js';
import { UI, ModelAttributeProperty as Prop } from '../../enums.js';
import { UTILS, HELPER } from '../../utils/index.js';
import { Exception } from '../../exception.js';
import { events } from '../../pubsub.js';

export const MultiValueAttribute = (function ($, _, ERR) {
    "use strict";

    const EL = UI.Element;
    const SEPARATOR = ',';

    var pub = ModelAttributeBase.create({
        init() {
            var self = this;

            var min = _.valOrDefault(self._source.multiple.min, 1);
            self._min = min;
            if (!_.hasOwn(self._source, Prop.VAL)) {
                if (min == 0 || self.isOptional) {
                    self._source.val = [];
                } else if (min > 0) {
                    self._source.val = [];
                    for (let i = 0; i < min; i++)
                        self._source.val.push(self.MODEL.createInstance(self._type));
                } else {
                    ERR.InvalidModelError.create("Unexpected value for the min property");
                }
            }

            self._isMultiple = true;
            self._represent = "";
            self.indexer = {};

            self._fnUpdate = function (val, index) { self.set(val, index); };
        },
        createProjection: function (val) {
            var self = this;
            var projection = createProjection.call(self, val);
            projection.index = self.count - 1;
            return projection;
        },

        get fnMultiple() { return this._fnMultiple; },
        set fnMultiple(fn) { this._fnMultiple = fn; },

        get represent() { return this._represent; },
        set represent(val) { this._represent = val; },

        multiple_handler() { this.fnMultiple(); },

        render_attr() {
            var self = this;
            var M = self.MODEL;
            var container = $.createDocFragment();

            if (self.fnMultiple) {
                return self.fnMultiple();
            } else {
                let isComposedElement = M.hasComposition(self.type);
                if (!isComposedElement) {
                    if (self.isOptional) {
                        // create add button to add more item
                        let btnCreate = $.createButtonNew(self.name, function () {
                            self.eHTML = self.createContainer(isComposedElement);
                            $.insertBeforeElement(btnCreate, self.eHTML);
                            self.initValueHandler();
                            this.remove();
                        });
                        $.addClass(btnCreate, 'inline');
                        container.appendChild(btnCreate);

                        return container;
                    }
                }

                self.eHTML = self.createContainer(isComposedElement);
                container.appendChild(self.eHTML);
                self.initValueHandler();

                return container;
            }
        },
        initValueHandler() {
            var self = this;

            var M = self.MODEL;
            var len = self.value.length;

            if (len === 0) {
                // create add button to add more item
                let btnCreate = $.createButtonNew(self.name, btnCreate_Click);
                self.eHTML.appendChild(btnCreate);
            } else {
                for (let i = 0, last = len - 1; i < len; i++) {
                    self.eHTML.appendChild(self.handler(self._source, self.value[i], self.path, i === last));
                }
                self.postChange();

                if (M.isDataType(self.type) || M.isEnum(self.type)) {
                    let btnadd = $.createButtonAdd(function () {
                        var instance = M.createInstance(self.type);
                        self.add(instance);

                        // render
                        let li = (self.handler(self._source, instance, self.path));
                        $.insertBeforeElement(this, li);
                        let btnDelete = $.createButtonDelete(li, function () {
                            self.remove(self.count - 1);
                            events.emit('model.change', 'attribute:delete_clicked');
                        });
                        li.appendChild(btnDelete);

                        // focus on first element newly created
                        $.getElement(EL.ATTRIBUTE.toClass(), li).focus();
                    });
                    self.eHTML.appendChild(btnadd);
                }
            }

            function btnCreate_Click() {
                self.add(M.createInstance(self.type));

                var lastIndex = self.count - 1;
                var children = self.handler(self._source, self.value[lastIndex], self.path);
                var parent = this.parentElement;
                parent.appendChild(children);
                $.removeClass(parent, UI.EMPTY);
                this.remove();
            }
        },
        createContainer(isComposedElement) {
            if (isComposedElement) return $.createDiv({ class: 'attr-container' });

            var self = this;
            var M = self.MODEL;

            var ul = $.createUl({
                class: "bare-list " + (M.isElement(self.type) && M.getModelElement(self.type).extensions ?
                    "list empty" : "array")
            });

            if (self._source.inline === false) $.addClass(ul, "block");
            Object.assign(ul.dataset, { multiple: true });
            if (self.representation) {
                var surround = self.representation.val.split("$val");
                Object.assign(ul.dataset, { before: surround[0], after: surround[1] });
            }

            return ul;
        },
        get(index) { return this._source.val[index]; },
        getIndex(val) { return this._source.val.indexOf(val); },
        getElement(index) {
            var self = this;
            return index < 0 ? self.elements[self.elements.length + index] : self.elements[index];
        },
        set(val, index, el) {
            var self = this;

            if (self._source.val[index] !== val) {
                self._source.val[index] = val;
                events.emit('model.change', 'ModelAttributeMultivalue[l.405]:set');
            }

            if (el) {
                self.elements[index] = el;
            }
        },
        /**
         * Adds an element to the value of the attribute.
         * @param {object} val 
         */
        add(val) {
            var self = this;

            self._source.val.push(val);
            events.emit('model.change', 'ModelAttributeMultivalue[l.416]:add');
            self.postChange();

            return self.count;
        },
        /**
         * Removes an element from the value of the attribute at the specified index.
         * @param {number} index 
         */
        remove(index) {
            var self = this;

            if (index > -1) {
                if (self.projections[index]) self.projections.splice(index, 1)[0].remove();
                if (self.elements[index]) self.elements.splice(index, 1)[0].remove();
                self._source.val.splice(index, 1);
            } else {
                self.removeAll();
            }

            self.postChange();
            var isLast = self._source.val ? self.count === 0 : false;
            if (self.name === 'category' && self.multiplicity.min > 0 && isLast) {
                var instance = self.MODEL.createInstance(self.type);
                var mElem = self.MODEL.createModelElement(instance);
                self.eHTML.appendChild(self.handler(self._source, instance, self.path, true));
                self.set(instance, index, mElem);
            }

            return self;
        },
        /**
         * Removes every child elements and projections attached to this attribute.
         * @returns {ModelAttributeMultivalue}
         */
        removeAll() {
            var self = this;

            self.projections.slice(0).forEach(function (projection) { projection.remove(); });
            self.elements.slice(0).forEach(function (el) { el.remove(); });

            // restore the source value to its initial state
            if (self._val !== undefined) {
                self.value = self._val;
            } else {
                delete self._source.val;
            }
            self.indexer = {};

            return self;
        },
        /**
         * This function is executed on every change made to the attribute value.
         */
        postChange() {
            var self = this;

            // Disable all delete buttons if the number of elements is 
            // lower or equal to the minimum required (specified in the model)
            var buttons = $.getElements('.btn-delete', self.eHTML);
            var fn = self.min < self.count ? $.enable : $.disable;
            // Change the state (enabled|disabled) of the buttons found.
            for (let i = 0, len = buttons.length; i < len; i++) {
                fn(buttons[i]);
            }
        }
    });

    _.defProp(pub, 'count', {
        get() { return this._source.val ? this._source.val.length : 0; }
    });
    _.defProp(pub, 'multiplicity', {
        get() { return this._source.multiple; }
    });
    _.defProp(pub, 'separator', {
        get() { return _.valOrDefault(this._source.separator, SEPARATOR); }
    });
    _.defProp(pub, 'min', {
        get() { return this._min; }
    });

    return pub;
})(UTILS, HELPER, Exception);