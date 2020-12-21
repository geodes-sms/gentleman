import {
    createInput, createDiv, createLabel, createI, removeChildren,
} from 'zenkai';

export const StyleWindow = {

    createWidthControl() {
        /** @type {HTMLElement} */
        const controlWrapper = createDiv({
            class: ["control-wrapper", "control-wrapper--width"]
        });

        /** @type {HTMLLabelElement} */
        const labelWR = createLabel({
            class: ["style-label"],
        }, "Width");

        /** @type {HTMLElement} */
        const iconWR = createI({
            class: ["material-icons"],
        }, "height");

        /** @type {HTMLElement} */
        const inputWrapper = createDiv({
            class: ["input-wrapper"]
        });

        /** @type {HTMLInputElement} */
        const rangeWR = createInput({
            class: ["style-input", "style-input--range"],
            type: "range",
            min: 0,
            max: 100,
            step: 1
        });

        /** @type {HTMLInputElement} */
        const numberWR = createInput({
            class: ["style-input", "style-input--number"],
            type: "number",
            min: 0,
            max: 100
        });

        inputWrapper.append(rangeWR, numberWR);

        controlWrapper.append(labelWR, iconWR, inputWrapper);

        controlWrapper.addEventListener('input', (event) => {
            const { target } = event;

            this.container.style.width = `calc(300px + ${target.value}%)`;
            numberWR.value = target.value;
            rangeWR.value = target.value;
        });

        controlWrapper.addEventListener('focusin', (event) => {
            this.container.style.border = "1px solid blue";
        });

        controlWrapper.addEventListener('focusout', (event) => {
            this.container.style.border = null;
        });

        return controlWrapper;
    },

    createSizeControl() {
        /** @type {HTMLElement} */
        const controlWrapper = createDiv({
            class: ["control-wrapper", "control-wrapper--size"]
        });

        /** @type {HTMLLabelElement} */
        const labelWR = createLabel({
            class: ["style-label"],
        }, "Size");

        /** @type {HTMLElement} */
        const iconWR = createI({
            class: ["material-icons"],
        }, "format_size");

        /** @type {HTMLElement} */
        const inputWrapper = createDiv({
            class: ["input-wrapper"]
        });

        /** @type {HTMLInputElement} */
        const rangeWR = createInput({
            class: ["style-input", "style-input--range"],
            type: "range",
            min: 0,
            max: 50,
            step: 1
        });

        /** @type {HTMLInputElement} */
        const numberWR = createInput({
            class: ["style-input", "style-input--number"],
            type: "number",
            min: 0,
            max: 50
        });

        inputWrapper.append(rangeWR, numberWR);

        controlWrapper.append(labelWR, iconWR, inputWrapper);

        controlWrapper.addEventListener('input', (event) => {
            const { target } = event;

            this.container.style.fontSize = `${target.value}px`;
            numberWR.value = target.value;
            rangeWR.value = target.value;
        });

        controlWrapper.addEventListener('focusin', (event) => {
            this.container.style.border = "1px solid blue";
        });

        controlWrapper.addEventListener('focusout', (event) => {
            this.container.style.border = null;
        });

        return controlWrapper;
    },

    createSpaceControl() {
        /** @type {HTMLElement} */
        const controlWrapper = createDiv({
            class: ["control-wrapper", "control-wrapper--space"]
        });

        /** @type {HTMLLabelElement} */
        const labelWR = createLabel({
            class: ["style-label"],
        }, "Space");

        /** @type {HTMLElement} */
        const iconWR = createI({
            class: ["material-icons"],
        }, "format_size");

        /** @type {HTMLElement} */
        const inputWrapper = createDiv({
            class: ["input-wrapper"]
        });

        /** @type {HTMLInputElement} */
        const rangeWR = createInput({
            class: ["style-input", "style-input--range"],
            type: "range",
            min: 0,
            max: 50,
            step: 1
        });

        /** @type {HTMLInputElement} */
        const numberWR = createInput({
            class: ["style-input", "style-input--number"],
            type: "number",
            min: 0,
            max: 50
        });

        inputWrapper.append(rangeWR, numberWR);

        controlWrapper.append(labelWR, iconWR, inputWrapper);

        controlWrapper.addEventListener('input', (event) => {
            const { target } = event;

            this.container.style.fontSize = `${target.value}px`;
            numberWR.value = target.value;
            rangeWR.value = target.value;
        });

        controlWrapper.addEventListener('focusin', (event) => {
            this.container.style.border = "1px solid blue";
        });

        controlWrapper.addEventListener('focusout', (event) => {
            this.container.style.border = null;
        });

        return controlWrapper;
    }
};