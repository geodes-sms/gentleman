import { ContentHandler } from "../content-handler.js";
import { createDocFragment, isHTMLElement, createDiv, createElement, isEmpty, valOrDefault, isNullOrUndefined, last, getNextElementSibling, isNull} from "zenkai";
import { Algorithm } from "./algorithm.js";



export const BaseForceAlgorithm = {
    init(){
        const { dimensions = {} }  = this.schema;

        this.ratio = 0.4;

        this.width = valOrDefault(dimensions.width, 500);
        this.height = valOrDefault(dimensions.height, 500);

        this.buttons = [];
        this.dummies = [];

        this.transLink = [];
        this.transLinkId = [];

        this.arrowInventory = [];

        this.linkInventory = {}

        return this
    },

    render(){
        const { attributes = [], center, direction, intensity, fixed = [], arrowManagement} = this.schema;

        this.center = center;

        this.intensity = 500;

        switch(direction){
            case "-":
                this.direction = -1;
                break;
            default:
                this.direction = 1;
        }

        const fragment = createDocFragment();

        if (isNullOrUndefined(this.instances)){
            this.instances = new Map();
        }

        if (isNullOrUndefined(this.holders)){
            this.holders = new Map();
        }


        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["algorithm-container"],
                dataset: {
                    nature: "algorithm",
                    algorithm: "force",
                    id: this.id,
                },
                tabindex: 1
            });

            this.container.style["border"] = "solid 1px black"
        }

        if(!isHTMLElement(this.interactionsArea)){
            this.interactionsArea = createDiv({
                class: ["layout-container", "projection"],
                dataset: {
                    nature: "layout",
                    layout: "flex",
                    id: "iA" + this.id,
                    projection: -1
                },
                tabindex: 1
            });

            fragment.append(this.interactionsArea);
        }

        this.focusable = true;

        if(!isHTMLElement(this.ids)){
            this.ids = [];
        }

        if(!isEmpty(attributes)){
            attributes.forEach(a => {
                let attribute = ContentHandler.call(this, a);

                this.interactionsArea.append(attribute);

                let element = this.environment.resolveElement(attribute);

                element.parent = this;

                this.buttons.push(element);

            })
        }


        if(!isHTMLElement(this.svgArea)){
            this.svgArea = document.createElementNS("http://www.w3.org/2000/svg","svg");

            this.svgArea.setAttribute("width", this.width);
            this.svgArea.setAttribute("height", this.height); 

            this.linksArea = document.createElementNS("http://www.w3.org/2000/svg","g");
            this.linksArea.classList.add("linkArea");

            this.nodesArea = document.createElementNS("http://www.w3.org/2000/svg","g");
            this.nodesArea.classList.add("nodeArea");

            this.definitionsArea = document.createElementNS("http://www.w3.org/2000/svg", "g");
            this.definitionsArea.classList.add("definitionArea");

            /*let fixedArea = document.createElementNS("http://www.w3.org/2000/svg","g");
            fixedArea.classList.add("fixedArea");*/

            /*this.svgArea.appendChild(fixedArea);*/
            this.svgArea.appendChild(this.linksArea);
            this.svgArea.appendChild(this.nodesArea);
            this.svgArea.appendChild(this.definitionsArea);

            this.svgArea.setAttribute("tabindex", 1);
            this.svgArea.setAttribute("data-projection", -1);
            this.svgArea.setAttribute("id", "sA" + this.id);

        }

       
        /* Attach listeners*/ 

        fragment.append(this.svgArea);

        if(!isHTMLElement(this.openArrow)){
            switch(arrowManagement.type){
                case "interaction-management":
                    this.openArrow = createDiv({
                        class: ["button-container", "projection"],
                        dataset: {
                            nature: "layout",
                            layout: "flex",
                            id: "iA" + this.id,
                            projection: -1
                        },
                        tabindex: 1
                    });

                    this.openArrow.innerHTML = arrowManagement.content;
                    
                    this.openArrow.addEventListener("click", (event)=> {
    
                    let window = this.environment.findWindow("side-instance");
                    if(isNullOrUndefined(window)){
                        window = this.environment.createWindow("side-instance");
                        window.container.classList.add("model-projection-sideview");
                    }
                        
                    if(window.instances.size > 0){
                        let instance = Array.from(window.instances)[0];
                        instance.delete()
                    }


                    arrowManagement.attribute.forEach(a => {
                        let concept = this.source.getAttributeByName(a.dynamic.name).target;

                        let projection = this.environment.createProjection(concept, a.dynamic.tag);
                        let instance = this.environment.createInstance(concept, projection, {
                            type: "projection",
                            close: "DELETE-PROJECTION"
                        });
                                

                        window.addInstance(instance);
                    })

                    
                    this.environment.setActiveReceiver(this, this.projection.rtags[0])
                       
                    })

                    this.interactionsArea.append(this.openArrow);
            }
        }

        if(fragment.hasChildNodes()){
            this.container.append(fragment);
        }

        this.bindEvents();

        /*this.environment.registerReceiver(this, this.projection.rtags[0]);

        

        this.environment.getActiveReceiver(this.projection.rtags[0]);*/
        return this.container;
    },

    setUpForce(width, height, intensity, direction, center, edges){
        let linkDistance = 300;
        if(!this.isRoot){
            linkDistance = 150;
        }
        this.force = d3.layout.force()
                    .size([width, height])
                    .nodes([])
                    .linkDistance(linkDistance)
                    .charge(direction * intensity)
                    .on("tick", this.ticked.bind(this))
                
        var svg = d3.select("#sA" + this.id);

        var n = svg.select(".nodeArea");
        var l = svg.select(".linkArea");
            
        this.nodes = this.force.nodes();
        this.node = n.selectAll(".node" + this.id);

        this.links = this.force.links();
        this.link = l.selectAll(".link" + this.id);

        this.force.start();
    },
    
    restart(){
        
        let l = d3.select("#sA" + this.id).select(".linkArea");
        this.link = l.selectAll(".link" + this.id).data(this.links);

        let n = d3.select("#sA" + this.id).select(".nodeArea");
        this.node = n.selectAll(".node" + this.id).data(this.nodes);

        this.force.start();

        if(!this.isRoot){
            this.environment.getRootReceiver(this.projection.rtags[0]).restart();
        }
    },

    branchRoot(elem, ratio){
        let holder = this.createHolder(elem);

        this.nodesArea.append(holder);

        this.adapt(elem);

        return holder;
    },

    branch(){
        const { attributes = [], center, direction, intensity, fixed = [] } = this.schema;

        if(!isEmpty(fixed) && isNullOrUndefined(this.fixedArea)){
            
            fixed.forEach(f => {
                
                this.setUpForce(this.width, this.height, this.intensity, this.direction);
                this.nodes.push({x: f.coordinates.width
                    , y: f.coordinates.height
                    , fixed: true,
                    nbLink : 0,
                    points: []})

                let item = ContentHandler.call(this, f.attribute);


                let holder = this.environment.getRootReceiver(this.projection.rtags[0]).branchRoot(item, f.ratio);
                
                this.nodesArea.appendChild(holder);
          
                
                holder.classList.add("node" + this.id);

                this.nodes[this.nodes.length - 1].width = Number(holder.getAttribute("width"));
                this.nodes[this.nodes.length - 1].height = Number(holder.getAttribute("height"));


                if(isNullOrUndefined(this.instances)){
                    this.instances = new Map();
                }

                this.registerShape(holder);

                this.instances.set(this.environment.resolveElement(item).source.id, item);

                this.ids.push(holder);


                this.restart();
            })
        }

        this.buttons.forEach(a => {
            a.refresh();
        });

        this.openArrow.click();
    },

    addItem(value, button){
        if(isNullOrUndefined(this.force)){
            this.setUpForce(this.width, this.height, this.intensity, this.direction);
        }

        let root = this.environment.getRootReceiver(this.projection.rtags[0]);

        let {item, holder, id} = root.addItemRoot( value, button);

        if(item.dataset.nature === "algorithm"){
            this.environment.resolveElement(item).branch();
        }

        this.instances.set(id, item);
       
        this.nodes.push({
            nbLink : 0,
            points: []
        });


        holder.classList.add("node" + this.id);
        holder.id = this.nodes.length -1;

        this.nodesArea.append(holder);

        this.nodes[this.nodes.length - 1].size = this.getRadius(holder);
        this.nodes[this.nodes.length - 1].width = Number(holder.getAttribute("width"));
        this.nodes[this.nodes.length - 1].height = Number(holder.getAttribute("height"));

        
        this.registerShape(holder);

        this.holders.set(item, holder);
        this.ids.push(holder)

        this.restart();
    },

    addItemRoot(value, button){
        let {item, id} = this.createItemRoot(value, button);
        let holder = this.createHolder(item);

        this.nodesArea.append(holder);

        this.adapt(item);

        return {item : item, holder: holder, id : id};        
    },

    registerShape(item){
        let target = item.querySelector("[data-shape]");

        const schema = {};

        let rect;
        if(!isNullOrUndefined(target)){
            switch(target.tagName){
                case "ellipse":
                    if(this.environment.getRootReceiver(this.projection.rtags[0]) !== this){
                        let rectItem = item.getBoundingClientRect();
                        let rW = Number(item.getAttribute("width")) / rectItem.width;
                        let rH = Number(item.getAttribute("height")) / rectItem.height;

                        rect = target.getBoundingClientRect();
                        schema.rx = rect.width * rW;
                        schema.ry = rect.height * rH;

                    }else{
                        rect = target.getBoundingClientRect();
                        schema.rx = rect.width;
                        schema.ry = rect.height;
                    }

            
                    this.nodes[this.nodes.length - 1].ellipse = schema;
                    this.nodes[this.nodes.length - 1].tag = "ellipse";
                    return;
                case "polygon":
                    let vB = target.getAttribute("data-shape").split(",");
                    const ratioInfo = {w : Number(vB[0]), h : Number(vB[1])};                    

                    let points = [];
                    
                    let d = target.getAttribute("points").split(" ");
                    d.forEach(p => {
                        let coord = p.split(",");
                        points.push({x: Number(coord[0]),
                            y : Number(coord[1]),
                            rW : Number(coord[0]) / ratioInfo.w,
                            rH : Number(coord[1]) / ratioInfo.h});
                    })

                    schema.points = points;
                    
                    this.nodes[this.nodes.length - 1].polygon = schema;
                    this.nodes[this.nodes.length - 1].tag = "polygon";
                    console.log("Schema");
                    console.log(schema);
                    return;
            }
        }
        rect = item.getBoundingClientRect();
        schema.width = rect.width / 2;
        schema.height = rect.height / 2;

        this.nodes[this.nodes.length - 1].rect = schema;
        this.nodes[this.nodes.length - 1].tag = "svg";


    },

    adjustShape(p, shape, rW, rH){
        switch(shape.tag){
            case "ellipse":
                const ellipse = {};
                ellipse.rx = shape.ellipse.rx * rW;
                ellipse.ry = shape.ellipse.ry * rH;
                p.ellipse = ellipse;
                p.tag = "ellipse";
                return;
            case "rect":
            case "svg":
                const rect = {};
                rect.width = shape.rect.width * rW;
                rect.height = shape.rect.height * rH;

                p.rect = rect;
                p.tag = "svg";
                return;

        }
    },

    adapt(item, ratio = 0.5){
        this.adaptForeign(item.parentNode, item);
        this.adaptSVG(item.parentNode.parentNode, item.parentNode, ratio);
    },

    createHolder(element){
        let holder = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        let foreign = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");

        holder.appendChild(foreign);
        foreign.appendChild(element);

        return holder;
    },

    createItemRoot(object, button){
        const n = button.item;

        let itemProjection = this.model.createProjection(object);
        itemProjection.optional = true;

        let container = itemProjection.init().render();

        return {item : container, id : itemProjection.element.source.id } ;
    },

    createItem(object, button){
        const n = button.item;

        /*PRETEND RATIO 0.1*/

        /*if(!this.model.hasProjectionSchema(object, n.tag)){
            return "";
        }*/

        let itemProjection = this.model.createProjection(object);
        itemProjection.optional = true;
        itemProjection.parent = this.projection;

        

        let container = itemProjection.init().render()

        this.instances.set(itemProjection.element.source.id, container);

        return container;
    }, 

    removeItem(value){
        this.force.stop();

        let old = this.holders.get(this.instances.get(value.id));

        this.nodes.splice(old.id, 1);

        /*this.links.forEach(l => {
            if(l.source.id === old.id || l.target.id === old.id){

            }
        })*/
        
        old.remove();

        for(let i = 0; i < this.arrowInventory.length; i++){
            this.arrowInventory[i].deleteRef(value, i);
        }

        
    
        this.restart();
    },

    removeDummy(ref){
        for(let i = 0; i < this.dummies.length; i++){
            let d = this.dummies[i];
            if(d.ref === ref){
                d.item.remove();
                this.dummies.splice(i, 1);
                i--;
            } 
        }

        for(let j = 0; j < this.nodes.length; j++){
            if(this.nodes[j].ref === ref){
                this.nodes.splice(j, 1);
                j--;
            }
        }
    },

    removeArrow(arrow, index = -1){
        this.force.stop();
        let ref;
        let isDummy;

        for(let i = 0; i < this.links.length; i++){
            if(this.links[i].cID === arrow.id){
                ref = this.links[i].ref;
                isDummy = this.links[i].dummy
                this.links.splice(i, 1);
                break;
            }
        }

        if(isNullOrUndefined(ref)){
            this.restart();
            return;
        }

        this.removeDummy(ref);

        arrow.element.remove();

        if(index > 0){
            this.arrowInventory.splice(index, 1);
        }else{
            this.restart();
        }
    },

    adaptForeign(f, i){
        i.style.width = "fit-content";
        let rect = i.getBoundingClientRect();

        f.setAttribute("width", rect.width);
        f.setAttribute("height", rect.height);
    },

    adaptSVG(container, foreign, ratio = 0.4){
        container.setAttribute("width", Number(foreign.getAttribute("width")) * ratio);
        container.setAttribute("height", Number(foreign.getAttribute("height")) * ratio);


        container.setAttribute("viewBox", "0 0 " + foreign.getAttribute("width") + " " + foreign.getAttribute("height"));
    },

    adaptSVGSimple(container, foreign, width, height){
        container.setAttribute("width", width);
        container.setAttribute("height", height);

        container.setAttribute("viewBox", "0 0 " + foreign.getAttribute("width") + " " + foreign.getAttribute("height"));
    },

    ticked(){
        var computeBorders = this.computeBorders;
        var computeSelfBorders = this.computeSelfBorders;
        var adjustShape = this.adjustShape;
        var getPerpendicularLine = BorderHandler.getPerpendicularLine;
        var getPointConstructedEllipse = BorderHandler.getPointConstructedEllipse;
        var getEllipseCenter = BorderHandler.getEllipseCenter;
        var svgArea = this.svgArea;
        var linkInventory = this.linkInventory;
        let links = this.links;
        let w = this.width;
        let h = this.height;
        this.link.attr("d", function(d){
            if(d.source !== d.target){
                let s = computeBorders(d, d.source, d.target);
                let t = computeBorders(d, d.target, d.source);
                let dx = t.x - s.x;
                let dy = t.y - s.y;
    
    
                let dr = Math.sqrt(dx * dx + dy * dy);
                
    
                let lTotalLinkNum = linkInventory[d.source.index + "," + d.target.index].length;
                
    
                if(lTotalLinkNum > 1){
                    dr = (dr/ (1 + (1/lTotalLinkNum) * ( d.linkIndex -  1)));
                }
                
                d.source.points[d.sourceIndex] = s;
                d.target.points[d.targetIndex] = t;

                d.dr = dr;
                d.s = s;
                d.t = t;


                return "M" + t.x + "," + t.y +
                       "A" + dr + "," + dr + " 0 0 1," + s.x + "," + s.y +
                       "A" + dr + "," + dr + " 0 0 0," + t.x + "," + t.y
            }else{
                let s = computeSelfBorders(d);
                let c1, c2;
                switch(s.direction){
                    case "top":
                        c1 = {x : -0.03 *  w, y : -0.05 * h};
                        c2 = {x :  0.03 *  w, y : -0.05 * h};
                        break;
                    case "bot":
                        c1 = {x : -0.03 *  w, y :  0.05 * h};
                        c2 = {x :  0.03 *  w, y :  0.05 * h};
                         break;
                    case "left":
                        c1 = {x : -0.03 *  w, y : 0.05 * h};
                        c2 = {x : -0.03 *  w, y : -0.05 * h};
                        break;
                    default:
                        c1 = {x : 0.03 *  w, y : -0.05 * h};
                        c2 = {x : 0.03 *  w, y : 0.05 * h};
                        break;
                }

                let lTotalLinkNum = linkInventory[d.source.index + "," + d.target.index].length;
    
    
                if(lTotalLinkNum > 1){
                    c1.x = c1.x * d.linkIndex;
                    c1.y = c1.y * d.linkIndex;

                    c2.x = c2.x * d.linkIndex;
                    c2.y = c2.y * d.linkIndex;
                }

                return "M" + s.x + "," + s.y +
                       "c" + c1.x +","+ c1.y + " " + c2.x + "," + c2.y + " 0, 0"; 
                        
            } 
            
        })



        let moving = true;
        while(moving){
            this.nodes.forEach(a => {
                this.nodes.forEach( b => {
                    moving = this.collide(a, b);
                })
            })
        }
        
        if(!isNullOrUndefined(this.node)){
            this.node.attr("x", function(d) { 
                if(!isNullOrUndefined(d.ref)){
                    let center = getEllipseCenter(links[d.ref].dr, links[d.ref].s, links[d.ref].t, svgArea);
                    let dEq = getPerpendicularLine(links[d.ref].s, links[d.ref].t);
                    let rac = getPointConstructedEllipse(dEq, links[d.ref].dr, links[d.ref].dr, center);
                    let v = BorderHandler.getCloserBorder(rac, links[d.ref].t);

                    d.fx = v.x;
                    return v.x - d.width / 2;
            }
            return (d.x = Math.max(d.width / 2, Math.min(w - d.width / 2, d.x))) - d.width / 2; 
            })
                .attr("y", function(d) {
                if(!isNullOrUndefined(d.ref)){
                    let center = getEllipseCenter(links[d.ref].dr, links[d.ref].s, links[d.ref].t, svgArea);
                    let dEq = getPerpendicularLine(links[d.ref].s, links[d.ref].t);
                    let rac = getPointConstructedEllipse(dEq, links[d.ref].dr, links[d.ref].dr, center);
                    let v = BorderHandler.getCloserBorder(rac, links[d.ref].t);

                    d.fy = v.y;

                    return v.y - d.height / 2;
                }
                return (d.y = Math.max(d.height / 2, Math.min(h - d.height / 2 , d.y))) - d.height / 2; 
            })
                .attr("id", function(d) {
                    if(!isNullOrUndefined(d.ref)){
                        return d.index
                    } 
                    return (d.index); 
                })
        }

        if(!isEmpty(this.transLink)){
            this.transLink.forEach(schema => {
                let arrow = schema.arrow;
                let sSchema = schema.source;
                let tSchema = schema.target;
                
                let p1 = {};
                if(!isNullOrUndefined(sSchema.rW)){
                    p1.x = (sSchema.source.x) * sSchema.rW + sSchema.base.x - sSchema.base.width / 2;
                    p1.y = (sSchema.source.y + sSchema.off) * sSchema.rH + sSchema.base.y - sSchema.base.height / 2;
                    adjustShape(p1, sSchema.source, sSchema.rW, sSchema.rH);
                }else{
                    p1 = sSchema.source
                }

                let p2 = {};

                if(!isNullOrUndefined(tSchema.rW)){
                    p2.x = (tSchema.source.x) * tSchema.rW + tSchema.base.x - tSchema.base.width / 2;
                    p2.y = (tSchema.source.y + tSchema.off) * tSchema.rH + tSchema.base.y - tSchema.base.height / 2;
                    adjustShape(p2, tSchema.source, tSchema.rW, tSchema.rH);

                }else{
                    p2 = tSchema.source;
                }

 

                
                let s = computeBorders(schema, p1, p2);
                let t = computeBorders(schema, p2, p1);

                let dx = t.x - s.x;
                let dy = t.y - s.y;
    


                let dr = Math.sqrt(dx * dx + dy * dy);
                

    
                arrow.setAttribute("d", "M" + t.x + "," + t.y +
                "A" + dr + "," + dr + " 0 0 1," + s.x + "," + s.y +
                "A" + dr + "," + dr + " 0 0 0," + t.x + "," + t.y)
                
            })
        }
    },

    collide(node, conc){
        let res = false;

        if(!isNullOrUndefined(node.ref)){
            console.log(node.ref);
            return res;
        }

        if(!isNullOrUndefined(conc.ref) && conc !== node){
            console.log(node.ref);
            if( (node.x < conc.fx) &&
                (node.y < conc.fy) &&
                (node.x + node.width / 2 > conc.fx - conc.width / 2) &&
                (node.y + node.height / 2 > conc.fx - conc.height / 2)){
                    console.log("hoho1");
                    let offW = (node.x + node.width / 2) - (conc.fx - conc.width / 2);
                    let offH = ((node.y + node.height /2) - (conc.fy - conc.height / 2)) * 1.1;

                    switch(Math.min(offW, offH)){
                        case offW:
                            node.x -= offW;
                            break;

                        case offH:                      
                            node.y -= offH;                           
                            break;
                    }
                }else{
                    if( (node.x > conc.fx) &&
                    (node.y < conc.fy) &&
                    ((conc.fx + conc.width / 2) > (node.x - node.width /2)) &&
                    ((node.y + node.height /2) > (conc.fy - conc.height / 2))){
                        console.log("hoho2");
                        let offW = (node.x + node.width / 2) - (conc.fx - conc.width / 2); 
                        let offH = ((node.y + node.height /2) - (conc.fy - conc.height / 2)) * 1.1;

                        switch(Math.min(offW, offH)){
                            case offW:
                                node.x -= offW ;
                                break;
                            case offH:
                                node.y -= offH;
                                break;
                        }
                    }else{
                        if( (node.x > conc.fx) &&
                        (node.y > conc.fy) &&
                        (conc.fx + conc.width / 2 > node.x - node.width / 2) &&
                        (conc.fy + conc.height /2 > node.y - node.height / 2)){
                            console.log("hoho3");
                            let offW = (conc.fx + conc.width / 2) - (node.x - node.width /2);
                            let offH = ((conc.fy + conc.height / 2) - (node.y - node.height / 2)) * 1.1;

                            switch(Math.min(offW, offH)){
                                case offW:
                                    node.x += offW;
                                    break;
                                case offH:
                                    node.y += offH;
                                    break;
                            }
                        }else{
                            if( (node.x < conc.fx) &&
                            (node.y > conc.fy) &&
                            ((node.x + node.width / 2) > (conc.fx - conc.width / 2)) &&
                            ((node.y - node.height / 2) < (conc.fy + conc.height / 2))){
                                console.log("hoho4");
                                let offW = (node.x + node.width / 2) - (conc.fx - conc.width / 2); 
                                let offH = ((conc.fy + conc.height /2) - (node.y - node.height / 2)) * 1.1;

                                switch(Math.min(offW, offH)){
                                    case offW:
                                        node.x -= offW;
                                        break;
                                    case offH:
                                        node.y += offH;
                                        break;
                                }
                            } 
                        }
                    }
                }
             
        }
        if (conc && (conc !== node)) {
            if( (node.x < conc.x) &&
                (node.y < conc.y) &&
                (node.x + node.width / 2 > conc.x - conc.width / 2) &&
                (node.y + node.height / 2 > conc.x - conc.height / 2)){
                    let offW = (node.x + node.width / 2) - (conc.x - conc.width / 2); 
                    let offH = ((node.y + node.height /2) - (conc.y - conc.height / 2)) * 1.1;

                    switch(Math.min(offW, offH)){
                        case offW:
                            node.x -= offW / 2;
                            conc.x += offW / 2;
                            break;
                        case offH:
                        

                            node.y -= offH / 2;
                            conc.y += offH / 2;
                            break;
                    }
            }else{
                if( (node.x > conc.x) &&
                    (node.y < conc.y) &&
                    ((conc.x + conc.width / 2) > (node.x - node.width /2)) &&
                    ((node.y + node.height /2) > (conc.y - conc.height / 2))){
                        let offW = (conc.x + conc.width / 2) - (node.x - node.width /2);
                        let offH = ((node.y + node.height /2) - (conc.y - conc.height / 2) ) * 1.1;
                        
                        switch(Math.min(offW, offH)){
                            case offW:

                                node.x += offW / 2;
                                conc.x -= offW / 2;
                                break;
                            case offH:
                                
                                node.y -= offH / 2;
                                conc.y += offH / 2;
                                break;
                        }
                }else{
                    if( (node.x > conc.x) &&
                        (node.y > conc.y) &&
                        (conc.x + conc.width / 2 > node.x - node.width / 2) &&
                        (conc.y + conc.height /2 > node.y - node.height / 2)){
                            let offW = (conc.x + conc.width / 2) - (node.x - node.width /2);
                            let offH = ((conc.y + conc.height / 2) - (node.y - node.height / 2)) * 1.1;

                            switch(Math.min(offW, offH)){
                                
                                case offW:

                                    node.x += offW / 2;
                                    conc.x -= offW / 2;
                                    break;
                                case offH:

                                    node.y += offH / 2;
                                    conc.y -= offH / 2;
                                    break;
                            }
                    }else{                                          
                        if( (node.x < conc.x) &&
                            (node.y > conc.y) &&
                            ((node.x + node.width / 2) > (conc.x - conc.width / 2)) &&
                            ((node.y - node.height / 2) < (conc.y + conc.height / 2))){
                                let offW = (node.x + node.width / 2) - (conc.x - conc.width / 2); 
                                let offH = ((conc.y + conc.height /2) - (node.y - node.height / 2)) * 1.1;

                                switch(Math.min(offW, offH)){
                                    case offW:

                                        node.x -= offW / 2;
                                        conc.x += offW / 2;
                                        break;
                                    case offH:
 
                                        node.y += offH / 2;
                                        conc.y -= offH / 2;
                                        break
                                }
                            } 
                    }
                }
            }

            
        }
        return res;
    },

    computeBorders(d, source, target){
        let schema, answer;
        
        switch(source.tag){
            case "ellipse":
                schema = BorderHandler.getPointEllipse(source, target, source.ellipse);
                answer = BorderHandler.getCloserBorder(schema, target);
                return answer;

            case "polygon":
                answer = BorderHandler.getPointPolygon(source, target, source.polygon);
                return answer;
            case "rect":
            case "svg":
                schema = BorderHandler.getPointRect(source, target, source.rect);
                answer = BorderHandler.getCloserBorder(schema, target);
                return answer;

        }
    },

    computeSelfBorders(d){

        switch(d.source.tag){
            case "ellipse":
                return BorderHandler.getSelfPointEllipse(d.source);
            case "rect":
            case "svg":
                schema = BorderHandler.getSelfPointRect(d.source)
        }
    },

    getRadius(svg){
        let w = svg.getAttribute("width");
        let h = svg.getAttribute("height");

        return Math.sqrt((w / 2) * (w / 2) + (h / 2) * (h / 2));
    },

    accept(source, target, arrow){
        
        let sourceInstance = this.instances.get(source);
        
        let absolSource = this.environment.findReceiverInstance(source, this.projection.rtags[0]);

        let targetInstance = this.instances.get(target);

        let absolTarget = this.environment.findReceiverInstance(target, this.projection.rtags[0]);

        if(this.environment.getRootReceiver(this.projection.rtags[0]).checkTransLinkId(arrow)){
            this.environment.getRootReceiver(this.projection.rtags[0]).acceptTransArrow(arrow, absolSource, absolTarget, source, target);
            return;
        }

        if((absolSource.container != this) || (absolTarget.container != this)){
            if(absolSource.container === absolTarget.container){
                absolSource.container.accept(source, target, arrow);
                return;
            }
            let root = this.environment.getRootReceiver(this.projection.rtags[0]);

            root.acceptTransArrow(arrow, absolSource, absolTarget, source, target);
            return;
        }

        let sourceHolder = Number(sourceInstance.parentNode.parentNode.id);
        let targetHolder = Number(targetInstance.parentNode.parentNode.id);

        let existing = this.checkValue(arrow.id, arrow.source.id, sourceHolder, targetHolder);

        if(existing === -2){
            return;
        }

        this.linksArea.append(arrow.element)
        
        if(arrow.definitions){
            this.definitionsArea.append(arrow.definitions);
        }

        arrow.element.classList.add("link" + this.id);

        if(existing >= 0){
            let saveT = this.links[existing].target;
            let saveS = this.links[existing].source;

            this.linkInventory[saveS.index + "," + saveT.index] = this.linkInventory[saveS.index + "," + saveT.index].filter((item) => {
                return item !== arrow.id;
            })

            this.links[existing].target = targetHolder;
            this.links[existing].source = sourceHolder;

            if(isNullOrUndefined(this.linkInventory[sourceHolder + "," + targetHolder])){
                this.linkInventory[sourceHolder + "," + targetHolder] = [arrow.id];
                this.links[this.links.length - 1].linkIndex = 1; 
            }else{
                this.linkInventory[sourceHolder + "," + targetHolder].push(arrow.id);
                this.links[this.links.length - 1].linkIndex =  this.linkInventory[sourceHolder + "," + targetHolder].length;
            }

            this.restart();
            return;
        }else{
            this.links.push({source: sourceHolder,
                target: targetHolder,
                cID : arrow.id,
                concept : arrow.source.id,
                ref: this.links.length,
                
            });

            if(sourceHolder !== targetHolder){
                this.nodes[sourceHolder].nbLink++;
                this.nodes[targetHolder].nbLink++;
                this.links[this.links.length - 1].sourceIndex = this.nodes[sourceHolder].nbLink;
                this.links[this.links.length - 1].targetIndex = this.nodes[targetHolder].nbLink;
            }else{
                this.nodes[sourceHolder].nbLink++;
                this.links[this.links.length - 1].sourceIndex = this.nodes[sourceHolder].nbLink;
            }


            this.nodes.push({
                ref : this.links.length - 1,
                fixed : true,
                width : 0.1 * this.height,
                height : 0.1 * this.height
            })

            this.arrowInventory.push(arrow);

            if(isNullOrUndefined(this.linkInventory[sourceHolder + "," + targetHolder])){
                this.linkInventory[sourceHolder + "," + targetHolder] = [arrow.id];
                this.links[this.links.length - 1].linkIndex = 1; 
            }else{
                this.linkInventory[sourceHolder + "," + targetHolder].push(arrow.id);
                this.links[this.links.length - 1].linkIndex =  this.linkInventory[sourceHolder + "," + targetHolder].length;
            }


            if(arrow.decorator){
                this.decoratorHandler(arrow.decorator);
                this.links[this.links.length - 1].dummy = false;
            }else{
                let dummy = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            
                dummy.classList.add("node" + this.id);
                this.nodesArea.append(dummy);
                this.dummies.push({item: dummy, ref : this.links.length - 1});     
                this.links[this.links.length - 1].dummy = true;
                this.ids.push(dummy);           
            }
             


            this.restart();
        }

    },

    acceptTransArrow(arrow, source, target, refS, refT){
        let sSchema = {};

        if(this.transLinkId.includes(arrow.id)){
            let link;

            let i;
            for(i = 0; i < this.transLink.length; i++){
                if(this.transLink[i].arrow === arrow.element){
                    link = this.transLink[i];
                    break;
                }
            }

            let newS = {};
            if(source.container === target.container){
                

                this.transLink.splice(i, 1);

                for(i = 0; i < this.transLinkId.length; i++){
                    if(this.transLinkId[i] === arrow.id){
                        this.transLinkId.splice(i, 1);
                        break;
                    }
                }


                source.container.accept(refS, refT, arrow);
                return;

            }

            if(source.container != this){
                this.setTransSchema(newS, source);
            }else{
                newS.source = this.nodes[Number(source.instance.parentNode.parentNode.id)];
            }

            let newT = {};
            if(target.container != this){
                this.setTransSchema(newT, target);
            }else{
                newT.source = this.nodes[Number(target.instance.parentNode.parentNode.id)];
            }

            this.transLink[i] = {arrow : arrow.element, source : newS, target : newT, s : refS, t : refT}
        }else{

            this.transLinkId.push(arrow.id);


            if(source.container != this){
                this.setTransSchema(sSchema, source);
            }else{
                sSchema.source = this.nodes[Number(source.instance.parentNode.parentNode.id)]
            }

            let tSchema = {};
            if(target.container != this){
                this.setTransSchema(tSchema, target);
            }else{
                tSchema.source = this.nodes[Number(target.instance.parentNode.parentNode.id)];
            }


            this.linksArea.append(arrow.element);

            if(arrow.definitions){
                this.definitionsArea.append(arrow.definitions);
            }

            
            this.transLink.push({arrow : arrow.element, source : sSchema, target : tSchema, s : refS, t : refT});
        }

        this.restart();
    },
    
    setTransSchema(schema, elem){
        let container = elem.container;

        let holder = elem.container.container.parentNode.parentNode;
        let foreign = elem.container.container.parentNode;

        let ratioW = Number(holder.getAttribute("width")) / Number(foreign.getAttribute("width"));
        let ratioH = Number(holder.getAttribute("height")) / Number(foreign.getAttribute("height"));

        let offset = Number(foreign.getAttribute("height")) - container.height;

        schema.rH = ratioH;
        schema.rW = ratioW;
        schema.off = offset;

        schema.base = this.nodes[Number(holder.id)];

        schema.source = container.nodes[Number(elem.instance.parentNode.parentNode.id)];
    },

    checkTransLinkId(arrow){
        let found = false;

        this.transLinkId.forEach(link => {
            if(link === arrow.id){
                found = true;
                return;
            }
        });
        
        return found;
    },


    decoratorHandler(decorator, ratio = 1){
        let holder = this.createHolder(decorator);
        this.nodesArea.append(holder);

        this.adapt(decorator, ratio);

        holder.classList.add("node" + this.id);

        this.nodes[this.nodes.length - 1].width = Number(holder.getAttribute("width"));
        this.nodes[this.nodes.length - 1].height = Number(holder.getAttribute("height"));

        this.ids.push(holder);

    },

    checkValue(value, concept, source, target){
        for(let i = 0; i < this.links.length; i++){
            if((this.links[i].concept === concept) && ((this.links[i].target.index === target) && (this.links[i].source.index === source))){
                return -2;
            }
            if(this.links[i].concept === concept){
                return i;
            }
        }
        return -1;
    },

    focus(){
        this.container.focus();
        return this;
    },

    focusIn(){
        this.focused = true;
        this.container.classList.add("active");
        this.container.classList.add("focus");

        this.container.focus();

        return this;
    },

    focusOut(){
        this.focused = false;
        this.container.classList.remove("active");
        this.container.classList.remove("focus");

        return this;
    },

    enterHandler(){
        if(this.focused){
            this.interactionsArea.focus();
        }
    },

    bindEvents(){
        this.svgArea.addEventListener("click", (event) => {
            const {target} = event;

            
            if(target === this.svgArea){
                this.svgArea.classList.add("active");
                this.svgArea.classList.add("focus");
                this.svgArea.focus();
            }
        })
    }

};

