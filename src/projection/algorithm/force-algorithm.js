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

        const { dimensions, style } = this.schema;

        const fragment = createDocFragment();

        if (isNullOrUndefined(this.instances)){
            this.instances = new Map();
        }

        if (isNullOrUndefined(this.holders)){
            this.holders = new Map();
        }


        if (!isHTMLElement(this.container)) {

            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.container.classList.add("algorithm-container");
            this.container.dataset.nature = "algorithm";
            this.container.dataset.algorithm = "force";
            this.container.dataset.id = this.id;
            this.container.tabindex = 1;
            this.container.id = this.id;
        }

        if(dimensions){
            this.container.setAttribute("width", dimensions.width);
            this.container.setAttribute("height", dimensions.height);
        }

        this.focusable = true;

        if(!isHTMLElement(this.ids)){
            this.ids = [];
        }
        if(fragment.hasChildNodes()){
            this.container.append(fragment);
        }

        if(style){
            this.container.style = style;
        }

        if(isNullOrUndefined(this.content)){
            this.content = [];
        }
       this.bindEvents();
       
        return this.container;
    },

    setUpForce(){
        const { intensity, linkval } = this.schema.force;

        this.force = d3.layout.force()
                    .size([this.width, this.height])
                    .nodes([])
                    .links([])
                    .linkDistance(linkval)
                    .charge(intensity)
                    .on("tick", this.ticked.bind(this))
                
        var svg = d3.select("#" + this.id);
            
        this.nodes = this.force.nodes();
        this.node = svg.selectAll("svg");

        this.links = this.force.links();
        this.link = svg.selectAll(".link" + this.id);

        this.force.start();
    },
    
    restart(){
        
        let n = d3.select("#" + this.id);
        this.node = n.selectAll(".node" + this.id).data(this.nodes);

        if(!isNullOrUndefined(this.links)){
            this.link = n.selectAll(".link" + this.id).data(this.links);
        }


        this.force.start();

    },

    addItem(value){
        if(isNullOrUndefined(this.force)){
            this.setUpForce(this.width, this.height, this.intensity, this.direction);
        }

        if(value.schema.nature === "prototype"){
            value.register(this.projection);
            this.projection.registerHandler("value.changed", (val) => {

                if(value.hasValue()){
                    for(let i = 0; i < this.nodes.length; i++){
                        if(this.nodes[i].concept === (value.id)){
                            this.nodes[i].meta = this.nodes[i].concept;
                            this.nodes[i].concept = value.getValue(true).id;
                        }
                    }
                }
            
            })
        }

        let item =  this.createItem(value, this.schema.tag);

        item.classList.add("node" + this.id);

        this.container.append(item);

        let projection = this.projection.resolveElement(item)

        projection.projection.update("displayed");

        projection.registerDimensionsObserver(this);


        this.content.push(projection);

        if(value.schema.nature === "prototype"){
            this.nodes.push({
                nbLink : 0,
                points: [],
                width: projection.width,
                height: projection.height,
                id: projection.id,
                concept: value.id
            });
        }else{
            this.nodes.push({
                nbLink : 0,
                points: [],
                width: projection.width,
                height: projection.height,
                id: projection.id,
                concept: value.id,
                shape: this.computeShape(item)
            });
        }
       
        

        this.restart();
    },

    checkForContent(from, to){
        const indexF = this.findIndex(from);
        const indexT = this.findIndex(to);

        return (indexF >= 0) && (indexT >= 0)
    },

    addArrow(arrow, from, to){
        
        if(isNullOrUndefined(this.force)){
            this.setUpForce();
        }

        if(isNullOrUndefined(this.links)){
            this.links = this.force.links();
        }

        if(this.containsArrow(arrow, from, to)){
            return;
        }

        this.force.stop();

        const targetF = from.id || from;
        const targetT = to.id || to;

        const indexF = this.findIndex(targetF);
        const indexT = this.findIndex(targetT);
        if(indexF < 0 || indexT < 0){
            let brothers = this.environment.getReceivers(this.projection.rtag);

            for(let i = 0; i < brothers.length; i++){
                if(brothers[i].checkForContent(from, to)){
                    arrow.projection.parent = brothers[i];
                    brothers[i].addArrow(arrow, from, to);
                    return;
                }
            }

            const container = this.environment.getRootReceiver(this.projection.rtag);

            container.addTransLink(arrow, from, to);

            this.restart();

            return;
        }

        this.links.push({
            source: indexF,
            target: indexT,
            id: arrow.id
        });

        arrow.path.classList.add("link" + this.id);

        this.container.append(arrow.path);

        if(arrow.definitions){
            this.container.append(arrow.definitions);
        }

        this.addDummy(arrow, arrow.decorator, this.links.length - 1);

        this.restart();        
    },

    addDummy(arrow, decorator = false, index){
        this.nodes.push({
            dummy: true,
            ref: index,
            fixed: true
        })

        if(!isNullOrUndefined(decorator)){
            this.container.append(decorator);
            decorator.classList.add("node" + this.id);
            decorator.classList.add("dummy");
        }else{
            let dummy = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            dummy.classList.add("node" + this.id);
            dummy.classList.add("dummy");
            this.container.append(dummy);

        }

    },

    addTransLink(arrow, from, to){
        arrow.projection.parent = this;

        if(isNullOrUndefined(this.transLinks)){
            this.transLinks = [];
        }

        this.transLinks.push({
            id: arrow.id,
            from: from.id || from,
            to: to.id || to,
            arrow: arrow
        });

        this.container.append(arrow.path);

        this.restart();
    },

    containsArrow(arrow, from, to){
        for(let i = 0; i < this.links.length; i++){
            if(this.links[i].id === arrow.id){
                const targetF = from.id || from;
                const targetT = to.id || to;

                const indexF = this.findIndex(targetF);
                const indexT = this.findIndex(targetT);

                if(indexF < 0 || indexT < 0){
                    this.removeArrow(arrow, i);
                }else{
                    this.links[i].source = indexF;
                    this.links[i].target = indexT;
                }

                this.restart();
                return true;
            }
        }
        return false;
    },

    removeArrow(arrow, index = false, decorator){
        if(isNullOrUndefined(this.links)){
            return;
        }

        if(index){
            this.links.splice(index, 1);
            arrow.path.remove();
            this.restart();
            return;
        }

        for(let i = 0; i < this.links.length; i++){
            if(this.links[i].id === arrow.id){
                this.links.splice(i, 1);
                arrow.path.remove();
                this.restart();
                return;
            }
        }


    },

    findIndex(id){
        for(let i = 0; i < this.nodes.length;i++){
            if(this.nodes[i].concept === id){
                return i;
            }
        };

        return -1;
    },
    /*addItemRoot(value, button){
        let {item, id} = this.createItemRoot(value, button);
        let holder = this.createHolder(item);

        this.nodesArea.append(holder);

        this.adapt(item);

        return {item : item, holder: holder, id : id};        
    },*/

    /*registerShape(item){
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
                    return;
            }
        }
        rect = item.getBoundingClientRect();
        schema.width = rect.width / 2;
        schema.height = rect.height / 2;

        this.nodes[this.nodes.length - 1].rect = schema;
        this.nodes[this.nodes.length - 1].tag = "svg";


    },*/

    /*adjustShape(p, shape, rW, rH){
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
    },*/

    /*adapt(item, ratio = 0.5){
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
    },*/

    createItem(object, button){
        const n = button.item;

        const item = this.schema.item;

        let itemProjection = this.model.createProjection(object, item);
        itemProjection.optional = true;
        itemProjection.parent = this.projection;


        let container = itemProjection.init().render();

        this.instances.set(itemProjection.element.source.id, container);

        return container;
    }, 

    /*removeItem(value){
        this.force.stop();

        let old = this.holders.get(this.instances.get(value.id));

        this.nodes.splice(old.id, 1);

        /*this.links.forEach(l => {
            if(l.source.id === old.id || l.target.id === old.id){

            }
        })
        
        old.remove();

        for(let i = 0; i < this.arrowInventory.length; i++){
            this.arrowInventory[i].deleteRef(value, i);
        }

        
    
        this.restart();
    },*/

    removeItem(value){
        this.force.stop();

        let i;
        for(i = 0; i < this.nodes.length; i++){
            if((this.nodes[i].meta === value.id) || (this.nodes[i].concept === value.id)){
                this.nodes.splice(i, 1);
                break;
            }
        }

        if(isNullOrUndefined(this.links) || isEmpty(this.links)){
            this.restart();
            return;
        }

        for(let j = 0; j < this.links.length; j++){

            if(this.links[j].source.index === i || this.links[j].target.index === i){
                let arrow = this.projection.model.getArrow(this.links[j].id);
                this.removeArrow(arrow, j);
            }

            if(this.links[j].source.index > i){
                this.links[j].source.index--;
            }

            if(this.links[j].target.index > i){
                this.links[j].target.index--;
            }
        }

        this.restart();
    },

    /*removeDummy(ref){
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
    },*/

    ticked(){
        let moving = true;
        while(moving){
            if(isEmpty(this.nodes)){
                break;
            }
            this.nodes.forEach(a => {
                this.nodes.forEach( b => {
                    moving = this.collide(a, b);
                })
            })
        }
        let links = this.links;
        let svgArea = this.container;

        if(!isNullOrUndefined(this.link) ){

            this.link.attr("d",
                function(d){
                    const source = BorderHandler.computeBorder(d.source, d.target);
                    const target = BorderHandler.computeBorder(d.target, d.source);
                    
                    let dx = target.x - source.x;
                    let dy = target.y - source.y;

                    let dr = Math.sqrt(dx * dx + dy * dy);

                    d.dr = dr;
                    d.s = source;
                    d.t = target;

                    return "M" + target.x + "," + target.y +
                       "A" + dr + "," + dr + " 0 0 1," + source.x + "," + source.y +
                       "A" + dr + "," + dr + " 0 0 0," + target.x + "," + target.y
                }
            )

        }

        if(!isNullOrUndefined(this.transLinks)){
            this.transLinks.forEach((transLink) => {
                const { arrow, id, from, to } = transLink;

                const rect = this.container.getBoundingClientRect();

                let fromProj = this.container.querySelector("[data-concept='" + from + "']");
                if(isNullOrUndefined(fromProj)){
                    fromProj = document.querySelector("[data-concept='" + from + "']");
                }
                let toProj = this.container.querySelector("[data-concept='" + to + "']");
                if(isNullOrUndefined(toProj)){
                    toProj = document.querySelector("[data-concept='" + to + "']");
                }
            
                const fromRect = fromProj.getBoundingClientRect();
                const toRect = toProj.getBoundingClientRect();

                const source = {x: fromRect.x + fromRect.width / 2 - rect.x, y: fromRect.y + fromRect.height / 2 - rect.y};
                const target = {x: toRect.x + toRect.width / 2 - rect.x, y: toRect.y + toRect.height / 2 - rect.y};

                source.shape = this.computeShape(fromProj);
                target.shape = this.computeShape(toProj);

                const s = BorderHandler.computeBorder(source, target);
                const t = BorderHandler.computeBorder(target, source);

                const transDx = t.x - s.x;
                const transDy = t.y - s.y;
                const transDr = Math.sqrt(transDx * transDx + transDy * transDy);

                arrow.setPath("M" + t.x + "," + t.y +
                       "A" + transDr + "," + transDr + " 0 0 1," + s.x + "," + s.y +
                       "A" + transDr + "," + transDr + " 0 0 0," + t.x + "," + t.y)

            })
        }

        this.node.attr("x", function(d){
            if(!isNullOrUndefined(d.ref)){
                let center = BorderHandler.getEllipseCenter(links[d.ref].dr, links[d.ref].s, links[d.ref].t, svgArea);
                let dEq = BorderHandler.getPerpendicularLine(links[d.ref].s, links[d.ref].t);
                let rac = BorderHandler.getPointConstructedEllipse(dEq, links[d.ref].dr, links[d.ref].dr, center);
                let v = BorderHandler.getCloserBorder(rac, links[d.ref].t);

                d.fx = v.x;

                if(!isNullOrUndefined(d.width)){
                    return v.x - d.width / 2;
                }
                return v.x;
                
            }

            return d.x - d.width / 2})
        .attr("y", function(d){ 
            if(!isNullOrUndefined(d.ref)){
                let center = BorderHandler.getEllipseCenter(links[d.ref].dr, links[d.ref].s, links[d.ref].t, svgArea);
                let dEq = BorderHandler.getPerpendicularLine(links[d.ref].s, links[d.ref].t);
                let rac = BorderHandler.getPointConstructedEllipse(dEq, links[d.ref].dr, links[d.ref].dr, center);
                let v = BorderHandler.getCloserBorder(rac, links[d.ref].t);

                d.fy = v.y;

                if(!isNullOrUndefined(d.height)){
                    return v.y - d.height / 2;
                }
                return v.y;
            }
            return d.y - d.height / 2});


    },

    analyseContentDim(){
        this.content.forEach(c => {
            for(let i = 0; i < this.nodes.length; i++){
                if(this.nodes[i].id === c.id){
                    this.nodes[i].width = c.width;
                    this.nodes[i].height = c.height;
                    this.nodes[i].shape = this.computeShape(c.container || c.element);
                    break;
                }
            }
        })
        
        this.force.start();
    },

    computeShape(container){
        const target = container.querySelector("[data-shape]");

        if(isNullOrUndefined(target)){
            return;
        }

        const rectItem = target.getBoundingClientRect();
        const rect = container.getBoundingClientRect();

        let ratio;

        switch(target.tagName){
            case "circle":
                /*Equation: (x -a)^2 + (y - b)^2 = r^2*/
                ratio = Number(target.getAttribute("r")) / (rectItem.width / 2);


                return {
                    type: "circle", 
                    r: rect.width * ratio / 2
                };
            case "ellipse":
                ratio = Number(target.getAttribute("width")) / rectItem.width;
                const rx = rect.width * ratio;

                ratio = Number(target.getAttribute("height")) / rectItem.height;
                const ry = rect.height * ratio;

                return {
                    type: "ellipse",
                    rx: rx,
                    ry: ry   
                }
            case "polygon":


                return {

                }
            default:
                ratio = Number(target.getAttribute("width")) / rectItem.width;
                const w = rect.width * ratio;
                
                ratio = Number(target.getAttribute("height")) / rectItem.height;
                const h = rect.height * ratio;

                return{
                    type: "rect",
                    w: w,
                    h: h
                }
        }
    },

    
    collide(node, conc){
        let res = false;

        if(!isNullOrUndefined(node.ref)){
            return res;
        }

        /*if(!isNullOrUndefined(conc.ref) && conc !== node){
            if( (node.x < conc.fx) &&
                (node.y < conc.fy) &&
                (node.x + node.width / 2 > conc.fx - conc.width / 2) &&
                (node.y + node.height / 2 > conc.fx - conc.height / 2)){
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
             
        }*/
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

    /*enterHandler(){
        if(this.focused){
            this.interactionsArea.focus();
        }
    },*/

    bindEvents(){
        this.projection.registerHandler("value.added", (value) => {
            this.addItem(value);
        })

        this.projection.registerHandler("value.removed", (value) => {
            this.removeItem(value);
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

            return [{ x : x1, y : y1}, { x : x2, y : y2}];
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


    
    getDeq(p1, p2){
        let a = (p2.y - p1.y) / (p2.x - p1.x);
        let b = p1.y - a * p1.x;

        return {a: a, b: b};
    },

    getCloserBorder(points, ref){
        let d1 = Math.sqrt((points[0].x - ref.x) * (points[0].x - ref.x) + (points[0].y - ref.y) * (points[0].y - ref.y));
        let d2 = Math.sqrt((points[1].x - ref.x) * (points[1].x - ref.x) + (points[1].y - ref.y) * (points[1].y - ref.y));

        if(d2 < d1){
            return points[1];
        }   
        return points[0];
    },

    getPointRect(source, target, shape){

        let topLeftX = source.x - shape.w / 2;
        let topLeftY = source.y - shape.h / 2;

        let topRightX = source.x + shape.w / 2;
        let topRightY = source.y - shape.h / 2;

        let botRightY = source.y + shape.h / 2;


        let baseEq = BorderHandler.getDeq({x: source.x, y: source.y}, {x: target.x, y: target.y});


        /*Top line*/

        let topEq = BorderHandler.getDeq({x: topLeftX, y: topLeftY}, {x: topRightX, y: topRightY});

        let intersection = BorderHandler.getLineIntersection(baseEq, topEq);

        if(intersection && (intersection.x > topLeftX && intersection.x < topRightX)){
            return [
                intersection,
                {x: (botRightY - baseEq.b) / baseEq.a, y: botRightY}
            ]
        }

        return [
            {x : topRightX, y: baseEq.a * topRightX + baseEq.b},
            {x : topLeftX, y: baseEq.a * topLeftX + baseEq.b}
        ]
    },

    getLineIntersection(lineA, lineB){
        if(lineA.a === lineB.a){
            return false;
        }

        let a = lineA.a - lineB.a;
        let b = lineB.b - lineA.b;

        return {
            x: b / a,
            y: lineA.a * (b/a) + lineA.b
        }

        /*y = a x + b
            a1 x + b1 = a1x + b;
            (a1 - a2) x = b2 - b1;
            x = (b) / a
        */
    },

    getPointCircle(source, target, shape){
        let dEq = BorderHandler.getDeq({x: source.x, y: source.y}, {x: target.x, y: target.y});

        let a = dEq.a * dEq.a + 1;
        let b = 2 * dEq.a * dEq.b - 2 * dEq.a * source.y - 2 * source.x;
        let c = (dEq.b *dEq.b) - (dEq.b * source.y) * 2+ (source.y * source.y) + (source.x * source.x) - shape.r * shape.r;
        

        let delta = b * b - 4 * a * c;

        if(delta > 0){
            let x1 = (- b +  Math.sqrt(delta)) / (2 * a);
            let x2 = (- b - Math.sqrt(delta)) / (2 * a);

            return [
                {x : x1, y: dEq.a * x1 + dEq.b},
                {x : x2, y: dEq.a * x2 + dEq.b},
            ]
        }
        
    },

    computeBorder(source, target){

        let schema = {}, answer = {};

        switch(source.shape.type){
            case "rect":
                schema = BorderHandler.getPointRect(source, target, source.shape);
                answer = BorderHandler.getCloserBorder(schema, target)
                return answer;
            case "circle":
                schema = BorderHandler.getPointCircle(source, target, source.shape);
                answer = BorderHandler.getCloserBorder(schema, target);
                return answer;
            case "ellipse":
                schema = BorderHandler.getPointEllipse(source, target, source.shape);
                answer = BorderHandler.getCloserBorder(schema, target);
                return answer;
            case "polygon":

                return;
        }
    }

}

export const ForceAlgorithm = Object.assign({},
    Algorithm,
    BaseForceAlgorithm
);