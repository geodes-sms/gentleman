import { isNullOrUndefined, valOrDefault } from "zenkai"

const { Simulation } = require("./simulation")

const BaseTreeSimulation = {
    init(){
        this.depth = valOrDefault(20, this.source.getAttributeByName("depth").target.value);
        this.width = valOrDefault(400, this.source.getAttributeByName("width").target.value);
        this.height = valOrDefault(400, this.source.getAttributeByName("height").target.value);

        return this;
    },
    
    render(){
        if(isNullOrUndefined(this.container)){
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.container.classList.add("simulation-container");
            this.container.dataset.nature = "simulation";
            this.container.dataset.shape = "tree";
            this.container.dataset.id = this.id;
            this.container.id = this.id;

            this.container.setAttribute("width", this.width);
            this.container.setAttribute("height", this.height);
        }

        if(isNullOrUndefined(this.nodeSpace)){
            this.nodeSpace = document.createElementNS("http://www.w3.org/2000/svg", "g");
            this.nodeSpace.classList.add("nodeSpace");

            this.container.append(this.nodeSpace);
        }

        
        if(isNullOrUndefined(this.linkSpace)){
            this.linkSpace = document.createElementNS("http://www.w3.org/2000/svg", "g");
            this.linkSpace.classList.add("linkSpace");

            this.container.prepend(this.linkSpace);
        }

        if(isNullOrUndefined(this.data)){
            this.data = [{
                id: 0,
                children:[
                    {
                        id: 1,
                        children:[
                            {
                                id: 2
                            },
                            {
                                id: 3
                            }
                        ]
                    },
                    {
                        id: 4,
                        children:[
                            {
                                id: 5
                            }
                        ]
                    }
                ]         
            }]
        }

        if(isNullOrUndefined(this.tree)){
            switch(this.orientation){
                case "vertical":
                    this.tree = d3.layout.tree().size([this.width, this.height]);
                    break;
                default:
                    this.tree = d3.layout.tree().size([this.height, this.width]);
            }
        }

        this.bindEvents();

        return this.container;
    },


    update(){
        this.svg = d3.select("#" + this.id);

        switch(this.direction.value){
            case "horizontal":
                this.updateHorizontal();
                break;
            case "vertical":
                this.updateVertical();
                break;
        }
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

        const intensity = this.depth.value;;
        const duration = 500;

        nodes.forEach(function(d) {
            d.y = d.depth * intensity + 20 * 2;
        })

        //this.arrange();

        var node = this.svg.select("g.nodeSpace").selectAll("g.node").data(nodes);

        let nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {return "translate(" + (root.y0) + ", " + (root.x0) + ")"})
        .append("circle")
        .attr("fill", "red")
        .attr("r", 12.5);

        let nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + (d.y) + ", " + (d.x) + ")"})
         
        let nodeExit = node.exit()
        .transition()
        .attr("transform", function(d){
            return "translate(" + (root.y) + ", " + (root.x) + ")";
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

    bindEvents(){
        this.depth = this.source.getAttributeByName("depth").target;
        this.depth.register(this.projection);

        this.direction = this.source.getAttributeByName("direction").target;
        this.direction.register(this.projection);

        this.projection.registerHandler( "value.changed", () => {
            this.update();
        });

        this.projection.registerHandler("displayed", () => {
            this.update();
        })
    }
}

export const TreeSimulation = Object.assign(
    Object.create(Simulation),
    BaseTreeSimulation
)