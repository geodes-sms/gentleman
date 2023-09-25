import { Simulation } from "./simulation";
import { ContentHandler } from "./../content-handler"

const { isNullOrUndefined, valOrDefault, isEmpty } = require("zenkai");

const BaseSetSimulation = {
    init(){
        return this;
    },

    render(){
        if(isNullOrUndefined(this.container)){
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.container.classList.add("simulation-container");
            this.container.dataset.nature = "simulation";
            this.container.dataset.shape = "anchor";
            this.container.dataset.id = this.id;
            
            this.container.setAttribute("width", 250);
            this.container.setAttribute("height", 250);

            this.middle = {
                x: 125,
                y: 125
            }

            this.container.setAttribute("preserveAspectRatio", "xMidYMid meet");

            this.container.style = "border: 2px solid black"
        }

        if(isNullOrUndefined(this.path)){
            this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");

            this.path.style.stroke = "black";
            this.path.style["stroke-width"] = 3;
            this.container.append(this.path);
            this.path.setAttribute("fill", "transparent");
        }

        
        if(isNullOrUndefined(this.center)){
            this.center = document.createElementNS("http://www.w3.org/2000/svg", "circle");

            this.center.setAttribute("cx", 125);
            this.center.setAttribute("cy", 125);
            this.center.setAttribute("fill", "white");
            this.center.setAttribute("stroke", "#738CFF")
            this.center.setAttribute("stroke-width", 3);
            this.center.setAttribute("r", 5);

            this.container.append(this.center);
        }

        this.bindEvents();
    
        return this.container;
    },

    registerPoint(value){
        if(isNullOrUndefined(this.d)){
            this.d = [];
        }

        this.d.push(value);

        let x = value.getAttributeByName("x").target;
        x.register(this.projection);

        
        let y = value.getAttributeByName("y").target;
        y.register(this.projection);
    },

    drawPath(){
        if(isNullOrUndefined(this.d) || isEmpty(this.d)){
            this.path.setAttribute("d", "");
        }

        let bufferX = this.middle.x;
        let bufferY = this.middle.y;

        this.minX = this.middle.x;
        this.minY = this.middle.y;

        this.maxX = this.middle.x;
        this.maxY = this.middle.y;

        let d = "M " + bufferX + " " + bufferY;

        for(let i = 0; i < this.d.length; i++){
            let x = this.d[i].getAttributeByName("x").target;
            let y = this.d[i].getAttributeByName("y").target;

            bufferX += valOrDefault(x, 0);
            bufferY += valOrDefault(y, 0);

            d += " L " + bufferX + " " + bufferY;

            if(this.minX > bufferX){
                this.minX = bufferX;
            }

            if(this.maxX < bufferX){
                this.maxX = bufferX;
            }
            
            if(this.minY > bufferY){
                this.minY = bufferY;
            }

            if(this.maxY < bufferY){
                this.maxY = bufferY;
            }
        }

        this.path.setAttribute("d", d);

        this.setDimensions();
    },

    setDimensions(){
        let viewBox = {
            x: Math.min(this.minX - 5, 0),
            y: Math.min(this.minY - 5, 0),
            w: Math.max(this.maxX + 5  - Math.min(this.minX - 5, 0), 250),
            h: Math.max(this.maxY + 5  - Math.min(this.minY - 5, 0), 250) 
        }

        this.container.setAttribute("viewBox", viewBox.x + " " + viewBox.y + " " + viewBox.w + " " + viewBox.h);
  
    },

    unregisterPoint(value){
        if(isNullOrUndefined(this.d)){
            return;
        }

        for(let i = 0; i < this.d.length; i++){
            if(d.id === value.id){
                this.d.splice(i, 0);
                return;
            }
        }
    },

    bindEvents(){

        this.projection.registerHandler("value.added", (value) => {
            this.registerPoint(value);
        })

        this.projection.registerHandler("value.removed", (value) => {
            this.unregisterPoint(value);
        })
        
        this.projection.registerHandler("value.changed", () => {
            this.drawPath();
        })
    }
}

export const SetSimulation = Object.assign(
    Object.create(Simulation),
    BaseSetSimulation
)