import { MeetHandler, SizeHandler } from "./../size-handler";
import { ContentHandler } from "./../content-handler";
import { createArticle, createI, isNullOrUndefined , findAncestor, isFunction, isEmpty, valOrDefault} from "zenkai";

export const Algorithm = {
    
    clickHandler(target) {
        console.warn(`CLICK_HANDLER NOT IMPLEMENTED FOR ${this.name}`);
        return false;
    },

    focusChild(child){
        this.container.append(child);
        if(!isNullOrUndefined(this.parent)){
            this.parent.focusChild(this.container);
        }
    },

    getContainer(){ return this.container },

    meetSize() {
        if(!this.meet) {
            return;
        }

        if(!this.displayed) {
            return;
        }

        MeetHandler[this.meet].call(this);

        for(let i = 0; i < this.content.length; i++) {
            this.content[i].meetSize();
        }
    },
}
