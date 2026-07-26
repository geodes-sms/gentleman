import { Field } from "./field";
import { GraphicalBuilder } from "../../builder/graphical-builder";
import { SvgHelper } from "../../builder/svg-helper";
import { findAncestor } from "zenkai";

const { isNullOrUndefined } = require("zenkai");

const BaseTextSVG = {
    /**
     * @type { string }
     * Represents the text-anchor svg attribute.
     */
    anchor: "start",
    /**
     * @type { string }
     * Represents the dominant-baseline svg attribute.
     */
    baseline: "middle",
    /**
     * @type { string }
     * A string displayed when the field is empty.
     */
    placeholder: "...",

    /**
     * @type { SVGElement }
     * The SVG projection.
     */
    element: null,
    /**
     * @type { SVGRectElement }
     * A box containing the textual element. Used to compute the field size.
     */
    box: null,
    /**
     * @type { SVGTextElement }
     * The text area.
     */
    textArea: null,
    /**
     * @Type { SVGRectElement }
     * The caret displayed on the text.
     */
    caret: null,

    /**
     * @type { boolean }
     * Indicates if the field is empty or not.
     */
    empty: true,
    /**
     * @type { string | number }
     * The displayed text or number.
     */
    content: null,
    /**
     * @type { boolean }
     * Indicates if the field's value can be changed.
     */
    readonly: false,
    /**
     * @type { boolean }
     * Indicates if the field is being edited.
     */
    active: false,
    /**
     * @type { boolean }
     * Indicated if the field has been added to the DOM.
     */
    displayed: false,

    /**
     * @type { SVGTSpanElement }
     * The projection text content.
     */
    textElement: null,
    /**
     * @type { SVGForeignObjectElement }
     * The input's holder.
     */
    holder: null,
    /**
     * @type { HTMLInputElement }
     * The input's used to interact with the field.
     */
    inputElement: null,

    /**
     * @type { number }
     * The projection default abscissa.
     */
    defaultX: 0,
    /**
     * @type { number }
     * The projection default ordinate.
     */
    defaultY: 0,

    /**
     * @type { number }
     * The current index of the caret in the content. The value is -1 if placed before the first character.
     */
    index: -1,
    /**
     * @type { number | null }
     * The id of the interval used to make the caret clip.
     */
    interval: null,

    /**
     * Sets up the TextField's Attribute.
     *
     * @param args : Object. The object containing the field properties.
     *
     * @return {BaseTextSVG} : The configurated TextField.
     */
    init(args) {
        Object.assign(this.schema, args);

        const { anchor = "start", baseline = "auto", placeholder = "..." } = this.schema;

        this.anchor = anchor;
        this.baseline = baseline;
        this.placeholder = placeholder;

        return this;
    },

    /**
     * Renders the TextField.
     *
     * @return {SVGElement} : The field's element.
     */
    render() {

        if (isNullOrUndefined(this.element)) {
            this.element = GraphicalBuilder.createField(this.id, this.name);
        }

        if (isNullOrUndefined(this.box)) {
            this.box = GraphicalBuilder.createTextBox(this.id, this.name);
            this.element.append(this.box);
        }

        if (isNullOrUndefined(this.textArea)) {
            this.textArea = GraphicalBuilder.createTextArea(this.id, this.anchor, this.baseline);
            this.element.append(this.textArea);
        }

        if (this.readonly) {
            SvgHelper.preventInteraction(this.element);
        } else {
            SvgHelper.allowFocus(this.element);
            this.initInput();
        }

        this.loadValue();
        this.updateValue();
        this.style();
        this.bindEvents();

        return this.element;
    },

    /**
     * Sets up the required element to simulate a text input.
     */
    initInput() {
        if (isNullOrUndefined(this.textElement)) {
            this.textElement = GraphicalBuilder.createTextElement(this.id);
            this.textArea.append(this.textElement);

            SvgHelper.preventFocus(this.textElement);
        }

        if (isNullOrUndefined(this.holder)) {
            this.holder = GraphicalBuilder.createHolder(this.id);
            this.element.append(this.holder);
        }

        if (isNullOrUndefined(this.inputElement)) {
            this.inputElement = GraphicalBuilder.createInputElement(this.id, this.source.name === "number" ? "number" : "text");
            this.holder.append(this.inputElement);
        }
    },

    /**
     * Sets the field's initial value.
     */
    loadValue() {
        this.empty = !this.source.hasValue();
        this.content = this.empty && !this.active ? this.placeholder : this.source.value;
    },

    /**
     * Updates the field value.
     *
     * @param updateSource : boolean. True if the source's value should be updated.
     */
    updateValue(updateSource = false) {
        if (updateSource) {
            this.source.setValue(this.inputElement.value);
            this.loadValue();
        }

        if (this.empty && !this.active) {
            SvgHelper.set(this.textElement, "font-style", "italic");
            SvgHelper.set(this.textElement, "opacity", "25%");
            this.content = this.placeholder;
        } else {
            SvgHelper.remove(this.textElement, "font-style");
            SvgHelper.remove(this.textElement, "opacity");
        }

        this.textElement.textContent = this.content;
    },

    /**
     * Applies the selected style on the textElement.
     */
    style() {
        const { font = "Segoe UI", size = 10, color = "black", weight = false } = this.schema.style;

        SvgHelper.set(this.textElement, "font-family", font);
        SvgHelper.set(this.textElement, "font-size", size);
        SvgHelper.set(this.textElement, "fill", color);
        SvgHelper.set(this.textElement, "font-weight", weight);
    },

    /**
     * Sets up the default position for the field.
     */
    initCoordinates() {
        this.defaultX = Number(SvgHelper.get(this.element, "x"));
        this.defaultY = Number(SvgHelper.get(this.element, "y"));
    },

    /**
     * Updates the field's dimension and position to wrap its content.
     */
    updateSize() {
        if (this.empty && this.active) {
            this.updateSizeEmpty();
            return;
        }

        const box = SvgHelper.getBox(this.textElement);

        if (this.active) {
            if (this.index === -1) {
                box.x += 1;
                box.width += 1;
            }

            if (this.index >= this.content.length - 1) {
                box.width += 1;
            }
        }


        this.updateSizeFromBox(box);

        this.parent.updateSize();
    },

    /**
     * Updates the field's dimension and position to wrap its content when the field is empty but active.
     */
    updateSizeEmpty() {
        const height = Number(SvgHelper.get(this.caret, "height"));
        const box = { x: 0, y: -(height / 2), width: 1, height: height }

        this.updateSizeFromBox(box);

        this.parent.updateSize();

    },

    /**
     * Updates the field's dimension based on a DOMRect.
     *
     * @param box : DOMRect. The field's dimensions
     */
    updateSizeFromBox(box) {

        SvgHelper.setViewBox(this.element, box);

        SvgHelper.set(this.element, "x", this.computeX(box.width));
        SvgHelper.set(this.element, "y", this.computeY(box.height));
        SvgHelper.set(this.element, "width", box.width);
        SvgHelper.set(this.element, "height", box.height);

        SvgHelper.set(this.box, "x", box.x);
        SvgHelper.set(this.box, "y", box.y);
        SvgHelper.set(this.box, "width", box.width);
        SvgHelper.set(this.box, "height", box.height);
    },

    /**
     * Computes the abscissa of the textElement.
     *
     * @param witdh : number. The textElement witdh.
     *
     * @return {number} : The textElement new x coordinate.
     */
    computeX(witdh) {
        switch (this.anchor) {
            case "middle":
                return this.defaultX - witdh / 2;
            case "end":
                return this.defaultX - witdh;
            default:
                return this.defaultX;
        }
    },

    /**
     * Computes the abscissa of the textElement.
     *
     * @param height : number. The textElement height.
     *
     * @return {number} : The textElement new y coordinate.
     */
    computeY(height) {
        switch (this.baseline) {
            case "middle":
                return this.defaultY - height / 2;
            case "auto":
                return this.defaultY - height;
            default:
                return this.defaultY;
        }
    },

    /**
     * Adapts the projection when it first enters the DOM.
     */
    display() {
        if (!this.parent.displayed) {
            return;
        }

        this.initCoordinates();
        this.updateSize();

        this.displayed = true;
    },

    /**
     * Handles the click action.
     *
     * @param target : SVGElement. The target of the click.
     */
    clickHandler(target) {
        console.warn(`CLICK HANDLER NOT IMPLEMENTED FOR ${this.name}`);
    },

    /**
     * Handles a click on the field. Starts the flow to position the caret on the projection.
     *
     * @param event : PointerEvent. The click event.
     *
     * @private Requires the event position, that is not given to the default clickHandler().
     */
    _clickHandler(event) {
        this.active = true;

        if (isNullOrUndefined(this.caret)) {
            const height = SvgHelper.getBox(this.element).height;
            this.caret = GraphicalBuilder.createCaret(this.id, height);

            SvgHelper.set(this.caret, "y", 0 - height / 2);
        }

        this.loadValue();

        if (this.empty) {
            this.content = "";
            this.updateValue(true);
            this.index = -1;
        } else {
            this.index = this.findCurrentIndex(event.clientX);
        }

        this.placeCaret();
        this.updateSize();
        this.inputElement.focus();
    },

    /**
     * Handles the `escape` command
     * @param {HTMLElement} target
     */
    escapeHandler(target) {
        let parent = findAncestor(target, (el) => el.tabIndex === 0);

        this.parent.focus(parent);

        return false;
    },

    /**
     * Handles the `arrow` command
     * @param {HTMLElement} target
     */
    arrowHandler(dir, target) {
        console.warn(`ARROW HANDLER NOT IMPLEMENTED FOR ${this.name}`);
    },

    /**
     * Handles the `arrow` commanad in the input
     */
    _arrowHandler(dir) {
        switch (dir) {
            case "ArrowRight":
            case "right":
                if (this.index >= this.content.length - 1) {
                    this.arrowHandler(dir, this.inputElement);
                    return;
                }

                this.index++;
                this.placeCaret();
                return;
            case "ArrowLeft":
            case "left":
                if (this.index <= -1) {
                    this.arrowHandler(dir, this.inputElement);
                    return;
                }

                this.index--;
                this.placeCaret();
                return;
        }
    },

    /**
     * Places the caret on the appropriated position.
     */
    placeCaret() {
        if (this.empty) {
            SvgHelper.set(this.caret, "x", 0);
            this.inputElement.setSelectionRange(0, 0);
        } else if (this.index < 0) {
            SvgHelper.set(this.caret, "x", SvgHelper.getStartPosCharX(this.textElement, 0));
            this.inputElement.setSelectionRange(0, 0);
        } else {
            SvgHelper.set(this.caret, "x", SvgHelper.getEndPosCharX(this.textElement, this.index));
            this.inputElement.setSelectionRange(this.index + 1, this.index + 1);
        }

        this.startTimer();
    },

    /**
     * Finds the index where the caret should be placed.
     *
     * @param x : number. A click event position on the x-axis.
     *
     * @return {number} : The index of the end of the letter where the character should be placed.
     * Returns -1 if the caret should be placed at the beginning of the text
     */
    findCurrentIndex(x) {
        const clientX = SvgHelper.getAbsBox(this.textElement).x;
        const offset = SvgHelper.getStartPosCharX(this.textElement, 0);
        const clickPos = x - clientX - offset;

        let index = -1;
        let min = SvgHelper.getDistanceOnAxe(clickPos, offset);

        for (let $idx = 0; $idx < this.content.length; $idx++) {
            const dist = SvgHelper.getDistanceOnAxe(clickPos, SvgHelper.getEndPosCharX(this.textElement, $idx));

            if (min < dist) {
                return index;
            }

            min = dist;
            index = $idx;
        }

        return index;
    },

    /**
     * Creates the interval managing caret's clipping visual effect.
     */
    startTimer() {
        if (!isNullOrUndefined(this.interval)) {
            this.clearTimer();
        }

        this.interval = window.setInterval(this.clipCaret.bind(this), 500);
    },

    /**
     * Manages the caret's clipping visual effect.
     */
    clipCaret() {
        if (this.element.contains(this.caret)) {
            this.hideCaret();
        } else {
            this.showCaret();
        }
    },

    /**
     * Removes the caret from the DOM.
     */
    hideCaret() {
        this.caret.remove();
    },

    /**
     * Adds the caret to the DOM.
     */
    showCaret() {
        this.element.append(this.caret);
    },

    /**
     * Removes the current interval for the caret's clipping visual effect.
     */
    clearTimer() {
        clearInterval(this.interval);
    },

    /**
     * Handles changes in the input value.
     */
    inputHandler() {
        this.content = this.inputElement.value;
        this.index = this.inputElement.selectionStart - 1;

        this.updateValue(true);
        this.placeCaret();
        this.updateSize();
    },

    /**
     * Handles the manual focus of the element.
     *
     * @param target : HTMLElement. The element that caught focus.
     */
    focus(target) {
        this.active = true;

        if (isNullOrUndefined(this.caret)) {
            const height = SvgHelper.getBox(this.element).height;
            this.caret = GraphicalBuilder.createCaret(this.id, height);

            SvgHelper.set(this.caret, "y", 0 - height / 2);
        }

        this.loadValue();

        if (this.empty) {
            this.content = "";
            this.updateValue(true);
        }

        this.index = -1;

        this.placeCaret();
        this.inputElement.focus();
    },

    /**
     * Handles the impact of getting focused.
     *
     * @return {BaseTextSVG} : This.
     */
    focusIn() {
        this.element.classList.add("active");

        return this;
    },

    /**
     * Handles the impact of the focus leaving.
     *
     * @return {BaseTextSVG} : This.
     */
    focusOut() {
        this.active = false;

        this.clearTimer();
        this.hideCaret();
        this.updateValue();
        this.updateSize();

        this.element.classList.remove("active");

        return this;
    },

    /**
     * Registers handlers on the projection.
     */
    bindEvents() {
        this.projection.registerHandler("displayed", () => {
            this.display();
        });

        this.element.addEventListener('click', (event) => {
            this._clickHandler(event);
        })

        this.inputElement.addEventListener('input', (event) => {
            this.inputHandler();
        })

        this.inputElement.addEventListener('keydown', (event) => {
            const arrows = ["ArrowRight", "ArrowLeft"];
            if (arrows.includes(event.key)) {
                this._arrowHandler(event.key);
            }
        })
    }

}

export const SvgText = Object.assign(
    Object.create(Field),
    BaseTextSVG
)