import {
    createDocFragment, createSpan, createDiv, createTextArea, createInput,
    createUnorderedList, createListItem, findAncestor, removeChildren,
    isHTMLElement, isNullOrWhitespace, isEmpty, valOrDefault, hasOwn, isNullOrUndefined, POST, isNull,
} from "zenkai";
import {
    hide, show, getCaretIndex, isHidden, NotificationType, getClosest,
    getTopElement, getBottomElement, getRightElement, getLeftElement
} from "@utils/index.js";
import { StyleHandler } from "./../style-handler.js";
import { StateHandler } from "./../state-handler.js";
import { ContentHandler, resolveValue } from "./../content-handler.js";
import { Field } from "./field.js";
import { createNotificationMessage } from "./notification.js";

const BaseInteractiveField = {
    /** @type {string} */
    content : "",
    
    init(){

        return this;

    },

    render(){


        const fragment = createDocFragment();

        const { content, marker, tag } = this.schema;

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
            })
        }


        if(!isHTMLElement(this.content)){
            this.content = parser.parseFromString(content.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;
            fragment.appendChild(this.content);
        }

        if(isNullOrUndefined(this.place)){
            this.place = this.content.querySelector("[data-" + marker + "]");
        }

        if((!isHTMLElement(this.field)) && (!isNullOrUndefined(tag))){
            this.field = ContentHandler.call(this, {type: "external", tag: tag }, null, this.args);
        }
        
        /*
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
        }*/

        if(fragment.hasChildNodes()){
            this.element.appendChild(fragment);
        }
        
        this.initValue = this.update;
        this.bindEvents();

        return this.element;

    },

    createForeign(){
        let holder = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        let foreign = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
        
        let box = this.place.getBBox();

        let r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        r.setAttribute("x", box.x);
        r.setAttribute("y", box.y);
        r.setAttribute("width", box.width);
        r.setAttribute("height", box.height);
        r.style.fill = "red";
        /*this.content.replaceWith(r)*/


        foreign.setAttribute("width", box.width);
        foreign.setAttribute("height", box.height);
        holder.setAttribute("width", box.width);
        holder.setAttribute("height", box.height);

        holder.append(foreign);
        foreign.append(this.field);

        this.place.replaceWith(holder);

        holder.setAttribute("x", 120);
        holder.setAttribute("y", 50);

        let rect = this.field.getBoundingClientRect();

        foreign.setAttribute("width", rect.width);
        foreign.setAttribute("height", rect.height);

        holder.setAttribute("viewBox", "0 0 "+ rect.width + " " + rect.height);   
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
            if(isNullOrUndefined(this.foreign)){
                this.createForeign();
                return;
            }


            this.place.replaceWith(this.foreign);
            this.field.focus();
            /*this.parent.setIndex(this);*/
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
    }
}

export const InteractiveField = Object.assign(
    Object.create(Field),
    BaseInteractiveField
);