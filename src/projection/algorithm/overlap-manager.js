import { isNullOrUndefined, valOrDefault } from "zenkai";

const RowManager = function () {
    /**Supposing the order is right */

    for(let i = 0; i < this.content.length - 1; i++){

        let projection = this.content[i].container || this.content[i].element;
        
        const { discard = false} = projection.dataset;
        
        if(discard !== "absolute"){
            let w;

            if(!isNullOrUndefined(this.content[i].containerView)){
                w = this.content[i].containerView.targetW;
            }else{
                w = valOrDefault(Number(projection.getAttribute("width")), projection.getBBox().width)
            }
            
            let x = valOrDefault(Number(projection.getAttribute("x")), 0);

            let nextProjection = this.content[i + 1].container || this.content[i + 1].element;

            nextProjection.setAttribute("x", x + w + valOrDefault(this.overlap.spacing, 0));
        }
    }
}

const ColumnManager = function () {
    for(let i = 0; i < this.content.length - 1; i++){
        let stroke = valOrDefault(Number(this.adapter.element.getAttribute("stroke-width")), 0);
        let projection = this.content[i].container || this.content[i].element;

        let h;

        if(!isNullOrUndefined(this.content[i].containerView)){
            h = this.content[i].containerView.targetH - stroke;
        }else{
            h = valOrDefault(Number(projection.getAttribute("height")), projection.getBBox().height) - stroke;
        }

        let y = valOrDefault(Number(projection.getAttribute("y")), 0);
        let nextProjection = this.content[i + 1].container || this.content[i + 1].element;
        
        if(this.overlap.absolute){
            nextProjection.setAttribute("y", y + h + valOrDefault(this.overlap.spacing, 0));
        }else{
            nextProjection.setAttribute("y", Math.max(Number(nextProjection.getAttribute("y")), y + h + valOrDefault(this.overlap.spacing, 0)));
        }
        
    }
}

export const OverlapManager = {
    "row": RowManager,
    "column": ColumnManager
}

