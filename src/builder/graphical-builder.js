import { SvgBuilder } from "./svg-builder";
import { SvgHelper } from "./svg-helper";
import { HtmlBuilder } from "./html-builder";

export const GraphicalBuilder = {
    /**
     * Creates a graphical field
     *
     * @param id : string. The field's id.
     * @param view : string. The field's type.
     *
     * @return { SVGElement } : A freshly created field.
     */
    createField(id, view) {
        const field = SvgBuilder.createSvg();
        field.id = id;
        field.classList.add("field");

        field.dataset.nature = "field";
        field.dataset.view = view;
        field.dataset.id = id;

        return field;
    },

    /**
     * Creates a textBox.
     *
     * @param id : string. The field's id.
     * @param view : string. The field's type.
     *
     * @return { SVGRectElement } : A freshly created textBox.
     */
    createTextBox(id, view) {
        const textBox = SvgBuilder.createRect();
        textBox.setAttribute("fill", "transparent");

        textBox.dataset.nature = "field-component";
        textBox.dataset.view = "box";
        textBox.dataset.id = id;

        return textBox;
    },

    /**
     * Creates a textArea.
     *
     * @param id : string. The associated field's id.
     * @param textAnchor : string. The text's anchor (start, middle or end).
     * @param dominantBaseline : string. The text's dominant baseline (auto, middle, hanging ...).
     *
     * @return { SVGTextElement } : A freshly created textArea.
     */
    createTextArea(id, textAnchor, dominantBaseline) {
        const textArea = SvgBuilder.createText();

        textArea.dataset.nature = "field-component";
        textArea.dataset.view = "area";
        textArea.dataset.id = id;

        textArea.setAttribute("text-anchor", textAnchor);
        textArea.setAttribute("dominant-baseline", dominantBaseline);

        return textArea;
    },

    /**
     * Creates a textElement.
     *
     * @param id : string. The associated field's id.
     *
     * @return { SVGTSpanElement } : A freshly created textElement.
     */
    createTextElement(id) {
        const span = SvgBuilder.createTSpan();
        SvgHelper.preventFocus(span);

        span.dataset.nature = "field-component";
        span.dataset.view = "span";
        span.dataset.id = id;

        return span;
    },

    /**
     * Creates a holder.
     *
     * @param id : string. The associated field's id.
     *
     * @return {SVGForeignObjectElement } : A freshly created holder.
     */
    createHolder(id) {
        const holder = SvgBuilder.createForeignObject();

        holder.dataset.nature = "field-component";
        holder.dataset.view = "holder";
        holder.dataset.id = id;

        return holder;
    },

    /**
     * Creates an input.
     *
     * @param id : string. The associated field's id.
     * @param type : string. The input's type.
     *
     * @return { HTMLInputElement } : A freshly created input.
     */
    createInputElement(id, type) {
        const input = HtmlBuilder.createInput();

        input.dataset.nature = "field-component";
        input.dataset.view = "input";
        input.dataset.id = id;

        input.setAttribute("type", type);

        return input;
    },

    /**
     * Creates a caret.
     *
     * @param id : string. The associated field's id.
     * @param height : number. The caret's height.
     *
     * @return { SVGRectElement } : A freshly created caret.
     */
    createCaret(id, height) {
        const caret = SvgBuilder.createRect();

        caret.dataset.nature = "field-component";
        caret.dataset.view = "caret";
        caret.dataset.id = id;

        SvgHelper.set(caret, "width", 1);
        SvgHelper.set(caret, "height", height);
        SvgHelper.set(caret, "y", 0);

        return caret;
    }
}