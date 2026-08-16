import { Static } from './static.js';
import { isNullOrUndefined } from "zenkai";
import { GraphicalBuilder } from "../../builder/graphical-builder";
import { SvgHelper } from "../../builder/svg-helper";


const BaseSVGStatic = {
    /**
     * @type { SVGElement }
     * The SVG projection.
     */
    element: null,
    /**
     * @type { SVGElement }
     * The associated image.
     */
    content : null,

    /**
     * @type { boolean }
     * Indicated if the field has been added to the DOM.
     */
    displayed : false,

    /**
     * Sets up the SVGStatic's base attributes.
     *
     * @param args : Object. The object containing the field's properties.
     *
     * @return { BaseSVGStatic } : The configurated SVGStatic.
     */
    init(args) {
        Object.assign(this.schema, args);

        return this;
    },

    /**
     * Renders the SVGStatic.
     *
     * @return { SVGElement } : The static's element.
     */
    render() {
        const  { content } = this.schema;

        if(isNullOrUndefined(this.element)) {
            this.element = GraphicalBuilder.createStatic(this.id, this.name);
            SvgHelper.preventFocus(this.element);
        }

        if(isNullOrUndefined(this.content)) {
            this.content = GraphicalBuilder.createFromString(content);
            this.element.append(this.content);
        }

        this.bindEvents();

        return this.element;
    },

    /**
     * Adapts the projection when it first enters the DOM.
     */
    display() {
        if(!this.parent.displayed || this.displayed) {
            return;
        }

        this.displayed = true;

        this.updateSize();
    },

    /**
     * Updates the static's dimension to wrap its content.
     */
    updateSize() {
        if(GraphicalBuilder.hasDimensions(this.content)) {
            SvgHelper.set(this.element, "width", SvgHelper.getWidth(this.content));
            SvgHelper.set(this.element, "height", SvgHelper.getHeight(this.content));
            return;
        }

        const box = SvgHelper.getBox(this.content);
        SvgHelper.set(this.element, "width", box.width);
        SvgHelper.set(this.element, "height", box.height);
    },


    /**
     * Handles the manual focus of the element.
     *
     * @param target : HTMLElement. The element that caught focus.
     */
    focus(target) {
        console.log('focus : ');
        console.log('target : ', target);
    },

    /**
     * Handles the impact of getting focused.
     *
     * @return { BaseSVGStatic } : This.
     */
    focusIn() {
        this.element.classList.add('active');

        return this;
    },

    /**
     * Handles the impact of the focus leaving.
     *
     * @return { BaseSVGStatic } : This.
     */
    focusOut() {
        this.element.classList.remove('active');

        return this;
    },

    /**
     * Registers handlers on the projection.
     */
    bindEvents() {
        this.projection.registerHandler('displayed', () => {
            this.display();
        })

    }
}

export const SVGStatic = Object.assign(
    Object.create(Static),
    BaseSVGStatic
);