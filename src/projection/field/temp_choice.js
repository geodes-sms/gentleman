import { ContentHandler } from "./../content-handler";
import { getClosestSVG, hide, NotificationType } from "@utils/index.js";
import { isNullOrUndefined, valOrDefault, isObject, removeChildren, findAncestor } from "zenkai";
import { Field } from "./field"
import { getElementTop, getElementBottom, getElementLeft, getElementRight } from '@utils/index.js';


/**
 * Get the choice element
 * @param {HTMLElement} element 
 * @this {BaseChoiceField}
 * @returns {HTMLElement}
 */
function getItem(element) {
    const isValid = (el) => el.parentElement === this.choices;

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

function getItemType(item) {
    const { type } = item.dataset;

    return type;
}

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

/**TO DO: Default icon when selection needed */;

const BaseSVGChoice = {
    init(args){
        Object.assign(this.schema, args);

        const { direction = "vertical", closeable = false} = this.schema;

        this.items = new Map();
        this.direction = direction;
        this.closeable = closeable;

        return this;
    },

    render(){
        const {icon = false} = this.schema;

        if(isNullOrUndefined(this.element)){
            this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.element.id = this.id;
            this.element.classList.add("field");
            this.element.tabIndex = -1;

            this.element.dataset.nature = "field";
            this.element.dataset.view = "svg-choice";
            this.element.dataset.id = this.id;
        }

        /**TO DO: create input */

        if(isNullOrUndefined(this.choices)){
            this.choices = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.element.append(this.choices);
        }


        this.values = this.source.getCandidates();

        this.values.forEach((value) => {
            this.choices.append(this.createChoiceOption(value));
        })

        if(this.source.hasValue()){
            if(this.source.schema.nature === "prototype"){
                this.setValue(this.source.getValue(true));
            }else{
                this.setValue(this.source.getValue());
            }
        }



        if(this.closeable && icon){
            this.createIcon();
        }

        this.bindEvents();

        //this.refresh();
        return this.element;
    },

    createIcon(){
        const { content = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\"><rect width=\"17\" height=\"17\" rx=\"3\" x=\"1.5\" y=\"1.5\" stroke=\"#7c7d7c\" stroke-width=\"1.5\" fill=\"#fefefe\"></rect><path d=\"M 4 4 L 10 12 L 16 4 Z\" fill=\"#4a4a4a\"></path></svg>",
        adaptable = false } = this.schema.icon;

        const parser = new DOMParser();

        this.icon = parser.parseFromString(content.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;
        this.icon.dataset.adaptable = adaptable;
        this.element.prepend(this.icon);

    },

    hasValue(){ return !isNullOrUndefined(this.value) },

    createChoiceOption(value){
        const { template = {} } = this.schema.choice.option;

        const isConcept = isObject(value);

        const container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        container.dataset.type = isConcept? "concept" : "value";
        container.dataset.value = isConcept? value.id : value;

        this.items.set(value.id, container);

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

    setValue(value, update = false){
        console.log("Setting Value");
        var response = null;

        if(update){
            response = this.source.setValue(value);

            if(!response.success){
                this.environment.notify(response.message, NotificationType.ERROR);
            }

            return true;
        }

        if(isNullOrUndefined(this.selectListValue)) {
            return;
        }

        if(isNullOrUndefined(value)){
            /**Cancel selection */
        } else {
            this.setChoice(value);
        }

        if (isNullOrUndefined(value)) {
            this.value = null;
        } else if (value.type === "concept") {
            this.value = value.id;
        } else if (value.type === "meta-concept") {
            this.value = value.name;
        } else {
            this.value = value;
        }

        const isConcept = isObject(value);

        this.selectListValue.childNodes[0].remove();

        if(/*this.selection && !this.expanded &&*/ value){
            this.selectListValue.remove();
            if(value.type === "meta-concept"){
                let choiceProjectionSchema = this.model.getProjectionSchema(value.concept, valOrDefault(tag))[0];
    
                let type = choiceProjectionSchema.type;
                let schema = {
                    "type": type,
                    [type]: choiceProjectionSchema.content || choiceProjectionSchema.projection
                }
                let render = ContentHandler.call(this, schema, value.concept, { focusable: false, meta: value.name });
                this.selectListValue.append(render);
                this.selectListValue.dataset.type = "meta-concept";
                this.selectListValue.dataset.value = value.name;
                this.selectListValueProj = this.projection.resolveElement(render);
            }else if(isConcept){
                if(!this.model.hasProjectionSchema(value, tag)){
                    return container;
                }
    
                let choiceProjection = this.model.createProjection(value, template.tag).init({focusable: false});
                choiceProjection.readonly = true;
                choiceProjection.focusable = false;
                choiceProjection.parent = this.projection;
    
                let render = choiceProjection.render();
                this.selectListValue.append(render);
                this.selectListValueProj = this.projection.resolveElement(render);
            }else{
                this.createSelectListValue(value.toString());
            }
            this.element.prepend(this.selectListValue);
            this.selectListValueProj.projection.update("displayed");
        }

        if(this.displayed){
            this.adaptView();
        }
    }, 

    updateSize(){
        if(this.fixed){
            return;
        }
        this.adaptView();
    },

    adaptView(){
        switch(this.direction){
            case "horizontal":
                this.setHorizontalSelection();
                break;
            default:
                this.setVerticalSelection();
                break;
        }
        this.parent.updateSize();
    },

    setVerticalSelection(){
        let y = 0;
        let x = 0;
        let maxW = 0;
        if(!isNullOrUndefined(this.icon)){
            x = valOrDefault(Number(this.icon.getAttribute("width")), this.icon.getBBox().width);
            this.selectListValue.setAttribute("x", x);
        }

        if(!isNullOrUndefined(this.selectListValue)){
            if(!isNullOrUndefined(this.selectListValueProj.containerView)){
                y = this.selectListValueProj.containerView.targetH;
                maxW = this.selectListValueProj.containerView.targetW;

            }else{
                let box = this.selectListValue.getBBox();
                y = box.height;
                maxW = box.width;
            }
        }

        if(this.closed){
            this.containerView.targetW = x + maxW;
            this.containerView.targetH = isNullOrUndefined(this.icon) ? y : Math.max(y, Number(this.icon.getAttribute("height")));
    
            this.element.setAttribute("width", this.containerView.targetW);
            this.element.setAttribute("height", this.containerView.targetH);

            return;
        }
        let firstElem = this.choices.childNodes[0];
        firstElem.setAttribute("x", x);
        firstElem.setAttribute("y", y);

        let proj = this.projection.resolveElement(firstElem.childNodes[0]);
    
        if(!isNullOrUndefined(proj.containerView)){
            y += proj.containerView.targetH;
            maxW = Math.max(proj.containerView.targetW, maxW);
        }else{
            let box = firstElem.getBBox();
            y += box.height;
            maxW = Math.max(box.width, maxW);
        }

        let nodes = this.choices.childNodes;

        for(let i = 1; i < nodes.length; i++){
            proj = this.projection.resolveElement(nodes[i].childNodes[0]);
            nodes[i].setAttribute("y", y);

            if(!isNullOrUndefined(proj.containerView)){
                y += proj.containerView.targetH;
                maxW = Math.max(maxW, proj.containerView.targetW); 
            }else{
                let box = nodes[i].getBBox();
                y += box.height;
                maxW = Math.max(maxW, box.height);
            }
        }

        for(let i = 0; i < nodes.length; i++){
            proj = this.projection.resolveElement(nodes[i].childNodes[0]);

            if(!isNullOrUndefined(proj.containerView)){
                nodes[i].setAttribute("x", x + (maxW - proj.containerView.targetW) / 2);
            }else{
                let box = nodes[i].getBBox();
                nodes[i].setAttribute("x", x + (maxW - box.width) / 2)
            }
        }

        if(isNullOrUndefined(this.containerView)){
            this.containerView = {
                targetW : maxW,
                targetH : y,
                contentW: maxW,
                contentH : y
            }
        }

        this.containerView.targetW = x + maxW;
        this.containerView.targetH = y;
        this.containerView.contentW = x + maxW;
        this.containerView.contentH = y;

        this.element.setAttribute("width", this.containerView.targetW);
        this.element.setAttribute("height", this.containerView.targetH);
    },

    setHorizontalSelection(){
        let firstElem = this.choices.childNodes[0];

        let proj = this.projection.resolveElement(firstElem.childNodes[0]);
    
        let x, maxH;
        if(!isNullOrUndefined(proj.containerView)){
            x = proj.containerView.targetW;
            maxH = proj.containerView.targetH;
        }else{
            if(!isNullOrUndefined(firstElem.childNodes[0].getAttribute("width")) && !isNullOrUndefined(firstElem.childNodes[0].getAttribute("height"))) {
                x = Number(firstElem.childNodes[0].getAttribute("width"));
                maxH = Number(firstElem.childNodes[0].getAttribute("height"));
            } else {
                let box = firstElem.getBBox();
                x = box.width;
                maxH = box.height;
            }

        }

        firstElem.setAttribute("x", 0);
        firstElem.setAttribute("y", 0);

        let nodes = this.choices.childNodes;

        for(let i = 1; i < nodes.length; i++){
            proj = this.projection.resolveElement(nodes[i].childNodes[0]);
            nodes[i].setAttribute("x", x);

            if(!isNullOrUndefined(proj.containerView)){
                x += proj.containerView.targetW;
                maxH = Math.max(maxH, proj.containerView.targetH); 
            }else{
                if(!isNullOrUndefined(nodes[i].childNodes[0].getAttribute("width")) && !isNullOrUndefined(nodes[i].childNodes[0].getAttribute("height"))) {
                    x += Number(nodes[i].childNodes[0].getAttribute("width"));
                    maxH = Math.max(maxH, Number(nodes[i].childNodes[0].getAttribute("height")));
                } else {
                    let box = nodes[i].getBBox();
                    x += box.width;
                    maxH =  Math.max(maxH, box.height);
                }
            }
        }

        for(let i = 1; i < nodes.length; i++){
            proj = this.projection.resolveElement(nodes[i].childNodes[0]);

            if(!isNullOrUndefined(proj.containerView)){
                nodes[i].setAttribute("y", (maxH - proj.containerView.targetH) / 2);
            }else{
                if(!isNullOrUndefined(nodes[i].childNodes[0].getAttribute("width")) && !isNullOrUndefined(nodes[i].childNodes[0].getAttribute("height"))) {
                    nodes[i].setAttribute("y", (maxH - Number(nodes[i].childNodes[0].getAttribute("height"))) / 2);
                } else {
                    let box = nodes[i].getBBox();
                    nodes[i].setAttribute("y", (maxH - box.height) / 2)
                }

            }
        }


        if(isNullOrUndefined(this.containerView)){
            this.containerView = {
                targetW : x,
                targetH : maxH,
                contentW : x,
                contentH : maxH
            }
        }

        this.containerView.targetW = x;
        this.containerView.targetH = maxH;
        this.containerView.contentW = x;
        this.containerView.contentH = maxH;

        this.element.setAttribute("width", this.containerView.targetW);
        this.element.setAttribute("height", this.containerView.targetH);
    },

    clickHandler(target){
        const item = getItem.call(this, target);

        if(!isNullOrUndefined(item) && target !== this.selection){
            let type = getItemType(item);

            if(type === "placeholder"){
                this.source.removeValue();
            } else {
                this.setValue(getItemValue.call(this, item), true);
            }
            if(this.closeable){
                this.choices.classList.add("hidden");
                this.choices.dataset.state = "close";
                this.closed = true;
            }
            this.adaptView();
        } else if (target === this.selectListValue){
            if(this.closeable){
                this.choices.classList.remove("hidden");
                this.choices.dataset.state = "open";
                this.closed = false;
            }
    
            this.adaptView();
        }
    },

    focusIn(target){
        if(!this.focused){
            this.parent.focusChild(this.element);
        }
        this.focused = true;
        this.element.classList.add("focused");

        let newChoices = []
        this.source.getCandidates()
            .filter(val => !this.values.some(value => isSame(value, val)))
            .forEach(value => {
                let choiceOption = this.createChoiceOption(value);
                this.choices.append(choiceOption);

                newChoices.push(this.projection.resolveElement(choiceOption.childNodes[0]));
                this.values.push(value);
            })
        
        if(this.closeable){
            this.choices.classList.remove("hidden");
            this.choices.dataset.state = "open";
            this.closed = false;
        }

        newChoices.forEach((choice) => {
            choice.projection.update("displayed");
        });

        this.adaptView();
        return this;
    },

    focusOut(){
        this.focused = false;
        this.element.classList.remove("focused");

        if(this.closeable){
            this.choices.classList.add("hidden");
            this.closed = true;
        }
        
        this.adaptView();
        return this;
    },

    bindEvents(){
        this.projection.registerHandler("displayed", () => {
            if(!this.parent.displayed){
                return;
            }
            if(this.displayed){
                return;
            }
            this.displayed = true;
            
            if(!isNullOrUndefined(this.selectListValue)){
                this.selectListValueProj.projection.update("displayed");
            }

            this.choices.childNodes.forEach((c) => {
                let projection = this.projection.resolveElement(c.childNodes[0]);
                projection.projection.update("displayed");
            })


            if(this.closeable){
                this.choices.classList.add("hidden");
                this.closed = true;
            }

            this.adaptView();
        })

        this.projection.registerHandler("value.changed", (value) => {
            this.setValue(value);
        })
    }
}

export const SVGChoice = Object.assign(
    Object.create(Field),
    BaseSVGChoice
)