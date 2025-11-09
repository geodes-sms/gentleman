import { ContentHandler } from './../content-handler.js';
import { isNullOrUndefined, isUndefined } from 'zenkai';
import { Simulation } from './simulation.js';

import * as d3 from "d3";

const First = "<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"node\" width=\"30\" height=\"30\"><rect rx=\"2\" width=\"27\" height=\"27\" x=\"1.5\" y=\"1.5\" stroke=\"#555\" stroke-width=\"1.5\" fill=\"transparent\"></rect><text fill=\"#555\" x=\"15\" y=\"15\" text-anchor=\"middle\" font-size=\"18\" font-family=\"Segoe UI\" dominant-baseline=\"middle\">1</text></svg>"
const Second = "<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"node\" width=\"30\" height=\"30\"><rect rx=\"2\" width=\"27\" height=\"27\" x=\"1.5\" y=\"1.5\" stroke=\"#555\" stroke-width=\"1.5\" fill=\"transparent\"></rect><text fill=\"#555\" x=\"15\" y=\"15\" text-anchor=\"middle\" font-size=\"18\" font-family=\"Segoe UI\" dominant-baseline=\"middle\">2</text></svg>"
const Third = "<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"node\" width=\"30\" height=\"30\"><rect rx=\"2\" width=\"27\" height=\"27\" x=\"1.5\" y=\"1.5\" stroke=\"#555\" stroke-width=\"1.5\" fill=\"transparent\"></rect><text fill=\"#555\" x=\"15\" y=\"15\" text-anchor=\"middle\" font-size=\"18\" font-family=\"Segoe UI\" dominant-baseline=\"middle\">3</text></svg>" 


const BaseForceSimulation = {

    init(args){
        Object.assign(this.schema, args);

        const { width, height } = this.schema;
        this.width = width;
        this. height = height;

        return this;
    },

    render(){
        if(isNullOrUndefined(this.container)) {
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.container.classList.add("simulation-container");
            this.container.dataset.nature = "simulation";
            this.container.dataset.view = "force-display";
            this.container.dataset.id = this.id;

            this.background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            this.background.setAttribute("fill", "#f5f5f5");
            this.background.setAttribute("rx", 5);
            this.background.setAttribute("width", this.width);
            this.background.setAttribute("height", this.height);

            this.container.setAttribute("width", this.width);
            this.container.setAttribute("height", this.height);
            this.container.append(this.background);
        }

        if(isNullOrUndefined(this.elements)) {
            this.elements = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.elements.dataset.nature = "simulation-component";
            this.elements.dataset.view = "force-container";
            this.elements.dataset.id = this.id;

            const parser = new DOMParser();

            this.elements.append(parser.parseFromString(First.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement);
            this.elements.append(parser.parseFromString(Second.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement);
            this.elements.append(parser.parseFromString(Third.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement);

            this.container.append(this.elements);
        }

        this.bindEvents();

        return this.container;
    },

    setUpForce(){

        this.force = d3.layout.force()
            .size([this.width, this.height])
            .nodes([{}, {}, {}])
            .charge(this.charge.value * -1)
            .on("tick", this.tick.bind(this));

        this.nodes = this.force.nodes();

        this.node = d3.selectAll(".node")
            .data(this.nodes);

    },

    tick(){
        this.node
        .attr("x", function(d) {
            return d.x - 15
        })
        .attr("y", function(d) {
            return d.y - 15
        });
    },

    focusIn(){

    },

    focusOut(){

    },

    update(){
        if(isNullOrUndefined(this.force)) {
            this.setUpForce();
        }

        this.force.stop();

        this.force
        .charge(this.charge.value * -1)
        .linkDistance(this.linksDist.value);

        this.force.start();
    },

    bindEvents(){
        this.charge = this.source.getAttributeByName("charge").target;
        this.charge.register(this);

        this.linksDist = this.source.getAttributeByName("links-dist").target;
        this.linksDist.register(this);

        this.projection.registerHandler("value.changed", () => {
            this.update();
        });

        this.projection.registerHandler("displayed", () => {
            this.update();
        });
    }

}


export const ForceSimulation = Object.assign(
    Object.create(Simulation),
    BaseForceSimulation
);