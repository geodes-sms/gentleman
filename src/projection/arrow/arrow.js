import { isNullOrUndefined, valOrDefault } from "zenkai";

export const Arrow = {
    stylePath(style){
        const { stroke = "black", dasharray = null, width = 1, linecap = "butt", end = false, start = false } = style;

        this.path.style.stroke = stroke;

        if(!isNullOrUndefined(dasharray)){
            this.path.style["stroke-dasharray"] = dasharray;
        }

        this.path.style["stroke-width"] = valOrDefault(width, 5);

        this.path.style["stroke-linecap"] = linecap;

        if(end){
            this.createMarkerEnd();
        }
    },

    styleSubPath(style, sp){
        const { stroke = "black", dasharray = null, width = 1, linecap = "butt", end = false, start = false } = style;

        sp.style.stroke = stroke;

        if(!isNullOrUndefined(dasharray)){
            sp.style["stroke-dasharray"] = dasharray;
        }

        sp.style["stroke-width"] = valOrDefault(width, 5);

        sp.style["stroke-linecap"] = linecap;

        /*if(end){
            this.createMarkerEnd();
        }*/
    },

    createMarkerEnd(){
        if(isNullOrUndefined(this.definitions)){
            this.definitions = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        }

        this.end = document.createElementNS("http://www.w3.org/2000/svg", "marker");

        this.end.id = "marker" + this.id;

        this.end.setAttribute("refY", 5);
        this.end.setAttribute("refX", 10);
        this.end.setAttribute("markerUnit", "strokeWidth");
        this.end.setAttribute("markerWidth", 10);
        this.end.setAttribute("markerHeight", 10)
        this.end.setAttribute("orient", "auto");
        this.end.classList.add("end");

        let path = document.createElementNS("http://www.w3.org/2000/svg", "path");

        path.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
        path.setAttribute("fill", "black");

        this.end.appendChild(path);

        this.definitions.appendChild(this.end);

        this.path.setAttribute("marker-end", "url(#" + this.end.id + ")");
    },

    setPath(d){
        this.path.setAttribute("d", d);
    }
}