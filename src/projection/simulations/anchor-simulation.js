import { Simulation } from "./simulation";
import { ContentHandler } from "./../content-handler"

const { isNullOrUndefined, valOrDefault } = require("zenkai");

const BaseAnchorSimulation = {
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
        }

        if(isNullOrUndefined(this.path)){
            this.path = ContentHandler.call(this, {
                type: "attribute",
                name: "arrow-style",
                tag: "simulation-wider"
            });

            this.container.append(this.path);

            this.path.setAttribute("x", 25);
            this.path.setAttribute("y", 0)
        }

        this.bindEvents();
    
        return this.container;
    },

    bindEvents(){
        this.offSetX = this.source.getAttributeByName("offSet").target.getAttributeByName("x").target;
        this.offSetX.register(this.projection);

        this.offSetY = this.source.getAttributeByName("offSet").target.getAttributeByName("y").target;
        this.offSetY.register(this.projection);

        this.projection.registerHandler("value.changed", () => {
            this.path.setAttribute("x", 25 + valOrDefault(this.offSetX.value, 0));
            this.path.setAttribute("y", valOrDefault(this.offSetY.value, 0));
        })
    }
}

export const AnchorSimulation = Object.assign(
    Object.create(Simulation),
    BaseAnchorSimulation
)