export const Simulation = {

    notifyDimObservers(){
        if(isNullOrUndefined(this.observers)){
            return;
        }

        this.observers.forEach(o => {
            o.analyseContentDim();
        })
    },
}