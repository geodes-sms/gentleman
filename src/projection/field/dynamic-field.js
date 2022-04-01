import {
    createDocFragment, createSpan, createDiv, createTextArea, createInput,
    createUnorderedList, createListItem, findAncestor, removeChildren,
    isHTMLElement, isNullOrWhitespace, isEmpty, valOrDefault, hasOwn, isNullOrUndefined, POST,
} from "zenkai";
import {
    hide, show, getCaretIndex, isHidden, NotificationType, getClosest,
    getTopElement, getBottomElement, getRightElement, getLeftElement
} from "@utils/index.js";
import { StyleHandler } from "./../style-handler.js";
import { StateHandler } from "./../state-handler.js";
import { ContentHandler, resolveValue } from "./../content-handler.js";
import { Field } from "./field.js";

const BaseDynamicField = {

    init(){
        return this;
    },

    render(){
        const fragment = createDocFragment();

        const { content, markers, marker, self} = this.schema;



        var parser = new DOMParser();
        
        if(!isHTMLElement(this.element)){
            this.element = createDiv({
                id: this.id,
                class: [],
                dataset:{
                    nature: "field",
                    view: "dynamic",
                    id: this.id
                }
            })
        }

        if(!isHTMLElement(this.content)){
            this.content = parser.parseFromString(content.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;
            fragment.appendChild(this.content);
        }

        if(isNullOrUndefined(this.place)){
            this.place = this.content.querySelector("[data-" + marker + "]");
        }

        if(isNullOrUndefined(this.markers)){
            this.markers = new Map();
            let locations = this.content.querySelectorAll("[data-" + marker + "]");
            locations.forEach(loc =>{
                let mv = loc.getAttribute("data-" + marker);
                if(isNullOrUndefined(this.markers.get(mv))){
                    this.markers.set(mv, [loc]);
                }else{
                    this.markers.set(mv, this.markers.get(mv).concat([loc]));
                }
            });
        }


        if(isNullOrUndefined(this.aliases)){
            this.aliases = new Map();
            markers.forEach(a => {
                let effects = []
                a.aliases.forEach(mv => {
                    let target = this.markers.get(mv.mv);
                    const markerValue = [];
                    target.forEach(t => {
                        const schema = {};
                        schema.target = t;
                        let impacts = [];
                        mv.props.forEach(p =>{
                            const impact = {};
                            impact.property = p.props;
                            impact.value = p.value;
                            if(isNullOrUndefined(t["style"]) || isNullOrUndefined(t["style"][p.props])){
                                impact.default = t[p.props];
                            }else{
                                impact.default = t["style"][p.props];
                            }
                            impacts.push(impact);
                        });
                        schema.impacts = impacts;
                        markerValue.push(schema);
                    })
                    effects.push(markerValue);
                })
                this.aliases.set(a.mv, effects);
            });
        }


        if(isNullOrUndefined(this.self) && (!isEmpty(self))){
            this.self = [];
            self.forEach(s => {
                const schema = {};
                schema.property = s;
                if(isNullOrUndefined(this.place["style"][s])){
                    schema.default = this.place[s];
                }else{
                    schema.default = this.place["style"][s];
                }
                this.self.push(schema);
            })
        }


        if(fragment.hasChildNodes()){
            this.element.appendChild(fragment);
        }

        this.update = this.refresh;
        this.clear = this.clean;

        return this;
    },

    refresh(value){
        let current = this.aliases.get(value.toString());

        if(!isNullOrUndefined(current)){
            current.forEach(target => {
                target.forEach(s => {
                    s.impacts.forEach(i => {
                        if(isNullOrUndefined(s.target[i.property])){
                            s.target["style"][i.property] = i.value;
                        }else{
                            s.target[i.property] = i.value;
                        }
                    })
                })
            });
        }
        if(!isNullOrUndefined(this.self)){
            this.self.forEach(s => {

                if(isNullOrUndefined(this.place["style"][s.property])){
                    this.place[s.property] = value;
                }else{
                    this.place["style"][s.property] = value;
                }
            })
        }
    },

    clean(value){
        let clean = this.aliases.get(value);
        if(!isNullOrUndefined(clean)){
            clean.forEach(target => {
                target.forEach(s => {
                    s.impacts.forEach(i => {
                        if(isNullOrUndefined(s.target["style"][i.property])){
                            s.target[i.property] = i.default;
                        }else{
                            s.target["style"][i.property] = i.default;
                        }
                    })
                })
            })
        }
        if(!isNullOrUndefined(this.self)){
            this.self.forEach(s => {
                if(isNullOrUndefined(this.place["style"][s.property])){
                    this.place[s.property] = s.default;
                }else{
                    this.place["style"][s.property] = s.default;
                }
            })        
        }
    }
    
}




export const DynamicField = Object.assign(
    Object.create(Field),
    BaseDynamicField
);