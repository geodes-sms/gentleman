import { ContentHandler } from "./../content-handler";
import { isNullOrUndefined } from "zenkai";
import { Simulation } from "./simulation";

const BaseMultiSimulation = {
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

        if(isNullOrUndefined(this.nodes)){
            this.nodes = [];
            for(let i = 0; i < 3; i++){

                let circle = ContentHandler.call(this, {
                    kind: "static",
                    type: "svg",
                    content: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 10 10\" width=\"10\" height=\"10\" version=\"1\"><circle r=\"5\" cx=\"5\" cy=\"5\"></circle></svg>"
                });
                this.container.append(circle);

                this.nodes.push(circle);
            }

            this.nodes[0].setAttribute("x", 50);
            this.nodes[0].setAttribute("y", 110);

            this.nodes[1].setAttribute("x", 225);
            this.nodes[1].setAttribute("y", 35);

            this.nodes[2].setAttribute("x", 400);
            this.nodes[2].setAttribute("y", 190);
        }

        if(isNullOrUndefined(this.path)){
            this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");

            this.path.setAttribute("stroke", "black");
            this.path.setAttribute("fill", "transparent");

            this.container.append(this.path);
        }

        this.sp = ContentHandler.call(this, {
            type: "attribute",
            name: "sub-paths",
            tag: "simulation"
        })

        this.container.append(this.sp);

        this.subPaths = this.projection.resolveElement(this.sp);

        this.bindEvents();
        this.bindStyle();

        this.bindSubPath();
        this.bindSubStyle();

        this.setPath();

        return this.container;
    },

    setPath(){
        let meet = this.meet.value;

        switch(meet){
            case "free":
                this.path.setAttribute("d", "M 55 115 L 230 40 L 405 195");
                break;
            case "minX":
                this.path.setAttribute("d", "M 55 40 L 55 195");
                break;
            case "maxX":
                this.path.setAttribute("d", "M 405 40 L 405 195");
                break;
            case "minY":
                this.path.setAttribute("d", "M 55 40 L 405 40");
                break;
            case "maxY":
                this.path.setAttribute("d", "M 55 195 L 405 195");
                break
        }

        this.style();

        this.subPaths.setPath(meet, {x: 0, y: 0})
    },

    bindEvents(){
        this.meet = this.source.getAttributeByName("meet").target;

        this.meet.register(this.projection);

        this.projection.registerHandler("value.changed", () => {
            this.setPath();
        })

    },

    style(){
        this.path.setAttribute("stroke", this.stroke.value);
        this.path.setAttribute("stroke-width", this.width.value);
        this.path.setAttribute("stroke-linecap", this.linecap.value);

        if(!isNullOrUndefined(this.dasharray.value)){
            this.path.style["stroke-dasharray"] = this.dasharray.value;
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

    bindSubPath(){
        
    },

    bindSubStyle(){

    }
}

export const MultiSimulation = Object.assign(
    Object.create(Simulation),
    BaseMultiSimulation
)