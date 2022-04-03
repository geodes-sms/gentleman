import {
    createDocFragment, createDiv, isHTMLElement, isEmpty, isNullOrUndefined, 
} from "zenkai";
import { ContentHandler } from "./../content-handler.js";
import { Field } from "./field.js";

const BaseInteractiveField = {
    /** @type {string} */
    content : "",
    
    init(transform){

        this.transform = transform;

        return this;

    },

    render(){


        const fragment = createDocFragment();

        const { content, source, marker, markers, dd, sd, self } = this.schema;

        var parser = new DOMParser();
        
        if(!isHTMLElement(this.element)){
            this.element = createDiv({
                id: this.id,
                class: [],
                dataset:{
                    nature: "field",
                    view: "interactive",
                    id: this.id
                }
            });
        }


        if(!isHTMLElement(this.content)){
            this.content = parser.parseFromString(content.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;
            fragment.appendChild(this.content);
        }

        if(isNullOrUndefined(this.place)){
            this.place = this.content.querySelector("[data-" + source.marker + "]");
        }


        if((!isHTMLElement(this.field)) && (!isNullOrUndefined(source.tag))){
            source.type = "external";
            this.field = ContentHandler.call(this, source, null, this.args);

            switch (this.field.type){
                case "text":
                    let input = this.field.element.querySelector(".field--textbox__input");
                    input.classList.remove("field--textbox__input");
                    input.classList.add("field--svg__input");
                    break;
                case "choice":
                    let nb = this.field.choices.childNodes.length;

                    let w = 100 / nb;
                    let fs = w - 10;

                    let list = this.field.element.querySelector(".bare-list");
                    list.style.width = "inherit";
                    list.style.height = "inherit";

                    let choices = this.field.element.querySelectorAll(".field--choice__choice");
                    choices.forEach(c => {
                        c.style.width = w + "%";
                        c["style"]["font-size"] = fs + "%";
                    })
                    break;
                case "binary":
                    let box = this.field.element;
                    box.style.display = "flex";
                    box.style.border = "1px solid black";
                    if(this.field.label.innerHTML !== ""){
                        let label = this.field.element.querySelector(".field--checkbox__label");
                        label.style.width = "75%";
                        label["style"]["font-size"] = "70%"

                        this.field.element.querySelector(".field--binary__input").style.width = "25%"
                    }
            }
        }
        
        if(isNullOrUndefined(this.self) && (!(isEmpty(self) || isNullOrUndefined(self)))){
            this.self = [];
            self.forEach(s => {
                const schema = {};
                schema.property = s;
                if(isNullOrUndefined(this.place["style"][s])){
                    schema.default = this.place[s];
                }else{
                    schema.default = this.place["style"][s];
                }
                this.self.push(schema);
            })
        }

        if(isNullOrUndefined(this.sd) && (!(isEmpty(sd) || isNullOrUndefined(sd)))){
            this.sd = new Map();
            sd.forEach(temp => {
                temp.type = "template";
                var render = ContentHandler.call(this, temp, null, this.args);
                this.sd.set(render.mv, render);
            });
        }

        if(isNullOrUndefined(this.dd) && (!(isEmpty(dd) || isNullOrUndefined(dd)))){
            this.dd = [];
            dd.forEach(temp => {
                temp.type = "template";
                var render = ContentHandler.call(this, temp, null, this.args);
                this.dd.push(render);
                var attach = this.content.querySelector("[data-" + temp.marker + "]");
                if(isNullOrUndefined(attach)){
                    this.content.appendChild(render.content);
                }else{
                    attach.appendChild(render.content);
                }
            });
        }

        if(!isHTMLElement(this.foreign)){
            this.foreign = this.createForeign();
        }

        if(fragment.hasChildNodes()){
            this.element.appendChild(fragment);
        }
        
        this.initValue = this.update;
        this.bindEvents();


        return this.element;

    },

    createForeign(){
        let foreign = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
        
        if(isNullOrUndefined(this.place.getAttribute("width"))){
            foreign.setAttribute("width", 30)
        }else{
            foreign.setAttribute("width", this.place.getAttribute("width"));
        }

        if(isNullOrUndefined(this.place.getAttribute("height"))){
            foreign.setAttribute("height", 15)
        }else{
            foreign.setAttribute("height", this.place.getAttribute("height"));
        }
        
        let newX;
        let newY;

        if(isNullOrUndefined(this.place.getAttribute("x"))){
            newX = Number(this.place.getAttribute("cx"));
        }else{
            newX = Number(this.place.getAttribute("x"));
        }

        if(isNullOrUndefined(this.place.getAttribute("y"))){
            newY = Number(this.place.getAttribute("cy"));
        }else{
            newY = Number(this.place.getAttribute("y"));

        }

        if(this.place.tagName === "text" || this.place.tagName === "ellipse"){
            let box = this.place.getBBox();


            let noiX, noiY;
            if(box.width === 0){
                noiX = 30;
            }else{
                noiX = box.width;
            }

            if(box.height === 0){
                noiY = 15;
            }else{
                noiY = box.height;
            }


            let anchor;

            if(isNullOrUndefined(this.place["style"]["text-anchor"])){
                anchor = this.place.getAttribute("text-anchor");
            }else{
                anchor = this.place.getAttribute("text-anchor");
            }

            if(isNullOrUndefined(anchor)){
                anchor = "middle";
            }
            

            switch(anchor){
                case "middle":
                    newX = newX - noiX / 2;
                    break;
                case "end":
                    newX = newX - noiX;
                    break;
                default:
                    break;
            }

            newY = newY - noiY
        }

        foreign.setAttribute("x", newX);
        foreign.setAttribute("y", newY);

        foreign.classList.add("field--svg__foreign");

        foreign.appendChild(this.field.element);

        if(!isNullOrUndefined(this.place.getAttribute("transform"))){
            foreign.setAttribute("transform", this.place.getAttribute("transform")) 
        }

        return foreign;
    },

    selfUpdate(){
        let current;
        if(!isNullOrUndefined(this.aliases)){
            current = this.aliases.get(this.value);
        }
        if(!isNullOrUndefined(current)){
            current.forEach(target => {
                target.forEach(s => {
                    s.impacts.forEach(i => {
                        if(isNullOrUndefined(s.target[i.property])){
                            s.target["style"][i.property] = i.value;
                        }else{
                            s.target[i.property] = i.value;
                        }
                    })
                })
            });
        }
        if(!isNullOrUndefined(this.self)){
            this.self.forEach(s => {
                if(isNullOrUndefined(this.place["style"][s.property])){
                    this.place[s.property] = this.value;
                }else{
                    this.place["style"][s.property] = this.value;
                }
            })
        }
    },

    clear(){
        let clean;
        if(!isNullOrUndefined(this.aliases)){
            clean = this.aliases.get(this.value);
        }
        if(!isNullOrUndefined(clean)){
            clean.forEach(target => {
                target.forEach(s => {
                    s.impacts.forEach(i => {
                        if(isNullOrUndefined(s.target["style"][i.property])){
                            s.target[i.property] = i.default;
                        }else{
                            s.target["style"][i.property] = i.default;
                        }
                    })
                })
            })
        }
        if(!isNullOrUndefined(this.self)){
            this.self.forEach(s => {
                if(isNullOrUndefined(this.place["style"][s.property])){
                    this.place[s.property] = s.default;
                }else{
                    this.place["style"][s.property] = s.default;
                }
            })        
        }
    },

    updateStatics(){
        if(!isNullOrUndefined(this.sd)){
            let target = this.sd.get(this.value);
            if(!isNullOrUndefined(target)){
                this.content.appendChild(target.content);
            }
        }
    },

    clearStatics(){
        if(!isNullOrUndefined(this.sd)){
            let target = this.sd.get(this.value);
            if(!isNullOrUndefined(target)){
                target.content.parentNode.removeChild(target.content);
            }
        }
    },

    updateDynamics(value){
        if(!isNullOrUndefined(this.dd)){
            this.dd.forEach(dyna =>{
                dyna.update(value);
            })
        }
    },

    clearDynamics(value){
        if(!isNullOrUndefined(this.dd)){
            this.dd.forEach(dyna =>{
                dyna.clear(value);
            })
        }
    },

    update(value){
        if(!isNullOrUndefined(this.value)){
            this.clearStatics();
            this.clearDynamics(this.value);
            this.clear();
        }
        if(value === ""){
            this.value = this.attributeName;
        }else{
            if(!isNullOrUndefined(this.property)){
                this.value = this.translateProperty(value);
            }else{
                this.value = value;
            }
        }
        this.selfUpdate();
        this.updateDynamics(this.value);
        this.updateStatics();
    },

    bindEvents(){
        this.place.addEventListener("click", event =>{
            this.place.replaceWith(this.foreign);
            this.field.focus();
            this.parent.setIndex(this);
        });
    },

    getContent(){
        if(!isHTMLElement(this.content)){
            this.content = parser.parseFromString(content.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;
        }
       return this.content;
    },

    arrowHandler(dir, target){
        return this.parent.arrowHandler(dir, this);
    },

    focus(){
        this.focusIn();
    },

    focusIn(){
        this.place.replaceWith(this.foreign);
        this.field.focus();
    },
    
    focusOut(){
        this.foreign.replaceWith(this.place);
        if(this.field.value === ""){
            this.update(this.attributeName);
        }else{
            this.update(this.field.value);
        }
    },

    translateProperty(value){
        let ins = new Map();
        let result;
        this.property.forEach(i =>{
            switch(i.type){
                case "affectation":
                    ins.set(i.target, this.translateProc(i.proc, ins, value));
                    break;
                case "result":
                    result = this.translateProc(i.proc, ins, value);
                    return result.value;
            }
        })
        return result.value;
    },

    translateProc(proc, ins, value){
        let target = {};
        const schema = {};
        let pred;

        switch(proc.type){
            case "filter":
                pred = ins.get(proc.target);
                let result;

                if(proc.order[0] === "V"){
                    target.value = value;
                    target.type = this.source.name;
                }else{
                    target = ins.get(proc.order[0]);
                }

                if(target.type === "string"){
                    result = ""
                    for(let i = 0; i < target.value.length; i++){
                        const current = {};
                        current.type = "string";
                        current.value = target.value.charAt(i);
                        let test = this.evaluate(pred, current);
                        if(test){
                            result += target.value.charAt(i);
                        }
                    }
                }else{
                    result = [];
                    target.value.forEach(c =>{
                        let test = this.evaluate(pred, c);
                        if(test){
                            result.push(c);
                        }
                    })
                }

                schema.type = target.type;
                schema.value = result;

                return schema;
            case "lenght":
                schema.type = "int";
                if(proc.target === "V"){
                    target.value = value;
                    target.type = this.source.name;
                }else{
                    target = ins.get(proc.target);
                }
                schema.value = target.value.length;
                return schema;
            case "check":
                pred = ins.get(proc.pred);
                schema.type="bool";
                
                if(proc.param === "V"){
                    target.value = value;
                    target.type = this.source.name;
                }else{
                    target = ins.get(proc.param);
                }

                schema.value = this.evaluate(pred, target);
                return schema;
            case "pred":
               return proc;
        }
    },

    evaluate(p, elem){
        p.vars.value = elem.value;
        switch(p.op){
            case "!=":
                if(p.vars.name === p.order[0]){
                    return elem.value !== p.order[1];
                }else{
                    return elem.value != p.order[0];
                }
            case "=":
                if(p.vars.name === p.order[0]){
                    return elem.value === p.order[1];
                }else{
                    return elem.value === p.order[0];
                }
            case "<=":
                if(p.vars.name === p.order[0]){
                    return elem.value <= p.order[1];
                }else{
                    return elem.value <= p.order[0];
                }
            case "<":
                if(p.vars.name === p.order[0]){
                    return elem.value < p.order[1];
                }else{
                    return elem.value < p.order[0];
                }
            case "<=":
                if(p.vars.name === p.order[0]){
                    return elem.value <= p.order[1];
                }else{
                    return elem.value <= p.order[0];
                }
            case ">":
                if(p.vars.name === p.order[0]){
                    return elem.value > p.order[1];
                }else{
                    return elem.value > p.order[0];
                }
            case "function":
                return window[proc.fun](...proc.args);
        }
    }
}

export const InteractiveField = Object.assign(
    Object.create(Field),
    BaseInteractiveField
);