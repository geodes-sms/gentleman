import { ModelAttributeBase } from './mattr-base.js';
import { createProjection } from './fn.js';
import { UI, ModelAttributeProperty as Prop } from '@src/enums.js';
import { UTILS, HELPER } from '@utils/index.js';

export const SingleValueAttribute = (function ($, _) {

    // ClassName
    const ATTR_WRAPPER = 'attr-wrapper';

    var pub = ModelAttributeBase.create({
        init() {
            var self = this;
            if (!_.hasOwn(this._source, Prop.VAL))
                this._source.val = this.MODEL.createInstance(this._type);

            this._fnUpdate = function (val) {
                self.value = val;
            };
        },
        render_attr() {
            var container;

            if (this.representation) {
                container = $.createDiv({ class: [ATTR_WRAPPER, UI.EMPTY] });
                let surround = this.representation.val.split('$val');
                Object.assign(container.dataset, { before: surround[0], after: surround[1] });
            } else {
                container = $.createDocFragment();
            }

            container.appendChild(this.handler(this._source, this.value, this.path));

            return container;
        },
        createProjection: createProjection
    });

    return pub;
})(UTILS, HELPER);