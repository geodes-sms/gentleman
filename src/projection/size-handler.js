import { isEmpty, isNullOrUndefined, valOrDefault } from "zenkai"

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

    return schema;
}

export const SizeHandler = {
    "circle": updateCircle,
    "rect": updateRect,
    "wrap": updateWrap,
}


function updateCircle(adapter){
    if(!isNullOrUndefined(this.animationFrame)){
        window.cancelAnimationFrame(this.animationFrame);
    }

    let contentBase = isNullOrUndefined(this.content[0].container) ? this.content[0].element : this.content[0].container;

    
    let minX = valOrDefault(Number(contentBase.getAttribute("x")), 0);
    let minY = valOrDefault(Number(contentBase.getAttribute("y")), 0);
    let maxX, maxY;

    if(!isNullOrUndefined(this.content[0].containerView)){
        maxX = minX + this.content[0].containerView.targetW;
        maxY = minY + this.content[0].containerView.targetH;
    }else{

        let box = (isNullOrUndefined(this.content[0].container) ? this.content[0].element : this.content[0].container).getBBox();
        maxX = minX + valOrDefault(Number(contentBase.getAttribute("width")), box.width);
        maxY = minY + valOrDefault(Number(contentBase.getAttribute("height")), box.height);
    }
 
    this.content.forEach((proj) => {
        let view = (isNullOrUndefined(proj.container) ? proj.element : proj.container);
        let box = view.getBBox();
        let boxX = valOrDefault(Number(view.getAttribute("x")), 0);
        let boxY = valOrDefault(Number(view.getAttribute("y")), 0);

        minX = Math.min(boxX, minX);
        minY = Math.min(boxY, minY);

        if(!isNullOrUndefined(proj.containerView)){
            maxX = Math.min(boxX + proj.containerView.targetW, maxX);
            maxY = Math.min(boxY + proj.containerView.targetH, maxY);
        }else{
            maxX = Math.max(valOrDefault(Number(view.getAttribute("width")), box.width) + boxX, maxX);
            maxY = Math.max(valOrDefault(Number(view.getAttribute("height")), box.height) + boxY, maxY);
        }

    })


    let center = {
        x: Number(adapter.element.getAttribute("cx")),
        y: Number(adapter.element.getAttribute("cy")),
        r: Number(adapter.element.getAttribute("r"))
    }

    let ptA = Math.sqrt(Math.pow(minX - center.x, 2) + Math.pow(minY - center.y, 2));
    let ptB = Math.sqrt(Math.pow(maxX - center.x, 2) + Math.pow(minY - center.y, 2));
    let ptC = Math.sqrt(Math.pow(maxX - center.x, 2) + Math.pow(maxY - center.y, 2));
    let ptD = Math.sqrt(Math.pow(minX - center.x, 2) + Math.pow(maxY - center.y, 2));

    let loner = Math.max(ptA, ptB, ptC, ptD);

    if(loner > center.r - this.padding){
        augmentCircle.call(this, loner, center.r, adapter);
        return;
    }

    if((loner + this.padding < center.r ) && (this.padding + loner > adapter.defaultRadius)){
        reduceCircle.call(this, loner, center.r, adapter);
        return;
    }

    if(center.r > adapter.defaultRadius){
        resetCircle.call(this, center.r, adapter);
        return;
    }

}

