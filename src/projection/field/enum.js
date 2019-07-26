import { hasOwn, isNullOrWhitespace, valOrDefault, defProp, find } from '@zenkai';
import { addClass, removeClass } from '@zenkai';
import { UI } from '@src/global/enums.js';
import { Field } from './field.js';

export const EnumProjection = Field.create({
    init() {
        var self = this;
        defProp(this, 'value', {
            get() { return this._value; },
            set(val) {
                this._value = val;

                if (isNullOrWhitespace(val) && !Number.isInteger(val)) {
                    this._input.textContent = "";
                    addClass(this._input, UI.EMPTY);
                } else {
                    let elEnum = this.values[val];
                    this._input.textContent = Array.isArray(this.values) ? elEnum : valOrDefault(elEnum.val, elEnum);
                    removeClass(this._input, UI.EMPTY);
                }
            }
        });

        var validator = function () {
            var isValid = Array.isArray(self.values) ? +self.value < self.values.length : hasOwn(self.values, self.value);

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

        if (isNullOrWhitespace(val)) {
            addClass(self._input, UI.EMPTY);
        }

        self._value = valOrDefault(find(self.values, val), val);
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
                KV.push({ key: key, val: valOrDefault(value.val, value) });
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
