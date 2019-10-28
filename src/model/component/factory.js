import { Component } from "./component.js";

export const ComponentFactory = {
    createComponent(concept, schema) {
        return Component.create(concept, schema);
    }
};