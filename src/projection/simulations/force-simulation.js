import { ContentHandler } from './../content-handler.js';
import { isNull, isNullOrUndefined, isUndefined } from 'zenkai';
import { Simulation } from './simulation.js';
5
const BaseForceSimulation = {

    init(){
        this.width = 700;
        this.height = 700;

        return this;
    },

    render(){
        if(isNullOrUndefined(this.container)){
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.container.setAttribute("width", 350);
            this.container.setAttribute("height", 350);

            this.container.classList.add("simulation-container");
            this.container.dataset.nature = "simulation";
            this.container.dataset.shape = "force";
            this.container.dataset.id = this.id;

            this.simulationArea = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.simulationArea.setAttribute("width", 350);
            this.simulationArea.setAttribute("height", 350);
            this.simulationArea.setAttribute("viewBox", "0 0 700 700")
            this.simulationArea.setAttribute("preserveAspectRatio", "xMidYMid meet");
            this.simulationArea.id = this.id;

            this.settingArea = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.settingArea.setAttribute("x", 0);
            this.settingArea.setAttribute("y", 0);

            this.container.append(this.settingArea);
            this.container.append(this.simulationArea);
        }

        if(isNullOrUndefined(this.circleRadiusTxt)){
            this.circleRadiusTxt = document.createElementNS("http://www.w3.org/2000/svg", "text");
            this.circleRadiusTxt.textContent = "Radius:";

            this.circleRadiusTxt.setAttribute("x", 5);
            this.circleRadiusTxt.setAttribute("y", 30);
            this.circleRadiusTxt.setAttribute("font-size", 8);
            this.circleRadiusTxt.setAttribute("font-weight", 500);
            this.circleRadiusTxt.setAttribute("font-family", "Segoe UI");

            this.settingArea.append(this.circleRadiusTxt);
        }
        if(isNullOrUndefined(this.radiusTxt)){
            this.radiusTxt = ContentHandler.call(this, {
                type: "attribute",
                name: "radius",
                tag: "simulation"
            })

            this.radiusTxt.setAttribute("x", 37);
            this.radiusTxt.setAttribute("y", 30);

            this.settingArea.append(this.radiusTxt)
        }
        
        if(isNullOrUndefined(this.widthTxt)){
            this.widthTxt = document.createElementNS("http://www.w3.org/2000/svg", "text");
            this.widthTxt.textContent = "Width:"

            this.widthTxt.setAttribute("x", 5);
            this.widthTxt.setAttribute("y", 40);
            this.widthTxt.setAttribute("font-size", 8);
            this.widthTxt.setAttribute("font-weight", 500);
            this.widthTxt.setAttribute("font-family", "Segoe UI");

            this.settingArea.append(this.widthTxt);
        }

        if(isNullOrUndefined(this.wTxt)){
            this.wTxt = ContentHandler.call(this, {
                type: "attribute",
                name: "width",
                tag: "simulation"
            })

            this.wTxt.setAttribute("x", 37);
            this.wTxt.setAttribute("y", 40);

            this.settingArea.append(this.wTxt)
        }
        
        if(isNullOrUndefined(this.heightTxt)){
            this.heightTxt = document.createElementNS("http://www.w3.org/2000/svg", "text");
            this.heightTxt.textContent = "Height";

            this.heightTxt.setAttribute("x", 5);
            this.heightTxt.setAttribute("y", 50);
            this.heightTxt.setAttribute("font-size", 8);
            this.heightTxt.setAttribute("font-weight", 500);
            this.heightTxt.setAttribute("font-family", "Segoe UI");

            this.settingArea.append(this.heightTxt);
        }

        if(isNullOrUndefined(this.hTxt)){
            this.hTxt = ContentHandler.call(this, {
                type: "attribute",
                name: "height",
                tag: "simulation"
            })

            this.hTxt.setAttribute("x", 37);
            this.hTxt.setAttribute("y", 50);

            this.settingArea.append(this.hTxt)
        }

        this.button = document.createElementNS("http://www.w3.org/2000/svg", "text");
        this.button.textContent = "Simulate";

        this.settingArea.append(this.button);


        this.button.addEventListener("click", () => {
            this.setUpForce();
        })

        this.button.setAttribute("x", 5);
        this.button.setAttribute("y", 12);
        this.button.setAttribute("font-size", 12);
        this.button.setAttribute("font-weight", 500);
        this.button.setAttribute("font-family", "Segoe UI");

        let link = document.createElementNS("http://www.w3.org/2000/svg", "path");

        link.classList.add("linkSimulation");
        link.id = "linkSimulation" + this.id;

        link.setAttribute("stroke", "black");

        this.simulationArea.append(link);


        this.svgNode = [];

        for(let i = 0; i < 3; i++){
            let node = document.createElementNS("http://www.w3.org/2000/svg", "circle");

            node.style["fill"] = "red";
            node.style["stroke"] = "black";
            
            node.setAttribute("r", 50)

            node.classList.add("nodeSimulation")
            node.classList.add("hidden");

            this.svgNode.push(node);
            this.simulationArea.append(node);
        }

        let dummy = document.createElementNS("http://www.w3.org/2000/svg", "circle");

        dummy.classList.add("nodeSimulation");

        dummy.classList.add("hidden")

        this.svgNode.push(dummy);
        this.simulationArea.append(dummy);

        this.bindEvents();

        this.intensity = Number(this.intensityAttr.value);
        this.linkVal = Number(this.linkDistAttr.value);

        return this.container;
        
    },

    branch(){
        this.setUpForce();
    },

    setUpForce(){
        if(isNullOrUndefined(this.force)){
            this.svgNode.forEach(n => {
                n.classList.remove("hidden");
            });
    
            const intensity = this.source.getAttributeByName("intensity").target.value;
            const linkDist = Number(this.source.getAttributeByName("linkVal").target.value);
    
            this.force = d3.layout.force()
                        .size([this.width, this.height])
                        .nodes(
                        [])
                        .links([{source: 0, target: 1}])
                        .linkDistance(linkDist)
                        .charge(-500)
                        .on("tick", this.tick.bind(this))
                  
            var svg = d3.select("#" + this.id);     
                
            this.nodes = this.force.nodes();
    
            this.nodes.push({x: 25, y : 25})
            this.nodes.push({ x: 325, y : 25})
            this.nodes.push({ x: 175, y : 75})
            this.nodes.push({ref: true});
    
            this.node = svg.selectAll("circle").data(this.nodes);

            this.links = this.force.links()

            this.link = svg.selectAll("path").data(this.links);
        }        

        this.force.start();
    },

    clickHandler(){

    },

    tick(){
        let nodes = this.nodes;
        this.node.attr("cx", function(d) { 
            if(d.ref){
                let eq = MediatriceHandler.getMediatrice(nodes[0], nodes[1]);
                let middle = {
                    x: (nodes[0].x + nodes[1].x) / 2,
                    y: (nodes[0].y + nodes[1].y) / 2,
                }
                let d = (nodes[0].x - nodes[1].x) * (nodes[0].x - nodes[1].x) - (nodes[0].y - nodes[1].y) * (nodes[0].y - nodes[1].y);
                return middle.x;
            }
            return d.x 
        }).
        attr("cy", function(d) { 
            if(d.ref){
                let eq = MediatriceHandler.getMediatrice(nodes[0], nodes[1]);
                let middle = {
                    x: (nodes[0].x + nodes[1].x) / 2,
                    y: (nodes[0].y + nodes[1].y) / 2,
                }
                let d = (nodes[0].x - nodes[1].x) * (nodes[0].x - nodes[1].x) - (nodes[0].y - nodes[1].y) * (nodes[0].y - nodes[1].y);

                return middle.y;
            }
            return d.y });

        let dr = 1;
        
        this.link.attr("d", function(d) {return "M" + d.target.x + "," + d.target.y +
        "A" + dr + "," + dr + " 0 0 1," + d.source.x + "," + d.source.y +
        "A" + dr + "," + dr + " 0 0 0," + d.target.x + "," + d.target.y});
    },

    updateClean(){
        this.height = this.heightAttr.value;
        this.width = this.widthAttr.value;

        if(this.height > 0 && this.width > 0){
            this.simulationArea.setAttribute("viewBox", "0 0 " + this.width + " " + this.height);
        }

        for(let i = 0; i < 3; i ++) {
            if(this.radius.value > 0){
                this.svgNode[i].setAttribute("r", this.radius.value);
            }
        }
    },

    focusIn(){

    },

    focusOut(){

    },

    updateParams(){
        if(isNullOrUndefined(this.force)){
            this.updateClean();
            return;
        }
        this.force.stop();

        this.intensity = Math.min(Number(this.intensityAttr.value) * (-1), Number(this.intensityAttr.value) * (-1));
        this.linkVal = Number(this.linkDistAttr.value);

        for(let i = 0; i < 3; i ++) {
            if(this.radius.value > 0){
                this.svgNode[i].setAttribute("r", this.radius.value);
            }
        }

        this.height = this.heightAttr.value;
        this.width = this.widthAttr.value;

        if(this.height > 0 && this.width > 0){
            this.simulationArea.setAttribute("viewBox", "0 0 " + this.width + " " + this.height);
            this.force.size([this.width, this.height]);
        }

        this.force.linkDistance(this.linkVal).charge(this.intensity);

        this.force.start();
    },


    bindEvents(){
        this.intensityAttr =  this.source.getAttributeByName("intensity").target;
        this.linkDistAttr =  this.source.getAttributeByName("linkVal").target;
        this.widthAttr = this.source.getAttributeByName("width").target;
        this.heightAttr = this.source.getAttributeByName("height").target;
        this.radius = this.source.getAttributeByName("radius").target;

        this.intensityAttr.register(this.projection);
        this.linkDistAttr.register(this.projection);
        this.widthAttr.register(this.projection);
        this.heightAttr.register(this.projection);
        this.radius.register(this.projection);

        this.projection.registerHandler("value.changed", () => {
            this.updateParams()
        });
    }

}

const MediatriceHandler = {
    getMediatrice(pt1, pt2){
        let middle = {
            x: (pt1.x + pt2.x) / 2,
            y: (pt1.y + pt2.y) / 2,
        }

        let dEq = (pt2.y - pt1.y) / (pt2.x - pt1.x);

        return {
            k: -1 / dEq,
            h: middle.y + (-1 / dEq) * middle.x
        }
    },

    findPoint(eq, pt, d){
        let a =  1- (eq.k * eq.k);
        let b = -2 + 2 * pt.y * eq.k - 2 * eq.k * eq.h;
        let c = pt.x * pt.x - pt.y * pt.y - eq.h * eq.h + 2 * pt.y * eq.h - d;

        let delta = b * b - 4 * a * c;

        if(delta > 0){
            return (- b - Math.sqrt(delta)) / (2 * a);
        }

        console.log(delta);
        console.log("Not Found");
        
    }
}

export const ForceSimulation = Object.assign(
    Object.create(Simulation),
    BaseForceSimulation
);