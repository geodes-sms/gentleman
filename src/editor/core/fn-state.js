import {
    isNullOrUndefined, isEmpty, formatDate, createButton, createI, getElement, removeChildren,
    createDiv, createSpan, createListItem, findAncestor
} from 'zenkai';

var inc = 0;
const nextValueId = () => `value${inc++}`;

export const FnState = {
    createState(concept, _element) {
        const { id, name } = concept;

        let stateID = nextValueId();
        let value = JSON.stringify(concept.clone());
        let time = formatDate(new Date(), "hh:dd");
        // let size = concept.getDescendant().length;

        let icoDelete = createI({
            class: ["ico", "ico-delete"]
        }, "✖");


        let btnDelete = createButton({
            class: ["btn", "btn-delete"],
            title: `Delete ${name} state`
        }, icoDelete);

        let preview = createDiv({
            class: ["model-state-preview"],
            title: `Preview ${name}`
        }, _element);

        let content = createSpan({
            class: ["model-state-content", "fit-content"]
        }, `${concept.getName()}`);

        let item = createListItem({
            class: ["model-state"],
            title: `Restore ${name} state`,
            dataset: {
                id: stateID,
                concept: id
            }
        }, [btnDelete, content, preview]);

        /**
         * Resolves the target
         * @param {HTMLElement} element 
         * @returns {HTMLElement}
         */
        function resolveTarget(element) {
            const isValid = (el) => el === item || el === btnDelete;
            if (isValid(element)) {
                return element;
            }

            return findAncestor(element, (el) => isValid(el), 5);
        }

        item.addEventListener('click', (event) => {
            let target = resolveTarget(event.target);

            this.unhighlight();
            if (target === btnDelete) {
                this.removeState(stateID);
            } else {
                let concept = this.restore(value);
                this.removeState(stateID);

                let targetProjection = getElement(`.projection[data-concept="${concept.id}"]`, this.body);
                if (targetProjection) {
                    targetProjection.focus();
                }
            }
        });

        let selector = `.projection[data-concept="${id}"]`;

        item.addEventListener("mouseenter", (event) => {
            let targetProjection = getElement(selector, this.body);
            if (targetProjection) {
                this.highlight(targetProjection);
            }
        });

        item.addEventListener("mouseleave", (event) => {
            this.unhighlight();
        });

        if (this.states.length > 8) {
            let { id } = this.stateList.lastChild.dataset;

            this.removeValue(id);
        }

        let state = Object.create({}, {
            id: { value: stateID },
            object: { value: "value" },
            type: { value: "state" },
            element: { value: item },
            concept: { value: concept },
            value: { value: value }
        });

        this.addState(state);

        return state;
    },
    /**
     * Gets a value in the editor
     * @param {string} index 
     * @returns {EditorInstance}
     */
    getState(index) {
        if (isNullOrUndefined(index) || isEmpty(this.states)) {
            return;
        }

        return this.states[index];
    },
    /**
     * Adds a state to editor
     * @param {*} state 
     * @returns {HTMLElement}
     */
    addState(state) {
        this.stateList.append(state.element);

        this.states.push(state);

        this.refresh();

        return state;
    },
    removeState(id) {
        if (isNullOrUndefined(id)) {
            return;
        }


        const index = this.states.findIndex(state => state.id === id);

        if (index === -1) {
            return null;
        }

        let removedState = this.states.splice(index, 1)[0];

        let { element } = removedState;

        removeChildren(element).remove();

        this.refresh();

        return this;
    },
};