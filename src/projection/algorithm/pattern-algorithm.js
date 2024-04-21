import { findAncestor, isEmpty, isNullOrUndefined } from "zenkai";
import { Algorithm } from "./algorithm"
import { getFirstGraphical } from "@utils/index.js";

const BasePatternAlgorithm = {

    /** @type {Array[Coordinates]}*/
    anchors: null,

    init(args) {
        Object.assign(this.schema, args);

        const { orientation, meet, focusable = true } = this.schema;

        this.orientation = orientation;
        this.content = [];
        this.meet = meet;
        this.focusable = focusable;

        return this;
    },

    render() {

        if(isNullOrUndefined(this.container)) {
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.container.classList.add("algorithm-container");
            this.container.dataset.nature = "algorithm";
            this.container.dataset.algorithm = "pattern";
            this.container.dataset.id = this.id;
            this.container.id = this.id;

        }

        this.source.getValue().forEach( (value) => {
            let item = this.createItem(value);

            this.container.append(item);
        })

        if (this.focusable) {
            this.container.tabIndex = 0;
        } else {
            this.container.dataset.ignore = "all";
        }


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

        this.content.push(itemProjection.element);

        return container;
    },

    refresh() {
        ContentManager[this.orientation.type].call(this);
    },

    removeItem(item) {
        for(let i = 0; i < this.content.length; i++) {
            if(this.content[i].source.id == item.id) {
                let container = this.content[i].container || this.content[i].element;
                container.remove();

                this.content.splice(i, 1);
            }
        }

        this.updateSize();

    },

    updateSize() {
        this.refresh();

        if(!isNullOrUndefined(this.parent)) {
            this.parent.updateSize();
        }

        this.content.forEach( (item) => {
            item.meetSize();
        })

        return;
    },

    focus(){
        if(!this.displayed){
            this.display();
        }

        this.container.focus();
    },

        /**
     * Handles the focusin event
     * @returns this
     */
    focusIn(){
        console.warn(`FOCUSIN_HANDLER NOT IMPLEMENTED FOR ${this.name}`);
        return;
    },

    /**
     * Handles the focusin event
     * @returns this
     */
    focusOut(){
        console.warn(`FOCUSOUT_HANDLER NOT IMPLEMENTED FOR ${this.name}`);
        return;
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
            element.projection.update("displayed");
        })

        this.refresh();

        return;
    },

    /**
     * Handles the `enter` command
     * @param {HTMLElement} target element
     */
    enterHandler(target) {
        if(isNullOrUndefined(this.content) || isEmpty(this.content)) {
            return;
        }

        let focusableElement = getFirstGraphical(this.content, this.containerView.targetX, this.containerView.targetY);

        if(isNullOrUndefined(focusableElement)) {
            return;
        }

        let child = this.projection.resolveElement(focusableElement);

        if(isNullOrUndefined(child)) {
            return;
        }

        child.focus();

        console.log(child);

        return true;
    },

    /**
     * Handles the `arrow` command
     * @param {string} dir direction 
     * @param {HTMLElement} target element
     */
    arrowHandler(dir, target) {
        if(target === this.container) {
            if(isNullOrUndefined(this.parent)) {
                return;
            }

            return this.parent.arrowHandler(dir, this.container);
        }

        let closestElement = getClosestSVG(target, dir, this.content);

        if(isNullOrUndefined(closestElement)) {
            if(isNullOrUndefined(this.parent) || this.parent.object !== "algorithm") {
                return false;
            }

            return this.parent.arrowHandler(dir, this.container);
        }

        let element = this.projection.resolveElement(closestElement);

        if(element) {
            element.focus();
        }

        return true;
    },

    escapeHandler(target) {
        if(isNullOrUndefined(this.parent)) {
            return false;
        }

        let parent = findAncestor(target, (el) => el.tabIndex === 0);
        let element = this.projection.resolveElement(parent);

        if(isNullOrUndefined(element)) {
            return false;
        }

        element.focus(parent);

        return true;
    },


    bindEvents() {
        this.projection.registerHandler("value.added", (value) => {
            let item = this.createItem(value);

            this.container.append(item);

            let projection = this.projection.resolveElement(item);
            projection.projection.update("displayed");

            this.updateSize();
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
    let maxY = 0

    const { spacing = 0 } = this.schema.list.item.template.options;

    for(let i = 0; i < this.content.length; i++) {
        let item = this.content[i];
        let container = item.container || item.element;

        container.setAttribute("x", x);
        
        if(!isNullOrUndefined(item.containerView)) {
            x += item.containerView.targetW + spacing;
            maxY = Math.max(item.containerView.targetH, maxY);
        } else {
            let box = container.getBBox();
            x += box.width + spacing;
            maxY = Math.max(box.height, maxY);
        }
    }

    this.container.setAttribute("width", x);
    this.container.setAttribute("height", maxY);

    if(isNullOrUndefined(this.containerView)) {
        this.containerView = {
            x: 0,
            y: 0,
            w: 0,
            h: 0
        };
    }


    this.containerView.targetW = x;
    this.containerView.targetH = maxY;
    this.containerView.targetX = 0;
    this.containerView.targetY = 0;

    this.containerView.contentW = x;
    this.containerView.contentH = maxY;
    this.containerView.contentX = 0;
    this.containerView.contentY = 0;
}

function manageVertical() {
    let y = 0;
    let maxX = 0;

    const { spacing = 0 } = this.schema.list.item.template.options;

    for(let i = 0; i < this.content.length; i++) {
        let item = this.content[i];
        let container = item.container || item.element;
        
        container.setAttribute("y", y);
        
        if(!isNullOrUndefined(item.containerView)) {
            y += item.containerView.targetH + spacing;
            maxX = Math.max(item.containerView.targetW, maxX);
        } else {
            let box = container.getBBox();
            y += box.height + spacing;
            maxX = Math.max(box.width, maxX);
        }
    }

    this.container.setAttribute("width", maxX);
    this.container.setAttribute("height", y);

    if(isNullOrUndefined(this.containerView)) {
        this.containerView = {
            x: 0,
            y: 0,
            w: 0,
            h: 0
        };
    }


    this.containerView.targetW = maxX;
    this.containerView.targetH = y;
    this.containerView.targetX = 0;
    this.containerView.targetY = 0;

    this.containerView.contentW = maxX;
    this.containerView.contentH = y;
    this.containerView.contentX = 0;
    this.containerView.contentY = 0;
    
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