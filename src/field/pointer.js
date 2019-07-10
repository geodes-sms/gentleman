import { defProp, isNullOrWhitespace, isInt } from '@zenkai/utils/datatype/index.js';
import { addClass, removeClass } from '@zenkai/utils/dom/index.js';
import { UI } from '@src/global/enums.js';
import { Field } from './field.js';

export const PointerProjection = Field.create({
    init() {
        var self = this;
        var MODEL = self.modelAttribute.MODEL;

        defProp(this, 'value', {
            get() { return this._value; },
            set(val) {
                if (this.pointsTo) {
                    MODEL.projections[+this.pointsTo].removeReference(+this.id);
                    this.pointsTo = null;
                }
                this._value = val;
                if (isNullOrWhitespace(val)) {
                    addClass(this._input, UI.EMPTY);
                } else if (isInt(val)) {
                    var refProjection = MODEL.projections[val];
                    this.pointsTo = +val;
                    this._input.textContent = refProjection.value;
                    refProjection.addReference(+this.id);
                    removeClass(this._input, UI.EMPTY);
                }
            }
        });

        var validator = function () {
            //model data-type validation
            return true;
        };

        this.validators.push(validator);
    },
    object: "POINTER",
    update() {
        var refProjection = this.modelAttribute.MODEL.projections[this.value];
        if (refProjection) {
            this._input.textContent = refProjection.value;
        } 
        this._update(this.value, this.index);
        if (isNullOrWhitespace(this._input.textContent)) {
            addClass(this._input, UI.EMPTY);
        }
    },
    pointsTo: undefined,
    reference: undefined,
    valuesKV() {
        var self = this;
        // Filter ID list by type and take only those with values
        var projections = self.modelAttribute.MODEL.ID.filter(function (x) {
            if (x.type.split('.').indexOf(self.reference) !== -1) {
                return !isNullOrWhitespace(x.projection.value);
            }
            return false;
        });

        var data = projections.map(function (x) { return { key: x.projection.id, val: x.projection.value }; });

        return data;
    }
});