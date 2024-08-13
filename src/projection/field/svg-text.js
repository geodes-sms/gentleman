import { Field } from "./field";

const { isNullOrUndefined } = require("zenkai");

const BaseTextSVG = {
    init(args) {
        Object.assign(this.schema, args);

        const { anchor = "start", baseline = "auto", placeholder = "..." } = this.schema;
        
        this.anchor = anchor;
        this.baseline = baseline;
        this.placeholder = placeholder;

        return this;
    },

    render() {

        if(isNullOrUndefined(this.element)) {
            this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.element.id = this.id;
            this.element.classList.add("field");

            this.element.dataset.nature = "field";
            this.element.dataset.view = "svg-text";
            this.element.dataset.id = this.id;
        }

        if(isNullOrUndefined(this.box)){
            this.box = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            this.box.setAttribute("fill", "transparent");
            
            this.box.dataset.nature = "field-component";
            this.box.dataset.view = "svg-text";
            this.box.dataset.id = this.id;

            this.element.append(this.box);
        }

        
        if(isNullOrUndefined(this.textArea)){
            this.textArea = document.createElementNS("http://www.w3.org/2000/svg", "text");
            this.element.append(this.textArea);
        }

        this.textArea.setAttribute("text-anchor", this.anchor);
        this.textArea.setAttribute("dominant-baseline", this.baseline);
        
        if(this.source.hasValue()) {
            this.empty = false;
            this.content = this.source.value;
        } else {
            this.empty = true;
            this.content = this.placeholder
        }

        if(this.readonly) {
            this.element.dataset.ignore = "all";
        } else {
            this.element.tabIndex = 0;
            this.createInput();
        }

        this.setValue();

        this.bindEvents();

        this.style();

        return this.element;

    },

    createInput() {
        if(isNullOrUndefined(this.textElement)) {
            this.textElement = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
            this.textElement.tabIndex = -1;
            
            this.textElement.dataset.nature = "field-component";
            this.textElement.dataset.view = "span";
            this.textElement.dataset.id = this.id;
        }

        this.textArea.append(this.textElement);

        if(isNullOrUndefined(this.holder)) {
            this.holder = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
            
            this.holder.dataset.nature = "field-component";
            this.holder.dataset.view = "holder";
            this.holder.dataset.id = this.id;
        }

        this.element.append(this.holder);

        if(isNullOrUndefined(this.inputElement)) {
            this.inputElement = document.createElementNS("http://www.w3.org/1999/xhtml", "input");
            
            this.inputElement.dataset.nature = "field-component";
            this.inputElement.dataset.view = "input";
            this.inputElement.dataset.id = this.id;

            if(this.source.name === "string") {
                this.inputElement.setAttribute("type", "text")
            } else if (this.source.name === "number") {
                this.inputElement.setAttribute("type", "number");
            }
        }
        
        this.holder.append(this.inputElement);

        if(this.source.hasValue()) {
            this.inputElement.value = this.source.value;
        }
    },

    createCaret() {
        let { height } = this.textElement.getBBox();

        this.caret = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        this.caret.setAttribute("width", 1);
        this.caret.setAttribute("height", height);
        this.caret.setAttribute("y", 0);
     
        this.caret.dataset.nature = "field-component";
        this.caret.dataset.view = "caret";
        this.caret.dataset.id = this.id;
    },

    getCharIndex(e) {
        const clientRect = this.textElement.getBoundingClientRect();
        const startOffset = this.textElement.getStartPositionOfChar(0).x;

        let min = Math.pow(e.x - clientRect.x - Math.abs(startOffset) * 2, 2);
        let index = 0;

        const length = this.textElement.textContent.length;

        for(let i = 1; i < length; i++) {
            const start = Math.pow(e.x - clientRect.x - Math.abs(startOffset) - this.textElement.getStartPositionOfChar(i).x, 2)
        
            if(min < start) {
                return index;
            }

            min = start;
            index = i;
        }

        const ending = Math.pow(e.x - clientRect.x - this.textElement.getEndPositionOfChar(index).x, 2); 
    
        if(min < ending) {
            return index;
        }

        return index + 1;
    },

    placeEmptyCaret() {
        this.caret.setAttribute("x", 0);
        this.caretIndex = 0;

        this.placeInput(0);

        this.setTimer();
    },

    setTimer() {
        if(!isNullOrUndefined(this.timer)) {
            clearInterval(this.timer);
        }

        this.timer = setInterval( () => {
            if(this.element.contains(this.caret)) {
                this.caret.remove();
            } else {
                this.element.append(this.caret);
            }
        }, 500)
    },

    placeCaret() {
        let x;

        const length = this.textElement.textContent.length;

        if(this.caretIndex >= length) {
            x = this.textElement.getEndPositionOfChar(this.caretIndex - 1).x;
        } else {
            x = this.textElement.getStartPositionOfChar(this.caretIndex).x;
        }

        this.caret.setAttribute("x", x);
        
        this.placeInput(this.caretIndex);

        this.setTimer();
    },

    placeInput(index) {
        if(this.inputElement.createTextRange) {
            let range = this.inputElement.createTextRange();
            range.move('character', index)
            range.select();
        } else {
            if(this.inputElement.selectionStart) {
                this.inputElement.focus();
                this.inputElement.setSelectionRange(index, index);
            } else {
                this.inputElement.focus();
            }
        }
    },

    focusIn() {

    },

    focusOut() {
        if(!isNullOrUndefined(this.timer)) {
            clearInterval(this.timer);
        }

        this.caret.remove();

        this.active = false;

        this.setValue();

        this.updateSize();

        return false;
    },

    setValue(update = false) {
        if(update) {
            this.source.setValue(this.inputElement.value);
            this.content = this.inputElement.value;
        }

        if(this.empty && !this.active) {
            this.textElement.setAttribute("font-style", "italic");
            this.textElement.setAttribute("opacity", "25%");
            this.content = this.placeholder;
        } 

        this.textElement.textContent = this.content;

    },

    style() {
        const { font = "Segoe UI", size = 10, color = "black", weight = false } = this.schema.style;

        this.textElement.setAttribute("font-family", font);
        this.textElement.setAttribute("font-size", size);
        this.textElement.setAttribute("fill", color);
        this.textElement.setAttribute("font-weight", weight);
    },

    updateEmptySize() {
        const height = Number(this.caret.getAttribute("height"));

        this.element.setAttribute("viewBox",
            "0 0 " +
            1 + " " +
            height
        );

        this.element.setAttribute("width", 1);
        this.element.setAttribute("height", height);

        if(this.active) {
            this.caret.setAttribute("y", 0);
        }

        switch(this.anchor) {
            case "middle":
                this.element.setAttribute("x", this.defaultCoordinates.x - 0.5);
                break;
            case "end":
                this.element.setAttribute("x", this.defaultCoordinates.x - 1);
                break;
            case "start":
                this.element.setAttribute("x", this.defaultCoordinates.x);
                break;
        }

        switch(this.baseline) {
            case "middle":
                this.element.setAttribute("y", this.defaultCoordinates.y - height / 2);
                break;
            case "auto":
                this.element.setAttribute("y", this.defaultCoordinates.y - height);
                break;
            case "hanging":
                this.element.setAttribute("y", this.defaultCoordinates.y);
                break;
        }

        this.box.setAttribute("width", 1);
        this.box.setAttribute("height", height);
        this.box.setAttribute("y", 0);
        this.box.setAttribute("x", 0);

        this.parent.updateSize();

    },

    updateSize() {
        let box = this.textElement.getBBox();
                
        if(isNullOrUndefined(this.defaultCoordinates)){
            this.defaultCoordinates = {
                x: Number(this.element.getAttribute("x")),
                y: Number(this.element.getAttribute("y"))
            }
        }


        if(this.empty && this.displayed && this.active) {
            this.updateEmptySize();
            return;
        }

        this.element.setAttribute("viewBox",
            box.x + " " +
            box.y + " " +
            box.width + " " +
            box.height
        )

        this.element.setAttribute("width", box.width);
        this.element.setAttribute("height", box.height);

        if(this.active) {
            this.caret.setAttribute("y", box.y);
        }

        switch(this.anchor){
            case "middle":
                this.element.setAttribute("x", this.defaultCoordinates.x - box.width / 2);
                break;
            case "end":
                this.element.setAttribute("x", this.defaultCoordinates.x - box.width);
                break;
            case "start":
                this.element.setAttribute("x", this.defaultCoordinates.x);
                break;
        }

        switch(this.baseline){
            case "middle":
                this.element.setAttribute("y", this.defaultCoordinates.y - box.height / 2);
                break;
            case "auto":
                this.element.setAttribute("y", this.defaultCoordinates.y - box.height);
                break;
            case "hanging":
                this.element.setAttribute("y", this.defaultCoordinates.y);
                break;
        }

        
        this.box.setAttribute("width", box.width);
        this.box.setAttribute("height", box.height);
        this.box.setAttribute("y", box.y);
        this.box.setAttribute("x", box.x);

        this.parent.updateSize();
    },

    bindEvents() {
        this.textElement.addEventListener("click", (e) => {
            this.active = true;

            this.textElement.removeAttribute("opacity");
            this.textElement.removeAttribute("font-style");

            if(isNullOrUndefined(this.caret)) {
                this.createCaret();
            }

            if(this.empty) {
                this.textElement.textContent = "";
                this.placeEmptyCaret()
            } else {
                this.caretIndex = this.getCharIndex(e);
                this.placeCaret();
            }
                        
            this.updateSize();
        })

        this.inputElement.addEventListener("focusout", (e) => {
            this.focusOut();
        })

        this.inputElement.addEventListener("input", (e) => {
            const value = this.inputElement.value;

            this.textElement.textContent = value;

            if(value === "") {
                this.empty = true;
                this.caretIndex = 0;
                this.placeEmptyCaret();
            } else {
                this.empty = false;
                this.caretIndex = this.inputElement.selectionStart;
                this.placeCaret();
            }

            this.setValue(true);
            this.updateSize();
        })

        this.inputElement.addEventListener("keyup", (e) => {
            if(e.key === "ArrowRight") {
                if(this.caretIndex > this.textElement.textContent.length) {
                    return;
                }

                this.caretIndex++;
                this.placeCaret();

                return;
            }

            if(e.key === "ArrowLeft") {
                if(this.caretIndex === 0) {
                    return;
                }

                this.caretIndex--;
                this.placeCaret();

                return;
            }
        })

        this.projection.registerHandler("displayed", () => {
            if(!this.parent.displayed) {
                return;
            }

            this.updateSize();

            this.displayed = true;
        });
    }
}

export const SvgText = Object.assign(
    Object.create(Field),
    BaseTextSVG
)