import { UTILS as $, HELPER as _ } from '@utils';
import { UI } from '@src/enums';
import { BaseProjection } from './projection-base.js';

export const PointerProjection = BaseProjection.create({
    init() {
        var self = this;
        var MODEL = self.modelAttribute.MODEL;

        _.defProp(this, 'value', {
            get() { return this._value; },
            set(val) {
                if (this.pointsTo) {
                    MODEL.projections[+this.pointsTo].removeReference(+this.id);
                    this.pointsTo = null;
                }
                this._value = val;
                if (_.isNullOrWhiteSpace(val)) {
                    $.addClass(this._input, UI.EMPTY);
                } else if (_.isInt(val)) {
                    var refProjection = MODEL.projections[val];
                    this.pointsTo = +val;
                    this._input.textContent = refProjection.value;
                    refProjection.addReference(+this.id);
                    $.removeClass(this._input, UI.EMPTY);
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
        if (_.isNullOrWhiteSpace(this._input.textContent)) {
            $.addClass(this._input, UI.EMPTY);
        }
    },
    pointsTo: undefined,
    reference: undefined,
    valuesKV() {
        var self = this;
        // Filter ID list by type and take only those with values
        var projections = self.modelAttribute.MODEL.ID.filter(function (x) {
            if (x.type.split('.').indexOf(self.reference) !== -1) {
                return !_.isNullOrWhiteSpace(x.projection.value);
            }
            return false;
        });

        var data = projections.map(function (x) { return { key: x.projection.id, val: x.projection.value }; });

        return data;
    }
});