function resetCircle(radius, adapter){
    let stroke = valOrDefault(Number(adapter.element.getAttribute("stroke-width")) / 2, 0);
    let bbox = this.container.getBBox();

    if(isNullOrUndefined(this.containerView)){
        this.containerView = {
                x: 0,
                y: 0,
                w: (radius + valOrDefault(stroke, 0)) * 2 ,
                h: (radius + valOrDefault(stroke, 0)) * 2,
                radius: radius,
                defaultRadius: adapter.defaultRadius,
                targetX: 0,
                targetY: 0,
                targetW: (adapter.defaultRadius + stroke) * 2,
                targetH: (adapter.defaultRadius + stroke) * 2,
                bbox: {
                    x: bbox.x,
                    y: bbox.y,
                    w: bbox.width,
                    h: bbox.height
                }
        }
    }else{
        this.containerView.targetW = 2 *(adapter.defaultRadius + stroke);
        this.containerView.targetH = this.containerView.targetW;
        this.containerView.targetX = this.containerView.x + (radius - adapter.defaultRadius);
        this.containerView.targetX = this.containerView.y + (radius - adapter.defaultRadius);
    }

    const defaultView = {
        x: this.containerView.x,
        y: this.containerView.y,
        w: this.containerView.w,
        h: this.containerView.h,
        radius: this.containerView.radius,
    }
    
    let offSet = radius - adapter.defaultRadius;
    let startTime = 0;
    const totalTime = this.speed;
    const animateStep = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / totalTime;

        this.containerView.x = Math.min(0, defaultView.x + (offSet * progress));
        this.containerView.y = Math.min(0, defaultView.y + (offSet * progress));

        this.containerView.radius = Math.max(adapter.defaultRadius, defaultView.radius - (offSet * progress));
        this.containerView.h = 2 * (this.containerView.radius + stroke);
        this.containerView.w = 2 * (this.containerView.radius + stroke)

        this.container.setAttribute("viewBox", 
        ""  + this.containerView.x +
        " " + this.containerView.y +
        " " + this.containerView.w +
        " " + this.containerView.h 
        )

        this.container.setAttribute("width", this.containerView.w);
        this.container.setAttribute("height", this.containerView.h);

        this.width = this.containerView.w;
        this.height = this.containerView.h;
            
        adapter.element.setAttribute("r", this.containerView.radius);

        if(progress < 1){
            this.animationFrame = window.requestAnimationFrame(animateStep);
        }
    }
    this.animationFrame = window.requestAnimationFrame(animateStep)
}

function augmentCircle(point, radius, adapter){
    let stroke = Number(adapter.element.getAttribute("stroke-width"));


    const offSet = point - Math.max(radius, adapter.defaultRadius) + this.padding;

    if(isNullOrUndefined(this.containerView)){
        this.containerView = {
                x: 0,
                y: 0,
                w: (radius + valOrDefault(stroke, 0)) * 2 ,
                h: (radius + valOrDefault(stroke, 0)) * 2,
                radius: radius,
                defaultRadius: radius,
                targetX: 0 - offSet,
                targetY: 0 - offSet,
                targetW: (radius + offSet + stroke) * 2,
                targetH: (radius + offSet + stroke) * 2,
        }
    }else{
        this.containerView.targetW = 2 *(this.containerView.radius + offSet + stroke);
        this.containerView.targetH = this.containerView.targetW;
    }
    
    const defaultView = {
        x: this.containerView.x,
        y: this.containerView.y,
        w: this.containerView.w,
        h: this.containerView.h,
        radius: this.containerView.radius,
    }

    let startTime = 0;
    const totalTime = this.speed;
    const animateStep = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / totalTime;

        this.containerView.x = defaultView.x - (offSet * progress);
        this.containerView.y = defaultView.y - (offSet * progress);

        this.containerView.radius = defaultView.radius + (offSet * progress);
        this.containerView.h = 2 * (this.containerView.radius + stroke);
        this.containerView.w = 2 * (this.containerView.radius + stroke);

        this.container.setAttribute("viewBox", 
        ""  + this.containerView.x +
        " " + this.containerView.y +
        " " + this.containerView.w +
        " " + this.containerView.h 
        )

        this.container.setAttribute("width", this.containerView.w);
        this.container.setAttribute("height", this.containerView.h);

        this.width = this.containerView.w;
        this.height = this.containerView.h;
            
        adapter.element.setAttribute("r", this.containerView.radius);

        if(progress < 1){
            this.animationFrame = window.requestAnimationFrame(animateStep);
        }
    }

    this.animationFrame = window.requestAnimationFrame(animateStep);
}

