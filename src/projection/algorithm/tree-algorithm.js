import { getRootUrl, isEmpty, isNull, isNullOrUndefined } from "zenkai";
import { Algorithm } from "./algorithm";

const BaseTreeAlgorithm = {
    init(){
        const { width, height } = this.schema.dimensions;
        const { depth } = this.schema;

        this.width = width;
        this.height = height;
        this.intensity = depth;

        return this;
    },

    render(){

        const { tag, duration, orientation } = this.schema;

        if(isNullOrUndefined(this.container)){
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.container.classList.add("algorithm-container");
            this.container.dataset.nature = "algorithm";
            this.container.dataset.algorithm = "tree";
            this.container.dataset.id = this.id;
            this.container.tabindex = 1;
            this.container.id = this.id;

            this.container.setAttribute("width", this.width);
            this.container.setAttribute("height", this.height);
        }

        if(isNullOrUndefined(this.linkSpace)){
            this.linkSpace = document.createElementNS("http://www.w3.org/2000/svg", "g");
            this.container.append(this.linkSpace);

            this.linkSpace.classList.add("linkSpace");
        }

        
        if(isNullOrUndefined(this.nodeSpace)){
            this.nodeSpace = document.createElementNS("http://www.w3.org/2000/svg", "g");
            this.container.append(this.nodeSpace);
            this.nodeSpace.classList.add("nodeSpace");
        }

        this.rootTag = tag;
        this.duration = duration;
        this.orientation = orientation;

        if(isNullOrUndefined(this.tree)){
            switch(this.orientation){
                case "vertical":
                    this.tree = d3.layout.tree().size([this.width, this.height]);
                    break;
                default:
                    this.tree = d3.layout.tree().size([this.height, this.width]);
            }
        }

        this.createRoot();

        this.setData();

        this.bindEvents();
    
        return this.container;
    },

    accept(concept, parent, tag){
        let data = this.findData(parent.getAttribute("data-concept"));

        let itemProj = this.model.createProjection(concept, tag).init();
        itemProj.optional = true;
        let item = itemProj.render();

        concept.register(this.projection);

        let holder = this.createHolder();
        holder.append(item);

        holder.setAttribute('id', item.getAttribute("data-concept"));

        item.setAttribute("data-tree", this.schema.treeId);
        item.classList.add("node")

        this.nodeSpace.append(holder);


        itemProj.element.source.notify("displayed");
        
        if(isNullOrUndefined(data.children)){
            data.children = [];
        }

        /*this.container.append(holder);*/

        let box = item.getBBox();
        
        data.children.push({
            proj: holder,
            id: item.getAttribute("data-concept"),
            offW: box.width / 2,
            offH: box.height /2,
            children: []
        })

        if(isNullOrUndefined(this.treeIndex)){
            this.treeIndex = new Map();
        }
        this.treeIndex.set(item.getAttribute("data-concept"), holder);

        this.update();
    },

    findData(id){
        let root = this.data[0];

        return this.findDataAt(id, root);
    },

    findDataAt(id, root){
        if(root.id === id){
            return root;
        }

        if(isNullOrUndefined(root.children) || isEmpty(root.children)){
            return false;
        }

        for(let i = 0; i < root.children.length; i++){
            let obj = this.findDataAt(id, root.children[i]);
            if(obj){
                return obj;
            }
        }

        return false;
    },

    createRoot(){
        
        this.rootProj = this.model.createProjection(this.source, this.rootTag).init();
        this.rootProj.parent = this.projection;

        let root = this.rootProj.render();

        root.setAttribute("data-tree", this.schema.treeId);

        this.root = root;

        let holder = this.createHolder();

        this.projMap = new Map();

        this.projMap.set(root, {group: holder, index: 0});

        holder.setAttribute('id', root.getAttribute("data-concept"));

        switch(this.orientation){
            case "horizontal":
                holder.setAttribute("x", 0);
                holder.setAttribute("y", this.height / 2 - this.rootProj.element.height / 2);
                break;
            case "vertical":
                holder.setAttribute("y", 0);
                holder.setAttribute("x", this.width / 2 - this.rootProj.element.width / 2);
                break;
        }
    

        holder.append(root);
        this.nodeSpace.appendChild(holder);
    },


    createHolder(){
        let holder = document.createElementNS("http://www.w3.org/2000/svg", "g");
        holder.classList.add("node");

        return holder;
    },

    setData(){
        this.data = [
            {
                name: "root",
                index: 0,
                id: this.root.getAttribute("data-concept"),
                children: []
            }
        ]
    },

    update(){

        if(isNullOrUndefined(this.svg)){
            this.svg = d3.select("#" + this.id);
        }

        switch(this.orientation){
            case "vertical":
                this.updateVertical();
                break;
            default:
                this.updateHorizontal();
                break;            
        }
    },

    arrange(){        
        let root = this.data[0];

        let k = 1;

        if(isNullOrUndefined(root.children)){
            return 0    ;
        }
        for(let i = 0; i < root.children.length; i++){
            k = this.arrangeChildren(root.children[i], k);
        }
        
        if(k > 3){
            return 1
        }
        return 0;
    },

    arrangeChildren(node, k){
        let g = this.treeIndex.get(node.id);


        g.setAttribute("example", k);

        if(this.nodeSpace.children.length > k){
            this.nodeSpace.insertBefore(g, this.nodeSpace.children[k]);
        }else{
            this.nodeSpace.append(g);
        }

        if(isNullOrUndefined(node.children)){
            return k + 1;
        }

        let a = k + 1;

        for(let i = 0; i < node.children.length; i++){
            a = this.arrangeChildren(node.children[i], a);
            a++;
        }
        
        return a;
    },

    updateVertical(){
        var diagonal = d3.svg.diagonal()
	    .projection(function(d) { return [d.y, d.x]; });

        let root = this.data[0];
        
        root.x0 = this.width / 2;
        root.y0 = 50;

        let i = 0;
        let nodes = this.tree.nodes(root);
        let links = this.tree.links(nodes);

        const intensity = this.intensity;
        const duration = this.duration;

        nodes.forEach(function(d) {
            d.y = d.depth * intensity + 50;
        })


        var node = this.svg.select("g.node").data(nodes);
        var link = this.svg.select("path.link").data(links);

        let nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("data-content", function(d) { return d.id })
        .attr("data-moved", function(d) { return "true"})
        .attr("transform", function(d) {return"translate(" + root.x0 + ", " + root.y0 +")"});

        this.arrange();

        let nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) {return "translate(" + d.x + ", " + d.y + ")"});
        
        let nodeExit = node.exit()
        .transition()
        .attr("transform", function(d){
            return "translate(" + root.x + ", " + root.y + ")";
        })
        .remove()

        nodes.forEach(function(d){
            d.x0 = d.x;
            d.y0 = d.y;
        })

        var link = svg.selectAll("path.link").data(links);

        link.enter().insert('path', "g")
            .attr("class", "link")
            .attr("fill", node)
            .attr("stroke", black)
            .attr("stroke-width", 2)
            .attr("d", function(d) {
                var o = {x: source.x0, y: source.y0};
                return diagonal({source: o, target: o})
            });

        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
              var o = {x: source.x, y: source.y};
              return diagonal({source: o, target: o});
            })
            .remove();
      
    },

    updateHorizontal(){
        var diagonal = d3.svg.diagonal()
	    .projection(function(d) { return [d.y, d.x]; });

        let root = this.data[0];
        
        root.x0 = this.width / 2;
        root.y0 = 50;

        let i = 0;
        let nodes = this.tree.nodes(root);
        let links = this.tree.links(nodes);

        const intensity = this.intensity;
        const duration = this.duration;

        nodes.forEach(function(d) {
            d.y = d.depth * intensity + root.offW * 2;
        })

        this.arrange();

        var node = this.svg.select("g.nodeSpace").selectAll("g.node").data(nodes);

        let nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {return "translate(" + (root.y0 - root.offW) + ", " + (root.x0 - root.offH) + ")"});
        

        let nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + (d.y - d.offW) + ", " + (d.x - d.offH) + ")"})
        
        let nodeExit = node.exit()
        .transition()
        .attr("transform", function(d){
            return "translate(" + (root.y - root.offW) + ", " + (root.x - root.offH) + ")";
        })
        .remove();

        nodes.forEach(function(d){
            d.x0 = d.x;
            d.y0 = d.y;
        })

        var link = this.svg.select("g.linkSpace").selectAll("path.link").data(links);

        link.enter().insert('path', "g")
            .attr("class", "link")
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("d", function(d) {
                var o = {x: root.x0, y: root.y0};
                return diagonal({source: o, target: o})
            });

        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
              var o = {x: root.x, y: root.y};
              return diagonal({source: o, target: o});
            })
            .remove();
    },

    removeNode(id, d){
        if(!d.children){
            return false;
        }
        for(let i = 0; i < d.children.length; i++){
            if(d.children[i].id === id){
                d.children.splice(i, 1);
                if(d.children.length === 0){
                    d.children = null;
                }
                return true;
            }
    
            if(deleteItem(id, d.children[i])){
                return true;
            }
        }
    
        return false;
    },

    bindEvents(){
        this.projection.registerHandler("displayed", () => {
            if(!this.displayed){
                this.displayed = true;
    
                this.rootProj.element.source.notify("displayed");

                let box = this.rootProj.element.container.getBBox();

                this.data[0].offW = box.width / 2;
                this.data[0].offH = box.height / 2;

                this.update();

            }
        });

        this.projection.registerHandler("delete", (value, from) => {
            this.removeNode(from.id, this.data[0]);
            this.treeIndex.delete(from.id);
            this.update();
        })
    }
}

export const TreeLayout = Object.assign(
    Object.create(Algorithm),
    BaseTreeAlgorithm
)