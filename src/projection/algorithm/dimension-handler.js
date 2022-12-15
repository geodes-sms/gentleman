
export const DimensionHandler = {

    createHolder(item){
        let holder = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        let foreign = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");

        holder.append(foreign);
        foreign.append(item);

        return holder;
    },

    analysePos(render, schema){
        let positions = schema.coordinates;

        const res = {};
        res.type = positions.type;
        res.render = render;

        switch(positions.type){
            case "delegate":
                res.await = false;
                break;
            default:
                res.anchor = positions.anchor;
                res.x = positions.x;
                res.y = positions.y;
                res.await = true;
                break;
        }

        return res;
    },

    positionElement(schema, render){
        switch(schema.anchor){
            case "middle":
                render.setAttribute("x", schema.x - Number(render.getAttribute("width"))/ 2);
                render.setAttribute("y", schema.y);
                return;
            case "right":
                render.setAttribute("x", schema.x - Number(render.getAttribute("width")));
                render.setAttribute("y", schema.y);
                return;
            case "center":
                render.setAttribute("x", schema.x - Number(render.getAttribute("width")) / 2);
                render.setAttribute("y", schema.x - Number(render.getAttribute("height"))/ 2);
                return;
            default:6
                render.setAttribute("x", schema.x);
                render.setAttribute("y", schema.y);
        }
    },

    analyseDim(render, schema){
        let dimensions = schema.dimension;

        const res = {};
        res.type = dimensions.type;
        res.item = render;
        switch(dimensions.type){
            case "fixed":
                res.value = dimensions.value;
                res.holder = this.createHolder(render);
                res.await = true;
                break;
            case "absolute":
                res.width = dimensions.width;
                res.height = dimensions.height;
                res.holder = this.createHolder(render);
                res.await = true;
                break;
            case "ratio":
                res.ratio = dimensions.ratio;
                res.holder = this.createHolder(render);
                res.await = true;
                break;
            case "pure":
                res.await = false;
                break;           
        }
        return res;
    },

    setDimensions(schema){
        switch(schema.type){
            case "fixed":
                this.adaptFixed(schema.item, schema.value);
                break;
            case "absolute":
                this.adaptAbsolute(schema.item, schema.width, schema.height);
                break;
            case "ratio":
                this.adaptRatio(schema.item, schema.ratio);
        }
    },

    adaptFixed(item, width){

        let foreign = item.parentNode;
        let holder = foreign.parentNode;

        let box = item.getBoundingClientRect();

        foreign.setAttribute("width", box.width);
        foreign.setAttribute("height", box.height);

        holder.setAttribute("width", width);
        holder.setAttribute("height", width * box.height / box.width);
        holder.setAttribute("viewBox", "0 0 " + box.width + " " + box.height);
    },

    adaptAbsolute(item, width, height){
        let foreign = item.parentNode;
        let holder = foreign.parentNode;

        foreign.setAttribute("width", width);
        foreign.setAttribute("height", height);

        holder.setAttribute("width", width);
        holder.setAttribute("height", height);
    },

    adaptRatio(item, ratio){
        let width = Number(item.getAttribute("width"));
        let height = Number(item.getAttribute("height"));

        let foreign = item.parentNode;
        let holder = foreign.parentNode;

        foreign.setAttribute("width", width);
        foreign.setAttribute("height", height);
    
        holder.setAttribute("width", width * ratio);
        holder.setAttribute("height", height * ratio);
        holder.setAttribute("viewBox", "0 0 " + width + " " + height);
        
    }
}