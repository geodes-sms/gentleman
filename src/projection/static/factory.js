import { isNullOrUndefined, valOrDefault } from 'zenkai';
import { TextStatic } from './text-static.js';


var inc = 0;
const nextId = () => `static${inc++}`;


const Handler = {
    'audio': (model, schema, projection) => Object.create(TextStatic, {
        object: { value: "static" },
        name: { value: "audio-static" },
        type: { value: "audio" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
    }),
    'image': (model, schema, projection) => Object.create(TextStatic, {
        object: { value: "static" },
        name: { value: "image-static" },
        type: { value: "image" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
    }),
    'link': (model, schema, projection) => Object.create(TextStatic, {
        object: { value: "field" },
        name: { value: "image-static" },
        type: { value: "image" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
    }),
    'text': (model, schema, projection) => Object.create(TextStatic, {
        object: { value: "static" },
        name: { value: "text-static" },
        type: { value: "text" },
        id: { value: nextId() },
        model: { value: model },
        schema: { value: schema },
        projection: { value: projection },
    }),
};

export const StaticFactory = {
    createStatic(model, schema, projection) {
        const { type } = schema;

        const handler = Handler[type];

        if (isNullOrUndefined(handler)) {
            throw new Error(`Missing handler: The '${type}' static could not be handled`);
        }

        var staticElement = handler(model, schema, projection);

        if (isNullOrUndefined(staticElement)) {
            throw new Error(`Bad request: The '${type}' static could not be created`);
        }

        staticElement.errors = [];
        staticElement.initObserver();

        if (isNullOrUndefined(staticElement.id)) {
            staticElement.id = nextId();
        }

        return staticElement;
    }
};