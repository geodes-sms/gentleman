import { valOrDefault, isNullOrUndefined } from "zenkai";
import { BaseStructure } from "./structure.js";
import { AttributeHandler } from "./attribute-handler.js";
import { ProjectionHandler } from "@projection/projection-handler.js";
import { ObserverHandler } from "./observer-handler.js";


const BaseComponent = {
    object: "component",
    listeners: null,
    init(data) {
        this.initObserver();
        this.initAttribute();
        this.initProjection(this.schema.projection);

        if (isNullOrUndefined(data)) {
            return this;
        }

        for (const key in data) {
            const element = data[key];
            const [type, name] = key.split(".");
            switch (type) {
                case "attribute":
                    this.createAttribute(name, element);
                    break;
                default:
                    break;
            }
        }

        return this;
    },
    canDelete() { return !this.required; },
    export() {
        var output = {
            name: valOrDefault(this.name, this.id)
        };

        this.getAttributes().forEach(attr => {
            Object.assign(output, attr.export());
        });

        return output;
    },
    toString() {
        var output = {};

        this.getAttributes().forEach(attr => {
            Object.assign(output, attr.toString());
        });

        return output;
    }
};

export const Component = Object.assign(
    Object.create(BaseStructure),
    BaseComponent,
    ObserverHandler,
    AttributeHandler,
    ProjectionHandler
);

Object.defineProperty(Component, 'fullName', { get() { return `${this.concept.name}:${this.name}`; } });
Object.defineProperty(Component, 'attributeSchema', { get() { return this.schema.attribute; } });