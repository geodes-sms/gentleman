import { findAncestor, isNullOrUndefined } from "zenkai";
import { Field } from "./field"
import { GraphicalBuilder } from "../../builder/graphical-builder";
import { SvgHelper } from "../../builder/svg-helper";

function getItem(element) {
    const isValid = (el) => this.selectionList.includes(el);

    if (isValid(element)) {
        return element;
    }

    return findAncestor(element, isValid, 5);
}


const isSame = (val1, val2) => {
    if (val1.type === "concept") {
        return isSame(val1.id, val2);
    }

    if (val2.type === "concept") {
        return isSame(val1, val2.id);
    }

    if (val1.type === "meta-concept") {
        return isSame(val1.name, val2);
    }

    if (val2.type === "meta-concept") {
        return isSame(val1, val2.name);
    }

    return val1 === val2;
};

function getItemValue(item) {
    const { type, value } = item.dataset;

    if (type === "concept") {
        return this.values.find(val => val.id === value).id;
    }

    if (type === "meta-concept") {
        return this.values.find(val => val.name === value).name;
    }

    if (type === "value") {
        return value;
    }

    if (type === "placeholder") {
        return null;
    }

    return value;
}

const BaseSwitchField = {
    /**
     * @type { SVGElement }
     * The SVG projection.
     */
    element : null,

    /**
     * Sets up the SwitchField's base attributes.
     *
     * @param args : Object. The object containing the field's properties.
     *
     * @return { BaseSwitchField } : The configurated SwitchField.
     */
    init(args) {
        Object.assign(this.schema, args);

        return this;
    },

    /**
     * Renders the SwitchField.
     *
     * @return { SVGElement } : The field's element.
     */
    render() {

        if(isNullOrUndefined(this.element)) {
            this.element = GraphicalBuilder.createField(this.id, this.name);
            SvgHelper.allowFocus(this.element);
        }

        this.refreshValues();

        return this.element;
    },

    /**
     * Creates and renders the projections of the available choices.
     */
    refreshValues() {
        if(isNullOrUndefined(this.values)) {
            this.values = [];
        }

        const newValues = this.source.getCandidates();

        this.removeOldValues(newValues);
        this.values = newValues;
        this.createNewValues(newValues);
    }



}

export const SwitchField = Object.assign(
    Object.create(Field),
    BaseSwitchField
)