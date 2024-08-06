import { isNullOrUndefined } from 'zenkai';
import {Static} from './static.js';

const BaseSVGTextStatic = {
    init(){
        return this;
    },

    render(){
        const { content, anchor, baseline, multiline } = this.schema;

        if(isNullOrUndefined(this.element)){
            this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.element.classList.add("static");

            this.element.dataset.id = this.id;
            this.element.dataset.nature = "static";
            this.element.dataset.view = "svg-text";
            this.element.dataset.ignore = "all";
        }

        if(isNullOrUndefined(this.textArea)){
            this.textArea = document.createElementNS("http://www.w3.org/2000/svg", "text");
            this.textArea.dataset.ignore = "all";
            this.element.append(this.textArea);
            this.style(this.textArea);
        }

        if(isNullOrUndefined(this.box)){
            this.box = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.box.setAttribute("fill", "transparent");
            this.element.prepend(this.box);
        }

        if(isNullOrUndefined(this.content)){
            this.content = content;
        }

        if(isNullOrUndefined(this.anchor)){
            this.anchor = anchor;
            this.textArea.setAttribute("text-anchor", this.anchor)
        }

        if(isNullOrUndefined(this.baseline)){
            this.baseline = baseline;
            this.textArea.style["dominant-baseline"] = baseline;
        }

        if(isNullOrUndefined(this.multiline)){
            this.multiline = multiline;
        }

        if(this.multiline){
            this.initiateLines();
        }else{
            this.initiateText();
        }

        this.bindEvents();

        return this.element;
    },

    initiateText(){
        this.textElement = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
        this.textElement.dataset.ignore = "all";
        
        this.textArea.append(this.textElement);

        this.textElement.textContent = this.content;
    },

    initiateLines(){
        let lines = this.content.split(/\r?\n/);
        this.lines = [];

        for(let i = 0; i < lines.length; i++){
            let span = this.createLine(lines[i], i > 0);
            this.lines.push(span);
        }
    },
    

    createLine(line = "", start = true){
        let span = document.createElementNS("http://www.w3.org/2000/svg", "tspan");

        if(start){
            span.setAttribute("x", 0);
            span.setAttribute("dy", "1.2em");
        }

        if(line === ""){
            span.textContent = "B";
            span.setAttribute("fill", "transparent");
        }else{
            span.textContent = line;
        }

        this.textArea.append(span);

        return span;
    },

    adaptViewBox(){
        let box = this.textArea.getBBox();

        this.element.setAttribute("viewBox",
            box.x + " " +
            box.y + " " +
            box.width + " " + 
            box.height + " "
        );
        this.element.setAttribute("width", box.width);
        this.element.setAttribute("height", box.height);

        if(isNullOrUndefined(this.defaultCoordinates)){
            this.defaultCoordinates = {
                x: Number(this.element.getAttribute("x")),
                y: Number(this.element.getAttribute("y"))
            }
        }



        switch(this.anchor){
            case "middle":
                this.element.setAttribute("x", this.defaultCoordinates.x - box.width / 2);
                break;
            case "end":
                this.element.setAttribute("x", this.defaultCoordinates.x - box.width);
                break;
            case "start":
                break;
        }

        switch(this.baseline){
            case "middle":
                this.element.setAttribute("y", this.defaultCoordinates.y - Math.abs(box.height) / 2);
                break;
            case "auto":
                this.element.setAttribute("y", this.defaultCoordinates.y - Math.abs(box.height));
                break;
            case "hanging":
                break;
        }

        this.box.setAttribute("width", box.x + box.width);
        this.box.setAttribute("height", box.y + box.height);
        this.box.setAttribute("y", box.y);
        this.box.setAttribute("x", box.x);

        this.parent.updateSize();
    },

    style(element) {
        const { font = "Segoe UI", size = 10, color = "black", weight = false } = this.schema.style;

        element.setAttribute("font-family", font);
        element.setAttribute("font-size", size);
        element.setAttribute("fill", color);
        element.setAttribute("font-weight", weight);
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

            this.adaptViewBox();
        })
    },

}

export const SVGTextStatic = Object.assign(
    Object.create(Static),
    BaseSVGTextStatic
);