function reduceCircle(point, radius, adapter){
    let stroke = valOrDefault(Number(adapter.element.getAttribute("stroke-width")) / 2, 0);

    const offSet = radius - (this.padding + point);

    if(isNullOrUndefined(this.containerView)){
        this.containerView = {
                x: 0,
                y: 0,
                w: (radius + valOrDefault(stroke, 0)) * 2 ,
                h: (radius + valOrDefault(stroke, 0)) * 2,
                radius: radius,
                defaultRadius: radius,
                targetX: 0 + offSet,
                targetY: 0 + offSet,
                targetW: (radius - offSet + stroke) * 2,
                targetH: (radius - offSet + stroke) * 2,
        }
    }else{
        this.containerView.targetW = 2 *(this.containerView.radius - offSet + stroke);
        this.containerView.targetH = this.containerView.targetW;
    }

    const defaultView = {
        x: this.containerView.x,
        y: this.containerView.y,
        w: this.containerView.w,
        h: this.containerView.h,
        radius: this.containerView.radius,
    }

    let startTime = 0;
    const totalTime = this.speed;
    const animateStep = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / totalTime;

        this.containerView.x = defaultView.x + (offSet * progress);
        this.containerView.y = defaultView.y + (offSet * progress);

        this.containerView.radius = defaultView.radius - (offSet * progress);
        this.containerView.h = 2 * (this.containerView.radius + stroke);
        this.containerView.w = 2 * (this.containerView.radius + stroke)

        this.container.setAttribute("viewBox", 
        ""  + this.containerView.x +
        " " + this.containerView.y +
        " " + this.containerView.w +
        " " + this.containerView.h 
        )

        this.container.setAttribute("width", this.containerView.w);
        this.container.setAttribute("height", this.containerView.h);

        this.width = this.containerView.w;
        this.height = this.containerView.h;
            
        adapter.element.setAttribute("r", this.containerView.radius);

        if(progress < 1){
            this.animationFrame = window.requestAnimationFrame(animateStep);
        }
    }

    this.animationFrame = window.requestAnimationFrame(animateStep);
}

