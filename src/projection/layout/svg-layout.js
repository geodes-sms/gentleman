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


        const { content, attributes = [], link} = this.schema;

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

        if(!isHTMLElement(this.content)){
            this.content = parser.parseFromString(content.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;
            fragment.appendChild(this.content);
        }


        if(isNullOrUndefined(this.link) && (!isNullOrUndefined(link))){
            this.link = this.projection.schema.findIndex((x) => x.tags.includes(link.tag));
            let target = this.content.querySelector("[data-" + link.marker + "]");

            link.type = "svg-link";

            target.addEventListener('click', (event) =>{
                this.projection.changeView(this.link);
            })
        }


        if((!isNullOrUndefined(link)) && isNullOrUndefined(this.informations)){
            let altis = this.projection.getInformations(this.link);
            this.projection.element = this;
            this.informations = altis.informations;
        }

        if(isNullOrUndefined(this.deciders) && !isEmpty(attributes)){
            this.deciders = this.attributeHandler(attributes);
            this.update();
        }

        if(fragment.hasChildNodes()){
            this.element.appendChild(fragment);
        }

        return this.element;
    },
    attributeHandler(attributes){
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
                            console.log("Sd");
                            console.log(temp);
                            temp.type = "template";
                            const stat = {};
                            var render = ContentHandler.call(this, temp, null, this.args);
                            stat.render = render;
                            stat.parent = this.content.querySelector("[data-" + temp.marker + "]")
                            console.log(stat);
                            current.sd.set(render.mv, stat);
                        });

                    }

                    console.log("Done sd");

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
        console.log("This update");
        if(!isNullOrUndefined(this.linkAttr)){
            this.linkAttr.forEach(attr => {
                console.log(attr);
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
        console.log("Deciders?");
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
            console.log(sd);
            let target = sd.get(value);
        
            if(!isNullOrUndefined(target)){
                target.parent.removeChild(target.render.content)
            }
        }
    },

    updateStatics(sd, value){
        console.log("sVal");
        console.log(value);
        console.log(sd)
        if(!isNullOrUndefined(sd)){
            let target = sd.get(value);
            console.log(target);
            if(!isNullOrUndefined(target)){
                console.log(target.render.content);            
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

    setIndex(active){
        let newIndex = 0;
        this.deciders.forEach(d => {
            if (d.id === active.id){
                this.index = newIndex;
                return;
            }
            newIndex++;
        })
    },

    translateProperty(value, property){
        let ins = new Map();
        let result;

        property.forEach(i =>{
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

                schema.type = target.type;

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
                    schema.result = result;
                    return schema;
                
                }
                if (target.type === "table") {
                    result = [];
                    target.value.forEach((values, keys) => {
                        const cur = {};
                        cur.type = "table";
                        cur.value = this.projection.resolveElement(values).value;
                        let t = this.evaluate(pred, cur);
                        if(t){
                            result.push(t);
                        }
                    })
                }
                else{
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
                    if(value instanceof Map){
                        target.type = "list";
                    }else{
                        target.type = this.source.name;
                    }
                }else{
                    target = ins.get(proc.target);
                }

                if(target.type === "list"){
                    schema.value = target.value.size;
                }else{
                    schema.value = target.value.length;
                }
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
            case "funI":
                return elem.value[p.fun].call(elem.value, p.order[0]);
            case "funO":
                return window[p.fun](...p.args);
        }
    }
}

function propertyHandler(property){
    let content = property.split(';');
    let ins = [];

    content.forEach(i => {
        const schema = {};
        let sep = i.indexOf(":");

        let type = i.substring(0, sep).replace(/\s/g, "");
        let action = i.substring(sep + 1, sep.lenght).replace(/\s/g, "");

        switch(type){
            case "VAR":
                schema.type = "affectation";
                
                let a = action.indexOf("=");
                
                schema.target = action.substring(0, a).replace(/\s/g, "");

                let proc = action.substring(a+1, action.lenght).replace(/\s/g, "");

                schema.proc = actionHandler(proc);

                ins.push(schema);

                break;
            case "RETURN":
                schema.type = "result";

                schema.proc = actionHandler(action.replace(/\s/g, ""));

                ins.push(schema);


                break;
        }

    })
    return ins;
}

function actionHandler(proc){
    const schema = {}

    let comma;
    let order;
    let vars = {};
    let target;

    let firstP = proc.indexOf("(");

    if(firstP === -1 ){
        schema.type = "value";
        schema.value = proc;
        return schema;
    }

    let type = proc.substring(0, firstP);
    let content = proc.substring(firstP + 1, proc.length - 1);

    switch(type){
        case "COUNT":
            schema.type = "lenght";
            schema.target = content;
            return schema;
        case "PREDICATE":
            schema.type = "pred";
            
            let checkP = content.lastIndexOf("}") + 1;
            let declarations = content.substring(1, checkP-1);


            comma = declarations.indexOf(",");

            while(comma !== -1){
                vars.name = declarations.substring(0, comma);
                vars.value = "";
                declarations = declarations.substring(comma + 1, declarations.lenght);
                comma = declarations.indexOf(",")
            }
            if(!(declarations === "")){
                vars.name = declarations;
                vars.value = "";
            }

            schema.vars = vars;

            let calc = content.substring(checkP + 1, content.length - 1);

            firstP = calc.indexOf("(");

            schema.op = calc.substring(0, firstP);

            let remaining = calc.substring(firstP + 1, calc.lenght);

            order = [];

            comma = remaining.indexOf(","); 

            switch(schema.op){
                case "funI":
                    schema.fun = remaining.substring(0, comma);
                    remaining = remaining.substring(comma + 1, remaining.length);
                    comma = remaining.indexOf(",");
                    schema.caller = remaining.substring(0, comma);
                    remaining = remaining.substring(comma + 1, remaining.length);
                    comma = remaining.indexOf(",");

                    while(comma !== -1){
                        order.push(remaining.substring(0, comma));
                        remaining = remaining.substring(comma + 1, remaining.lenght);
                        comma = remaining.indexOf(",")
                    }
        
                    if(!(remaining === "")){
                        order.push(remaining);
                    }
                    schema.order = order;
                    break;
                default:
                    while(comma !== -1){
                        order.push(remaining.substring(0, comma));
                        remaining = remaining.substring(comma + 1, remaining.lenght);
                        comma = remaining.indexOf(",")
                    }
        
                    if(!(remaining === "")){
                        order.push(remaining);
                    }

                    schema.order = order;
            }

            return schema;
        case "FILTER":
            schema.type = "filter";

            firstP = content.indexOf("(");

            if(firstP === -1){
                schema.target = content;
                return schema;
            }

            target = content.substring(firstP + 1, content.length - 1);
            
            schema.target = content.substring(0, firstP);

            order = [];
            
            comma = target.indexOf(",");

            while(comma !== -1){
                order.push(target.substring(0, comma));
                target = target.substring(comma + 1, target.length);
                comma = target.indexOf(",");
            }

            if(target !== ""){
                order.push(target);
            }

            schema.order = order;

            return schema;
        case "CHECK":
            schema.type = "check";

            firstP = content.indexOf("(");

            let toCheck = content.substring(firstP + 1, content.length - 1);

            schema.pred = content.substring(0, firstP);

            schema.param = toCheck;

            return schema;

    }
}




export const SVGLayout = Object.assign(
    Object.create(Layout),
    BaseSVGLayout
);