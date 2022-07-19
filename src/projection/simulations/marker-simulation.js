import { isNull, isNullOrUndefined } from 'zenkai';
import { Simulation } from './simulation.js';

const BaseMarkerSimulation = {

    init(){

        return this;
    },

    focusIn(){

    },

    focusOut(){

    },

    render(){
        if(isNullOrUndefined(this.def)){
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            
            this.def = document.createElementNS("http://www.w3.org/2000/svg", "defs");

            this.marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
            this.marker.setAttribute("orient", "auto");
            this.marker.setAttribute("markerUnit", "strokeWidth");

            this.path = document.createElementNS("http://www.w3.org/2000/svg", "path")

            this.container.classList.add("simulation-container");
            this.container.dataset.nature = "simulation";
            this.container.dataset.shape = "marker";
            this.container.dataset.id = this.id;

            this.def.append(this.marker);
            this.marker.append(this.path);
            this.container.append(this.def);

        }

        console.log(this);

        this.bindEvents();

        return this.container;
        
    },

    focus(){

    },

    updateParams(){

        if(!isNullOrUndefined(this.idAttr.value)){
            this.marker.setAttribute("id", (this.idAttr.value));

            console.log(this.container);

            this.user = this.container.parentNode.getElementById("path" + this.container.parentNode.id);
        
            console.log(this.user);

            console.log(this);

            this.user.setAttribute("marker-" + (this.schema.start ? "start" : "end"), "url(#" + this.idAttr.value +")");
        }

        if( !isNullOrUndefined(this.minX.value) &&
            !isNullOrUndefined(this.minY.value) &&
            !isNullOrUndefined(this.width.value) &&
            !isNullOrUndefined(this.height.value)
        ){
            this.marker.setAttribute("viewBox", "" + this.minX.value + " " +
            this.minY.value + " " + this.width.value + " " + this.height.value
            )
        }

        if(!isNullOrUndefined(this.refX.value)){
            this.marker.setAttribute("refX", (this.refX.value));
        }

        if(!isNullOrUndefined(this.refY.value)){
            this.marker.setAttribute("refY", (this.refY.value));
        }

        if(!isNullOrUndefined(this.markerWidth.value)){
            this.marker.setAttribute("markerWidth", (this.markerWidth.value));
        }

        if(!isNullOrUndefined(this.markerHeight.value)){
            this.marker.setAttribute("markerHeight", (this.markerHeight.value));
        }

        if(!isNullOrUndefined(this.d.value)){
            this.path.setAttribute("d", this.d.value);
        }
    },

    bindEvents(){
        this.idAttr = this.source.getAttributeByName("id").target;
        this.idAttr.register(this.projection);

        this.minX = this.source.getAttributeByName("minX").target;
        this.minX.register(this.projection);

        this.minY = this.source.getAttributeByName("minY").target;
        this.minY.register(this.projection);

        this.width = this.source.getAttributeByName("width").target;
        this.width.register(this.projection);

        this.height = this.source.getAttributeByName("height").target;
        this.height.register(this.projection);

        this.refX = this.source.getAttributeByName("refX").target;
        this.refX.register(this.projection);

        this.refY = this.source.getAttributeByName("refY").target;
        this.refY.register(this.projection);

        this.markerWidth = this.source.getAttributeByName("markerWidth").target;
        this.markerWidth.register(this.projection);

        this.markerHeight = this.source.getAttributeByName("markerHeight").target;
        this.markerHeight.register(this.projection);

        this.d = this.source.getAttributeByName("d").target;
        this.d.register(this.projection);

        this.projection.registerHandler("value.changed", () => {
            this.updateParams();
        })

    }

}

export const MarkerSimulation = Object.assign(
    Object.create(Simulation),
    BaseMarkerSimulation
);