/**TODO: First item can be discarded */
function updateRect(adapter){

    if(!isNullOrUndefined(this.animationFrame)){
        window.cancelAnimationFrame(this.animationFrame);
    }
    /**Half of the attribute for left and right offsets */
    let stroke = valOrDefault(Number(adapter.element.getAttribute("stroke-width")) / 2, 0);

    let minX, minY, maxX, maxY, box;
    let content = isNullOrUndefined(this.content[0].container) ? this.content[0].element : this.content[0].container;

    /**If has a container view, use it. If not, goes for svg attributes. Stroke not needed as it's gentleman structure, not background */
    if(!isNullOrUndefined(this.content[0].containerView)){
        minX = Number(content.getAttribute("x"));
        minY = Number(content.getAttribute("y"));
        maxX = minX + this.content[0].containerView.targetW;
        maxY = minY + this.content[0].containerView.targetH;
    }else{
        box = content.getBBox();

        minX = Number(content.getAttribute("x"));
        minY = Number(content.getAttribute("y"));
        maxX = minX + valOrDefault(Number(content.getAttribute("width")), box.width);
        maxY = minY + valOrDefault(Number(content.getAttribute("height")), box.height);
    }



    /**Check all content except dicarded projections. No stroke needed */
    this.content.forEach((proj) => {
        content = isNullOrUndefined(proj.container) ? proj.element : proj.container;

        const { discard = false } = content.dataset;

        if(discard === "absolute"){
            return;
        }

        if(!isNullOrUndefined(proj.containerView)){
            minX = Math.min(Number(content.getAttribute("x"), minX));
            minY = Math.min(Number(content.getAttribute("y")), minY);
            if(discard !== "meetW" && discard !== "meet"){
                maxX = Math.max(Number(content.getAttribute("x")) + proj.containerView.targetW, maxX);
            }
            if(discard !== "meetH" && discard !== "meet"){
                maxY = Math.max(Number(content.getAttribute("y")) + proj.containerView.targetH, maxY);
            }
        }else{
            box = content.getBBox();

            minX = Math.min(minX, Number(content.getAttribute("x")));
            minY = Math.min(Number(content.getAttribute("y")), minY);
            maxX = Math.max(Number(content.getAttribute("x")) + valOrDefault(Number(content.getAttribute("width")), box.width), maxX);
            maxY = Math.max(maxY, Number(content.getAttribute("y")) + valOrDefault(Number(content.getAttribute("height")), box.height));
        }

    })

    /**Place of the adapter in the viewBox */
    let rect = {
        x: valOrDefault(Number(adapter.element.getAttribute("x")), 0) - stroke,
        y: valOrDefault(Number(adapter.element.getAttribute("y")), 0) - stroke,
        w: valOrDefault(Number(adapter.element.getAttribute("width")) + stroke + valOrDefault(Number(adapter.element.getAttribute("x")), 0), 0),
        h: valOrDefault(Number(adapter.element.getAttribute("height")) + stroke + valOrDefault(Number(adapter.element.getAttribute("x")), 0), 0),
    }

    /**ViewBox, declared by the layout. Self designed viewBox not usable yet */
    if(isNullOrUndefined(this.containerView)){
        this.containerView = {
            x: rect.x,
            y: rect.y,
            w: rect.w,
            h: rect.h,
            defaultX: rect.x,
            defaultY: rect.y,
            defaultW: rect.x + rect.w,
            defaultH: rect.y + rect.h,
        }
    }

    /**Differences between each point and the adapter. Takes strokes in account */
    const offsets = {
        xOff: calcOffX(minX, rect.x, this.padding, this.containerView.defaultX),
        yOff: calcOffY(minY, rect.y, this.padding, this.containerView.defaultY),
        wOff: calcOffW(maxX, rect.w, this.padding, this.containerView.defaultW),
        hOff: calcOffH(maxY, rect.h, this.padding, this.containerView.defaultH),
    };

    adaptRect.call(this, offsets, adapter, stroke)
}

function adaptRect(offsets, adapter, stroke){

    /**Default viewBox */
    const defaultView = {
        x: this.containerView.x,
        y: this.containerView.y,
        w: this.containerView.w,
        h: this.containerView.h,
    }

    this.containerView.targetW = Math.max(this.containerView.defaultW, defaultView.w + (-offsets.xOff + offsets.wOff));
    this.containerView.targetH = Math.max(this.containerView.defaultH, defaultView.h + (-offsets.yOff + offsets.hOff));
    this.containerView.targetX = Math.min(this.containerView.defaultX, defaultView.x + (offsets.xOff));
    this.containerView.targetY = Math.min(this.containerView.defaultY, defaultView.y + (offsets.yOff));

    this.container.dataset.contentWidth = this.containerView.targetW;
    this.container.dataset.contentHeight = this.containerView.targetH;


    let startTime = 0;
    const totalTime = this.speed;


    const animateStep = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / totalTime;


        this.containerView.x = Math.min(0, defaultView.x + (offsets.xOff * progress));
        this.containerView.y = Math.min(0, defaultView.y + (offsets.yOff * progress));
        this.containerView.w = Math.max(this.containerView.defaultW, defaultView.w + (-offsets.xOff + offsets.wOff) * progress);
        this.containerView.h = Math.max(this.containerView.defaultH, defaultView.h + (-offsets.yOff + offsets.hOff) * progress);
        
        this.container.setAttribute("viewBox", 
        ""  + this.containerView.x +
        " " + this.containerView.y +
        " " + this.containerView.w +
        " " + this.containerView.h 
        )

        this.container.setAttribute("width", this.containerView.w);
        this.container.setAttribute("height", this.containerView.h);
        
        this.width = this.containerView.w;
        this.height = this.containerView.h;

        /**Add stroke back to element */
        adapter.element.setAttribute("x", this.containerView.x + stroke);
        adapter.element.setAttribute("y", this.containerView.y + stroke);
        adapter.element.setAttribute("width", this.containerView.w - 2 * stroke);
        adapter.element.setAttribute("height", this.containerView.h - 2 * stroke);
        
        if(progress < 1){
            this.animationFrame = window.requestAnimationFrame(animateStep);
        }else{
            this.containerView.x = this.containerView.targetX;
            this.containerView.y = this.containerView.targetY;
            this.containerView.w = this.containerView.targetW;
            this.containerView.h = this.containerView.targetH;

            this.container.setAttribute("viewBox", 
            ""  + this.containerView.x +
            " " + this.containerView.y +
            " " + this.containerView.w +
            " " + this.containerView.h 
            )

            this.container.setAttribute("width", this.containerView.w);
            this.container.setAttribute("height", this.containerView.h);
            
            this.width = this.containerView.w;
            this.height = this.containerView.h;

            /**Add stroke back to element */
            adapter.element.setAttribute("x", this.containerView.x + stroke);
            adapter.element.setAttribute("y", this.containerView.y + stroke);
            adapter.element.setAttribute("width", this.containerView.w - 2 * stroke);
            adapter.element.setAttribute("height", this.containerView.h - 2 * stroke);
        }
    }

    this.animationFrame = window.requestAnimationFrame(animateStep);
}


