import { isEmpty, isNull, isNullOrUndefined, isUndefined } from "zenkai";
import { Arrow } from "./arrow";

const MeetHandler = {
    "minY": drawMinY
}

function drawMinY(coordinates){
    let minY = coordinates[0].y;
    let minX = coordinates[0].x;
    let maxX = coordinates[0].x;


    for(let i = 0; i < coordinates.length; i++){
        const { x, y } = coordinates[i];

        if(x < minX){
            minX = x;
        }

        if(x > maxX){
            maxX = x;
        }

        if(y < minY){
            minY = y;
        }
    }

    /*if(!isNullOrUndefined(this.schema.offSet)){
        minX += this.schema.offSet.x - 3;
        minY += this.schema.offSet.y;
        maxX += this.schema.offSet.x;
    }*/

    this.setPath("M " + minX + " " + minY + " L " + maxX + " " + minY);
    this.drawSupPath(coordinates, minY, false);
}

const BaseMultiArrow = {

    init(){
        this.subPath = [];
        this.targets = [];
        this.elements = [];

        return this;
    },

    render(){
        const { style } = this.schema;

        if(isNullOrUndefined(this.path)){
            this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");

            this.path.classList.add("arrow-path");
            this.path.dataset.nature = "arrow";
            this.path.dataset.algorithm = "multi";
            this.path.dataset.id = this.id;
        }

        this.bindEvents();

        this.stylePath(style);

        return this.path;
    },

    addTarget(value){
        this.targets = [];

        this.elements.forEach(elem => {
            if(elem.hasValue()){
                this.targets.push(elem.getValue());
            }
        })

        if(this.targets.length > 1 ){
            this.drawPath();

            this.projection.parent.container.append(this.path);

            this.subPath.forEach(sp => {
                this.projection.parent.container.append(sp);
            })
        }
    },

    drawSupPath(points, ref, x){
        if(!isEmpty(this.subPath)){
            this.subPath.forEach(element => {
                element.remove();
            });

            this.subPath = [];
        }

        points.forEach(pt => {
            if(pt.y === ref && !x){
                return;
            }

            if(pt.x === ref && x){
                return;
            }

            let sp = document.createElementNS("http://www.w3.org/2000/svg", "path");

            this.path.classList.add("arrow-subpath");
            this.path.dataset.nature = "arrow";
            this.path.dataset.algorithm = "multi";
            this.path.dataset.id = this.id;

            if(x){

            }else{
                /*if(!isNullOrUndefined(this.schema.subpath.offSet)){
                    const {offSet} = this.schema.subpath;
                    pt.x += offSet.x;
                    pt.y += offSet.y;
                    ref += offSet.y;
                }*/
                sp.setAttribute("d", "M " + pt.x + " " + ref + " L " + pt.x + " " + pt.y);
            }

            this.styleSubPath(this.schema.subpath.style, sp);
            this.subPath.push(sp);
        })
    },
    
    drawPath(){
        const reference = this.projection.parent.container;

        let toReach = [];

        for(let i = 0; i < this.targets.length; i++){
            const val = this.targets[i];

            let item = reference.querySelector("[data-concept='" + val + "']");
            let proj = this.projection.resolveElement(item);

            if(isNullOrUndefined(item)){
                return;
            }

            toReach.push({item: item, proj: proj});
        }


        let relCoordinates = [];

        for(let i = 0; i < toReach.length; i++){
            const container = toReach[i].item;

            let box = container.getBoundingClientRect();

            const point = reference.createSVGPoint();

            point.x = box.x;
            point.y = box.y;

            const relXY = point.matrixTransform(reference.getScreenCTM().inverse());

            if(!isNullOrUndefined(toReach[i].proj.attachPoint)){
                relCoordinates.push({x: relXY.x + toReach[i].proj.attachPoint.x, y : relXY.y + toReach[i].proj.attachPoint.y});
            }else{
                relCoordinates.push({x: relXY.x, y : relXY.y});
            }

        }

        MeetHandler[this.schema.meet].call(this, relCoordinates);

    },

    removeTarget(value){
        if(isNullOrUndefined(this.targets)){
            return;
        }
    },

    registerElem(value){
        if(isNullOrUndefined(this.elements)){
            this.elements = [];
        }

        this.elements.push(value);

        value.register(this.projection);
    },

    unregisterElem(value){
        for(let i = 0; i < this.elements.length; i++){
            if(this.elements[i] === value){
                this.elements[i].unregister(this.projection);
                this.elements.splice(i, 1);
                break;
            }
        }

        if(this.elements.length > 1){
            this.addTarget();
        }else{
            this.path.remove();
            if(!isEmpty(this.subPath)){
                this.subPath.forEach(sp => {
                    sp.remove();
                })
            }
        }
    },

    deletePaths(){
        this.path.remove();
        if(!isEmpty(this.subPath)){
            this.subPath.forEach(sp => {
                sp.remove();
            })
        }
    },

    bindEvents(){
        this.projection.registerHandler("value.added", (value) => {
            this.registerElem(value);
        })

        this.projection.registerHandler("value.removed", (value) => {
            this.unregisterElem(value);
        })

        this.projection.registerHandler("value.changed", (value) => {
            this.addTarget(value);
        })
    }
}

export const MultiArrow = Object.assign({},
    Arrow,
    BaseMultiArrow
);