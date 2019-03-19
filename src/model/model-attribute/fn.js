import { DataType, UI } from '@src/enums';
import { HELPER as _ } from '@utils';
import { BaseProjection, AbstractProjection, EnumProjection, PointerProjection, DataTypeProjection, RawProjection } from '@src/projection';

export function createProjection(val) {
    const ABSTRACT = 'abstract';

    var M = this.MODEL;

    var element = this.MODEL.getModelElement(this.type);
    var packet = BaseProjection.prepare(this.MODEL.generateID(), val, this, this.type, this.fnUpdate);
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
    } else if (this.type === DataType.IDREF) {
        projection = PointerProjection.create(packet);
        projection.reference = this._source.ref;
    } else if (this.type === 'raw') {
        projection = RawProjection.create(packet);
        projection.struct = element;
    } else {
        projection = BaseProjection.create(packet);
    }

    // if (this.fnCreateProjection) this.fnCreateProjection(projection);

    this.projections.push(projection);
    this.MODEL.projections.push(projection);

    return projection;
}

export function prepare(el, attr, path) {
    var attrPath = _.addPath(path, 'attr.' + attr.name);
    return Object.freeze({
        _parent: el,
        _source: attr,
        _val: attr.val,
        _name: attr.name,
        _description: attr.description,
        _path: attrPath,
        _type: attr.type,
        _isOptional: _.toBoolean(attr.optional),
        _representation: attr.representation
    });
}