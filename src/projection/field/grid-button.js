import {
    createDocFragment, createDiv, createUnorderedList, createListItem, createButton,
    findAncestor, removeChildren, isHTMLElement, isNullOrUndefined, valOrDefault, hasOwn,
} from "zenkai";
import {
    hide, show, shake, NotificationType, getClosest, isHidden,
    getTopElement, getBottomElement, getRightElement, getLeftElement
} from "@utils/index.js";
import { StyleHandler } from "./../style-handler.js";
import { ContentHandler } from "./../content-handler.js";
import { StateHandler } from "./../state-handler.js";
import { Field } from "./field.js";
import { nodes } from "coffeescript";


/**
 * Verifies whether this element is valid
 * @param {HTMLElement} element 
 * @returns {boolean}
 * @this {BaseListField}
 */
 function isValid(element) {
    if (!isHTMLElement(element)) {
        return false;
    }

    const { nature, id } = element.dataset;

    return nature === "field-component" && id === this.id;
}

const BaseGridButton = {

    init(){
        this.elements = new Map();

        return this;
    },

    render(){
        const fragment = createDocFragment();

        const { action = {}, targetGrid } = this.schema;

        if (!isHTMLElement(this.element)) {
            this.element = createDiv({
                id: this.id,
                class: ["field", "grid-button"],
                tabindex: -1,
                dataset: {
                    nature: "field",
                    view: "list",
                    id: this.id,
                }
            });

            if (this.readonly) {
                this.element.classList.add("readonly");
            }

            StyleHandler.call(this.projection, this.element, this.schema.style);
        }

        if(action){
            const { position = "after", content, help, style } = action;

            let addElement = createButton({
                class: ["field-action", "field--list__add"],
                tabindex: 0,
                title: help,
                dataset: {
                    nature: "field-component",
                    view: "list",
                    component: "action",
                    id: this.id,
                    action: "add",
                }
            });

            content.forEach(element => {
                let content = ContentHandler.call(this, element, null, { focusable: false });

                addElement.append(content);
            });

            action.currentState = null;
            this.elements.set(action, addElement);

            StyleHandler.call(this.projection, addElement, style);

            fragment.appendChild(addElement);
        }        

        if(fragment.hasChildNodes()){
            this.element.append(fragment);
        }

        this.bindEvent();

        return this.element;
    },

    focusIn(){
    },

    clickHandler(target) {
        const getComponent = (element) => {
            if (isValid.call(this, element)) {
                return element;
            }

            return findAncestor(element, (el) => isValid.call(this, el), 5);
        };

        const component = getComponent(target);

        if (isNullOrUndefined(component)) {
            return;
        }

        const { action, index, name } = component.dataset;

        if (action === "add") {
            this.createElement();
        } else if (action === "remove") {
            this.delete(component.parentElement);
        }

    },

    createElement(){
        this.source.createElement();
    },

    createItem(object){
        const { node = {} } = this.schema.node;

        if(!this.model.hasProjectionSchema(object, node.tag)){
            return "";
        }

        let itemProjection = this.model.createProjection(object, node.tag);
        itemProjection.optional = true;
        itemProjection.parent = this.projection;

        //itemProjection.parent = this.parent.projection;
        //itemProjection.element.parent = this.parent;
        
        let container = itemProjection.init().render();
        container.dataset.index = object.index;

        return container;
    },

    addItem(value){
        this.targetGrid.addItem(value, this);

        /*this.element.append(item);*/

        return this;
    },

    removeItem(value){
        this.targetGrid.removeItem(value);
    },

    focusOut(){

    },

    bindEvent(){
        this.projection.registerHandler("value.added", (value) => {
            this.addItem(value);
        });

        this.projection.registerHandler("value.removed", (value) => {
            this.removeItem(value);
        })
    }
}

export const GridButton = Object.assign(
    Object.create(Field),
    BaseGridButton
);