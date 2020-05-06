import { isNullOrUndefined, isString, valOrDefault, hasOwn, isNullOrWhitespace } from "zenkai";
import { Component } from "./component.js";


export const ComponentHandler = {
    /** @type {Component[]} */
    components: [],
    /** @returns {Component[]} */
    initComponent() {
        this.components = [];
        this.components._created = new Set();
        this.components._updated = new Set();
        this.components._deleted = new Set();

        return this;
    },
    /** @returns {Component[]} */
    getComponents() {
        return this.components;
    },
    /** @returns {Component} */
    getComponent(id) {
        if (isNullOrWhitespace(id) || !Number.isInteger(id)) {
            throw new Error("Bad parameter");
        }

        if (Number.isInteger(id)) {
            return id < this.components.length ? this.components[id] : null;
        }

        return this.getComponentByName(id);
    },
    /** @returns {Component} */
    getComponentByName(name) {
        if (isNullOrWhitespace(name)) {
            throw new Error("Bad parameter");
        }

        var component = this.components.find((c) => c.name === name);
        if (isNullOrUndefined(component)) {
            component = this.createComponent(name);
        }

        return component;
    },
    /** @returns {Component} */
    getUniqueComponent() {
        var component = this.components.find((c) => c.isUnique());

        return component;
    },
    /**
     * Creates an component
     * @param {string} name 
     * @returns {Component}
     */
    createComponent(name, value) {
        const schema = this.componentSchema[name];
        if (isNullOrUndefined(schema)) {
            throw new Error(`Component not found: The concept ${this.name} does not contain an component named ${name}`);
        }
        this.componentSchema[name].name = name;
        var component = Component.create(this, schema).init(value);
        component.id = this.id;

        this.addComponent(component);

        return component;
    },

    addComponent(component) {
        this.components.push(component);
        this.components._created.add(component.name);
    },
    /**
     * Returns a value indicating whether the concept has an component
     * @param {string} id Component's id
     * @returns {boolean}
     */
    hasComponent(id) { return hasOwn(this.componentSchema, id); },
    /**
     * Returns a value indicating whether the component is required
     * @param {string} name Component's name
     * @returns {boolean}
     */
    isComponentRequired(name) { return valOrDefault(this.componentSchema[name].required, true); },
    /**
     * Returns a value indicating whether the component has been created
     * @param {string} name Component's name
     * @returns {boolean}
     */
    isComponentCreated(name) { return this.components._created.has(name); },
    getOptionalComponents() {
        if (isNullOrUndefined(this.componentSchema)) {
            return [];
        }

        var optionalComponents = [];

        for (const compName in this.componentSchema) {
            if (!this.isComponentRequired(compName) && !this.isComponentCreated(compName)) {
                optionalComponents.push(compName);
            }
        }

        return optionalComponents;
    },
    listComponents() {
        var components = [];

        for (const compName in this.componentSchema) {
            let component = this.componentSchema[compName];
            components.push({
                type: "component",
                name: compName,
                alias: component['alias'],
                description: component['description'],
                attributes: Object.keys(component.attribute),
                required: this.isComponentRequired(compName),
                created: this.isComponentCreated(compName)
            });
        }

        return components;
    },
    removeComponent(name) {
        var removedComponent = this.components.splice(this.components.findIndex(comp => comp.name === name), 1);
        this.components._created.remove(name);

        return removedComponent.length === 1;
    }
};