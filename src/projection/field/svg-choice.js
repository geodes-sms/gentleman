import { ContentHandler } from "../content-handler";
import { NotificationType } from "@utils/index.js";
import { isNullOrUndefined, valOrDefault, isObject, findAncestor } from "zenkai";
import { Field } from "./field"


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


const BaseSVGChoice = {
    init(args){
        Object.assign(this.schema, args);

        const { direction = "vertical" } = this.schema;

        this.items = new Map();
        this.direction = direction;

        return this;
    },

    render(){

        if(isNullOrUndefined(this.element)){
            this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.element.id = this.id;
            this.element.classList.add("field");
            this.element.tabIndex = -1;

            this.element.dataset.nature = "field";
            this.element.dataset.view = "svg-choice";
            this.element.dataset.id = this.id;
        }

        if(isNullOrUndefined(this.choices)){
            this.choices = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.choices.tabIndex = -1;
            
            this.choices.dataset.nature = "field-component";
            this.choices.dataset.view = "svg-choice";
            this.choices.dataset.id = this.id;

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

        this.bindEvents();

        return this.element;
    },

    hasValue(){ return !isNullOrUndefined(this.value) },

    createChoiceOption(value){
        const { template = {} } = this.schema.choice.option;

        const isConcept = isObject(value);

        const container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        container.tabIndex = 0;

        container.dataset.nature =  "field-component";
        container.dataset.view = "choice";
        container.dataset.id = this.id;
        container.dataset.type = isConcept? "concept" : "value";
        container.dataset.value = isConcept? value.id : value;
        container.dataset.ignore = "all";

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
        var response = null;

        if(update){
            response = this.source.setValue(value);

            if(!response.success){
                this.environment.notify(response.message, NotificationType.ERROR);
            }

            return true;
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

    setVerticalSelection() {
        let firstElem = this.choices.childNodes[0];

        let proj = this.projection.resolveElement(firstElem.childNodes[0])

        let y, maxW;

        if(!isNullOrUndefined(proj.containerView)) {
            y = proj.containerView.targetH;
            maxW = proj.containerView.targetW;
        } else {
            if(!isNullOrUndefined(firstElem.childNodes[0].getAttribute("height")) && !isNullOrUndefined(firstElem.childNodes[0].getAttribute("width"))) {
                y = Number(firstElem.childNodes[0].getAttribute("height"));
                maxW = Number(firstElem.childNodes[0].getAttribute("width")); 
            } else {
                let box = firstElem.getBBox();
                y = box.height;
                maxW = box.width;
            }
        }

        firstElem.setAttribute("x", 0);
        firstElem.setAttribute("y", 0);

        let nodes = this.choices.childNodes;

        for(let i = 1; i < nodes.length; i++){
            proj = this.projection.resolveElement(nodes[i].childNodes[0]);
            nodes[i].setAttribute("y", y);

            if(!isNullOrUndefined(proj.containerView)){
                y += proj.containerView.targetH;
                maxW = Math.max(maxW, proj.containerView.targetW); 
            }else{
                if(!isNullOrUndefined(nodes[i].childNodes[0].getAttribute("height")) && !isNullOrUndefined(nodes[i].childNodes[0].getAttribute("width"))) {
                    y += Number(nodes[i].childNodes[0].getAttribute("height"));
                    maxW = Math.max(maxW, Number(nodes[i].childNodes[0].getAttribute("width")));
                } else {
                    let box = nodes[i].getBBox();
                    y += box.height;
                    maxW =  Math.max(maxW, box.width);
                }
            }
        }

        for(let i = 1; i < nodes.length; i++){
            proj = this.projection.resolveElement(nodes[i].childNodes[0]);

            if(!isNullOrUndefined(proj.containerView)){
                nodes[i].setAttribute("x", (maxW - proj.containerView.targetW) / 2);
            }else{
                if(!isNullOrUndefined(nodes[i].childNodes[0].getAttribute("height")) && !isNullOrUndefined(nodes[i].childNodes[0].getAttribute("width"))) {
                    nodes[i].setAttribute("x", (maxW - Number(nodes[i].childNodes[0].getAttribute("width"))) / 2);
                } else {
                    let box = nodes[i].getBBox();
                    nodes[i].setAttribute("x", (maxW - box.width) / 2)
                }

            }
        }

        this.containerView = {
            targetW : maxW,
            targetH : y,
            contentW : maxW,
            contentH : y
        }

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
        } else {
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



        this.containerView = {
            targetW : x,
            targetH : maxH,
            contentW : x,
            contentH : maxH
        }

        this.element.setAttribute("width", this.containerView.targetW);
        this.element.setAttribute("height", this.containerView.targetH);
    },

    clickHandler(target){
        const item = getItem.call(this, target);

        if(!isNullOrUndefined(item) && target !== this.selection){
            let type = getItemType(item);
            
            /** TO DO: Gestion du placeholder? */
            if(type === "placeholder"){
                this.source.removeValue();
            } else {
                this.setValue(getItemValue.call(this, item), true);
            }

           

            if(!isNullOrUndefined(this.schema.choice.redirect)) {
                const { tag } = this.schema.choice.redirect;

                let index = this.projection.findView(tag);

                if(index === -1){
                    return false;
                }
        
                this.projection.changeView(index);
            }

        }

        return false;
    },

    focusIn(){
        this.focused = true;
        this.element.classList.add("active");

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

        this.adaptView();
        return this;
    },

    focusOut(){
        this.focused = false;
        this.element.classList.remove("focused");

        this.adaptView();
        return this;
    },

    display() {
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

        this.adaptView();
    },

    bindEvents(){
        this.projection.registerHandler("displayed", () => {
            this.display()
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