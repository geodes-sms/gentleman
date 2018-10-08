import { UTILS, HELPER } from '../utils/index.js';
import { BaseProjection } from './base.js';

export const DataTypeProjection = (function ($, _) {
    return BaseProjection.create({
        init() {
            var self = this;

            var validator = function () {
                var format = self.struct.format;
                var isValid = RegExp('^' + format + '$').test(self.value);
                if (!isValid) {
                    var friendlyFormat = format.replace(/\[0-9\]\+/gi, "INT")
                        .replace(/[[\]]/gi, "'")
                        .replace("(", " (");
                    this.error = _.valOrDefault(self.element.message, "This value is not valid.<br>Format:" + friendlyFormat);
                }
                return isValid;
            };

            this.validators.push(validator);
        },
        struct: undefined
    });

    function validateDataType(type) {
        var isValid = true;
        switch (type) {
            case DataType.ID:
                break;
            case DataType.boolean:
                // TODO
                break;
            case DataType.IDREF:
                var typeRef = self.type.split(':')[1];
                var data = self.ID.filter(function (x) {
                    return !_.isNullOrWhiteSpace(x.attr.val) && x.type && x.type.indexOf(typeRef) !== -1;
                });
                data = data.map(function (x) { return x.attr; });

                isValid = data.findIndex(function (value) { return value.val == self.value; }) !== -1;
                if (!isValid) {
                    let validValues = data.map(function (value) { return value.val; }).join(", ");
                    this.error = "This value is not valid reference.<br>Valid values: " + validValues;
                }
                break;
            case 'char':
                isValid = this.value.length === 1;
                if (!isValid) {
                    this.error = "Please enter a valid character";
                }
                break;
            case 'date':
                // TODO
                break;
            case DataType.integer:
                isValid = /^(-|\+)?[0-9]+$/.test(self.value) && _.isInt(self.value);
                if (!isValid) {
                    this.error = "Please enter a valid number.";
                }
                break;
            case DataType.real:
                isValid = /^(-|\+)?[0-9]+((,|\.)?[0-9]+)?$/.test(self.value);
                if (!isValid) {
                    this.error = "Please enter a valid number.";
                }
                break;
            default:
                break;
        }

        return isValid;
    }
})(UTILS, HELPER);