import { DataType, UI } from '../../enums.js';
import { HELPER as _ } from '../../utils/index.js';
import { BaseProjection, AbstractProjection, EnumProjection, PointerProjection, DataTypeProjection } from '../../projection/index.js';

export function createProjection(val) {
    const ABSTRACT = 'abstract';

    var self = this;
    var M = self.MODEL;

    var element = self.MODEL.getModelElement(self.type);
    var packet = BaseProjection.prepare(self.MODEL.generateID(), val, self, self.type, self.fnUpdate);
    var projection;

    // abstract element
    if (val && _.hasOwn(val, ABSTRACT)) {
        projection = AbstractProjection.create(packet);
        projection.extensions = element.extensions;
    }
    else if (element) {
        let elementType = M.getModelElementType(element);
        if (M.isEnum(elementType)) {
            projection = EnumProjection.create(packet);
            projection.values = element.values;
        } else if (M.isDataType(elementType)) {
            projection = DataTypeProjection.create(packet);
            projection.struct = element;
        } else {
            projection = BaseProjection.create(packet);
        }
    } else if (self.type === DataType.IDREF) {
        projection = PointerProjection.create(packet);
        projection.reference = self._source.ref;
    } else {
        projection = BaseProjection.create(packet);
    }

    // if (self.fnCreateProjection) self.fnCreateProjection(projection);

    self.projections.push(projection);
    self.MODEL.projections.push(projection);

    return projection;
}

export function prepare(el, attr, path) {
    var attrPath = _.addPath(path, 'attr.' + attr.name);
    return Object.freeze({
        _parent: el,
        _source: attr,
        _val: attr.val,
        _name: attr.name,
        _path: attrPath,
        _type: attr.type,
        _isOptional: _.toBoolean(attr.optional),
        _representation: attr.representation
    });
}