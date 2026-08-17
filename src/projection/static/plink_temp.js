import { Static } from './static.js';
import { isNullOrUndefined } from "zenkai";
import { GraphicalBuilder } from "../../builder/graphical-builder";
import { SvgHelper } from "../../builder/svg-helper";

const BaseSVGPLinkStatic = {
    /**
     * @type { SVGElement }
     * The SVG projection.
     */
    element : null,
    /**
     * @type { SVGElement }
     * The associated image.
     */
    content : null,

    /**
     * @type { boolean }
     * Indicates if the field has been added to the DOM.
     */
    displayed : false,

    /**
     * Sets up the SVGStatic's base attributes.
     *
     * @param args : Object. The object containing the field's properties.
     *
     * @return { BaseSVGPLinkStatic } : The configured SVGPLinkStatic.
     */
    init(args) {
        Object.assign(this.schema, args);

        return this;
    },

    /**
     * Renders the SVGPLinkStatic.
     *
     * @return { SVGElement }
     */
    render() {
        const { content } = this.schema;

        if(isNullOrUndefined(this.element)) {
            this.element = GraphicalBuilder.createStatic(this.id, this.name);
            SvgHelper.preventFocus(this.element);
            SvgHelper.preventInteraction(this.element);
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
     * Handles the click action.
     *
     * @param target : SVGElement. The target of the click.
     */
    clickHandler(target) {
        return this.changeView();
    },

    /**
     * Handles the enter action.
     *
     * @param target : SVGElement. The target of the enter command.

     */
    enterHandler(target) {
        return this.changeView();
    },

    /**
     * Changes the projection based on a tag.
     */
    changeView() {
        let index = this.projection.findView(this.schema.tag);

        if (index === -1) {
            return;
        }

        this.projection.changeView(index);
    },

    /**
     * Handles the impact of getting focused.
     *
     * @return { BaseSVGPLinkStatic } : This.
     */
    focusIn() {
        this.element.classList.add('active');

        return this;
    },

    /**
     * Handles the impact of the focus leaving.
     *
     * @return { BaseSVGPLinkStatic } : This.
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
        });
    },

}

export const ProjectionLinkSVGStatic = Object.assign(
    Object.create(Static),
    BaseSVGPLinkStatic
)