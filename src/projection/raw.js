import { UTILS as $, HELPER as _ } from '@utils/index.js';
import { UI } from '@src/enums.js';
import { BaseProjection } from './projection-base.js';

const OPTION = 'option';
const COMPOSITION = 'composition';

export const RawProjection = BaseProjection.create({
    init() {
        var self = this;

        this.terminals = [];
        _.defProp(this, 'value', {
            get() { return this._value; },
            set(val) {
                this._value = val;

                if (_.isNullOrWhiteSpace(val)) {
                    this._input.textContent = "";
                    $.addClass(this._input, UI.EMPTY);
                }
                else {
                    // let elEnum = this.values[val];
                    // this._input.textContent = Array.isArray(this.values) ? elEnum : _.valOrDefault(elEnum.val, elEnum);
                    $.removeClass(this._input, UI.EMPTY);
                }
            }
        });

        var validator = function () {
            var isValid = true;

            return isValid;
        };

        this.validators.push(validator);
    },
    object: "RAW",
    terminals: null,
    update() {
        var val = this._input.textContent;

        if (_.isNullOrWhiteSpace(val)) {
            $.addClass(this._input, UI.EMPTY);
        }

        this.handler(val);

        this._value = val;
        this._update(this.value, this.index);
    },
    handler(value) {
        var model = this._mAttribute.MODEL;
        var parentMElement = this._mAttribute.Element;
        var parentMElementAttr = parentMElement.elements[0].attributes[0];

        var arr = value.replace(/ /g, " space ")
            .replace(/(#[A-Za-z0-9_]+)/g, " $1 ")
            .split(" ")
            .filter(function (x) { return !_.isNullOrWhiteSpace(x); });

        for (let i = 0, len = arr.length, parent = parentMElementAttr; i < len; i++) {
            var mode = arr[i].charAt(0);
            var key = arr[i].substring(1);

            switch (mode) {
                case '$':

                    break;
                case '#':
                    if (this.terminals.indexOf(key) === -1) {
                        parent.add(model.createInstance(parent.type));
                        var mmElement = model.getModelElement('attribute');
                        mmElement['attr']['name'].val = key;
                        var children = parent.handler(parent._source, mmElement, parent.path);
                        parent.eHTML.appendChild(children);

                        this.terminals.push(key);
                    }
                    break;
                default:
                    break;
            }
        }
    },
    struct: undefined
});

function validateDataType(type) {
    var isValid = true;

    return isValid;
}