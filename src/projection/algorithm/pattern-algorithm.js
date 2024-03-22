import { isNullOrUndefined } from "zenkai";
import { Algorithm } from "./algorithm"

const BasePatternAlgorithm = {

    /** @type {Array[Coordinates]}*/
    anchors: null,

    init(args) {
        Object.assign(this.schema, args);

        const { orientation  } = this.schema;

        this.orientation = orientation;
        this.content = [];

        return this;
    },

    render() {

        if(isNullOrUndefined(this.container)) {
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.container.classList.add("pattern-container");
            this.container.dataset.nature = "algorithm";
            this.container.dataset.algorithm = "pattern";
            this.container.dataset.id = this.id;
            this.container.id = this.id;

        }

        this.source.getValue().forEach( (value) => {
            let item = this.createItem(value);

            this.container.append(item);
            this.refresh();
        })

        this.bindEvents();

        return this.container;
    },

    createItem(object) {
        const { template = {} } = this.schema.list.item;
        
        if(!this.model.hasProjectionSchema(object, template.tag)) {
            return "";
        }

        let itemProjection = this.model.createProjection(object, template.tag);
        itemProjection.optional = true;
        itemProjection.parent = this.projection;
                                                         
        let container = itemProjection.init(template.options).render();
        
        itemProjection.element.parent = this;

        this.content.push(container);

        return container;
    },

    refresh() {
        ContentManager[this.orientation.type].call(this);
    },

    removeItem(item) {
        console.log(item);
        for(let i = 0; i < this.content.length; i++) {
            if(this.content[i].id == item) {
                this.content[i].remove();
                this.content.splice(i, 1);
            }
        }

    },

    display() {
        if(!this.parent.displayed) {
            return;
        }

        if(this.displayed) {
            return;
        }

        this.displayed = true;

        this.content.forEach((element) => {
            let projection = this.projection.resolveElement(element);

            projection.projection.update("displayed");

            this.refresh();
        })

        return;
    },

    bindEvents() {
        this.projection.registerHandler("value.added", (value) => {
            let item = this.createItem(value);

            this.container.append(item)
            this.refresh();
        });

        this.projection.registerHandler("value.removed", (value) => {
            this.removeItem(value)
        });

        this.projection.registerHandler("displayed", () => {
            this.display();
        });

    }

}

export const PatternAlgorithm = Object.assign( {}, 
    Algorithm,
    BasePatternAlgorithm
)


const ContentManager = {
    "horizontal": manageHorizontal,
    "vertical": manageVertical,
    "custom": manageCustom
}

function manageHorizontal() {
    let x = 0;

    this.content.forEach( (item)  => {
        item.setAttribute("x", x);

        let projection = this.projection.resolveElement(item);
        
        if(!isNullOrUndefined(projection.containerView)) {
            x += projection.containerView.targetW;
        } else {
            let box = item.getBBox();
            x += box.width;
        }
    })
}

function manageVertical() {
    let y = 0;

    this.content.forEach( (item)  => {
        item.setAttribute("y", y);

        let projection = this.projection.resolveElement(item);
        
        if(!isNullOrUndefined(projection.containerView)) {
            y += projection.containerView.targetH;
        } else {
            let box = item.getBbox();
            y += box.width;
        }
    })
}

function manageCustom() {
    let start = {
        x: 0,
        y: 0
    }

    if(isNullOrUndefined(this.anchors)) {
        this.anchors = [ start ];
    } 

    for ( let i = 0; i < this.content.length; i ++) {
        const { x, y } = this.anchors[i];

        this.content[i].setAttribute("x", x);
        this.content[i].setAttribute("y", y);

        if(i + 1 > this.anchors.length) {
            let k = this.anchors.length;

            this.anchors.push({
                x: this.anchors[k - 1].x + this.orientation.x, 
                y: this.anchors[k - 1].y + this.orientation.y
            })
        }
    }
}