const BorderHandler = {
    getPointEllipse(p1, p2, e){
        const ellipse = {a : e.rx /2, b : e.ry / 2, h : p1.x, k : p1.y};

        const dEq = this.getDeq(p1, p2);

        let a = ellipse.b * ellipse.b + ellipse.a * ellipse.a * dEq.a * dEq.a;
        let b = 2 * ellipse.a * ellipse.a * dEq.a * dEq.b
              - 2 * ellipse.h * ellipse.b * ellipse.b
              - 2 * ellipse.k * dEq.a * ellipse.a * ellipse.a;
        let c = ellipse.h * ellipse.h * ellipse.b * ellipse.b
              + ellipse.a * ellipse.a * ellipse.k * ellipse.k
              + ellipse.a * ellipse.a * dEq.b * dEq.b
              - 2 * ellipse.k * ellipse.a * ellipse.a * dEq.b
              - ellipse.a * ellipse.a * ellipse.b * ellipse.b;

        let delta = b * b - 4 * a * c;

        if(delta >= 0){
            let x1 = (-b - Math.sqrt(delta)) / (2 * a);
            let y1 = x1 * dEq.a + dEq.b

            let x2 = (-b + Math.sqrt(delta)) / (2 * a);
            let y2 = x2 * dEq.a + dEq.b;

            return {x1 : { x : x1, y : y1}, x2 : { x : x2, y : y2}};
        }

        console.log("Nothing found");
    },

    getPointConstructedEllipse(dEq, rX, rY, center){
        const ellipse = {a : rX, b : rY, h : center.x, k : center.y};

        let a = ellipse.b * ellipse.b + ellipse.a * ellipse.a * dEq.a * dEq.a;
        let b = 2 * ellipse.a * ellipse.a * dEq.a * dEq.b
              - 2 * ellipse.h * ellipse.b * ellipse.b
              - 2 * ellipse.k * dEq.a * ellipse.a * ellipse.a;
        let c = ellipse.h * ellipse.h * ellipse.b * ellipse.b
              + ellipse.a * ellipse.a * ellipse.k * ellipse.k
              + ellipse.a * ellipse.a * dEq.b * dEq.b
              - 2 * ellipse.k * ellipse.a * ellipse.a * dEq.b
              - ellipse.a * ellipse.a * ellipse.b * ellipse.b;

        let delta = b * b - 4 * a * c;

        if(delta >= 0){
            let x1 = (-b - Math.sqrt(delta)) / (2 * a);
            let y1 = x1 * dEq.a + dEq.b

            let x2 = (-b + Math.sqrt(delta)) / (2 * a);
            let y2 = x2 * dEq.a + dEq.b;

            return {x1 : { x : x1, y : y1}, x2 : { x : x2, y : y2}};
        }
    },

    getEllipseCenter(dr, p1, p2, svgArea){

        let xPrime = ((p1.x - p2.x) / 2) ;
        let yPrime = ((p1.y - p2.y) / 2);

        let r = -
        Math.sqrt(((dr * dr) * (dr * dr) - (dr * dr) *(yPrime * yPrime) - (dr * dr) * (xPrime * xPrime))
                /((dr * dr) * (yPrime * yPrime) + dr * dr * xPrime * xPrime))

        let cxPrime = r * ((dr * yPrime) / dr);
        let cyPrime = r * (-(dr * xPrime) / dr);
        let cx = cxPrime + (p1.x + p2.x) / 2;
        let cy = cyPrime + (p1.y + p2.y) / 2;


        return {x : cx, y : cy};
    },

    getPerpendicularLine(p1, p2){
        let middleX = (p1.x + p2.x) / 2;
        let middleY = (p1.y + p2.y) / 2;

        let dEq = BorderHandler.getDeq(p1, p2);

        let a = - 1 / dEq.a;
        let b = middleY - a * middleX;

        return {a : a, b : b};
    },

    getSelfPointEllipse(d){
        let left = {x : d.x - d.ellipse.rx / 2, y : d.y};
        let right = {x : d.x + d.ellipse.rx /2, y : d.y};
        let top = {x : d.x, y : d.y - d.ellipse.ry / 2};
        let bot = {x : d.x, y : d.y - d.ellipse.ry / 2};

        let avLeft = 0;
        let avRight = 0;
        let avTop = 0;
        let avBot = 0;

        d.points.forEach(p => {
            avLeft += Math.sqrt((p.x - left.x) * (p.x - left.x) + (p.y - left.y) * (p.y - left.y));
            avRight += Math.sqrt((p.x - right.x) * (p.x - right.x) + (p.y - right.y) * (p.y - right.y));
            avTop += Math.sqrt((p.x - top.x) * (p.x - top.x) + (p.y - top.y) * (p.y - top.y));
            avBot += Math.sqrt((p.x - bot.x) * (p.x - bot.x) + (p.y - bot.y) * (p.y - bot.y));
        })

        switch(Math.max(avLeft, avRight, avTop, avBot)){
            case avTop:
                return {x : top.x, y : top.y, direction: "top"};
            case avRight:
                return {x : right.x, y : right.y, direction : "right"};
            case avBot:
                return {x : bot.x, y: bot.y, direction: "bot"};
            default:
                return {x : left.x, y : left.y, direction : "left"};
        }
    },

    getPointPolygon(p1, p2, polygon){
        let points = [];

        polygon.points.forEach(p =>{
            points.push({x : p.rW * p1.width + p1.x - p1.width / 2, y : p.rH * p1.height + p1.y - p1.height / 2})
        })

        let dx = (points[0].x - p2.x);
        let dy = (points[0].y - p2.y);

        let dist = Math.sqrt(dx * dx + dy * dy);

        let min = dist;
        let minIndex = 0;

        for(let i = 1; i < points.length; i++){
            dx = (points[i].x - p2.x);
            dy = (points[i].y - p2.y);

            dist = Math.sqrt(dx * dx + dy * dy);

            if(dist < min){
                min = dist;
                minIndex = i
            }
        }

        return points[minIndex];
    },


    getPointRect(p1, p2, rect){
        const schema = {};

        let dEq = this.getDeq(p1, p2);
        
        let left = (p1.x - rect.width) * dEq.a + dEq.b;
        let right = (p1.x + rect.width) * dEq.a + dEq.b;

        if( left >= p1.y - rect.height && left <= p1.y + rect.height){
            schema.x1 = {x : p1.x - rect.width, y : left};
            schema.x2 = {x : p1.x + rect.width, y : right};
            return schema;
        }

        let top = ((p1.y - rect.height) - dEq.b) / dEq.a;
        let bot = ((p1.y + rect.height) - dEq.b) / dEq.a;

        if( (top >= p1.x - rect.width) && (bot <= p1.x + rect.width)){
            schema.x1 = { x : top, y : p1.y - rect.height};
            schema.x2 = { x : bot, y : p1.y + rect.height};

            return schema;
        }

    },

    getDeq(p1, p2){
        let a = (p2.y - p1.y) / (p2.x - p1.x);
        let b = p1.y - a * p1.x;

        return {a: a, b: b};
    },

    getCloserBorder(points, ref){
        let d1 = Math.sqrt((points.x1.x - ref.x) * (points.x1.x - ref.x) + (points.x1.y - ref.y) * (points.x1.y - ref.y));
        let d2 = Math.sqrt((points.x2.x - ref.x) * (points.x2.x - ref.x) + (points.x2.y - ref.y) * (points.x2.y - ref.y));

        if(d2 < d1){
            return points.x2;
        }
        return points.x1;
    },
}

export const ForceAlgorithm = Object.assign({},
    Algorithm,
    BaseForceAlgorithm
);