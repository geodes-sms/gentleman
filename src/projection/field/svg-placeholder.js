import { NotificationType } from "@utils/index.js";
import { ContentHandler } from "./../content-handler";
import { findAncestor, isObject, valOrDefault } from "zenkai";
import { Field } from "./field";

const { isNullOrUndefined } = require("zenkai");

function hasDimensions(item) {
    return !isNullOrUndefined(item.getAttribute("width")) &&
    !isNullOrUndefined(item.getAttribute("width")) &&
    !isNullOrUndefined(item.getAttribute("x")) &&
    !isNullOrUndefined(item.getAttribute("y"));
}

function getItem(element) {
    const isValid = (el) => el.parentElement === this.choices;

    if (isValid(element)) {
        return element;
    }

    return findAncestor(element, isValid, 10);
}

const isSame = (val1, val2) => {

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


const BasePlaceholderField = {

    init(args) {
        Object.assign(this.schema, args);

        const { focusable = false } = this.schema;

        this.focusable = focusable;

        return this;
    },

    render() {

        if(isNullOrUndefined(this.element)) {
            this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.element.id = this.id;
            this.element.classList.add("field");
            this.element.tabIndex = -1;

            this.element.dataset.nature = "field";
            this.element.dataset.view = "svg-placeholder";
            this.element.dataset.id = this.id;
        }

        if(isNullOrUndefined(this.choices)) {
            this.choices = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.choices.tabIndex = -1;
            
            this.choices.dataset.nature = "field-component";
            this.choices.dataset.view = "svg-placeholder";
            this.choices.dataset.id = this.id;

            this.element.append(this.choices);
        }

        this.values = this.source.getCandidates();

        this.values.forEach( (value) => {
            this.choices.append(this.createChoiceOption(value));
        })

        this.bindEvents();

        return this.element;
    },

    createChoiceOption(value) {
        const { template = {} } = this.schema.choice.option;

        const isConcept = isObject(value);

        const container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        container.tabIndex = 0;

        container.dataset.nature =  "field-component";
        container.dataset.view = "choice";
        container.dataset.id = this.id;
        container.dataset.type = isConcept? "concept" : "value";
        container.dataset.value = isConcept? value.id : value;

        if(value.type === "meta-concept"){
            let choiceProjectionSchema = this.model.getProjectionSchema(value.concept, valOrDefault(template.tag))[0];

            let type = choiceProjectionSchema.type;
            let schema = {
                "type": type,
                [type]: choiceProjectionSchema.content || choiceProjectionSchema.projection
            }
            let render = ContentHandler.call(this, schema, value.concept, { focusable: false, meta: value.name });
            container.dataset.type = "meta-concept";
            container.dataset.value = value.name;
            container.append(render);
        }else if(isConcept){
            if(!this.model.hasProjectionSchema(value, template.tag)){
                return container;
            }

            let choiceProjection = this.model.createProjection(value, template.tag).init({focusable: false});
            choiceProjection.readonly = true;
            choiceProjection.focusable = false;
            choiceProjection.parent = this.projection;

            container.append(choiceProjection.render());
        }else{
            container.append(value.toString);
        }

        return container;
    },

    focusIn(){
        this.focused = true;
        this.element.classList.add("active");

        this.element.focus();

        let newChoices = []
        this.source.getCandidates()
            .filter(val => !this.values.some(value => isSame(value, val)))
            .forEach(value => {
                let choiceOption = this.createChoiceOption(value);
                this.choices.append(choiceOption);

                newChoices.push(this.projection.resolveElement(choiceOption.childNodes[0]));
                this.values.push(value);
            })

        newChoices.forEach((choice) => {
            choice.projection.update("displayed");
        });

        this.updateSize();
        return this;
    },

    focusOut(){
        this.focused = false;
        this.element.classList.remove("focused");

        this.updateSize();
        return this;
    },

    focus() {
        return;
    },

    setValue(value) {
        let response = this.source.setValue(value);

        if(!response.success){
            this.environment.notify(response.message, NotificationType.ERROR);
        }

        if(!isNullOrUndefined(this.schema.choice.link)) {
            let index = this.projection.findView(this.schema.choice.link);
            
            if(index == -1) {
                return false;
            }

            this.projection.changeView(index)

            return true;
        }
    },

    clickHandler(target) {
        const item = getItem.call(this, target);

        if(!isNullOrUndefined(item)){
            this.setValue(getItemValue.call(this, item));
        }

        return false;
    },

    updateSize() {
        if(this.fixed) {
            return;
        }

        this.fixed = true;

        let item = this.choices.childNodes[0].childNodes[0];
        let itemProjection = this.projection.resolveElement(item);

        let minX, minY, maxX, maxY;

        if(!isNullOrUndefined(itemProjection.containerView)) {
            const {targetX, targetY, targetW, targetH } = itemProjection.containerView;

            minX = targetX;
            minY = targetY;
            maxX = targetX + targetW;
            maxY = targetY + targetH;

        } else if (hasDimensions(item)) {
            minX = Number(item.getAttribute("x"));
            minY = Number(item.getAttribute("y"));
            maxX = minX + Number(item.getAttribute("width"));
            maxY = minY + Number(item.getAttribute("height"));
        } else {
            let box = item.getBBox();

            minX = box.x;
            minY = box.y;
            maxX = box.x + box.width;
            maxY = box.y + box.height;
        }

        this.choices.childNodes.forEach((node) => {
            item = node.childNodes[0];
            itemProjection = this.projection.resolveElement(item);

            if(!isNullOrUndefined(itemProjection.containerView)) {
                const {targetX, targetY, targetW, targetH } = itemProjection.containerView;
    
                minX = Math.min(minX, targetX);
                minY = Math.min(minY, targetY);
                maxX = Math.max(maxX, targetX + targetW);
                maxY = Math.max(maxY, targetY + targetH);
    
            } else if (hasDimensions(item)) {
                minX = Math.min(minX, Number(item.getAttribute("x")));
                minY = Math.min(minY, Number(item.getAttribute("y")));
                maxX = Math.max(maxX, Number(item.getAttribute("x")) + Number(item.getAttribute("width")));
                maxY = Math.max(maxY, Number(item.getAttribute("y")) + Number(item.getAttribute("height")));
            } else {
                let box = item.getBBox();
    
                minX = Math.min(minX, box.x);
                minY = Math.min(minY, box.y);
                maxX = Math.max(maxX, box.x + box.width);
                maxY = Math.max(maxY, box.y + box.height);
            }
        })

        this.element.setAttribute("width", maxX - Math.min(minX, 0));
        this.element.setAttribute("height", maxY - Math.min(minY, 0));
    },

    display() {
        if(!this.parent.displayed || this.displayed) {
            return;
        }

        this.displayed = true;

        this.element.childNodes.forEach( (node) => {
            let projection = this.projection.resolveElement(node.childNodes[0]);
            projection.projection.update("displayed");
        })

        this.updateSize();
    },

    bindEvents() {
        this.projection.registerHandler("displayed", () => {
            this.display()
        })
    }
    

}

export const PlaceholderField = Object.assign(
    Object.create(Field),
    BasePlaceholderField
    )