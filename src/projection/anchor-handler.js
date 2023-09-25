import { isNull, isNullOrUndefined, no } from "zenkai";

export const AnchorHandler = {

    models: null,

    init(){
        this.models = new Map();
    },

    create(projection, infos){
        if(isNullOrUndefined(this.models)){
            this.init();
        }

        if(isNullOrUndefined(this.models.get(infos.id))){
            this.createModel(infos.id, infos.rtag, projection);
        }else{
            this.register(infos.id, infos.rtag, projection)
        }

        return this.models.get(infos.id);
    },

    createModel(id, rtag, proj){
        const referee = proj.projection.environment.getActiveReceiver(rtag);

        let items = [];
        
        for(let i = 0; i < referee.items.length; i++){
            if(referee.items[i].render.contains(proj.container)){
                items.push({id: proj.id, pId: referee.items[i].render.dataset.id, holder: referee.items[i].render, elem: proj})
                this.models.set(id, {items: items, index: 0});
                return;
            }          
           
        }
    },

    register(id, rtag, proj){
        let model = this.models.get(id);

        const referee = proj.projection.environment.getActiveReceiver(rtag);

        for(let i = 0; i < referee.items.length; i++){
            if(referee.items[i].render.contains(proj.container)){
                model.items.push({id: proj.id, pId: referee.items[i].render.dataset.id, holder: referee.items[i].render, elem: proj})
                break;
            }         
        }

        for(let j = 0; j < model.index; j++){
            proj.nextAnchor(false);
        }
    },

    nextAnchor(id, projId){
        let model = this.models.get(id);

        for(let i = 0; i < model.items.length; i++){
            let item = model.items[i];

            if(item.id !== projId){
                item.elem.nextAnchor(false);
            }
        }

        model.index++;
    },

    findSource(id, render){
        const items = this.models.get(id).items;

        const res = {}

        let i, j;
        for(i = 0; i < items.length; i++){
            const proj = items[i].elem;
            const projItems = proj.items;

            if(!isNullOrUndefined(projItems)){
                for(j = 0; j < projItems.length; j++){
                    if(projItems[j].render.contains(render)){
                        res.x = Number(projItems[j].render.getAttribute("x")) + Number(items[i].holder.getAttribute("x")) + Number((proj.container || proj.element).getAttribute("x"));
                        res.y = Number(projItems[j].render.getAttribute("y")) + Number(items[i].holder.getAttribute("y")) + Number((proj.container || proj.element).getAttribute("y"));
                        res.calc ={
                            projItems: {
                                x: Number(projItems[j].render.getAttribute("x")),
                                y: Number(projItems[j].render.getAttribute("y"))
                            },
                            holder: items[i].holder,
                            proj: proj
                        }
                        break;
                    }
                }
            }
            
            if(!isNullOrUndefined(res.x)){
                break;
            };
        }

        let anchor = items[i].elem.anchors.indexes;
        const targetX =  Number(items[i].elem.items[j].render.getAttribute("x"));
        const targetY =  Number(items[i].elem.items[j].render.getAttribute("y"));

        for(let k = 0; k < anchor.length; k++){
            if(anchor[k].x === targetX && anchor[k].y === targetY){
                res.index = k;
                return res;
            }
        }
    },

    unregister(id, proj){
        let listeners = this.models.get(id).listeners;

        for(let i = 0; i < listeners.length; i++){
            if(listeners[i] === proj){
                listeners.splice(i, 1);
                return;
            }
        }
    },

    createSubModel(id, element){
        let model = this.models.get(id);

        if(isNullOrUndefined(model.subModels)){
            model.subModels = []
        }

        model.subModels.push({elem: element, size: 1});
    },

    registerSubModel(id, algo, elem){
        let model = this.models.get(id);
        let sb;

        for(let i = 0; i < model.subModels.length; i++){
            if(model.subModels[i].elem === algo){
                sb = model.subModels[i];
            }
        }

        if(isNullOrUndefined(sb.start)){
            sb.start = this.estimateStart(model, sb.elem)
        }

        const items = model.items;
        let anchorIndex;

        for(let i = 0; i < items.length; i++){
            const proj = items[i].elem;
            const projItems = proj.items;

            if(!isNullOrUndefined(proj.items)){
                for(let j = 0; j < projItems.length; j++){
                    if(projItems[j].render.contains(elem.container || elem.element)){
                        anchorIndex = {};
                        anchorIndex.j = j;
                        anchorIndex.index = projItems[j].index;
                        break;
                    }
                }
    
                if(!isNullOrUndefined(anchorIndex)){
                    anchorIndex.i = i;
                    break;
                }
            }
            
        }

        if(anchorIndex.index > sb.start + sb.size){
            const target = items[anchorIndex.i].elem.moveElemToAnchor(sb.start + sb.size, anchorIndex.j);
            items.forEach(item => {
                item.elem.increaseAnchors(sb.start + sb.size, anchorIndex.index, target, model.forbiden);
            })
        }else if(anchorIndex.index < sb.start + sb.size){
            const target = items[anchorIndex.i].elem.moveElemToAnchor(sb.start + sb.size - 1, anchorIndex.j);
            items.forEach(item => {
                item.elem.decreaseAnchors(anchorIndex.index, sb.start + sb.size, target, model.forbiden);
            })
            sb.start--;
        }

        sb.elem.increaseSize();


        sb.size++;
        
        if(!isNullOrUndefined(model.listeners)){
            model.listeners.forEach(l => {
                l.updateValue();
            })
        }
    },

    estimateStart(model, sb){
        const items = model.items;

        for(let i = 0; i < items.length; i++){
            const proj = items[i].elem;
            const projItems = proj.items;
            
            for(let j = 0; j < projItems.length; j++){
                if(projItems[j].render.contains(sb.container)){
                    return j;
                }
            }

        }
    },

    findTarget(id, target, j){
        const items = this.models.get(id).items;

        for(let i = 0; i < items.length; i++){
            const proj = items[i].elem;
            const holder = items[i].holder;
            const projItems = proj.anchors.indexes;

            if(holder.dataset.concept === target){
                return { 
                    x: projItems[j].x + Number(holder.getAttribute("x")) + Number((proj.container || proj.element).getAttribute("x")),
                    y: projItems[j].y + Number(holder.getAttribute("y")) + Number((proj.container || proj.element).getAttribute("y")),
                    calc:{
                        projItems: projItems[j],
                        holder: holder,
                        proj: proj,
                    }
                }
            }
        }
    },

    estimatePositionCondamn(id, render){
        const model = this.models.get(id)
        const items = model.items;
        for(let i = 0; i < items.length; i++){
            const proj = items[i].elem;
            const projItems = proj.items;

            if(!isNullOrUndefined(projItems)){
                for(let j = 0; j < projItems.length; j++){
                    if(projItems[j].render.contains(render.container)){
                        if(isNullOrUndefined(this.condamn)){
                            model.condamn = [];
                            model.forbiden = [];
                        }
                        model.condamn.push({index: j, elem: render})
                        model.forbiden.push(j);

                        model.subModels.forEach(sb => {
                            if(sb.elem.container === render.container ){
                                sb.start = projItems[j].index;
                            }
                        })
                        return{
                            x : Number(projItems[j].render.getAttribute("x")) + Number(items[i].holder.getAttribute("x")) + Number((proj.container || proj.element).getAttribute("x")),
                            y : Number(projItems[j].render.getAttribute("y")) + Number(items[i].holder.getAttribute("y")) + Number((proj.container || proj.element).getAttribute("y")),
                            anchors: proj.anchors.next
                        }
                    }
                }
            }

        }

    },

    
    estimatePosition(calc){
        const {projItems, holder, proj} = calc;

        return {
            x : projItems.x + Number(holder.getAttribute("x")) + Number((proj.container || proj.element).getAttribute("x")),
            y : projItems.y + Number(holder.getAttribute("y")) + Number((proj.container || proj.element).getAttribute("y")) 
        }
    },


    registerListener(id, listener){
        let model = this.models.get(id);
        if(isNullOrUndefined(model.listeners)){
            model.listeners = []
        }

        model.listeners.push(listener);

    },

    deleteItem(id, projId, index){
        const model = this.models.get(id)
        model.items.forEach(i => { 
            if(i.id !== projId){
                i.elem.removeAnchor(index);
            }
        })

        if(!isNullOrUndefined(model.condamn)){
            for(let v = 0; v < model.subModels.length; v++){

                if(model.subModels[v].start < index &&
                    ((model.subModels[v].start + model.subModels[v].size) > index) ){
                        model.subModels[v].size--;
                        model.subModels[v].elem.decreaseSize();
                    }
            }

            for(let i = 0; i < model.condamn.length; i++){
                if(model.condamn[i].index > index){
                    model.condamn[i].index--;
                    model.condamn[i].elem.decreaseAnchor();

                    for(let k = 0; k < model.subModels.length; k++){
                        if(model.subModels[k].elem === model.elem){
                            model.subModels[k].start--;
                        }
                    }
                }
                if(model.condamn[i].index === index){
                    model.condamn.splice(i, 1);
                    i--;
                }
            }

            for(let j = 0; j < model.forbiden.length; j++){
                if(model.forbiden[j] === index){
                    model.forbiden.splice(j, 1);
                    j--
                }
            }
        }
        model.index--;

        if(isNullOrUndefined(model.listeners)){
            return;
        }


        model.listeners.forEach(l => {
            l.updateValue();
        })


    }

};