function updateWrap() {
    if(!isNullOrUndefined(this.animationFrame)){
        window.cancelAnimationFrame(this.animationFrame);
    }

    if(isNullOrUndefined(this.containerView)){
        this.containerView = {
            x: 0,
            y: 0,
            w: 0,
            h: 0
        }
    }

    const defaultView = {
        x: this.containerView.x,
        y: this.containerView.y,
        w: this.containerView.w,
        h: this.containerView.h
    }

    let minX, minY, maxX, maxY;

    let content = this.content[0].container || this.content[0].element;
    let box = content.getBBox();
    minX = valOrDefault(Number(content.getAttribute("x")), 0);
    minY = valOrDefault(Number(content.getAttribute("y")), 0);

    let projection = this.projection.resolveElement(content);

    if(!isNullOrUndefined(projection.containerView)){
        maxX = minX + projection.containerView.targetW;
        maxY = minY + projection.containerView.targetH;
    }else{
        maxX = minX + valOrDefault(Number(content.getAttribute("width")), 0);
        maxY = minY + valOrDefault(Number(content.getAttribute("height")), 0);
    }

    for(let i = 1; i < this.content.length; i++){
        content = this.content[i].container || this.content[i].element;
        box = content.getBBox();

        let x = valOrDefault(Number(content.getAttribute("x")), 0);
        let y = valOrDefault(Number(content.getAttribute("y")), 0)

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);

        projection = this.projection.resolveElement(content);

        if(!isNullOrUndefined(projection.containerView)){
            maxX = Math.max(maxX, x + projection.containerView.targetW);
            maxY = Math.max(maxY, y + projection.containerView.targetH);
        }else{
            maxX = Math.max(maxX, x + valOrDefault(Number(content.getAttribute("width")), 0));
            maxY = Math.max(maxY, y + valOrDefault(Number(content.getAttribute("height")), 0));
        }
    }

    const offSet = {
        x: this.containerView.x - minX,
        y: this.containerView.y - minY,
        w: this.containerView.w - maxX,
        h: this.containerView.h - maxY
    }

    this.containerView.targetX = minX;
    this.containerView.targetY = minY;
    this.containerView.targetW = maxX;
    this.containerView.targetH = maxY;

    let startTime = 0;
    const totalTime = this.speed;

    const animateStep = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / totalTime;


        this.containerView.x = defaultView.x - (offSet.x * progress);
        this.containerView.y = defaultView.y - (offSet.y * progress);
        this.containerView.w = defaultView.w - (offSet.w * progress);
        this.containerView.h = defaultView.h - (offSet.h * progress);

        this.container.setAttribute("viewBox",
            this.containerView.x + " " +
            this.containerView.y + " " +
            this.containerView.w + " " +
            this.containerView.h + " "
        );

        this.container.setAttribute("width", this.containerView.w);
        this.container.setAttribute("height", this.containerView.h);

        if(progress < 1){
            this.animationFrame = window.requestAnimationFrame(animateStep);
        }
    }
    this.animationFrame = window.requestAnimationFrame(animateStep);
}

