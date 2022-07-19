import {
    createDocFragment, createSpan, createDiv, createTextArea, createInput,
    createUnorderedList, createListItem, findAncestor, removeChildren,
    isHTMLElement, isNullOrWhitespace, isEmpty, valOrDefault, hasOwn, isNullOrUndefined, isNull, first,
} from "zenkai";
import {
    hide, show, getCaretIndex, isHidden, NotificationType, getClosestSVG,
    getTopElement, getBottomElement, getRightElement, getLeftElement
} from "@utils/index.js";
import { ContentHandler, resolveValue } from "./../content-handler.js";
import { Layout } from "./layout.js";

const BaseSVGLayout = {
    
    /** @type {string} */
    content : "",


    init(){

        return this;

    },

    render(){
        const fragment = createDocFragment();

        const { content, attributes = [], link, dimensions = {}} = this.schema;

        var parser = new DOMParser();

        if(!isHTMLElement(this.element)){
            this.element = createDiv({
                id: this.id,
                class: [],
                dataset:{
                    nature: "layout",
                    view: "svg",
                    id: this.id
                }
            })
        }

        this.element.setAttribute("tabIndex", 0);
        this.focusable = true;

        if(!isHTMLElement(this.content) && content){
            this.content = parser.parseFromString(content.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;
            fragment.appendChild(this.content);
        }else{
            if(!isHTMLElement(this.content)){
                this.content = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                fragment.appendChild(this.content);
            }
        }

        if(!isEmpty(attributes)){
            attributes.forEach(a => {
                let render = ContentHandler.call(this, a.attribute);

                let attribute = this.environment.resolveElement(render);

                //this.attributeHandler(attribute, a.marker);

                if((a.marker)){
                    this.content.querySelector("[data-" + a.marker + "]").append(render);
                }else{
                    this.content.append(render);
                }


            })
        }

        if(dimensions.type){
            this.dimensions = dimensions;
        }

        /*if(isNullOrUndefined(this.link) && (!isNullOrUndefined(link.marker))){
            this.link = this.projection.schema.findIndex((x) => x.tags.includes(link.tag));
            let target = this.content.querySelector("[data-" + link.marker + "]");

            link.type = "svg-link";


            if(link.external){
                target.addEventListener('click', (event) => {
                    let concept = this.source;
                    let projection = this.environment.createProjection(concept, link.tag);

                    let window = this.environment.findWindow("side-instance");
                    if(isNullOrUndefined(window)){
                        window = this.environment.createWindow("side-instance");
                        window.container.classList.add("model-projection-sideview");
                    }

                    if(window.instances.size > 0){
                        let instance = Array.from(window.instances)[0];
                        instance.delete()
                    }

                    let instance = this.environment.createInstance(concept, projection, {
                        type: "projection",
                        close: "DELETE-PROJECTION"
                    });

                    window.addInstance(instance);
                });
            }else{
                target.addEventListener('click', (event) =>{
                    this.projection.changeView(this.link);
                })
            }

        }*/


        /*if((!isNullOrUndefined(link)) && isNullOrUndefined(this.informations)){
            let altis = this.projection.getInformations(this.link);
            this.projection.element = this;
            this.informations = altis.informations;
        }*/


        if(fragment.hasChildNodes()){
            this.element.appendChild(fragment);
        }

        return this.element;
    },

    getWidth(){
        return Number(this.content.getAttribute("width"));
    },

    getHeight(){
        return Number(this.content.getAttribute("height"));
    },

    registerDimObsever(proj){
        if(isNullOrUndefined(this.observers)){
            this.observers = [];
        }

        this.observers.push(proj);
    },

    attributeHandler(attribute, marker){       
        switch(attribute.type){
            case "interactive":
                this.content.querySelector("[data-" + marker + "]").append(attribute.content);
                break;
            case "text-svg":
                break;
            case "choice":
                break;
            default:
                //TODO: Finish
                let info = this.content.querySelector("[data-" + marker + "]");
                attribute.element.append(attribute.element);

                let holder = this.createHolder(attribute.element);
                info.append(holder);
                this.adapt(attribute.element, attribute.ratio);
                
        }
    },

    createHolder(item){
        let holder = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        let foreign = document.createElementNS("http://www.w3.org/2000/svg", "foreign");
        foreign.append(item);
        holder.append(foreign);

    },

    adapt(item, ratio){
        let rect = item.getBoundingClientRect();

        item.parentNode.setAttribute("width", rect.width);
        item.parentNode.setAttribute("height", rect.height);

        let holder = item.parentNode.parentNode;
        if(!isNullOrUndefined(ratio)){
            let w = this.content.width.baseVal.value;
            let h = this.content.height.baseVal.value;
            holder.setAttribute("width", w * ratio);
            holder.setAttribute("height", w * ratio);
        }
    },

    _attributeHandler(attributes){

        let deciders = [];

        attributes.forEach(element => {
            switch(element.placement.type){
                case "in-place":
                    let parent = this.content.querySelector("[data-" + element.placement.marker + "]");
                    
                    element.type = "svg-attribute";

                    let render = ContentHandler.call(this, element, null, this.args);

                    if(!isNullOrUndefined(element.property)){
                        render.property = propertyHandler(element.property);
                    }
        
                    deciders.push(render);

                    parent.appendChild(render.content);
                 
                    break;
                case "link-place":
                    let {type, sd = [], dd = []} = element.placement;

                    if(isNullOrUndefined(this.linkAttr)){
                        this.linkAttr = []; 
                    }

                    let current = {};

                    current.name = element.value;

                    current.field = this.informations.get(element.value);

                    if(current.field.type === "list"){
                        current.value = current.field.items;
                    }else{
                        current.value = current.field.value;
                    }
                    
                    if(!isNullOrUndefined(element.property)){
                        current.property = propertyHandler(element.property);   
                    }

                    /*dd/sd Management*/


                    if(!isEmpty(sd)){
                        current.sd = new Map();
                        sd.forEach(temp => {
                            temp.type = "template";
                            const stat = {};
                            var render = ContentHandler.call(this, temp, null, this.args);
                            stat.render = render;
                            stat.parent = this.content.querySelector("[data-" + temp.marker + "]")
                            current.sd.set(render.mv, stat);
                        });

                    }

                    if(isNullOrUndefined(this.dd) && (!(isEmpty(dd) || isNullOrUndefined(dd)))){
                        current.dd = [];
                        dd.forEach(temp => {
                            temp.type = "template";
                            var render = ContentHandler.call(this, temp, null, this.args);
                            current.dd.push(render);
                            render.property = current.property;
                            var attach = this.content.querySelector("[data-" + temp.marker + "]");
                            if(isNullOrUndefined(attach)){
                                if(this.content.getAttribute("data-" +  temp.marker) === "before"){
                                    this.content.prepend(render.content)
                                }else{
                                    this.content.appendChild(render.content);
                                }
                            }else{
                                if(attach.getAttribute("data-" +  temp.marker) === "before"){
                                    attach.prepend(render.content)
                                }else{
                                    attach.appendChild(render.content);
                                }
                            }
                        });

                    }

                    /*Check for default value*/

                    this.linkAttr.push(current);

                    break;
            }

        });
        
        return deciders;
    },

    update(){
        if(!isNullOrUndefined(this.linkAttr)){
            this.linkAttr.forEach(attr => {
                this.clearStatics(attr.sd, attr.value);
                if(!isNullOrUndefined(attr.property)){
                    this.clearDynamics(attr.dd, this.translateProperty(attr.value, attr.property));
                }else{
                    this.clearDynamics(attr.dd, attr.value);
                }
                if(attr.field.type === "list"){
                    attr.value = attr.field.items;
                }else{
                    attr.value = attr.field.value;
                }
                if(!isNullOrUndefined(attr.property)){
                    this.updateDynamics(attr.dd, this.translateProperty(attr.value, attr.property));
                }else{
                    this.updateDynamics(attr.dd, attr.value);
                }
                this.updateStatics(attr.sd, attr.value);
            })
        }
        if((!isNullOrUndefined(this.deciders)) && (!isEmpty(this.deciders))){
            this.deciders.forEach(inter => {
                inter.update(inter.field.value);
            })
        }
    },

    clearDynamics(dd, value){
        if(!isNullOrUndefined(dd)){
            dd.forEach(dyna =>{
                dyna.clear(value);
            })
        }
    },

    updateDynamics(dd, value){
        if(!isNullOrUndefined(dd)){
            dd.forEach(dyna =>{
                dyna.update(value);
            })
        }
    },

    clearStatics(sd, value){
        if(!isNullOrUndefined(sd)){
            let target = sd.get(value);
        
            if(!isNullOrUndefined(target)){
                target.parent.removeChild(target.render.content)
            }
        }
    },

    updateStatics(sd, value){
        if(!isNullOrUndefined(sd)){
            let target = sd.get(value);
            if(!isNullOrUndefined(target)){
                target.parent.appendChild(target.render.content)
            }
        }
    },

    focus(){
        this.element.focus();
        this.focused = true;
        if(!isNullOrUndefined(this.deciders)){
            this.deciders.forEach(d => {
                d.focusOut();
            })
        }
        return this;
    },

    focusIn(){
        this.focus();
        return this;
    },

    focusOut(){
        this.focused = false;
        return this;
    },

    arrowHandler(dir, target){
        if(target === this.element){
            if(isNullOrUndefined(this.parent)){
                return false;
            }
            
            return this.parent.arrowHandler(dir, this.element);
        }

        let closestElement = getClosestSVG(target.foreign, dir, this, false);

        if(!isNullOrUndefined(closestElement)){
            target.focusOut();
            closestElement.focus();
            return true
        }

        return false;

    },

    enterHandler(target){
        this.index = 0;
        this.deciders[0].focusIn();

    },

    escapeHandler(target){
        if(target !== this.element){
            return this.focus();
        }
        let parent = findAncestor(target, (el) => el.tabIndex === 0);
        let element = this.environment.resolveElement(parent);

        if (element) {
            element.focus(parent);
        }

        return false;
    },

    getDimensions(){
        switch(this.dimensions.type){
            case "absolute":
                return {
                    height: this.dimensions.height,
                    width: this.dimensions.width
                }
        }
    },

    setIndex(active){
        let newIndex = 0;
        this.deciders.forEach(d => {
            if (d.id === active.id){
                this.index = newIndex;
                return;
            }
            newIndex++;
        })
    }
}




export const SVGLayout = Object.assign(
    Object.create(Layout),
    BaseSVGLayout
);