import { findAncestor, isNullOrUndefined, isObject, valOrDefault } from "zenkai";
import { Field } from "./field"
import { ContentHandler } from "./../content-handler";

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

const BaseSwitchField = {
    /** @type {SVGElement} */
    element: null,

    /** @type {Array} */
    values: null,

    /** @type {Array} */
    selectionList: null,
    /** @type {SVGElement} */
    selection: null,
    /** @type {Projection} */
    selectionProjection: null,
    /** @type {Int}*/
    selectionIndex: null,

    /** @type {boolean} */
    displayed: null,

    /** 
     * Creates the object from its schema
     * @returns An instance of SwitchField
    */
    init(){
        this.selectionList = [];

        return this;
    },

    /** 
     * Creates the SVG elements and binds the events
     * @return An SVG element
    */
    render(){
        const {} = this.schema;

        if(isNullOrUndefined(this.element)){
            this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.element.dataset.nature = "field";
            this.element.dataset.view = "switch";
            this.element.dataset.id = this.id;

            this.element.id = this.id;
            this.element.tabIndex = -1;
            this.element.classList.add("field");
        }

        this.values = this.source.getCandidates();
        this.values.forEach((value) => {
            this.selectionList.push(this.createChoiceOption(value));
        })

        if(this.source.hasValue()){
            this.setValue(this.source.getValue());
        }

        this.bindEvents();

        this.displayed = false;

        return this.element;
    },

    /**
     * Creates a projection for a possible value
     * @param {Concept} value 
     * @return A projection for the value
     */
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

    /**
     * Updated the displayed projection according to the value
     * @param {Concept} value 
     * @returns The current instance
     */
    setChoice(value){
        for(let i = 0; i < this.selectionList.length; i++){
            const item = this.selectionList[i];

            let itemValue = getItemValue.call(this, item);

            if(itemValue && isSame(itemValue, value)){
                this.element.append(item);
                let projection = this.projection.resolveElement(item.childNodes[0]);
                projection.projection.update("displayed");

                projection.updateSize();

                item.classList.add("selected");
                item.dataset.selected = "selected";
                this.selection = item.childNodes[0];
                this.selectionProjection = projection;
                this.selectionIndex = i;
            }else{
                item.classList.remove("selected");
                delete item.dataset.selected;
                item.remove();
            }
        }
        
        return this;
    },

    /**
     * Updates the value of the field. Can update the related concept value.
     * @param {Concept} value 
     * @param {boolean} update 
     * @returns nothing
     */
    setValue(value, update = false){
        var response = null;

        if(update){
            response = this.source.setValue(value);

            if(!response.success){
                this.environment.notify(response.message, NotificationType.ERROR);
            }

            return true;
        }

        this.setChoice(value);

        if(this.displayed){
            this.updateSize();
        }
    },

    /**
     * Adapts the container size
     * @return nothing
     */
    updateSize(){
        if(isNullOrUndefined(this.containerView)){
            this.containerView = {};
        }

        let box = this.selection.getBBox();

        let x = valOrDefault(Number(this.selection.getAttribute("x")), 0);
        let y = valOrDefault(Number(this.selection.getAttribute("y")), 0);

        let w, h;

        if(!isNullOrUndefined(this.selectionProjection.containerView)){
            w = this.selectionProjection.containerView.targetW;
            h = this.selectionProjection.containerView.targetH;
        }else{
            w = valOrDefault(Number(this.selection.getAttribute("width")), box.width);
            h = valOrDefault(Number(this.selection.getAttribute("height")), box.height);
        }
        

        this.containerView.targetW = x + w;
        this.containerView.targetH = y + h;
        this.containerView.contentW = x + w;
        this.containerView.contentH = y + h;

        this.parent.updateSize();
    },

    /**
     * Handles the focusin event
     * @returns this
     */
    focusIn(){
        console.warn(`FOCUSIN_HANDLER NOT IMPLEMENTED FOR ${this.name}`);
        return;
    },

    /**
     * Handles the focusin event
     * @returns this
     */
    focusOut(){
        console.warn(`FOCUSOUT_HANDLER NOT IMPLEMENTED FOR ${this.name}`);
        return;
    },

    /**
     * Handles the click event
     * Switches to the next value
     * @returns false if the event is handled
     */
    clickHandler(target){
        const item = getItem.call(this, target);


        if(!isNullOrUndefined(item) && this.selection.parentNode === item){
            this.selectionIndex = (this.selectionIndex + 1) % this.selectionList.length;
            this.setValue(this.values[this.selectionIndex], true);
        }
        return false;
    },

    /**
     * Adapts the projection to the DOM
     * @returns nothing
     */
    display() {
        if(!this.parent.displayed){
            return;
        }

        if(this.displayed){
            return;
        }

        this.displayed = true;
                    
        if(this.source.hasValue()){
            this.setValue(this.source.getValue());
        }

        this.displayed = true;
    },

    /**
     * Creates the handlers for the projection
     * @returns nothing
     */
    bindEvents(){
        this.projection.registerHandler("displayed", () => {
            this.display();
        });

        this.projection.registerHandler("value.changed", (value) => {
            this.setValue(value);
        });
    },
    
}

export const SwitchField = Object.assign(
    Object.create(Field),
    BaseSwitchField
)