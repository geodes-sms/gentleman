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

const BaseArrow ={
    init(){
        return this;
    },
    render(){
        if(!isHTMLElement(this.element)){
            this.element = createDiv({
                id: this.id,
                class: ["field", "arrow"],
                tabindex: -1,
                dataset: {
                    nature: "field",
                    view: "arrow",
                    id: this.id,
                }
            });
        }

        this.bindEvent();

        return this.element;
    },

    bindEvent(){
        this.projection.registerHandler("value.changed", (value) => {
            console.log("Here");
            this.targetGrid.addArrow(this);
        });
    }
}

export const Arrow = Object.assign(
    Object.create(Field),
    BaseArrow
);