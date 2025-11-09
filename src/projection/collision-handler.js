/**
 * Handles overlapping issues in the layout.
 */
export const CollisionHandler = {
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