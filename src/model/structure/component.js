import { isNullOrUndefined, valOrDefault } from "zenkai";
import { BaseStructure } from "./structure.js";
import { AttributeHandler } from "./attribute-handler.js";
import { ObserverHandler } from "./observer-handler.js";


const BaseComponent = {
    object: "component",

    init(args) {
        this.initObserver();
        this.initAttribute();

        if (isNullOrUndefined(args)) {
            return this;
        }

        this.id = args.id;

        for (const key in args) {
            const element = args[key];
            const [name, type] = key.split(":");
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
    /**
     * Gets the reference name (attribute) or initial name
     * @returns {string}
     */
    getName() {
        return valOrDefault(this.refname, this.name);
    },
    /**
     * Gets the alias or the name
     * @returns {string}
     */
    getAlias() {
        return valOrDefault(this.alias, this.getName());
    },

    canDelete() {
        return !this.required;
    },

    /**
     * Gets the concept parent if exist
     * @param {string} [name]
     * @returns {Concept}
     */
    getParent(name) {
        return this.concept;
    },

    /**
     * Gets the children
     * @returns {Concept}
     */
    getChildren(name) {
        const children = [];

        if (isNullOrUndefined(name)) {
            this.getAttributes().forEach(attr => {
                children.push(attr.target);
            });
        } else {
            this.getAttributes().forEach(attr => {
                if (attr.target.name === name) {
                    children.push(...attr.target);
                } else {
                    children.push(...attr.target.getChildren(name));
                }
            });
        }

        return children;
    },
    /**
     * Removes a child concept
     * @param {Concept} concept 
     * @returns {boolean} Value indicating the success of the operation
     */
    remove(concept) {
        var result = this.removeAttribute(concept.refname);

        return result;
    },
    delete() {
        this.notify("delete");

        return this.concept.removeComponent(this.name);
    },

    export() {
        var output = {};

        this.attributes.forEach(attr => {
            Object.assign(output, attr.export());
        });

        return {
            [`${this.name}:component`]: output
        };
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
    AttributeHandler
);

Object.defineProperty(Component, 'attributeSchema', { get() { return this.schema.attribute; } });