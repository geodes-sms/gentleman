import { isEmpty, isNullOrUndefined } from "zenkai";
import { Algorithm } from "./algorithm";
import { SizeHandler } from "../size-handler";


export const BaseForceAlgorithm = {
    /** @type {int}*/
    width: null,

    /** @type {int}*/
    height: null,

    /** @type {SVGElement}*/
    container: null,

    /** @type {Object}*/
    force: null,

    /** @type {Array[Object]}*/
    nodes: null,

    /** @type {Map{id, SVGElement}} */
    elements: null,

    /** @type {Array[Object]}*/
    links: null,

    /** @type {Object}*/
    node: null,

    /** @type {Object}*/
    link: null,

    init(args) {
        Object.assign(this.schema, args);

        const { width, height } = this.schema.dimensions;

        this.width = width;
        this.height = height;

        this.elements = new Map();

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

        if(!isEmpty(this.source.getValue()) && isEmpty(this.nodes)) {
            this.source.getValue().forEach((value) => {
                this.addItem(value);
            });
        }

        this.bindEvents();

        return this.container;
    },

    /**
     * Creates the d3 force layout used to compute nodes coordinates.
     */
    setUpForce() {
        const { charge, linkLength } = this.schema.force;

        this.force = d3.layout.force()
            .size([this.width, this.height])
            .nodes([])
            .links([])
            .charge(charge)
            .linkDistance(linkLength)
            .on("tick", this.ticked.bind(this));

        this.nodes = this.force.nodes();
        this.links = this.force.links();
    },

    /**
     * Restarts the computation of coordinates.
     */
    restart() {
        this.node = d3.selectAll(".node" + this.id).data(this.nodes);

        this.force.start()
    },

    /**
     * Stops the computation of coordinates.
     */
    stop() {
        this.force.stop();
    },

    /** 
     * Periodically called function when the computation is activated.
     * Uses the collision handler to prevent overlapping issues before applying the computed coordinates to nodes projections.
    */
    ticked() {
        // Updates coordinates based on Collision detection
        CollisionHandler.init(this);
        CollisionHandler.compute();

        const width = this.width;
        const height = this.height

        this.node
        .attr("x", function(d) { 
            const x = d.x - d.width / 2;

            return Math.min(width - d.width, Math.max(0, x));
            } )
        .attr("y", function(d) {
            const y = d.y - d.height / 2;

            return Math.min(height - d.height, Math.max(0, y));
        } );

    },

    /**
     * Adds an item to the algorithm.
     * @param {Concept} value 
     */
    addItem(value) { 
        const schema = this.createItem(value);

        if(!isNullOrUndefined(value.force)) {
            const { x, y } = value.force;
            schema.x = x;
            schema.y = y;
        }

        this.nodes.push(schema);
        this.restart();
    },

    /**
     * Creates the projection for an element of the layout.
     * @param {Concept} value 
     * @returns A node schema.
     */
    createItem(value) {
        const { tag } = this.schema.items;

        let itemProjection = this.model.createProjection(value, tag);
        itemProjection.parent = this;
        itemProjection.optional = true;
        
        let container = itemProjection.init().render();
        container.classList.add("node" + this.id);

        this.elements.set(value.id, container);

        this.container.append(container);
        itemProjection.update("displayed");

        const schema = {
            id: itemProjection.concept.id
        }

        let view = itemProjection.element.containerView;
        schema.width = view.targetW;
        schema.height = view.targetH;

        return schema;
    },
    
    /**
     * Removes a node from the layout.
     * @param {Concept} value 
     */
    removeItem(value) {
        for(let i = 0; i < this.nodes.length; i++) {
            if(this.nodes[i].id == value.id) {
                this.nodes.splice(i, 1);
                this.elements.get(value.id).remove();
                this.elements.delete(value.id);
                break;
            }
        }

        this.restart();
    },

    /**
     * Function called when the element is rendered in the DOM.
     */
    display() {
        this.displayed = true;

        this.restart();
    },

    /**
     * Allows to update nodes size when projections change.
     */
    updateSize() {
        if(this.fixed) {
            return;
        }

        if(!this.displayed) {
            this.display();
        }

        SizeHandler["force"].call(this);
    },

    /**
     * Handles focusIn event.
     */
    focusIn() {

    },
/**
     * Handles focusOut event.
     */
    focusOut() {

    },

    /**
     * Handles click event.
     */
    clickHandler() {

    },

    /**
     * Allows to attach handlers for various events.
     */
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

/**
 * Handles overlapping issues in the layout.
 */
const CollisionHandler = {
    /**@type {boolean} */
    resolved: false,

    /**@type {BBox} */
    seekerBox: null,

    /**@type {BBox} */
    seaterBox: null,

    /**@type {Array[Object]}*/
    nodes : null,

    /**@type {Map{id, SVGElement} */
    elements: null,

    /**@type {Number} */
    width: null,

    /**@type {Number} */
    height: null,

    init(config) {
        this.nodes = config.nodes;
        this.elements = config.elements;
        this.width = config.width;
        this.height = config.height;
        this.resolved = false;
    },

    compute(){
        if(this.nodes.length >= 2) {
            while(!this.resolved) {
                this.nodes.forEach(a => {
                    this.nodes.forEach( b => {
                        this.resolved = this.collide(a, b);
                    })
                })
            }
            console.log("End of collision !");
        }
    },

    collide(a, b) {
        if(a.id === b.id) {
            return true;
        }

        // On récupère le + loin du centre 
        this.rank(a, b);

        // On detecte une potentielle invasion, sinon renvoie true
        if(!this.isInvading()) {
            return true;
        }
        
        // Si collision => On resoud en eloignant du centre
        this.solve();

        return false;
    },

    rank(a, b) {
        let containerA = this.elements.get(a.id);
        let containerB = this.elements.get(b.id);

        const boxA = containerA.getBBox({stroke: true});
        const boxB = containerB.getBBox({stroke: true});
        const center = {
            x: this.width / 2,
            y: this.height / 2
        }

        const distA = Math.sqrt( (boxA.x - center.x) * (boxA.x - center.x) + (boxA.y - center.y) * (boxA.y - center.y));
        const distB = Math.sqrt( (boxB.x - center.x) * (boxB.x - center.x) + (boxB.y - center.y) * (boxB.y - center.y));

        if(distA > distB) {
            this.initSeeker(a, containerA);
            this.initSeater(b, containerB);
            return;
        }
        
        this.initSeeker(b, containerB);
        this.initSeater(a, containerA);
    },

    initSeeker(node, container) {
        this.seeker = container;

        const box = container.getBBox();
        this.seekerBox = {
            x: node.x,
            y: node.y,
            width: box.width,
            height: box.height
        }

        this.node = node;
    },

    initSeater(node, container) {
        this.seater = container;

        const box = container.getBBox();
        this.seaterBox = {
            x: node.x,
            y: node.y,
            width: box.width,
            height: box.height
        }
    },

    isInvading() {

        // Supérieur gauche
        if( this.isTopLeft() ) {
            return true;
        }

        // Supérieur droit
        if( this.isTopRight() ) {
            return true;
        }
        // Inférieur gauche
        if( this.isBottomRight() ) {
            return true;
        }
        // Inférieur droit
                // Inférieur gauche
        if( this.isBottomLeft() ) {
            return true;
        }
    },

    isTopLeft() {
        const x = this.seekerBox.x + this.seekerBox.width / 2;
        const y = this.seekerBox.y + this.seekerBox.height / 2;
        
        return this.isIn(x, y)
    },

    isTopRight() {
        const x = this.seekerBox.x - this.seekerBox.width / 2;
        const y = this.seekerBox.y + this.seekerBox.height / 2;

        return this.isIn(x, y);
    },

    
    isBottomRight() {
        const x = this.seekerBox.x - this.seekerBox.width / 2;
        const y = this.seekerBox.y - this.seekerBox.height / 2;

        return this.isIn(x, y);
    },

    isBottomLeft() {
        const x = this.seekerBox.x + this.seekerBox.width / 2;
        const y = this.seekerBox.y - this.seekerBox.height / 2;

        return this.isIn(x, y);
    },

    isIn(x, y) {
        return (x > this.seaterBox.x - this.seaterBox.width / 2)
        && (x < this.seaterBox.x + this.seaterBox.width / 2)
        && (y > this.seaterBox.y - this.seaterBox.height / 2)
        && (y < this.seaterBox.y + this.seaterBox.height / 2);
    },

    solve() {
        const dy = this.getYOffset();
        const dx = this.getXOffset();

        const { a, b } = this.getEq();

        if(Math.abs(dy) < Math.abs(dx)) {
            this.node.y += dy;
            this.node.x = this.solveForY(a, b, this.node.y);
        } else {
            this.node.x += dx;
            this.node.y = this.solveForX(a, b, this.node.x)
        }
    },

    getYOffset() {
        if(this.seekerBox.y < this.height / 2) {
            return (this.seaterBox.y - this.seaterBox.height / 2) - (this.seekerBox.y + this.seekerBox.height / 2) ; 
        }

        return (this.seaterBox.y + this.seaterBox.height / 2) - (this.seekerBox.y - this.seekerBox.height / 2);
    },

    getXOffset() {
        if(this.seekerBox.x < this.width / 2) {
            return (this.seaterBox.x - this.seaterBox.width / 2) - (this.seekerBox.x + this.seekerBox.width / 2);  
        }

        return (this.seaterBox.x + this.seaterBox.width / 2) - (this.seekerBox.x - this.seekerBox.width / 2);
    },

    getEq() {
        const a = (this.seekerBox.y - this.height / 2) / (this.seekerBox.x - this.width / 2);
        
        return {
            a : a,
            b : this.seekerBox.y - a * this.seekerBox.x
        };
    },

    solveForY(a, b, y) {
        return (y - b) / a;
    },

    solveForX(a, b, x) {
        return a * x + b;
    }
}

export const ForceAlgorithm = Object.assign({},
    Algorithm,
    BaseForceAlgorithm
)