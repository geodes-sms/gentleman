import { isNullOrUndefined } from "zenkai";
import { Algorithm } from "./algorithm";


export const BaseForceAlgorithm = {
    init(args) {
        Object.assign(this.schema, args);

        const {} = this.schema;

        return this;
    },

    render() {
        
        if(isNullOrUndefined(this.container)) {
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            
            this.container.classList.add("algorithm-container");
            this.container.dataset.nature = "algorithm";
            this.container.dataset.algorithm = "force";
            this.container.dataset.id = this.id;
            this.container.id = this.id;
        }

        if(isNullOrUndefined(this.force)) {
            this.setUpForce();
        }

        this.bindEvents();

        return this.container;
    },

    setUpForce() {
        const { width, height, charge, linkDistance } = this.schema.force;

        this.force = d3.layout.force()
            .size([width, height])
            .nodes([])
            .links([])
            .charge(charge)
            .linkDistance(linkDistance)
            .on("tick", this.ticked.bind(this));

        this.nodes = this.force.nodes();
        this.links = this.force.links();
    },

    restart() {
        this.node = d3.selectAll(".node" + this.id).data(this.nodes);

        this.force.start()
    },

    stop() {

    },

    ticked() {
        this.node
        .attr("x", function(d) { return d.x} )
        .attr("y", function(d) { return d.y} );
    },

    addItem(value) { 
        let container = this.createItem(value);

        this.container.append(container);
        this.nodes.push({});
        this.restart();
    },

    createItem(value) {
        const { tag } = this.schema.items;

        let itemProjection = this.model.createProjection(value, tag);
        itemProjection.parent = this;

        let container = itemProjection.init().render();
        container.classList.add("node" + this.id);
        
        return container;
    },

    removeItem(value) {
        console.log("Value removed");
        console.log(value);
    },

    display() {
        this.displayed = true;

        this.restart();
    },

    updateSize() {

    },

    focusIn() {

    },

    focusOut() {

    },

    clickHandler() {

    },

    bindEvents() {
        this.projection.registerHandler("displayed", () => {
            if(this.displayed) {
                return;
            }

            this.display();
        })

        this.projection.registerHandler("value.added", (value) => {
            this.addItem(value);
        })

        this.projection.registerHandler("value.removed", (value) => {
            this.removeItem(value);
        })
    }
};

export const ForceAlgorithm = Object.assign({},
    Algorithm,
    BaseForceAlgorithm
)