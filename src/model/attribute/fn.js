import { DataType, UI } from '@src/global/enums';
import { hasOwn, toBoolean } from '@zenkai/utils/datatype/index.js';
import { addPath } from '@zenkai/utils/path-utils.js';
import { Field, AbstractProjection, EnumProjection, PointerProjection, DataTypeProjection, RawProjection } from '@src/field';

export function createProjection(val) {
    const ABSTRACT = 'abstract';

    var M = this.MODEL;

    var element = this.MODEL.getModelElement(this.type);
    var packet = Field.prepare(this.MODEL.generateID(), val, this, this.type, this.fnUpdate);
    var projection;

    // abstract element
    if (val && hasOwn(val, ABSTRACT)) {
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
            projection = Field.create(packet);
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
    var attrPath = addPath(path, 'attr.' + attr.name);
    return Object.freeze({
        _parent: el,
        _source: attr,
        _val: attr.val,
        _name: attr.name,
        _description: attr.description,
        _path: attrPath,
        _type: attr.type,
        _isOptional: toBoolean(attr.optional),
        _representation: attr.representation
    });
}