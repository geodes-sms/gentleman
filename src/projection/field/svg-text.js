import { isNull, isNullOrUndefined } from "zenkai";
import { Field } from "./field.js";

const BaseSvgText = {

    init(options){
        if(!isNullOrUndefined(options)){
            const {focusable = false} = options;

            this.focusable = focusable;

        }

        return this;
    },

    render(){
        
        const { placeholder, style, readonly, breakDown = false} = this.schema;

        if(isNullOrUndefined(this.element)){

            this.element = document.createElementNS("http://www.w3.org/2000/svg", "text")

            this.element.id = this.id;
            this.element.classList.add("field");
            this.element.tabindex = -1;

            this.element.dataset.nature = "field";
            this.element.dataset.view = "svg";
            this.element.style["dominant-baseline"] = "hanging";
            this.element.dataset.id = this.id;
            this.element.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'preserve')
        }

        if(this.source.hasValue()){
            this.content = this.source.getValue().toString();
        }else{
            this.content = placeholder;
        }

        if(breakDown){
            this.breakDown = breakDown;
        }

        if(this.breakDown){
            this.element.textContent = this.content.substring(0, breakDown);
        }else{
            this.element.textContent = this.content;
        }
        

        this.caps = false;

        this.readonly = readonly;

        

        this.bindEvents();

        this.style();

        return this.element;
    },

    registerDimensionsObserver(o){
        if(isNullOrUndefined(this.observers)){
            this.observers = []
        }

        this.observers.push(o);
    },

    setActiveChar(t, x, y){

        let {target, end = false} = this.findChar(x, y);

        this.index = target;  

        this.end = end;

        if(end){
            this.char = this.element.getEndPositionOfChar(target);
        }else{
            this.char = this.element.getStartPositionOfChar(target);
        }

        /*this.svg.append(circle);*/    
        
        this.createCursor();

        this.switchOn();

        this.addListeners();

    },

    style(){
        const { font, size, anchor = "left", weight, baseline } = this.schema.style;

        this.element.setAttribute("text-anchor", anchor);
        this.element.setAttribute("font-family", font);
        this.element.setAttribute("font-size", size);
        this.element.style["dominant-baseline"] = baseline;
        if(weight){
            this.element.setAttribute("font-weight", weight);
        }

        this.baseline = baseline;
        this.size = size;
    },

    setValue(){
        if(this.source.name === "number"){
            this.source.setValue(Number(this.content));
        }else{
            this.source.setValue(this.content);
        }
    },

    addListeners(){
        this.element.addEventListener("keydown", (e) => {
            let value = e.keyCode;

            if(value === 27){
                if(this.content === ""){
                    this.content = this.schema.placeholder;
                    this.element.textContent = this.content;
                }
                this.setValue(this.content);
                this.switchOff();
                return;
            }

            e.stopPropagation();
            
            if(value === this.lastKey && this.repeat){
                return;
            }

            switch(value){
                case 8:
                    if(this.index === 0 && this.end && this.content !== ""){
                        this.content = "";
                        this.element.textContent = "";
                    }

                    if(this.index > 0){
                        if(this.end){
                            this.content = this.content.slice(0, this.index);
                            this.element.textContent = this.content;
                        }else{
                            this.content = this.content.slice(0, this.index - 1) + this.content.slice(this.index);
                            this.element.textContent = this.content;
                        }
                        this.index--;
                    }

                   break;
                case 46:
                    
                    if(this.index < this.content.length - 1 && !this.end){
                        this.content = this.content.slice(0, this.index) + this.content.slice(this.index + 1);
                        this.element.textContent = this.content;
                    }

                    if(this.index === this.content.length - 1 && !this.end){
                        this.content = this.content.slice(0, this.index);
                        this.element.textContent = this.content;
                        this.end = true;
                        this.index--;
                    }

                    if(this.index === 0 && this.content.length === 1){
                        this.content = "";
                        this.element.textContent = this.content;
                    }

                    break;
                case 20:
                    this.caps = !this.caps;
                    break;
                case 32:
                    e.preventDefault();
                    if(this.end){
                        this.content += " ";
                        this.element.textContent = this.content;
                    }else{
                        this.content = this.content.slice(0, this.index) + " " + this.content.slice(this.index);
                        this.element.textContent = this.content;
                    }
                    this.index++;
                    break;
            }

            if((this.source.name !== "number") && ((value >= 65 && value <= 90) || (value >= 48 && value <= 57) || (value >= 90 && value <= 105))){
                if(!this.caps){
                    if(this.end){
                        this.content = this.content + String.fromCharCode(e.keyCode).toLowerCase();
                    }else{
                        this.content = this.content.slice(0, this.index) + String.fromCharCode(e.keyCode).toLowerCase() + this.content.slice(this.index);
                    }
                }else{
                    if(this.end){
                        this.content = this.content + String.fromCharCode(e.keyCode);
                    }else{
                        this.content = this.content.slice(0, this.index) + String.fromCharCode(e.keyCode) + this.content.slice(this.index);
                    }
                }
                
                this.element.textContent = this.content;
                this.index++;
            }

            if(this.source.name === "number" && ((value >= 48 && value <= 57) || (value >= 96 && value <= 105))){

                if(value >= 96 && value <= 105){
                    value -= 48
                }

                
                if(this.end){
                    this.content = this.content + String.fromCharCode(value);
                }else{
                    this.content = this.content.slice(0, this.index) + String.fromCharCode(value) + this.content.slice(this.index);
                }
                this.element.textContent = this.content;
                this.index++;
            }

            this.lastKey = e.keyCode;
            this.repeat = true;
            setTimeout(() => {
                this.repeat = false
            }, 50)

            this.updateCursor()

            this.setValue(this.content);
        }) 
    },

    switchOn(){
        this.on = true;
        this.element.parentNode.append(this.cursor);
        if(!isNullOrUndefined(this.interval)){
            clearInterval(this.interval);
        }
        
        this.interval = setInterval(() => {
            if(this.on){
                this.cursor.remove();
                this.on = false;
            }else{
                this.element.parentNode.append(this.cursor);
                this.on = true;
            }
        }, 1000)
    },

    switchOff(){
        this.on = false;
        if(!isNullOrUndefined(this.cursor)){
            this.cursor.remove();
        }
        clearInterval(this.interval);
    },

    createCursor(){
        if(!isNullOrUndefined(this.cursor)){
            this.cursor.remove();
        }

        let box = this.element.getBBox();

        if(isNullOrUndefined){
            this.cursor = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        }
        this.cursor.setAttribute("x", this.char.x);
        
        switch(this.baseline){
            case "middle":
            case "auto": 
            this.cursor.setAttribute("y", Number(this.element.getAttribute("y")) - box.height / 2);
                break;
            case "hanging":
                this.cursor.setAttribute("y", this.element.getAttribute("y"));
                break;
        }
        this.cursor.setAttribute("width", 1);
        this.cursor.setAttribute("height", box.height);
    },

    updateCursor(){

        if(this.content === ""){
            this.cursor.setAttribute("x", Number(this.element.getAttribute("x")));
            return;
        }

        if(this.end){
            this.char = this.element.getEndPositionOfChar(this.content.length - 1);
            this.cursor.setAttribute("x", this.char.x);
            return;
        }
        
        this.char = this.element.getStartPositionOfChar(this.index);

        this.cursor.setAttribute("x", this.char.x);
    },

    findChar(x, y){
        let target = 0;

        let ptTarget = this.element.getStartPositionOfChar(0);
        let offSet = ptTarget.x;

        let ref = this.element.getBoundingClientRect().x;

        let dist = (x - ref) * (x - ref);

        for(let i = 1; i < this.element.getNumberOfChars(); i++){
            let dx = x - (ref - offSet + this.element.getStartPositionOfChar(i).x);
            
            if(dist > dx * dx){
                dist = dx * dx;
                target = i;
            }else{
                return {target: i, end: false};
            }
        }

        ptTarget = this.element.getEndPositionOfChar(this.element.getNumberOfChars() - 1);

        let dEnd = x - (ref - offSet + ptTarget.x);

        if(dEnd * dEnd < dist){
            return {target: this.element.getNumberOfChars() - 1, end: true}
        }

        return {target: this.element.getNumberOfChars() - 1, end: false}
        
    },

    findCharRelative(pt){
        let target = 0;

        let ptTarget = this.element.getStartPositionOfChar(0);

        let dx = pt.x - ptTarget.x;
        let dy = pt.y - ptTarget.y;

        let dr = Math.sqrt(dx * dx + dy * dy);

        let min = dr;
        let i;
        for(i = 1; i < this.element.getNumberOfChars(); i++){
            ptTarget = this.element.getStartPositionOfChar(i);

            dx = pt.x - ptTarget.x;
            dy = pt.y - ptTarget.y;

            dr = Math.sqrt(dx * dx + dy * dy);

            if(dr < min){
                min = dr;
                target = i;
            }else{
                return {target: target, start: true} ;
            }
            
        }

        ptTarget = this.element.getEndPositionOfChar(i - 1);

        dx = pt.x - ptTarget.x;
        dy = pt.y - ptTarget.y;

        dr = Math.sqrt(dx * dx + dy * dy);

        if(dr < min){
           return {target: i - 1, start: false, end: true}
        }

        return {target: target, start: true};
    },

    focusIn(){

    },

    focusOut(){
        console.log("SwitchOff");
        if(!this.readonly){
            console.log("SwitchOff");
            this.switchOff();
            this.setValue(this.content);
        }
    },

    bindEvents(){
        if(!this.readonly){
            this.element.addEventListener("click", (event) => {
                this.setActiveChar(event.target, event.clientX, event.clientY);
            })
        }

        this.projection.registerHandler("value.changed", (value) => {
            this.content = value.toString();
            if(this.breakDown && value.length > this.breakDown){
                this.element.textContent = this.content.substring(0, this.breakDown);
            }else{
                this.element.textContent = this.content;
            }
        })
    }
};

export const SvgText = Object.assign(
    Object.create(Field),
    BaseSvgText
);