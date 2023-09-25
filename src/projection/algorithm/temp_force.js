import { Algorithm } from "./algorithm";

const { isNullOrUndefined, isEmpty } = require("zenkai");


const BaseForceAlgorithm = {
    init(args){
        Object.assign(this.schema, args);

        const { focusable = true, dimensions } = this.schema;
        const { width, height } = dimensions;

        this.focusable = focusable;
        this.content = [];
        this.width = width;
        this.height = height;

        return this;
    },
    
    render(){
        const {width, height} = this.schema.dimensions;

        if(isNullOrUndefined(this.container)){
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.container.classList.add("algorithm-container");
            this.container.dataset.nature = "algorithm";
            this.container.dataset.algorithm = "force";
            this.container.dataset.id = this.id;
            this.container.id = this.id;

            this.container.setAttribute("width", width);
            this.container.setAttribute("height", height);
        }

        this.source.getValue().forEach((value) => {
            let item = this.createItem(value);
            this.container.append(item);
        })

        this.bindEvent();

        return this.container;
    },

    createItem(object){
        const { template = {} } = this.schema.list.item;

        if(!this.model.hasProjectionSchema(object, template.tag)){
            return "";
        }

        let itemProjection = this.model.createProjection(object, template.tag);
        itemProjection.optional = true;
        itemProjection.parent = this.projection;

        let container = itemProjection.init(template.options).render();
        container.dataset.index = object.index;

        itemProjection.element.parent = this;

        container.classList.add("node" + this.id);

        this.content.push(itemProjection.element);

        return container;
    },

    setUpForce(){
        const { intensity, edgeDist } = this.schema.force;

        this.force = d3.layout.force()
            .size([this.width, this.height])
            .nodes([])
            .links([])
            .linkDistance(edgeDist)
            .charge(intensity)
            .on("tick", this.ticked.bind(this));

        this.d3Container = d3.select("#" + this.id);

        this.nodes = this.force.nodes();
        this.links = this.force.links();

        this.force.start();
    },

    createNode(projection){
        const schema = {};

        schema.c_id = projection.source.id;
        schema.p_id = projection.id;

        this.nodes.push(schema)
    },

    restart(){
        this.node = this.d3Container.selectAll(".node" + this.id).data(this.nodes);
        this.link = this.d3Container.selectAll(".link" + this.id).data(this.links);

        this.force.start();
    },

    ticked(){
        const width = this.width;
        const height = this.height;

        this.node.attr("x", function(d) {
            return Math.max(0, Math.min(width - d.width / 2, d.x) - d.width / 2);
        })
        .attr("y", function(d){
            return Math.max(0, Math.min(height - d.height / 2, d.y) - d.height / 2);
        })
    },

    updateSize(){
        console.log("Updating force-size");

        if(!this.displayed){
            return;
        }

        this.content.forEach((element) => {
            this.registerContentDimension(element);
        })

        this.restart();
    },

    registerContentDimension(projection){
        for(let i = 0; i < this.nodes.length; i++){
            if(projection.id === this.nodes[i].p_id){
                if(!isNullOrUndefined(projection.containerView)){
                    this.nodes[i].width = projection.containerView.targetW;
                    this.nodes[i].height = projection.containerView.targetH;
                }else{
                    let element = projection.element || projection.container;
                    this.nodes[i].width = Number(element.getAttribute("width"));
                    this.nodes[i].height = Number(element.getAttribute("height"));
                }
                return;
            }
        }
    },

    bindEvent(){
        this.projection.registerHandler("displayed", () => {
            if(!this.parent.displayed){
                return;
            }

            if(this.displayed){
                return;
            }

            this.displayed = true;

            this.setUpForce();
            
            this.content.forEach((element) => {
                let projection = this.projection.resolveElement(element);

                this.createNode(projection);
                projection.projection.update("displayed");
            })

            this.restart();
        })

        this.projection.registerHandler("value.added", (value) => {
            let item = this.createItem(value);
            this.container.append(item);

            let projection = this.projection.resolveElement(item);
            this.createNode(projection);
            projection.projection.update("displayed");

            this.restart();
        })
    }
}


export const ForceAlgorithm = Object.assign({},
    Algorithm,
    BaseForceAlgorithm
)