export const MeetHandler = {
    "rect": meetRect,
    /*"circle": meetCircle*/
}

function meetRect(adapter){
    if(!isNullOrUndefined(this.animationFrame)){
        window.cancelAnimationFrame(this.animationFrame);
    }

    let stroke = valOrDefault(Number(adapter.element.getAttribute("stroke-width")) / 2, 0);

    /*let rectMeet = {
        x: valOrDefault(Number(this.container.getAttribute("x")), 0),
        y: valOrDefault(Number(this.container.getAttribute("y")), 0),
        w: valOrDefault(Number(this.container.getAttribute("width")), 0),
        h: valOrDefault(Number(this.container.getAttribute("height")), 0),
    }*/
    let rectMeet = {
        x: valOrDefault(Number(this.container.getAttribute("x")), 0),
        y: valOrDefault(Number(this.container.getAttribute("y")), 0),
        w: !isNullOrUndefined(this.containerView)? this.containerView.targetW : valOrDefault(Number(this.container.getAttribute("width")), 0),
        h: !isNullOrUndefined(this.containerView)? this.containerView.targetH : valOrDefault(Number(this.container.getAttribute("height")), 0),
    }

    let rect = {
        x: valOrDefault(Number(adapter.element.getAttribute("x")) - stroke, 0),
        y: valOrDefault(Number(adapter.element.getAttribute("y")) - stroke, 0),
        w: valOrDefault(Number(adapter.element.getAttribute("width")) + stroke, 0) + valOrDefault(Number(adapter.element.getAttribute("x")), 0),
        h: valOrDefault(Number(adapter.element.getAttribute("height")) + stroke, 0) + valOrDefault(Number(adapter.element.getAttribute("y")), 0)
    }

    if(isNullOrUndefined(this.containerView)){
        this.containerView = {
            x: rect.x,
            y: rect.y,
            w: rect.w,
            h: rect.h,
            defaultX: rect.x,
            defaultY: rect.y,
            defaultW: rect.w,
            defaultH: rect.h,
            targetX: rect.x,
            targetY: rect.y,
            targetW: rect.w,
            targetH: rect.h
        }
    }

    let targetW, targetH, targetX, targetY;

    if(!isNullOrUndefined(this.parent.containerView)){
        targetW = this.parent.containerView.targetW;
        targetH = this.parent.containerView.targetH;
        targetX = this.parent.containerView.targetX;
        targetY = this.parent.containerView.targetY;
    }else{
        targetW = Number(this.parent.container.getAttribute("width"));
        targetH = Number(this.parent.container.getAttribute("height"));
        targetX = this.parent.getBBox().x;
        targetY = this.parent.getBBox().y;
    }

    const targets = {
        targetW: rectMeet.w,
        targetH: rectMeet.h,
        targetX: rectMeet.x,
        targetY: rectMeet.y
    }

    if(this.meet === "meetW" || this.meet === "meet"){
        targets.targetW = Math.max(this.containerView.defaultW, targetW);
        targets.targetX = Math.min(targets.targetX, targetX);
    }

    if(this.meet === "meetH" || this.meet === "meet"){
        targets.targetH = Math.max(this.containerView.defaultH, targetH);
        targets.targetY = Math.min(targets.targetY, targetY)
    }

    const defaultView = {
        x: this.containerView.x,
        y: this.containerView.y,
        boxX: rectMeet.x,
        boxY: rectMeet.y,
        w: this.containerView.w,
        h: this.containerView.h,
    };

    const offSet = {
        xOff: this.containerView.targetX - this.containerView.x,
        yOff: this.containerView.targetY - this.containerView.y,
        boxXoff: targets.targetX - defaultView.x,
        boxYoff: targets.targetY - defaultView.y,
        wOff: targets.targetW - defaultView.w,
        hOff: targets.targetH - defaultView.h,
    }

    this.containerView.targetW = targets.targetW;
    this.containerView.targetH = targets.targetH;

    const {contentWidth, contentHeight} = this.container.dataset;


    if(Number(contentWidth) < targets.targetW || Number(contentHeight) < targets.targetH){
        this.container.dataset.discard = this.meet;
    }else{

        delete this.container.dataset.discard;
    }

    let startTime = 0;
    const totalTime = this.speed;

    const animateStep = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = (timestamp - startTime) / totalTime;
        
        this.containerView.w = defaultView.w + (offSet.wOff * progress);
        this.containerView.h = defaultView.h + (offSet.hOff * progress);
        this.containerView.x = defaultView.x + (offSet.xOff * progress);
        this.containerView.y = defaultView.y + (offSet.yOff * progress);

        let currentX = defaultView.boxX + (offSet.boxXoff * progress);
        let currentY = defaultView.boxY + (offSet.boxYoff * progress);

        this.container.setAttribute("viewBox",
            this.containerView.x + " " +
            this.containerView.y + " " +
            this.containerView.w + " " +
            this.containerView.h + " "
        );

        this.container.setAttribute("width", this.containerView.w);
        this.container.setAttribute("height", this.containerView.h);
        this.container.setAttribute("x", currentX);
        this.container.setAttribute("y", currentY); 

        adapter.element.setAttribute("width", this.containerView.w - 2 * stroke);
        adapter.element.setAttribute("height", this.containerView.h - 2 * stroke);
        adapter.element.setAttribute("x", this.containerView.x + stroke);
        adapter.element.setAttribute("y", this.containerView.y + stroke)

        if(progress < 1){
            this.animationFrame = window.requestAnimationFrame(animateStep);
        }else{
            this.containerView.w = this.containerView.targetW;
            this.containerView.h = this.containerView.targetH;
            this.containerView.x = this.containerView.targetX;
            this.containerView.y = this.containerView.targetY;

            this.container.setAttribute("viewBox",
                this.containerView.targetX + " " +
                this.containerView.targetY + " " +
                this.containerView.w + " " +
                this.containerView.h + " "
            );

            this.container.setAttribute("width", this.containerView.w);
            this.container.setAttribute("height", this.containerView.h);
            this.container.setAttribute("x", targets.targetX);
            this.container.setAttribute("y", targets.targetY);


            adapter.element.setAttribute("width", this.containerView.w - 2 * stroke);
            adapter.element.setAttribute("height", this.containerView.h - 2 * stroke);
            adapter.element.setAttribute("x", this.containerView.targetX + stroke);
            adapter.element.setAttribute("y", this.containerView.targetY + stroke);

        }
    }
    this.animationFrame = window.requestAnimationFrame(animateStep);
}

function calcOffX(minX, x, padding, defaultX){

    if(minX - padding < defaultX){
        return  minX - x - padding;
    }

    if(x < defaultX){
        return defaultX - x;
    }

    return 0;
}

function calcOffY(minY, y, padding, defaultY){
    if(minY - padding < defaultY){
        return minY - y  - padding
    }

    if(y < defaultY){
        return defaultY - y;
    }

    return 0;
}

function calcOffW(maxX, width, padding, defaultW){

    if(maxX + padding > defaultW){
        return maxX + padding - width;
    }

    if(width > defaultW){
        return defaultW - width;
    }

    return 0;
}

function calcOffH(maxY, height, padding, defaultH){
    
    if(maxY + padding > defaultH){
        return maxY + padding - height;
    }

    if(height > defaultH){
        return defaultH - height;
    }

    return 0;
}