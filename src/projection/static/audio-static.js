import {
    createDocFragment, createSpan, removeChildren, isHTMLElement, isNullOrUndefined, createAudio,
} from "zenkai";
import { hide, show } from "@utils/index.js";
import { StyleHandler } from "../style-handler.js";
import { ContentHandler } from "./../content-handler.js";
import { Static } from "./static.js";



/**
 * Resolves the value of the input
 * @param {*} object 
 */
function resolveValue(object) {
    if (object.object === "concept") {
        if (object.hasValue()) {
            return object.getValue();
        }
    }

    return false;
}


const BaseAudioStatic = {
    init() {

        return this;
    },

    render() {
        const fragment = createDocFragment();

        const { help, style, content } = this.schema;

        if (!isHTMLElement(this.element)) {
            this.element = createAudio({
                class: ["static", "audio-static"],
                src: content,
                dataset: {
                    nature: "static",
                    static: "audio",
                    id: this.id,
                    ignore: "all",
                }
            });
        }

        if (!isNullOrUndefined(help)) {
            this.element.title = help;
        }

        StyleHandler.call(this.projection, this.element, style);

        if (fragment.hasChildNodes()) {
            this.element.append(fragment);
            this.bindEvents();
        }

        this.refresh();

        return this.element;
    },

    focusIn() {
        this.focused = true;
        this.element.classList.add("active");

        return this;
    },
    focusOut() {
        if (this.messageElement) {
            hide(this.messageElement);
            removeChildren(this.messageElement);
        }


        this.element.classList.remove("active");

        this.refresh();
        this.focused = false;

        return this;
    },
    refresh() {
        return this;
    },

    bindEvents() {
    },
};


export const AudioStatic = Object.assign(
    Object.create(Static),
    BaseAudioStatic
);