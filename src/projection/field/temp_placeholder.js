import { NotificationType } from "@utils/index.js";
import { ContentHandler } from "./../content-handler";
import { findAncestor, isObject, valOrDefault } from "zenkai";
import { Field } from "./field";

const { isNullOrUndefined } = require("zenkai");

function getItem(element) {
    const isValid = (el) => el.parentElement === this.choices;

    if (isValid(element)) {
        return element;
    }

    return findAncestor(element, isValid, 5);
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
    init(args){
        this.placeholders = [];

        return this;
    },

    render(){
        const {} = this.schema;

        if(isNullOrUndefined(this.element)){
            this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.element.id = this.id;
            this.element.classList.add("field");
            this.element.tabIndex = -1;

            this.element.dataset.nature = "field";
            this.element.dataset.view = "placeholder";
            this.element.dataset.id = this.id;
        }

        if(isNullOrUndefined(this.selectList)){
            this.selectList = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.element.append(this.selectList);
        }

        if(isNullOrUndefined(this.choices)){
            this.choices = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.selectList.append(this.choices);
        }

        this.values = this.source.getCandidates();
        this.values.forEach(value => {
            this.choices.append(this.createChoiceOption(value));
        })

        if(this.source.hasValue()){
            this.setValue(this.source.getValue());
        }

        if(isNullOrUndefined(this.icon)){
            this.createIcon();
            this.element.append(this.selectListValue);
        }


        this.bindEvents();

        return this.element;
    },

    createIcon(){
        this.selectListValue = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const { content = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\"><rect width=\"17\" height=\"17\" rx=\"3\" x=\"1.5\" y=\"1.5\" stroke=\"#7c7d7c\" stroke-width=\"1.5\" fill=\"#fefefe\"></rect><path d=\"M 4 4 L 10 12 L 16 4 Z\" fill=\"#4a4a4a\"></path></svg>",
        adaptable = false } = this.schema.icon;

        const parser = new DOMParser();

        this.icon = parser.parseFromString(content.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;
        this.icon.dataset.adaptable = adaptable;
        this.icon.dataset.ignore = "all";
        this.selectListValue.append(this.icon);

        this.element.prepend(this.selectListValue);

    },

    createChoiceOption(value){
        const { template = {} } = this.schema.choice.option;

        const isConcept = isObject(value);

        const container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
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
            this.projection.resolveElement(render).parent = this;
            this.placeChoice(render, container);
        }else{
            container.append(value.toString);
        }

        this.placeholders.push(container);

        return container;
    },

    placeChoice(render, container){
        let markerContainer = render.querySelector("[data-position]");

        let x = Number(markerContainer.getAttribute("data-markerX"));
        let y = Number(markerContainer.getAttribute("data-markerY"));

        container.setAttribute("x", x);
        container.setAttribute("y", y);
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

        if(isNullOrUndefined(value)){
            /**To do: cancel selection */
        } else if (value.type === "meta-concept"){
            this.value = value.name;
        } else {
            this.value = value;
        }

        this.updateSize();
    },

    updateSize(){
        this.adaptView();
        this.parent.updateSize();
    },

    adaptView(){
        if(isNullOrUndefined(this.containerView)){
            this.containerView = {}
        }

        let x = 0;
        let y = 0;
        let maxX = valOrDefault(Number(this.icon.getAttribute("width")), this.icon.getBBox().width);
        let maxY = valOrDefault(Number(this.icon.getAttribute("height")), this.icon.getBBox().height);

        if(this.closed){
            this.containerView.targetW = maxX;
            this.containerView.targetH = maxY;
            return;
        }
        
        let minX = x;
        let minY = y;

        this.placeholders.forEach(placeholder => {
            let element = placeholder.childNodes[0];
            let projection = this.projection.resolveElement(element);

            let x = valOrDefault(Number(placeholder.getAttribute("x"), element.getBBox().x));
            let y = valOrDefault(Number(placeholder.getAttribute("y"), element.getBBox().y));

            minX = Math.min(x, minX);
            minY = Math.min(y, minY);

            if(!isNullOrUndefined(projection) && !isNullOrUndefined(projection.containerView)){
                maxX = x + projection.containerView.targetW;
                maxY = y + projection.containerView.targetH;
            }else{
                maxX = x + valOrDefault(Number(element.getAttribute("width")), element.getBBox().width);
                maxY = y + valOrDefault(Number(element.getAttribute("height")), element.getBBox().height);
            }

        })

        this.containerView.targetW = maxX - minX;
        this.containerView.targetH = maxY - minY;

        return;
    },

    focusIn(){
        if(this.closeable){
            this.choices.classList.remove("hidden");
            this.choices.dataset.state = "open";
            this.closed = false;
        }

        this.adaptView();

        return this;
    },

    focusOut(){

    },

    clickHandler(target){
        const item = getItem.call(this, target);

        if(!isNullOrUndefined(item) && target !== this.selection){

            this.setValue(getItemValue.call(this, item), true);

            this.selectList.classList.add("hidden");
            this.selectList.dataset.state = "close";
            this.closed = true;
            this.updateSize();
        }else if (this.icon.contains(target)){
            this.selectList.classList.remove("hidden");
            this.selectList.dataset.state = "open";
            this.closed = false;
            this.source.removeValue();
            this.updateSize();
        }
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

            if(this.parent.displayed){
                this.placeholders.forEach((element) => {
                    this.projection.resolveElement(element.childNodes[0]).projection.update("displayed");
                })
            }

            this.closed = true;
            this.selectList.classList.add("hidden");
            this.selectList.dataset.state = "close";

            this.updateSize();
        })
    }
}

export const PlaceholderField = Object.assign({},
    Object.create(Field),
    BasePlaceholderField
    )