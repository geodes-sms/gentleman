import { isNullOrUndefined, valOrDefault } from 'zenkai';
import { BinaryField } from './binary-field.js';
import { ChoiceField } from './choice-field.js';
import { ListField } from './list-field.js';
import { TableField } from './table-field.js';
import { TextField } from './text-field.js';
import { Arrow } from './arrow.js';
import { SvgText } from './temp_text.js';
import { SVGChoice } from './temp_choice.js';
import { SVGPlaceholder } from './svg-placeholder.js';
import { SVGSwitch } from './svg-switch.js';
import { SwitchField } from './temp_switch.js';
import { SpanField } from './span-field.js';
import { PlaceholderField } from './temp_placeholder.js';


const Handler = {
    'binary': (model, schema, projection) => Object.create(BinaryField, {
        object: { value: "field" },
        name: { value: "binary-field" },
        type: { value: "binary" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept },
    }),
    'choice': (model, schema, projection) => Object.create(ChoiceField, {
        object: { value: "field" },
        name: { value: "choice-field" },
        type: { value: "choice" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept },
    }),
    'list': (model, schema, projection) => Object.create(ListField, {
        object: { value: "field" },
        name: { value: "list-field" },
        type: { value: "list" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept },
    }),
    'table': (model, schema, projection) => Object.create(TableField, {
        object: { value: "field" },
        name: { value: "table-field" },
        type: { value: "table" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept },
    }),
    'text': (model, schema, projection) => Object.create(TextField, {
        object: { value: "field" },
        name: { value: "text-field" },
        type: { value: "text" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept },
    }),
    'arrow': (model, schema, projection) => Object.create(Arrow, {
        object: { value: "field" },
        name: { value: "arrow" },
        type: { value: "arrow" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept },
    }),
    'svg': (model, schema, projection) => Object.create(SvgText, {
        object: { value: "field" },
        name: { value: "svg" },
        type: { value: "svg" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept },
    }),
    'svg-choice': (model, schema, projection) => Object.create(SVGChoice, {
        object: { value: "field" },
        name: { value: "switch" },
        type: { value: "switch" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept },
    }),
    'svg-placeholder': (model, schema, projection) => Object.create(PlaceholderField, {
        object: { value: "field" },
        name: { value: "switch" },
        type: { value: "switch" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept },
    }),
    'svg-switch': (model, schema, projection) => Object.create(SwitchField, {
        object: { value: "field" },
        name: { value: "switch" },
        type: { value: "switch" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept },
    }),
    'span': (model, schema, projection) => Object.create(SpanField, {
        object: { value: "field" },
        name: { value: "span" },
        type: { value: "span" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
        source: { value: projection.concept }
    })
};

var inc = 0;
const nextId = () => `field${inc++}`;

export const FieldFactory = {
    createField(model, schema, projection) {
        const { type } = schema;

        const handler = Handler[type];

        if (isNullOrUndefined(handler)) {
            throw new Error(`Missing handler: The '${type}' field could not be handled`);
        }

        var field = handler(model, schema, projection);

        if (isNullOrUndefined(field)) {
            throw new Error(`Bad request: The '${type}' field could not be created`);
        }

        field.errors = [];
        field.readonly = valOrDefault(schema.readonly, false);

        if (isNullOrUndefined(field.id)) {
            field.id = nextId();
        }

        return field;
    }
};