<<<<<<< HEAD
import {
    createDocFragment, createDiv, createUnorderedList, createListItem, createButton,
    findAncestor, removeChildren, isHTMLElement, isNullOrUndefined, valOrDefault, hasOwn, isEmpty,
} from "zenkai";
import {
    hide, show, shake, NotificationType, getClosest, isHidden,
    getTopElement, getBottomElement, getRightElement, getLeftElement
} from "@utils/index.js";
import { StyleHandler } from "./../style-handler.js";
=======
import { isHTMLElement, isNullOrUndefined, valOrDefault, } from "zenkai";
>>>>>>> master
import { ContentHandler } from "./../content-handler.js";
import { Field } from "./field.js";
import { AnchorHandler } from "./../algorithm/anchor-handler.js";

<<<<<<< HEAD
const BaseArrow ={
    init(){
        const { arrowStyle = null, path, attach = {}} = this.schema;
=======
const BaseArrow = {
    init() {
        this.arrowStyle = this.schema.arrowStyle;
>>>>>>> master

        if(isNullOrUndefined(arrowStyle)){
            this.arrowStyle = {}
        }else{
            this.arrowStyle = arrowStyle;
        }

        if(path){
            this.meet = path.meet;
        }

        if(attach){
            this.attach = attach.type;
        }
        
        return this;
    },
<<<<<<< HEAD
    render(){
        const { reference, decorator = false} = this.schema;
=======
    render() {
        const { /*target = "self", source = "source",*/ decorator } = this.schema;
>>>>>>> master


        if (!isHTMLElement(this.element)) {

            this.element = document.createElementNS('http://www.w3.org/2000/svg', "path");
            this.element.style["fill"] = "transparent";

            this.element.id = this.id;
            this.element.classList.add("field");
            this.element.tabindex = -1;
            this.element.dataset["nature"] = "field";
            this.element.dataset["view"] = "arrow";
<<<<<<< HEAD
            this.element.dataset["id"] = this.id;            
        }


        if(isNullOrUndefined(this.reference)){
            switch(reference.type){
                case "multiple":
                    this.reference = this.source.getAttributeByName(reference.listen).target;
                    this.multiple = true;

                    break;
                case "duo":
                    this.from = this.source.getAttributeByName(reference.from).target;
                    this.to = this.source.getAttributeByName(reference.to).target;
                    this.multiple = false;
                    break;
                case "position":

                    break;
            }
        }

        /*if(target != "self"){
=======
            this.element.dataset["id"] = this.id;

        }

        if (target != "self") {
>>>>>>> master
            this.source.getAttributeByName(target).target.register(this.projection);
        }

        if (source != "self") {
            this.source.getAttributeByName(source).target.register(this.projection);
        }

        if (!isHTMLElement(this.decorator) && (!isNullOrUndefined(decorator.attribute.dynamic.name))) {
            this.decorator = ContentHandler.call(this, decorator.attribute);
            this.base = "left";
            this.ratio = 0.02;
        }

        if (isNullOrUndefined(this.registered)) {
            this.registered = [];
        }
        */
        this.computeStyle();
        
        this.bindEvent();

        return this.element;
    },

    /*Find a way to know what source to transmit*/

    getStyle() {

    },

    signal() {
        if (!isNullOrUndefined(this.valSource) && !isNullOrUndefined(this.valTarget)) {
            this.projection.parent.accept(this.valSource, this.valTarget, this);
        }
    },


<<<<<<< HEAD
    computeStyle(){

        const { stroke = "black", dasharray = null, width = 1, linecap = "butt", end = false, start = false } = this.arrowStyle;
=======
    computeStyle() {
        const { stroke, dasharray, width, linecap, end, start } = this.schema.arrowStyle;
>>>>>>> master

        this.element.style.stroke = stroke;

        if (!isNullOrUndefined(dasharray)) {
            this.element.style["stroke-dasharray"] = dasharray;
        }

        this.element.style["stroke-width"] = valOrDefault(width, 5);

        this.element.style["stroke-linecap"] = linecap;

        if (end) {
            this.createMarkerEnd();
        }

        if (start) {
            //this.createMarkerStart();
        }
    },

    createMarkerEnd() {
        if (isNullOrUndefined(this.definitions)) {
            this.definitions = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        }

        this.end = document.createElementNS("http://www.w3.org/2000/svg", "marker");

        this.end.id = "marker" + this.id;

        this.end.setAttribute("refY", 5);
        this.end.setAttribute("refX", 10);
        this.end.setAttribute("markerUnit", "strokeWidth");
        this.end.setAttribute("markerWidth", 10);
        this.end.setAttribute("markerHeight", 10);
        this.end.setAttribute("orient", "auto");
        this.end.classList.add("end");

        let path = document.createElementNS("http://www.w3.org/2000/svg", "path");

        path.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
        path.setAttribute("fill", "black");

        this.end.appendChild(path);

        this.definitions.appendChild(this.end);


        this.path.setAttribute("marker-end", "url(#" + this.end.id + ")");
    },

    createMarkerStart() {
        if (isNullOrUndefined(this.definitions)) {
            this.definitions = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        }

        this.start = document.createElementNS("http://www.w3.org/2000/svg", "marker");

        this.start.id = "marker" + this.id;

        this.start.setAttribute("refY", 5);
        this.start.setAttribute("refX", 1);
        this.start.setAttribute("markerUnit", "strokeWidth");
        this.start.setAttribute("markerWidth", 10);
        this.start.setAttribute("markerHeight", 10);
        this.start.setAttribute("orient", "auto");
        this.start.classList.add("start");

        let path = document.createElementNS("http://www.w3.org/2000/svg", "path");

        path.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
        path.setAttribute("fill", "black");

        this.start.appendChild(path);

        this.definitions.appendChild(this.end);

        this.element.setAttribute("marker-start", "url(#" + this.end.id + ")");
    },

    setValues() {
        if (!isNullOrUndefined(this.source.getAttributeByName("target").target.value)) {
            this.valTarget = this.source.getAttributeByName("target").target.value;
        }

        if (!isNullOrUndefined(this.source.getAttributeByName("source").target.value)) {
            this.valSource = this.source.getAttributeByName("source").target.value;
        }

    },

    refresh() {
        this.setValues();
        this.updateRegister();
        this.signal();
    },


    deleteRef(value, i) {
        if (this.valTarget === value.id || this.valSource === value.id) {
            this.projection.parent.removeArrow(this, i);
        }
    },

    setLine(p1, p2) {
        this.element.setAttribute("d",
            "M " + p1.x + ", " + p1.y +
            "L " + p2.x + ", " + p2.y
        );
    },

    setPath(d) {
        this.element.setAttribute("d", d);
    },

    updateRegister() {
        for (let i = 0; i < this.registered.length; i++) {
            this.registered[i] =
            {
                name: this.registered[i].name,
                value: this.source.getAttributeByName(this.registered[i].name).target.value
            };
        }
    },

    register(attribute) {
        if (!isNullOrUndefined(this.getAttribute)) {
            return;
        }

        this.registered.push(
            {
                name: attribute,
                value: this.source.getAttributeByName(attribute).target.value
            });

        this.source.getAttributeByName(attribute).target.register(this.projection);
        this.projection.registerHandler("value.added", (value) => {
            this.refresh();
        });
    },

<<<<<<< HEAD
    get(name){
        for(let i = 0; i < this.registered.length; i++){
            if(this.registered[i].name === name){
=======
    get(name) {
        console.log(this.registered);
        for (let i = 0; i < this.registered.length; i++) {
            if (this.registered[i].name === name) {
>>>>>>> master
                return this.registered[i].value;
            }
        }
    },

    registerValue(value){
        if(isNullOrUndefined(this.registered)){
            this.registered = [];
        }

<<<<<<< HEAD
        value.register(this);
        
        this.registered.push({concept: value, currentVal: value.value});

    },

    update(message, value){

        switch(message){
            case "value.changed":
                this.updatePath(value);
                break;
        }
    },

    updatePath(){
        this.lineUpdate();

        this.parent.container.append(this.element);
    },

    updatePathDuo(){
        switch(this.attach){
            case "anchor":
                this.anchorAttach();
        }
    },

    anchorAttach(){
        if(this.occupied){
            AnchorHandler.freeOccupation(this);
        }

        if(this.occupant){
            this.occupant.removeAnchor(this);
        }

        let from = this.parent.container.querySelector('[data-concept="' + this.valueF + '"]');
        let to = this.parent.container.querySelector('[data-concept="' + this.valueT + '"]');

        let index = AnchorHandler.findCommonIndex(from.dataset.id, to.dataset.id, this.occupant, this);

        let anchorF = AnchorHandler.getAnchorAt(from.dataset.id, index);
        let anchorT = AnchorHandler.getAnchorAt(to.dataset.id, index);

        let box = from.getBoundingClientRect();

        let pt = this.parent.container.createSVGPoint();
        
        pt.x = box.x + anchorF.x;
        pt.y = box.y + anchorF.y;
        
        let ptF = pt.matrixTransform(this.parent.container.getScreenCTM().inverse());

        box = to.getBoundingClientRect();

        pt.x = box.x + anchorT.x;
        pt.y = box.y + anchorT.y;

        let ptT = pt.matrixTransform(this.parent.container.getScreenCTM().inverse());

        this.setPath("M " + ptF.x + " " + ptF.y + " L " + ptT.x + " " + ptT.y);

        this.parent.container.append(this.element);

        if(this.occupant){
            this.occupant.accept(this, ptF, ptT, index);
        }

        AnchorHandler.registerOccupation(this, index, from.dataset.id, to.dataset.id);

        this.occupied = true;
    },

    forceAnchor(index){
        let from = this.parent.container.querySelector('[data-concept="' + this.valueF + '"]');
        let to = this.parent.container.querySelector('[data-concept="' + this.valueT + '"]');

        let anchorF = AnchorHandler.getAnchorAt(from.dataset.id, index);
        let anchorT = AnchorHandler.getAnchorAt(to.dataset.id, index);

        let box = from.getBoundingClientRect();

        let pt = this.parent.container.createSVGPoint();
        
        pt.x = box.x + anchorF.x;
        pt.y = box.y + anchorF.y;
        
        let ptF = pt.matrixTransform(this.parent.container.getScreenCTM().inverse());

        box = to.getBoundingClientRect();

        pt.x = box.x + anchorT.x;
        pt.y = box.y + anchorT.y;

        let ptT = pt.matrixTransform(this.parent.container.getScreenCTM().inverse());

        this.setPath("M " + ptF.x + " " + ptF.y + " L " + ptT.x + " " + ptT.y);

        this.parent.container.append(this.element);

        if(this.occupant){
            this.occupant.accept(this, ptF, ptT, index);
        }

        AnchorHandler.registerOccupation(this, index, from.dataset.id, to.dataset.id);

        this.occupied = true;

        return {e: this, from: from.dataset.id, to: to.dataset.id, index: index};
    },

    lineUpdate(){
        let targets = this.targetInformations();

        switch(this.meet){
            case "minY":
                let min = targets[0].y;
                let minTarget = targets[0];
                let minIndex = 0;

                for(let i = 1; i < targets.length; i++){
                    let y =targets[i].y;
                    if(y < min){
                        min = y;
                        minTarget = targets[i];
                    }
                }

                this.computeLineMin(targets, targets[0], minTarget)

                break;
        }
    },

    computeLineMin(targets, first, elem, yOff){
        let x1 = first.x;
        let x2 = elem.x;

        let y1 = first.y;
        let y2 = elem.y;

        let a = (y1 - y2) / (x1 - x2);
        let b = y1 - a * x1;

        if(!isNullOrUndefined(yOff)){
            b -= yOff;
        }

        for(let i = 0; i < targets.length; i++){
            let x = targets[i].x;
            let y = a * x + b;

            if(y > targets[i].y){
                return this.computeLineMin(targets, first, elem, y - targets[i].y);
            }
        }


        let d = "M " + (x1 - 0.5) + " " + (x2 * a + b)  + " " + "L " 
        + (targets[targets.length - 1].x + 0.5) + " "
        + (x2 * a + b); 

        this.setPath(d)

        if(isNullOrUndefined(this.subPath)){
            this.subPath = [];
        }

        if(!isEmpty(this.subPath)){
            this.subPath.forEach(s => {
                s.remove();
            })
            this.subPath = [];
        }

        let yAbs = x2 * a + b;

        for(let i = 0; i < targets.length; i++){
            if(targets[i].y > yAbs){
                let subP = document.createElementNS("http://www.w3.org/2000/svg", "line");

                subP.classList.add("subPath");
    
                this.subPath.push(subP);

                
                subP.setAttribute("x1", targets[i].x);
                subP.setAttribute("x2", targets[i].x);
                subP.setAttribute("y1", targets[i].y);
                subP.setAttribute("y2", yAbs);

                this.parent.container.append(subP);

                subP.style["stroke-width"] = 0.75;
                subP.setAttribute("stroke", "black");
            }           
        }
    },

    targetInformations(){
        let res = [];
        let broken = false;
        this.registered.forEach(t => {
            let value = t.concept.value;

            if(isNullOrUndefined(value)){
                broken = true;
                return;
            }

            let target = this.parent.container.querySelector('[data-concept="' + value + '"]');
            let proj = this.projection.resolveElement(target);
            let pt = this.parent.container.createSVGPoint();
            let box = target.getBoundingClientRect();

            
            pt.x = box.x;
            pt.y = box.y;

            let ptAbs = pt.matrixTransform(this.parent.container.getScreenCTM().inverse());

            if(!isNullOrUndefined(proj.schema.arrowAnchor)){
                ptAbs.x += proj.schema.arrowAnchor.x;
                ptAbs.y += proj.schema.arrowAnchor.y;
            }

            res.push({x: ptAbs.x, y: ptAbs.y})
        })

        if(broken){
            return false;
        }

        return res;
    },

    duoUpdate(){
        this.valueF = this.from.value;
        this.valueT = this.to.value;

        if(!isNullOrUndefined(this.valueF) && !isNullOrUndefined(this.valueT)){
            this.updatePathDuo();
        }
    },

    updatePosition(value){
        let to = this.projection.resolveElement(this.projection.parent.findItem(value.id).render);
        let from = this.projection.resolveElement(this.projection.parent.findAncestor(this.bind.container).render);



        let index = from.findAnchorIndex(this.bind.container);
        let toA = to.findAnchor(index);
        let fromA = from.findAnchor(index); 
        
        const fromX = Number(from.container.getAttribute("x")) + fromA.x;
        const fromY = Number(from.container.getAttribute("y")) + fromA.y;

        const toX = Number(to.container.getAttribute("x")) + toA.x;
        const toY = Number(to.container.getAttribute("y")) + toA.y;
    

        
        this.element.setAttribute("d", "M " + fromX + " " + fromY + " L " + toX + " " + toY);
        
        this.projection.parent.container.append(this.element);
    },

    bindProj(proj){
        this.bind = proj;

        const target = this.schema.reference.target;
        this.objectiv = this.source.getAttributeByName(target).target;
        this.objectiv.register(this.projection);

        this.projection.registerHandler("value.changed", (value) => {
            this.updatePosition(value);
        })
    },

    bindEvent(){

        switch(this.schema.reference.type){
            case "duo":
                this.from.register(this.projection);
                this.to.register(this.projection);
    
                this.projection.registerHandler("value.changed", (value) => {
                    this.duoUpdate();    
                });
                break;
            case "multiple":
                this.reference.register(this.projection);
                this.projection.registerHandler("value.added", (value) => {
                    this.registerValue(value);
                })
                break;
            default:
                break;
        }

=======
    bindEvent() {
        this.projection.registerHandler("value.changed", (value) => {
            console.log(value);
            this.refresh();
        });

        this.projection.registerHandler("displayed", () => {
            this.refresh();
        });
>>>>>>> master
    }
};

export const Arrow = Object.assign(
    Object.create(Field),
    BaseArrow
);