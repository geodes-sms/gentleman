import { isNullOrUndefined } from "zenkai";
import { Simulation } from "./simulation";

const BaseContentSimulation = {

    init(){
        this.width = 350;
        this.height = 350;

        return this;
    },

    render(){
        if(isNullOrUndefined(this.container)){
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.container.classList.add("simulation-container");
            this.container.dataset.nature = "simulation";
            this.container.dataset.shape = "content";
            this.container.dataset.id = this.id;

            this.container.setAttribute("width", 300);
            this.container.setAttribute("height", 300)

            this.holder = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.container.append(this.holder);
        }

        this.bindEvent();

        return this.container;
    },

    focusIn(){

    },

    focusOut(){

    },

    scale(){
        const width = this.content.width.baseVal.value;
        const height = this.content.height.baseVal.value;


        console.log(this.content.width);

        let ratio = Math.max(width, height) / 100;

        this.holder.setAttribute("viewBox", "0 0 " + width + " " + height);
        this.holder.setAttribute("width", width / ratio);
        this.holder.setAttribute("height", height / ratio);

        this.holder.setAttribute("x", 100);
        this.holder.setAttribute("y", 100);


    },

    bindEvent(){
        const parser = new DOMParser();

        this.projection.registerHandler("value.changed", (value) => {
            if(!isNullOrUndefined(this.content)){
                this.content.remove();
            }

            this.content = parser.parseFromString(value.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;

            this.holder.append(this.content);

            this.scale();
        })

        if(this.source.hasValue()){
            this.content =  parser.parseFromString(this.source.value.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;
            this.holder.append(this.content);

            this.scale()
        }
    }

}

export const ContentSimulation = Object.assign(
    Object.create(Simulation),
    BaseContentSimulation
);