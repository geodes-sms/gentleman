import { ModelAttributeBase } from './mattr-base';
import { createProjection } from './fn';
import { UI, ModelAttributeProperty as Prop } from '@src/enums';
import { UTILS, HELPER } from '@utils';

export const SingleValueAttribute = (function ($, _) {

    // ClassName
    const ATTR_WRAPPER = 'attr-wrapper';

    var pub = ModelAttributeBase.create({
        init() {
            var self = this;
            if (!_.hasOwn(self._source, Prop.VAL))
                self._source.val = self.MODEL.createInstance(self._type);

            self._fnUpdate = function (val) {
                self.value = val;
            };
        },
        render_attr() {
            var self = this;

            var container;

            if (self.representation) {
                container = $.createDiv({ class: [ATTR_WRAPPER, UI.EMPTY] });
                let surround = self.representation.val.split('$val');
                Object.assign(container.dataset, { before: surround[0], after: surround[1] });
            } else {
                container = $.createDocFragment();
            }

            container.appendChild(self.handler(self._source, self.value, self.path));

            return container;
        },
        createProjection: createProjection
    });

    return pub;
})(UTILS, HELPER);