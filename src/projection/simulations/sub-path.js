import { ContentHandler } from "../content-handler";
import { isNullOrUndefined } from "zenkai";
import { Simulation } from "./simulation";

const BaseSubPathSimulation = {
    init(){
        this.width = 460;
        this.height = 220;

        return this;
    },

    render(){
        
        if(isNullOrUndefined(this.container)){
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.container.classList.add("simulation-container");
            this.container.dataset.nature = "simulation";
            this.container.dataset.shape = "force";
            this.container.dataset.id = this.id;

            this.container.setAttribute("width", this.width);
            this.container.setAttribute("height", this.height);
        }

        if(isNullOrUndefined(this.paths)){
            this.paths = [];

            for(let i = 0; i < 3; i++){
                let path = document.createElementNS("http://www.w3.org/2000/svg", "path");

                path.setAttribute("stroke", "black");
                path.setAttribute("fill", "transparent");
                
                console.log(path);
                this.container.append(path);

                this.paths.push(path);
            }

        }

        this.bindEvents();
        this.bindStyle();

        /*this.setPath();*/

        console.log("Returning this");
        console.log(this.container);

        return this.container;
    },



    setPath(meet, offset){
        if(!isNullOrUndefined(meet)){
            this.meet = meet;
        }
        if(!isNullOrUndefined(offset)){
            this.offset = offset;
        }

        if(this.meet === "free"){
            this.paths[0].remove();
            this.paths[1].remove();
            this.paths[2].remove();
            this.style();
            return;
        }
        
        this.container.append(this.paths[0]);
        this.container.append(this.paths[1]);
        this.container.append(this.paths[2]);

        switch(this.meet){
            case "minX":
                this.paths[0].setAttribute("d", "M " + (55 + this.offset.x) + " 110 L 60 110");
                this.paths[1].setAttribute("d", "M " + (55 + this.offset.x) + " 40 L 230 40");
                this.paths[2].setAttribute("d", "M " + (55 + this.offset.x) + " 195 L 405 195");
                break;
            case "maxX":
                this.paths[0].setAttribute("d", "M " + (405 + this.offset.x) + " 110 L 60 110");
                this.paths[1].setAttribute("d", "M " + (405 + this.offset.x) + " 35 L 230 110");
                this.paths[2].setAttribute("d", "M " + (405 + this.offset.x) + " 190 L 405 190");
                break;
            case "minY":
                this.paths[0].setAttribute("d", "M 110 " + (35 + this.offset.y) + " 110 L 60 110");
                this.paths[1].setAttribute("d", "M 35 " + (35 + this.offset.y) + " 35 L 230 110");
                this.paths[2].setAttribute("d", "M 190 " + (35 + this.offset.y) + " 190 L 405 190");
                break;
            case "maxY":
                this.paths[0].setAttribute("d", "M 110 " + (190 + this.offset.y) + " 110 L 60 110");
                this.paths[1].setAttribute("d", "M 35 " + (190 + this.offset.y) + " 35 L 230 110");
                this.paths[2].setAttribute("d", "M 190 " + (190 + this.offset.y) + " 190 L 405 190");
                break
        }

        this.style();
    },

    bindEvents(){
        this.projection.registerHandler("value.changed", () => {
            this.setPath();
        })

    },

    style(){
        for(let i = 0; i < 3; i++){
            this.paths[i].setAttribute("stroke", this.stroke.value);
            this.paths[i].setAttribute("stroke-width", this.width.value);
            this.paths[i].setAttribute("stroke-linecap", this.linecap.value);
    
            if(!isNullOrUndefined(this.dasharray.value)){
                this.path.style["stroke-dasharray"] = this.dasharray.value;
            }
        }

    },

    bindStyle(){
        const style = this.source.getAttributeByName("arrow-style").target;

        this.dasharray = style.getAttributeByName("dasharray").target;
        this.dasharray.register(this.projection);

        this.stroke = style.getAttributeByName("stroke").target.getAttributeByName("value").target;
        this.stroke.register(this.projection);

        this.width = style.getAttributeByName("width").target;
        this.width.register(this.projection);

        this.linecap = style.getAttributeByName("linecap").target;
        this.linecap.register(this.projection);

        console.log(this);
    },
}

export const SubPathSimulation = Object.assign(
    Object.create(Simulation),
    BaseSubPathSimulation
)