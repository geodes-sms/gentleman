import { ContentHandler } from "./../content-handler";
import { Field } from "./field";

const { isNullOrUndefined, isEmpty, isNull, first, valOrDefault } = require("zenkai");


const BaseTextSVG = {
    init(){
        return this;
    },

    render(){
        const { placeholder, anchor, baseline, multiline } = this.schema;

        if(isNullOrUndefined(this.element)){
            this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.element.id = this.id;
            this.element.classList.add("field");
            this.element.tabIndex = -1;

            this.element.dataset.nature = "field";
            this.element.dataset.view = "svg";
            this.element.dataset.id = this.id;
        }

        if(isNullOrUndefined(this.textArea)){
            this.textArea = document.createElementNS("http://www.w3.org/2000/svg", "text");
            this.element.append(this.textArea);
            this.textArea.setAttribute("font-size", 12);
        }

        if(isNullOrUndefined(this.box)){
            this.box = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            this.box.setAttribute("fill", "transparent");

            this.element.prepend(this.box);
        }

        if(isNullOrUndefined(this.placeholder)){
            this.placeholder = placeholder;
        }

        if(isNullOrUndefined(this.anchor)){
            this.anchor = anchor;
            this.textArea.setAttribute("text-anchor", this.anchor)
        }

        if(isNullOrUndefined(this.baseline)){
            this.baseline = baseline;
            this.textArea.style["dominant-baseline"] = baseline;
        }

        if(isNullOrUndefined(this.content)){
            if(this.source.hasValue()){
                this.content = this.source.value;
            }else{
                this.content = this.placeholder;
            }
        }

        if(isNullOrUndefined(this.multiline)){
            this.multiline = multiline;
        }

        if(this.multiline){
            this.initiateLines();
        }else{
            this.initiateText();
        }

        this.bindEvents();

        return this.element;
    },

    /*Ensures that the text is always visible*/
    adaptViewBox(){
        let box = this.textArea.getBBox();
        this.element.setAttribute("viewBox",
            box.x + " " +
            box.y + " " +
            box.width + " " + 
            box.height + " "
        );
        this.element.setAttribute("width", box.width);
        this.element.setAttribute("height", box.height);

        if(isNullOrUndefined(this.defaultCoordinates)){
            this.defaultCoordinates = {
                x: Number(this.element.getAttribute("x")),
                y: Number(this.element.getAttribute("y"))
            }
        }

        switch(this.anchor){
            case "middle":
                this.element.setAttribute("x", this.defaultCoordinates.x - box.width / 2);
                break;
            case "end":
                this.element.setAttribute("x", this.defaultCoordinates.x - box.width);
                break;
            case "start":
                break;
        }

        switch(this.baseline){
            case "middle":
                this.element.setAttribute("y", this.defaultCoordinates.y - Math.abs(box.height) / 2);
                break;
            case "auto":
                this.element.setAttribute("y", this.defaultCoordinates.y - Math.abs(box.height));
                break;
            case "hanging":
                break;
        }

        this.box.setAttribute("width", box.width);
        this.box.setAttribute("height", box.height);
        this.box.setAttribute("y", box.y);
        this.box.setAttribute("x", box.x);

        this.parent.updateSize();
    },

    /*Creates lines for multiline text*/
    initiateLines(){
        let lines = this.content.split(/\r?\n/);
        this.lineMapper = new Map();
        this.lines = [];

        for(let i = 0; i < lines.length; i++){
            let {span, input} = this.createLine(lines[i], i > 0);
            this.lines.push(span);
            this.style(span);
            this.createInputListeners(span, input);
        }
    },

    /*Create duo line & input*/
    createLine(line = "", start = true){
        let span = document.createElementNS("http://www.w3.org/2000/svg", "tspan");

        if(start){
            span.setAttribute("x", 0);
            span.setAttribute("dy", "1.2em");
        }

        let holder = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");

        let input = document.createElement("input");
        input.setAttribute("type", "text");
        input.value = line;

        if(line === ""){
            span.textContent = "B";
            span.setAttribute("fill", "transparent");
            input.dataset.discard = true;
        }else{
            span.textContent = line;
        }

        this.lineMapper.set(span, input);
        this.textArea.append(span);

        holder.append(input);
        this.element.append(holder);

        return {
            span: span,
            input: input
        };
    },

    /*Bind events connecting span, input and caret*/
    createInputListeners(span, input){
        input.addEventListener("input", (e) =>{
            if(isNullOrUndefined(e.data) && this.carretIndex === 1){
                this.cancelBack = true;
            }
            this.setLineValue(span, input);
            this.getCaretfromRange(input, span);            
            this.displayCaret(this.carretIndex, this.carretLine);
        })

        input.addEventListener("keyup", (e) => {

            if(e.key === "Enter"){
                this.addLine(span, input);
            };

            if(e.key === "Delete"){
                if(this.carretIndex >= this.carretLine.textContent.length && span !== this.lines[this.lines.length - 1]){
                    for(let i = 0; i < this.lines.length; i++){
                        if(span === this.lines[i]){
                            this.deleteLine(this.lines[i + 1], this.lineMapper.get(this.lines[i + 1]));
                            return;
                        }
                    }
                }
            }

            if(e.key === "Backspace" && (isNullOrUndefined(this.cancelBack) || !this.cancelBack)){
                if(this.carretIndex === 0 && this.lines[0] !== span){
                    this.deleteLine(span, input);
                }
            }else{
                this.cancelBack = false;
            }

            if(e.key === "ArrowLeft"){
                if(this.carretIndex > 0){
                    this.carretIndex--;
                    this.displayCaret(this.carretIndex, span);
                }else{
                    if(this.lines[0] === span){
                        return;
                    }
                    for(let i = 1; i < this.lines.length; i++){
                        if(this.lines[i] === span){
                            this.carretLine = this.lines[i - 1];
                            if(this.lines[i - 1].getAttribute("fill") === "transparent"){
                                this.carretIndex = 0;
                                this.displayCaretEmpty(this.carretLine);
                            }else{
                                this.carretIndex = this.carretLine.textContent.length;
                                this.displayCaret(this.carretIndex, this.carretLine);
                            }

                        }
                    }
                }
            }

            if(e.key === "ArrowRight"){
                if(span.textContent.length > this.carretIndex && span.getAttribute("fill") !== "transparent"){
                    if(this.start){
                        this.carretIndex--;
                    }

                    this.carretIndex++;
                    this.displayCaret(this.carretIndex, span);
                    this.start = false;
                }else{
                    for(let i = 0; i < this.lines.length; i++){
                        if(this.lines[i] === span && (i + 1 < this.lines.length)){
                            this.carretLine = this.lines[i + 1];
                            this.carretIndex = 0;
                            if(this.lines[i + 1].getAttribute("fill") === "transparent"){
                                this.displayCaretEmpty(this.carretLine)
                            }else{
                                this.displayCaret(this.carretIndex, this.carretLine, true);
                            }
                            this.start = true;
                        }
                    }
                }
            }

            if(e.key === "ArrowUp"){

            }

            if(e.key === "ArrowDown"){

            }
        })

        span.addEventListener("click", (e) => {
            input.focus();
            if(span.getAttribute("fill") !== "transparent"){
                this.setCaret(e.x, span);    
            }else{
                this.displayCaretEmpty(span);
            }
        })
    },

    /*Ensures that the caret follows the input range*/
    getCaretfromRange(input, span){
        let index = input.selectionStart;
        this.displayCaret(index, span, true);
    },

    /*Find caret position for mono-line text*/
    setMonoCaret(x){
        let boxAbs = this.textElement.getBoundingClientRect().x;
        let firstLetterOffset = this.textElement.getStartPositionOfChar(0).x;

        let minX = (x - (boxAbs + Math.abs(firstLetterOffset) + this.textElement.getStartPositionOfChar(0).x)) * (x - (boxAbs + Math.abs(firstLetterOffset) + this.textElement.getStartPositionOfChar(0).x));
        let index = 0;

        for(let i = 0; i < this.textElement.textContent.length; i++){
            let distStart = (x - (boxAbs + Math.abs(firstLetterOffset) + this.textElement.getStartPositionOfChar(i).x)) * (x - (boxAbs + Math.abs(firstLetterOffset) + this.textElement.getStartPositionOfChar(i).x));

            if(distStart > minX){
                this.displayMonoCaret(index);
                return;
            }

            minX = distStart;
            index = i;
        }

        let lastLetter = this.textElement.getEndPositionOfChar(index).x;
        let lastLetterDist = (x - (boxAbs + Math.abs(firstLetterOffset) + lastLetter)) * (x - (boxAbs + Math.abs(firstLetterOffset) + lastLetter));
    
        if(lastLetterDist < minX){
            this.displayMonoCaret(index + 1);
            return;
        }
        
        this.displayMonoCaret(index);
    },

    displayMonoCaret(index){
        let {x, y} = index < this.textElement.textContent.length ? this.textElement.getStartPositionOfChar(index) : this.textElement.getEndPositionOfChar(index);
        let box = this.textElement.getBBox();

        if(isNullOrUndefined(this.caret)){          
            this.caret = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            this.caret.setAttribute("width", 1);
            this.caret.setAttribute("height", box.height);
            this.element.append(this.caret);
        }

        this.caret.setAttribute("x", x);
        this.caret.setAttribute("y", box.y);

        this.setTimer();
        this.setMonoInputCaret(index);
    },

    /*Find caret position after click*/
    setCaret(x, span){
        let boxAbs = span.getBoundingClientRect().x;
        let firstLetterOffset = span.getStartPositionOfChar(0).x;

        let minX = (x - (boxAbs + Math.abs(firstLetterOffset) + span.getStartPositionOfChar(0).x)) * (x - (boxAbs + Math.abs(firstLetterOffset) + span.getStartPositionOfChar(0).x));
        let index = 0;

        for(let i = 0; i < span.textContent.length; i++){
            let distStart = (x  - (boxAbs + Math.abs(firstLetterOffset) + span.getStartPositionOfChar(i).x)) * (x - (boxAbs + Math.abs(firstLetterOffset) + span.getStartPositionOfChar(i).x));
            
            if(distStart > minX){
                this.displayCaret(index, span);
                return
            }

            minX = distStart;
            index = i;
        }
        
        let lastLetter = span.getEndPositionOfChar(index).x;
        let lastLetterDist = (x - (boxAbs + Math.abs(firstLetterOffset) + lastLetter)) * (x - (boxAbs + Math.abs(firstLetterOffset) + lastLetter));

        if(lastLetterDist < minX){
            this.displayCaret(index + 1, span);
            return;
        }

        this.displayCaret(index, span);
    },

    /*Position the caret */
    displayCaret(index, span){
        let {x, y} = index < span.textContent.length ? span.getStartPositionOfChar(index) : span.getEndPositionOfChar(index - 1);
        let box = span.getBBox();

        if(isNullOrUndefined(this.caret)){          
            this.caret = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            this.caret.setAttribute("width", 1);
            this.caret.setAttribute("height", box.height);
            this.element.append(this.caret);
        }

        this.caret.setAttribute("x", x);
        this.caret.setAttribute("y", box.y);

        this.carretLine = span;
        this.carretIndex = index;

        this.setTimer();
        this.setInputCaret(index, span);
    },

    displayCaretEmpty(span){
        let box = span.getBBox();

        if(isNullOrUndefined(this.caret)){          
            this.caret = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            this.caret.setAttribute("width", 1);
            this.caret.setAttribute("height", box.height);
            this.element.append(this.caret);
        }

        this.caret.setAttribute("x", box.x + box.width / 2);
        this.caret.setAttribute("y", box.y);

        this.setTimer();
        this.lineMapper.get(span).focus();

        this.carretIndex = 0;
        this.carretLine = span;
    },

    /**Connect caret position to input range */
    setInputCaret(i, span){
        let index = /*end ? i + 1 :*/ i;
        let input = this.lineMapper.get(span);
        if(input.createTextRange){
            var range = input.createTextRange();
            range.move('character', i);
            range.select();
        }else{
            if(input.selectionStart){
                input.focus();
                input.setSelectionRange(index, index);
            }else{
                input.focus();
            }
        }

    },

    /*Connect caret position to input range*/
    setMonoInputCaret(index){
        if(this.inputElement.createTextRange){
            var range = input.creatTextRange();
            range.move('character', index);
            range.select();
        }else{
            if(this.inputElement.selectionStart){
                this.inputElement.focus();
                this.inputElement.setSelectionRange(index, index);
            }else{
                this.inputElement.focus();
            }
        }
    },

    /**Creates interval for the caret */
    setTimer(){
        if(isNullOrUndefined(this.caret)){
            return;
        }
        if(!isNullOrUndefined(this.timer)){
            clearInterval(this.timer);
        }

        this.timer = setInterval(() => {
            if(this.element.contains(this.caret)){
                this.caret.remove();
            }else{
                this.element.append(this.caret);
            }
        }, 500);
    },

    focusIn(){
        console.log(this);
    },

    focusOut(){
        console.log("Focusing out");
        if(!isNullOrUndefined(this.timer)){
            clearInterval(this.timer);
            this.caret.remove();
        }
        return;
    },

    _focusOut(){
        console.log("_Focusing out");
        if(!isNullOrUndefined(this.timer)){
            clearInterval(this.timer);
            this.caret.remove();
        }
    },


    initiateText(){
        this.textElement = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
        this.textElement.id = this.id;
        this.textElement.classList.add("field");
        this.textElement.tabIndex = -1;

        this.textElement.dataset.nature = "field";
        this.textElement.dataset.view = "svg";
        this.textElement.dataset.id = this.id;

        let holder = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
        this.inputElement = document.createElementNS("http://www.w3.org/1999/xhtml", "input");

        holder.append(this.inputElement);
        
        this.textArea.append(this.textElement);
        this.element.append(holder);

        this.inputElement.value = this.content;
        this.textElement.textContent = this.content;

        this.textElement.addEventListener("click", (e) => {
            this.inputElement.focus();
            this.setMonoCaret(e.x);
        });

        this.inputElement.addEventListener("input", () => {
            this.setLineValue(this.textElement, this.inputElement);
            this.displayMonoCaret(this.inputElement.selectionStart);
        });

        this.element.addEventListener("focusout", () => {
            this._focusOut();
        })

        this.inputElement.addEventListener("keyup", (e) => {
            if(e.key === "ArrowRight"){
                this.displayMonoCaret(this.inputElement.selectionStart);
                return;
            }

            if(e.key === "ArrowLeft"){
                this.displayMonoCaret(this.inputElement.selectionStart);
                return;
            }

            if(e.key === "ArrowUp"){

            }

            if(e.key === "ArrowUp"){
                
            }
        })

        this.style(this.textElement);
    },

    setValue(){
        if(this.multiline){
            let content = "";
            for(let i = 0; i < this.lines.length; i++){
                if(this.lines[i].getAttribute("fill") !== "transparent"){
                    content += this.lines[i].textContent + ((i < this.lines.length -1) ? "\n" : "");
                }else{
                    content += "\n";
                    
                }
            }
            this.content = isEmpty(content) ? content : this.placeholder;
            this.source.setValue(content);
        }else{
            this.source.setValue(this.inputElement.value);
        }

        this.adaptViewBox();
        this.parent.updateSize();
    },

    /**Creates new line after pressing Enter key */
    addLine(currentSpan, currentInput){
        for(let i = 0; i < this.lines.length; i++){
            if(this.lines[i] === currentSpan){
                let lineValue = currentInput.value.length > currentInput.selectionStart ?
                currentInput.value.substring(currentInput.selectionStart) : "";

                if(lineValue !== "" && lineValue !== currentInput.value){
                    currentInput.value = currentInput.value.substring(0, currentInput.selectionStart);
                    this.setLineValue(currentSpan, currentInput);
                }

                if(currentInput.value === lineValue){
                    currentInput.value = "";
                    currentSpan.setAttribute("fill", "transparent");
                    currentSpan.textContent = "B";
                    currentInput.dataset.discard = true;
                }

                let {span, input} = this.createLine(lineValue);
                this.style(span);
                
                if(i < this.lines.length - 1){
                    this.textArea.insertBefore(span, this.lines[i + 1]);
                    this.lines.splice(i + 1, 0, span);
                }else{
                    this.lines.push(span);
                }
                this.createInputListeners(span, input);
                
                if(input.value.length === 0){
                    span.setAttribute("fill", "transparent");
                    span.textContent = "B";
                    input.value = "";
                    input.dataset.discard = true;
                }
                this.activeInput = input;
                input.focus();

                if(lineValue === ""){
                    this.displayCaretEmpty(span);
                }else{
                    this.displayCaret(0, span);
                }
                break;
            }
        }
        this.adaptViewBox();
    },

    /**Delete line */
    deleteLine(span, input){
        let index = 1;
        for(let i = 1; i < this.lines.length; i++){
            if(this.lines[i] === span){
                this.lines.splice(i, 1);
                index = i - 1;
                break;
            }
        }

        let targetInput = this.lineMapper.get(this.lines[index]);
        let curetIndex = targetInput.value.length;

        targetInput.value += input.value;

        input.parentNode.remove();
        span.remove();
        this.setLineValue(this.lines[index], targetInput);
        if(isEmpty(targetInput.value)){
            this.displayCaretEmpty(this.lines[index]);
        } else {
            this.displayCaret(curetIndex, this.lines[index]);
        }
    },

    /**Adapts SVG text to input value*/
    setLineValue(span, input){
        if(isEmpty(input.value)){
            this.setValue();
            return;
        }
         span.textContent = input.value;
         span.setAttribute("fill", "black");
         delete input.dataset.discard;

         this.setValue();
    },


    clickHandler(target){
        if(this.multiline && this.textArea.contains(target)){
            this.setActiveInput(target);
        }else{
            this.inputElement.focus();
        }
    },

    /**Gets input from span */
    setActiveInput(target){
        let input = this.lineMapper.get(target);
        input.focus();
        this.activeInput = input;
    },

    /**Test function */
    createCircleCursor(x, y){
        if(isNullOrUndefined(this.circle)){
            this.circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            this.circle.setAttribute("r", 4);
            this.circle.setAttribute("fill", "blue");
        }

        this.circle.setAttribute("cx", x);
        this.circle.setAttribute("cy", y);

        this.element.append(this.circle);
    },

    style(element) {
        const { font = "Segoe UI", size = 10, color = "black", weight = false } = this.schema.style;

        element.setAttribute("font-family", font);
        element.setAttribute("font-size", size);
        element.setAttribute("fill", color);
        element.setAttribute("font-weight", weight);
    },

    bindEvents(){
        this.projection.registerHandler("displayed", () => {
            if(!this.parent.displayed){
                return;
            }
            this.adaptViewBox();
        })
    }
    
}

export const SvgText = Object.assign({},
    Object.create(Field),
    BaseTextSVG
)