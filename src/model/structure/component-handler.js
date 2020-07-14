import { isNullOrUndefined, valOrDefault, hasOwn, isNullOrWhitespace, isEmpty } from "zenkai";
import { Component } from "./component.js";


export const ComponentHandler = {
    /** @type {Component[]} */
    components: null,

    /** @returns {ComponentHandler} */
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
    /**
     * Returns a component matching the query
     * @param {*} query
     * @returns {Component}
     */
    getComponent(query) {
        if (isNullOrUndefined(query)) {
            throw new TypeError("Bad argument");
        }

        if (query.type === "id") {
            return this.getComponentById(query.value);
        }

        return this.getComponentByName(query);
    },
    /**
     * Returns a component with the given name
     * @param {string} name 
     * @returns {Component}
     */
    getComponentByName(name) {
        if (isNullOrWhitespace(name)) {
            throw new TypeError("Bad argument");
        }

        var component = this.components.find((c) => c.name === name);
        
        if (isNullOrUndefined(component)) {
            component = this.createComponent(name);
        }

        return component;
    },
    /**
     * Returns a component with the given id
     * @param {string} id 
     * @returns {Component}
     */
    getComponentById(id) {
        if (isNullOrWhitespace(id)) {
            throw new TypeError("Bad argument");
        }

        var component = this.components.find((c) => c.id === id);

        return component;
    },
    /**
     * Creates an component
     * @param {string} name 
     * @returns {Component}
     */
    createComponent(name, value) {
        if (!this.hasComponent(name)) {
            throw new Error(`Component not found: The concept ${this.name} does not contain an component named ${name}`);
        }

        const schema = Object.assign(this.componentSchema[name], {
            name: name
        });

        var component = Component.create(this, schema).init(value);
        component.id = this.id;

        this.addComponent(component);

        return component;
    },

    /**
     * Adds a component to the list of components held by the parent concept
     * @param {Component} component 
     */
    addComponent(component) {
        if (isNullOrUndefined(component) || component.object !== "component") {
            throw new Error(`Bad argument: 'component' must be a component object`);
        }

        this.components.push(component);
        this.components._created.add(component.name);

        this.notify("component.added", component);

        return this;
    },
    /**
     * Returns a value indicating whether the concept has any components
     * @returns {boolean}
     */
    hasComponents() {
        return !isEmpty(Object.keys(this.componentSchema)) || !isEmpty(this.components);
    },
    /**
     * Returns a value indicating whether the concept has a component with the given name
     * @param {string} name Component's name
     * @returns {boolean}
     */
    hasComponent(name) {
        return hasOwn(this.componentSchema, name);
    },
    /**
     * Returns a value indicating whether the component is required
     * @param {string} name Component's name
     * @returns {boolean}
     */
    isComponentRequired(name) {
        return valOrDefault(this.componentSchema[name].required, true);
    },
    /**
     * Returns a value indicating whether the component has been created
     * @param {string} name Component's name
     * @returns {boolean}
     */
    isComponentCreated(name) {
        return this.components._created.has(name);
    },
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
        const components = [];

        for (const name in this.componentSchema) {
            let component = this.componentSchema[name];

            components.push({
                type: "component",
                name: name,
                alias: component['alias'],
                description: component['description'],
                attributes: Object.keys(component.attribute),
                required: this.isComponentRequired(name),
                created: this.isComponentCreated(name),
            });
        }

        return components;
    },
    /**
     * Removes a component from a concept if possible
     * @param {string} name 
     */
    removeComponent(name) {
        if (this.isComponentRequired(name)) {
            return {
                message: `The component '${name}' is required.`,
                success: false,
            };
        }

        var index = this.components.findIndex(comp => comp.name === name);

        if (index === -1) {
            return {
                message: `The component '${name}' was not found.`,
                success: false,
            };
        }

        var removedComponent = this.components.splice(index, 1);
        this.components._created.delete(name);

        this.notify("component.removed", removedComponent);

        return {
            message: `The component '${name}' was successfully removed.`,
            success: true,
        };
    }
};