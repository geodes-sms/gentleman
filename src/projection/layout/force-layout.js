import {
    createDocFragment, createSpan, createDiv, createTextArea, createInput,
    createUnorderedList, createListItem, findAncestor, removeChildren,
    isHTMLElement, isNullOrWhitespace, isEmpty, valOrDefault, hasOwn, isNullOrUndefined, isNull, first,
} from "zenkai";
import {
    hide, show, getCaretIndex, isHidden, NotificationType, getClosestSVG,
    getTopElement, getBottomElement, getRightElement, getLeftElement
} from "@utils/index.js";
import { ContentHandler, resolveValue } from "../content-handler.js";
import { Layout } from "./layout.js";
import { nodes } from "coffeescript";

var node;
var index;
const BaseForceLayout = {

    init(){
        return this;
    },

    render(){
        const { force = "repulsive", intensity, center, edges, attributes} = this.schema;


        const fragment = createDocFragment();
        
        if(!isHTMLElement(this.container)){
            this.container = createDiv({
                class: ["layout-container"],
                dataset: {
                    nature: "layout",
                    layout: "grid",
                    id: this.id,
                }
            });
        }
  

        if(!isEmpty(attributes) && !isHTMLElement(this.interact)){

            /*Modifier la disposition du container*/
            let container = {
                type: "layout",
                layout:{
                    type: "flex",
                    orientation: "row",
                    disposition: attributes
                }
            };

            /*Render*/
            this.interact = ContentHandler.call(this, container, null, this.args);

            let layout = this.environment.resolveElement(this.interact);


            attributes.forEach(a => {
                layout.informations.get(a.dynamic.name).targetGrid = this;
            });
            
            /*Attacher*/
            this.interact["style"]["height"] = "9%"; 
            fragment.append(this.interact);
        }

        if(!isHTMLElement(this.drawArea)){
            this.drawArea = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.drawArea.setAttribute("height", "90%");
            this.drawArea.setAttribute("width", "100%");

            this.drawArea.setAttribute("viewBox", "0 0 " + 400 + " " + 400);

            fragment.append(this.drawArea)
        }

        if(fragment.hasChildNodes()){
            this.container.append(fragment);
        }

        if(isNullOrUndefined(this.foreignsID)){
            this.foreignsID = -1;
        }

        if(isNullOrUndefined(this.item)){
            this.items = new Map();
        }

        if(isNullOrUndefined(this.index)){
            this.index = -1;
        }

        return this.container;
    },

    createItem(object, button){
        const { node = {} } = button.schema.node;

        if(!this.model.hasProjectionSchema(object, node.tag)){
            return "";
        }

        let itemProjection = this.model.createProjection(object, node.tag);
        itemProjection.optional = true;
        itemProjection.parent = this.projection;

        //itemProjection.parent = this.parent.projection;
        //itemProjection.element.parent = this.parent;
        
        let container = itemProjection.init().render();

        return container;
    },

    setUpForce(force, intensity, center, edges){
        this.force = d3.layout.force()
                        .size([400, 400])
                        .nodes([])
                        .charge(-100)
                        .on("tick", this.ticked)

        var svg = d3.select("svg");

        
        this.nodes = this.force.nodes()
        node = svg.selectAll(".node");
    },

    ticked(){
        node.attr("x", function(d) { return d.x; })
                 .attr("y", function(d) { return d.y; })
                 .attr("id", function(d) { return d.index})
                 
    },
    
    /*id non placé*/

    restart(){
        node = node.data(this.nodes);

        var l = this.nodes.length - 1;

        node.enter().insert("foreignObject")
            .style("overflow", "visible")
            .attr("width", 20)
            .attr("width", 20)
            .attr("id", function(d) { return l;});
            

        node.exit().remove();

    },

    addItem(value, button){
        
        if(isNullOrUndefined(this.force)){
            this.setUpForce();
        }


        this.nodes.push({});

        this.restart();

        let last = document.getElementById(this.nodes.length - 1);        

        let item = this.createItem(value, button);
        switch(item.getAttribute("data-view")){
            case "svg":
                let field = this.environment.resolveElement(item);
                field.content.setAttribute("viewBox", " 0 0 170 165")
                last.appendChild(item);
                break;
            default:
                last.appendChild(item);
                this.adaptForeign(last, item)
        }
        ;

        this.force.start();

        this.items.set(value.id, { item : last, index : last.id});

    },

    removeItem(value){

        let item = this.items.get(value.id);
        item.item.remove();
        /*this.nodes.splice(item.index, 1);*/

        this.items.delete(value.id);

        this.restart();
        
        this.nodes.splice(item.index, 1);
        this.force.start();
        /*this.nodes.forEach(element => {
            console.log(element);
        });*/
    },


    adaptForeign(f, i){
        let rect = i.getBoundingClientRect();

        
        /*i.childNodes.forEach(c => {
            console.log(c);
            console.log(c.getBoundingClientRect());
        })*/

        f.setAttribute("width", /*Math.max(rect.width, 42)*/ rect.width);
        f.setAttribute("height", Number(rect.height + 5));
    }
}

export const ForceLayout = Object.assign(
    Object.create(Layout),
    BaseForceLayout
);