import { ContentHandler } from "./../content-handler";
import { createDiv, createDocFragment, isNull, isNullOrUndefined } from "zenkai";
import { Algorithm } from "./algorithm.js"

const BaseAlgorithmHolder = {
    init(){
        return this;
    },

    render(){
        const { interaction, algorithm } = this.schema;

        const fragment = createDocFragment();

        if(isNullOrUndefined(this.container)){
            this.container = createDiv({
                id: this.id,
                class: ["algorithm", "algorithm--holder"],
                tabindex: -1,
                dataset: {
                    nature: "algorithm",
                    view: "holder",
                    id: this.id,
                }
            });
        }

        if(isNullOrUndefined(this.interactionArea)){
            this.interactionArea = ContentHandler.call(this, interaction);

            fragment.append(this.interactionArea);
        }

        if(isNullOrUndefined(this.svgArea)){
            let attribute = this.source.getAttributeByName(algorithm.name).target;

            let projection = this.environment.projectionModel.createProjection(attribute, algorithm.tag);

            this.svgArea = projection.init().render();

            fragment.append(this.svgArea);
        }

        if(fragment.hasChildNodes()){
            this.container.append(fragment);
        }

        return this.container;
    }
}

export const AlgorithmHolder = Object.assign({},
    Algorithm,
    BaseAlgorithmHolder
)