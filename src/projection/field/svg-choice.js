import { Field } from "./field"
import { findAncestor, isNullOrUndefined, isObject, valOrDefault } from "zenkai";
import { GraphicalBuilder } from "../../builder/graphical-builder";
import { ContentHandler } from "../content-handler";
import { SvgHelper } from "../../builder/svg-helper";
import { NotificationType } from "@utils/index.js";

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
}


const BaseSVGChoice = {
    /**
     * @type { string }
     * The direction used to display the field.
     */
    direction: "vertical",

    /**
     * @type { SVGElement }
     * The SVG projection.
     */
    element: null,
    /**
     * @type { SVGElement }
     * The box containing the available choices.
     */
    choicesBox: null,

    /**
     * @type { Map<string, SVGElement> }
     * A Map to access the displayed choice based on their id.
     */
    items: null,
    /** @type { Array<Concept> }
     * An array of the currently displayed values.
     */
    values: null,
    /**
     * @type { boolean }
     * Indicated if the field has been added to the DOM.
     */
    displayed : false,

    /**
     * @type { Objects }
     * Describes the field's current dimension and the targeted ones.
     */
    containerView : null,

    /**
     * Sets up the ChoiceField's base attributes.
     *
     * @param args : Object. The object containing the field proprerties.
     *
     * @return { BaseSVGChoice } : The configurated ChoiceField.
     */
    init(args) {
        Object.assign(this.schema, args);

        const { direction = "vertical" } = this.schema;

        this.direction = direction;

        return this;
    },

    /**
     * Renders the ChoiceField.
     *
     * @return { SVGElement } : The field's element.
     */
    render() {

        if (isNullOrUndefined(this.element)) {
            this.element = GraphicalBuilder.createField(this.id, this.name);
        }

        if (isNullOrUndefined(this.choicesBox)) {
            this.choicesBox = GraphicalBuilder.createChoicesBox(this.id);

            this.element.append(this.choicesBox)
        }

        if(isNullOrUndefined(this.items)) {
            this.items = new Map();
        }

        this.refreshValues();
        this.bindEvents();

        return this.element;
    },

    /**
     * Creates and renders the projections of the available choices.
     */
    refreshValues() {
        if (isNullOrUndefined(this.values)) {
            this.values = [];
        }

        const newValues = this.source.getCandidates();

        this.removeOldValues(newValues);
        this.values = newValues;
        this.createNewValues(newValues);
    },

    /**
     * Removes the options that are not available anymore.
     *
     * @param newValues : Array. The new options' values.
     */
    removeOldValues(newValues) {
        this.values
            .filter(value => !newValues.some(v => isSame(v, value)))
            .forEach(choice => this.removeChoiceOption(choice));
    },

    /**
     * Removes a single option from the projection.
     *
     * @param value : Object. The option's value.
     */
    removeChoiceOption(value) {
        if(value.type === "meta-concept") {
            this.items.get(value.name).remove();
            this.items.delete(value.name);

            return;
        } else if(isObject(value)) {
            this.items.get(value.id).remove();
            this.items.delete(value.id);

            return;
        }

        this.items.get(value.toString()).remove();
        this.items.delete(value.toString());
    },

    /**
     * Creates the options that are not displayed yet.
     *
     * @param newValues : Array. The new options' values.
     */
    createNewValues(newValues) {
      newValues
          .filter(value => !this.hasItem(value))
          .forEach(choice => this.choicesBox.append(this.createChoiceOption(choice)));
    },

    /**
     * Checks if an item is displayed in the options.
     *
     * @param value : Object. The option to look for.
     *
     * @return { * | boolean } : true if the value is an option, false if not.
     */
    hasItem(value) {
        if(value.type === "concept") {
            return this.hasItem(value.id);
        }

        if(value.type === "meta-concept") {
            return this.hasItem(value.name)
        }

        return this.items.has(value);
    },

    /**
     * Creates an option for a value.
     *
     * @param value : Object. The value.
     *
     * @return { SVGElement } : A freshly created choiceOption.
     */
    createChoiceOption(value) {
        const choiceOption = GraphicalBuilder.createChoiceOption(this.id);

        if(value.type === "meta-concept") {
            const metaChoice = this.createMetaConceptChoice(value);

            choiceOption.dataset.type = "meta-concept";
            choiceOption.dataset.value = value.name;

            choiceOption.append(metaChoice);
            this.items.set(value.name, choiceOption);
        } else if (isObject(value)) {
            const conceptChoice = this.createConceptChoice(value);

            choiceOption.dataset.type = "concept";
            choiceOption.dataset.value = value.id;

            choiceOption.append(conceptChoice);
            this.items.set(value.id, choiceOption);
        } else {
            const stringValue = value.toString();

            choiceOption.dataset.type = "value";
            choiceOption.dataset.value = value;

            choiceOption.append(stringValue);
            this.items.set(stringValue, choiceOption);
        }

        return choiceOption;
    },

    /**
     * Creates the projection of a metaConcept displayed as a choice.
     *
     * @param value : Object. The metaConcept.
     *
     * @return { SVGElement } : The metaConcept's projection.
     */
    createMetaConceptChoice(value) {
        const { template } = this.schema.choice.option;

        const projectionSchema = this.model.getProjectionSchema(value.concept, valOrDefault(template.tag))[0];

        const schema = {
            "type": projectionSchema.type,
            [projectionSchema.type]: projectionSchema.content || projectionSchema.projection
        }

        return ContentHandler.call(this, schema, value.concept, { focusable: false, meta: value.name });

    },

    /**
     * Creates the projection of a concept displayed as a choice.
     *
     * @param value : Object. The concept.
     *
     * @return { SVGElement } : The concept's projection.
     */
    createConceptChoice(value) {
        const { template } = this.schema.choice.option;

        const choiceProjection = this.model.createProjection(value, template.tag).init({ focusable: false});
        choiceProjection.readonly = true;
        choiceProjection.focusable = false;
        choiceProjection.parent = this.projection;

        return choiceProjection.render();
    },

    /**
     * Updates the field's dimension.
     */
    updateSize() {
        if(this.direction === "horizontal") {
            this.updateSizeHorizontally();

        } else {
            this.updateSizeVertically();
        }

        this.parent.updateSize();
    },

    /**
     * Updates the choices disposition horizontally.
     */
    updateSizeHorizontally() {
        const avalaibleChoices = Array.from(this.items.values());

        const firstChoice = avalaibleChoices[0];

        let { height, width } = this.getItemDimensions(firstChoice);

        SvgHelper.set(firstChoice, "x", 0);
        SvgHelper.set(firstChoice, "y", 0);

        for(let $idx = 1; $idx < avalaibleChoices.length; $idx++ ) {
            const choice = avalaibleChoices[$idx];

            SvgHelper.set(choice, "x", width);
            SvgHelper.set(choice, "y", 0);

            const dimensions = this.getItemDimensions(choice);

            height = Math.max(height, dimensions.height);
            width += dimensions.width;
        }

        this.containerView = {
            targetW: width,
            targetH: height,
            contentW : width,
            contentH : height,
            w: width,
            h: height
        }

        SvgHelper.set(this.element, "width", this.containerView.targetW);
        SvgHelper.set(this.element, "height", this.containerView.targetH);
    },

    /**
     * Updates the choices disposition vertically.
     */
    updateSizeVertically() {
        const availableChoices = Array.from(this.items.values());

        const firstChoice = availableChoices[0];

        let { height , width } = this.getItemDimensions(firstChoice);

        SvgHelper.set(firstChoice, "x", 0);
        SvgHelper.set(firstChoice, "y", 0);

        for(let $idx = 1; $idx < availableChoices.length; $idx++) {
            const choice = availableChoices[$idx];

            SvgHelper.set(choice, "x", 0);
            SvgHelper.set(choice, "y", height);

            const dimensions = this.getItemDimensions(choice);

            height += height;
            width = Math.max(width, dimensions.width);
        }

        this.containerView = {
            targetW: width,
            targetH: height,
            contentW : width,
            contentH : height,
            w: width,
            h: height
        }

        SvgHelper.set(this.element, "width", this.containerView.targetW);
        SvgHelper.set(this.element, "height", this.containerView.targetH);
    },

    /**
     * Gets an item dimension.
     *
     * @param element : SVGElement. The item.
     *
     * @return { Object | SVGRect } : The SVGElement's dimensions.
     */
    getItemDimensions(element) {
        const projection = this.projection.resolveElement(SvgHelper.getChild(element));
        const svgElement = projection.container || projection.element;

        if(GraphicalBuilder.hasContainerView(projection)) {
            return { height : projection.containerView.targetH, width : projection.containerView.targetW };
        }

        if(GraphicalBuilder.hasDimensions(svgElement)) {
            return { height : Number(SvgHelper.get(svgElement, "height")), width: Number(SvgHelper.get(svgElement, "width"))};
        }

        return SvgHelper.getBox(svgElement);
    },

    /**
     * Adapts the projection when it first enters the DOM.
     */
    display() {
      if(!this.parent.displayed || this.displayed) {
          return;
      }
      this.displayed = true;

      this.displayChoices();
      this.updateSize();
    },

    /**
     * Notifies each choice that it got displayed.
     */
    displayChoices() {
        Array.from(this.items.values())
            .forEach( element => {
                const choiceProjection = this.projection.resolveElement(element);
                choiceProjection.projection.update("displayed");
            })
    },

    /**
     * Handles the click action.
     *
     * @param target : SVGElement. The target of the click.
     *
     * @return { boolean } : True if the click was handled.
     */
    clickHandler(target) {
        const item = this.getItem(target);

        if(!isNullOrUndefined(item)) {
            const { value } = item.dataset;

            this.setValue(value);
            item.focus();
        }

        return true;
    },

    /**
     * Handles the `escape` command.
     *
     * @param target : SVGElement. The active element when the `escape` command was used.
     *
     * @return { boolean } : True if the command was handled.
     */
    escapeHandler(target) {
        const item = this.getItem(target);

        if(isNullOrUndefined(item)) {

            let parent = findAncestor(target, (el) => el.tabIndex === 0);
            let element = this.projection.resolveElement(parent);

            if(element) {
                element.focus(parent);
            }

            return false;
        }

        this.element.focus();

        return true;
    },

    /**
     * Handles the `enter` command.
     *
     * @param target : SVGElement. The active element when the `enter` command was used.
     *
     * @return { boolean } : True if the command was handled.
     */
    enterHandler(target) {
        const item = this.getItem(target);

        if(item) {
            const { value } = item.dataset;

            this.setValue(value);
        } else {
            this.items.values().next()?.value().focus();
        }

        return true;
    },

    /**
     * Handles the `backspace` command.
     *
     * @param target : SVGElement. The active element when the `backspace` command was used.
     *
     * @return { boolean } : True if the command was handled.
     */
    backspaceHandler(target) {
        return true;
    },

    /**
     * Handles the `arrow` command.
     *
     * @param dir : string. The arrow's direction.
     * @param target : SVGElement. The active element when the `arrow` command was used.
     *
     * @return { boolean } : True if the command was handled.
     */
    arrowHandler(dir, target) {
        return true;
    },

    /**
     * Handles the manual focus of the element.
     *
     * @param target : HTMLElement. The element that caught focus.
     */
    focus(target) {
        this.element.focus();
    },

    /**
     * Handles the impact of getting focused.
     *
     * @return { BaseTextSVG } : This.
     */
    focusIn() {
        this.element.classList.add('active');

        this.refreshValues();
        this.updateSize();

        return this;
    },

    /**
     * Handles the impact of the focus leaving.
     *
     * @return { BaseTextSVG } : This.
     */
    focusOut() {
        this.element.classList.remove('active');

        return this;
    },

    /**
     * Updates the source's value.
     *
     * @param value : Object. The source's new value.
     */
    setValue(value) {
        const response = this.source.setValue(value);

        if(!response.success) {
            this.environment.notify(response.message, NotificationType.ERROR);
        }
    },

    /**
     * Find's the field's choice that is associated with the given SVGElement.
     *
     * @param target : SVGElement. The base element.
     *
     * @return { Element | null } : The associated choice or null if it cannot be found.
     */
    getItem(target) {
      const isValid = (element) =>  this.choicesBox === element.parentNode;

      if(isValid(target)) {
          return target;
      }

      return findAncestor(target, isValid, 5);
    },

    /**
     * Registers handlers on the projection.
     */
    bindEvents() {
        this.projection.registerHandler("displayed", () => {
            this.display();
        })
    }
}

export const SVGChoice = Object.assign(
    Object.create(Field),
    BaseSVGChoice
)