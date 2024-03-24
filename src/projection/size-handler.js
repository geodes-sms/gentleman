import { isEmpty, isNull, isNullOrUndefined, valOrDefault } from "zenkai"

export const SizeSchema = {
    "circle": createCircleSchema,
    "rect": createRectSchema,
}

function createCircleSchema(adapter){
    const schema = {};

    schema.tagName = "circle";
    schema.defaultRadius = Number(adapter.getAttribute("r"));
    schema.element = adapter;

    return schema;
}

function createRectSchema(adapter){
    const schema = {};

    schema.tagName = "rect";
    schema.defaultWidth = Number(adapter.getAttribute("width"));
    schema.defaultHeight = Number(adapter.getAttribute("height"));
    schema.element = adapter;
    schema.stroke = valOrDefault(Number(adapter.getAttribute("stroke-width")), 0) / 2;

    return schema;
}


export const SizeHandler = {
    //"circle": updateCircle,
    "rect": updateRect,
    "wrap": updateWrap/*,
    "wrap": updateWrap,*/
}

function updateRect() {

    if(!isNullOrUndefined(this.animationFrame)) {
        window.cancelAnimationFrame(this.animationFrame);
    }

    if(isNullOrUndefined(this.containerView)) {
        this.containerView = initContainerView(this);
    }

    const extremums = generateExtremums.call(this);

    const { stroke } = this.adapter;

    this.containerView.targetX = Math.min(this.containerView.defaultX, extremums.minX) - stroke;
    this.containerView.targetY = Math.min(this.containerView.defaultY, extremums.minY) - stroke;
    this.containerView.targetW = Math.max(this.containerView.defaultW, extremums.maxX) + stroke;
    this.containerView.targetH = Math.max(this.containerView.defaultH, extremums.maxY) + stroke;

    createFrame.call(this);
}

function updateWrap() {
    if(!isNullOrUndefined(this.animationFrame)) {
        window.cancelAnimationFrame(this.animationFrame);
    }

    if (isNullOrUndefined(this.containerView)) {
        this.containerView = initContainerView(this);
    }

    const extremums = generateExtremums.call(this);

    this.containerView.targetX = Math.min(0, extremums.minX);
    this.containerView.targetY = Math.min(0, extremums.minY);
    this.containerView.targetW = extremums.maxX;
    this.containerView.targetH = extremums.maxY;

    createFrame.call(this);
}
 
function generateExtremums() {
    let item = this.content[0].container || this.content[0].element;

    let box = getBox(item, this.content[0]);
    const padding = valOrDefault(this.padding, 0);

    const extremums = {
        minX: box.x - padding,
        minY: box.y - padding,
        maxX: box.w + box.x + padding * 2,
        maxY: box.h + box.y + padding * 2
    }

    for(let i = 1; i < this.content.length; i++) {
        item = this.content[i].container || this.content[i].element;
        box = getBox(item, this.content[i]);

        extremums.minX = Math.min(box.x - padding, extremums.minX) ;
        extremums.minY = Math.min(box.y - padding, extremums.minY);
        extremums.maxX = Math.max(box.w + box.x + padding, extremums.maxX);
        extremums.maxY = Math.max(box.h + box.y + padding, extremums.maxY);    
    }

    return extremums;

}

function getBox(item, projection) {
    const res = {};

    let box = item.getBBox();
    
    const x = valOrDefault(Number(item.getAttribute("x")), 0);
    const y = valOrDefault(Number(item.getAttribute("y")), 0);
    const w = valOrDefault(Number(item.getAttribute("width")), box.width);
    const h = valOrDefault(Number(item.getAttribute("height")), box.height);

    const stroke = valOrDefault(Number(item.getAttribute("stroke-width")), 0) / 2;

    res.x = x - stroke;
    res.y = y - stroke;

    if(!isNullOrUndefined(projection.containerView)) {
        res.w = projection.containerView.targetW + stroke;
        res.h = projection.containerView.targetH + stroke;
    } else {
        res.w = w + stroke;
        res.h = h + stroke;
    }

    return res;
}

function initContainerView(projection) {
    let viewBox = projection.container.viewBox.baseVal;
    let box = projection.container.getBBox();

    const width = Number(projection.container.getAttribute("width"));
    const height = Number(projection.container.getAttribute("height"));

    return { 
        x: viewBox.x,
        y: viewBox.y,
        w: valOrDefault(width, box.width),
        h: valOrDefault(height, box.height),
        defaultX: viewBox.x,
        defaultY: viewBox.y,
        defaultW: valOrDefault(width, box.width),
        defaultH: valOrDefault(height, box.height)
    }
}

const FrameCreator = {
    "rect": rectFraming,
    "wrap": wrapFraming
}

function createFrame() {
    const current = {
        x: this.containerView.x,
        y: this.containerView.y,
        w: this.containerView.w,
        h: this.containerView.h
    };

    const offsets = {
        x: this.containerView.targetX - this.containerView.x,
        y: this.containerView.targetY - this.containerView.y,
        w: this.containerView.targetW - this.containerView.w,
        h: this.containerView.targetH - this.containerView.h
    };
    
    let startTime = 0;
    const totalTime = this.speed;

    const update = (progress) => {
        FrameCreator[this.adapter.tagName].call(this, current, offsets, progress);
    }

    const animateStep = (timestamp) => {
        if(!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / totalTime;
        
        if(progress < 1) {
            update(progress);
            this.animationFrame = window.requestAnimationFrame(animateStep);
        } else {
            update(1);
        }        
    }

    this.animationFrame = window.requestAnimationFrame(animateStep);
}

function rectFraming(current, offsets, progress) {
    const { stroke } = this.adapter;

    this.containerView.x = current.x + (offsets.x * progress);
    this.containerView.y = current.y + (offsets.y * progress);
    this.containerView.w = current.w + (offsets.w * progress);
    this.containerView.h = current.h + (offsets.h * progress);

    this.container.setAttribute("width", this.containerView.w);
    this.container.setAttribute("height", this.containerView.h);

    this.container.setAttribute("viewBox", 
        this.containerView.x + " " +
        this.containerView.y + " " +
        this.containerView.w + " " +
        this.containerView.h
    )

    this.adapter.element.setAttribute("x", this.containerView.x + stroke);
    this.adapter.element.setAttribute("y", this.containerView.y + stroke);
    this.adapter.element.setAttribute("width", this.containerView.w - stroke * 2);
    this.adapter.element.setAttribute("height", this.containerView.h - stroke * 2);
}

function wrapFraming(current, offsets, progress) {

    this.containerView.x = current.x + (offsets.x * progress);
    this.containerView.y = current.y + (offsets.y * progress);
    this.containerView.w = current.w + (offsets.w * progress);
    this.containerView.h = current.h + (offsets.h * progress);

    this.container.setAttribute("width", this.containerView.w);
    this.container.setAttribute("height", this.containerView.h);

    this.container.setAttribute("viewBox", 
        this.containerView.x + " " +
        this.containerView.y + " " +
        this.containerView.w + " " +
        this.containerView.h
    )
}



export const MeetHandler = {}