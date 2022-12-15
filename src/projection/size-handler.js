import { isNullOrUndefined, valOrDefault } from "zenkai"

export const SizeHandler = {
    "circle": updateCircle,
}


function updateCircle(adapter){
    let contentBase = this.content[0].element;

    let box = contentBase.getBBox();

    let minX = box.x;
    let minY = box.y;
    let maxX = box.x + box.width;
    let maxY = box.y + box.height;

    this.content.forEach((proj) => {
        box = proj.element.getBBox();

        minX = Math.min(box.x, minX);
        minY = Math.min(box.y, minY);
        maxX = Math.max(box.x + box.width, maxX);
        maxY = Math.max(box.y + box.height, maxY);
    })

    let center = {
        x: Number(adapter.getAttribute("cx")),
        y: Number(adapter.getAttribute("cy")),
        r: Number(adapter.getAttribute("r"))
    }

    let ptA = Math.sqrt(Math.pow(minX - center.x, 2) + Math.pow(minY - center.y, 2));
    let ptB = Math.sqrt(Math.pow(maxX - center.x, 2) + Math.pow(minY - center.y, 2));
    let ptC = Math.sqrt(Math.pow(maxX - center.x, 2) + Math.pow(maxY - center.y, 2));
    let ptD = Math.sqrt(Math.pow(minX - center.x, 2) + Math.pow(maxY - center.y, 2));

    let loner = Math.max(ptA, ptB, ptC, ptD);


    if(loner > center.r - 10){
        adaptCircle.call(this, loner, center.r, adapter)
    }
}

function adaptCircle(point, radius, adapter){
    let stroke = Number(adapter.getAttribute("stroke-width"));

    if(isNullOrUndefined(this.containerView)){
        this.containerView = {
                x: 0,
                y: 0,
                w: (radius + valOrDefault(stroke, 0)) * 2 ,
                h: (radius + valOrDefault(stroke, 0)) * 2,
                radius: radius,
                defaultRadius: radius
        }
    }

    let offSet = Math.max(radius, point) - Math.min(radius, point) + 5;

    this.containerView.x -= offSet;
    this.containerView.y -= offSet;

    this.containerView.radius += offSet;
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
    
    adapter.setAttribute("r", this.containerView.radius);

}


