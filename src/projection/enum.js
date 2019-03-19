import { UTILS as $, HELPER as _ } from '@utils';
import { UI } from '@src/enums';
import { BaseProjection } from './projection-base.js';

export const EnumProjection = BaseProjection.create({
    init() {
        var self = this;
        _.defProp(this, 'value', {
            get() { return this._value; },
            set(val) {
                this._value = val;

                if (_.isNullOrWhiteSpace(val) && !Number.isInteger(val)) {
                    this._input.textContent = "";
                    $.addClass(this._input, UI.EMPTY);
                }
                else {
                    let elEnum = this.values[val];
                    this._input.textContent = Array.isArray(this.values) ? elEnum : _.valOrDefault(elEnum.val, elEnum);
                    $.removeClass(this._input, UI.EMPTY);
                }
            }
        });

        var validator = function () {
            var isValid = Array.isArray(self.values) ? +self.value < self.values.length : _.hasOwn(self.values, self.value);

            if (!isValid) {
                let validValues = [];
                self.valuesKV().forEach(function (prop) { validValues.push(prop.val); });

                self.error = createSentence([
                    "This value is not valid.",
                    "Valid values: " + validValues.join(", ")]);
            }
            return isValid;
        };

        this.validators.push(validator);
    },
    object: "ENUM",
    update() {
        var self = this;
        var val = self._input.textContent;

        if (_.isNullOrWhiteSpace(val)) {
            $.addClass(self._input, UI.EMPTY);
        }

        self._value = _.valOrDefault(_.find(self.values, val), val);
        self._update(self.value, self.index);
    },
    values: undefined,
    valuesKV() {
        var self = this;
        var KV = [];
        if (Array.isArray(self.values)) {
            self.values.forEach(function (val, index) {
                KV.push({ key: index, val: val });
            });
        } else {
            for (const [key, value] of Object.entries(self.values)) {
                KV.push({ key: key, val: _.valOrDefault(value.val, value) });
            }
        }

        return KV;
    }
});

/**
 * Returns an HTML sentence.
 * @param {Array} sentences 
 */
function createSentence(sentences) {
    var output = "";
    sentences.forEach(function (val) {
        output += val + "<br>";
    });
    return output;
}
