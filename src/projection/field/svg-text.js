import { isNull, isNullOrUndefined } from "zenkai";
import { Field } from "./field";

const BaseSvgText = {

    init(){
        return this;
    },

    render(){
        const {content, x, y} = this.schema;
        
        var parser = new DOMParser();

        if(isNullOrUndefined(this.element)){
            this.element = parser.parseFromString(content.replace(/\&nbsp;/g, ''), "image/svg+xml").documentElement;
            
            console.log(this.element);

            this.element.id = this.id;
            this.element.classList.add("field");
            this.element.tabindex = -1;
            this.element.dataset["nature"] = "field";
            this.element.dataset["view"] = "svg";
            this.element.dataset["id"] = this.id;
        }

        this.element.setAttribute("x", x);
        this.element.setAttribute("y", y);

        console.log(this.element);

        return this.element;
    }
}

export const SvgText = Object.assign(
    Object.create(Field),
    BaseSvgText
);