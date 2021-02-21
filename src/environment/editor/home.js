import {
    createDocFragment, createH3, createDiv, createParagraph, createButton,
    createSpan, createSection, createUnorderedList, createListItem,
} from 'zenkai';


/**
 * @returns {HTMLElement}
 */
export function createHome() {
    /** @type {HTMLElement} */
    const container = createSection({
        class: ["editor-home"]
    });

    let designMenu = createDesignMenu();

    let modelMenu = createModelMenu();

    container.append(designMenu, modelMenu);

    return container;
}

/**
 * Creates the design menu section
 * @returns {HTMLElement}
 */
function createDesignMenu() {
    const section = createSection({
        class: ["editor-home-section", "editor-home-section--design"],
    });

    let title = createH3({
        class: ["title", "editor-home-section__title", "font-ui"]
    }, "Design ");

    let content = createDiv({
        class: ["editor-home-section__content", "editor-home-section--design__content"],
    });

    let btnCreateMetaModel = createMenuButton("metamodel");

    let btnCreateProjection = createMenuButton("projection");

    content.append(btnCreateMetaModel, btnCreateProjection);

    section.append(title, content);

    return section;
}

/**
 * Creates a drop area
 * @param {string} type 
 * @returns {HTMLElement}
 */
function createMenuButton(type) {
    /** @type {HTMLElement} */
    let button = createButton({
        class: ["btn", "editor-home-section__button", "editor-home-section__button--new"],
        dataset: {
            action: `create-${type}`,
        }
    }, `New ${type}`);

    return button;
}

/**
 * Creates the model menu section
 * @returns {HTMLElement}
 */
function createModelMenu() {
    const section = createSection({
        class: ["editor-home-section", "editor-home-section--model"],
    });

    let title = createH3({
        class: ["title", "editor-home-section__title", "font-ui"]
    }, "Modelling activity");

    let content = createDiv({
        class: ["editor-home-section__content", "editor-home-section--model__content"],
    });

    let modelDroparea = createDropArea("model");
    let projectionDroparea = createDropArea("projection");

    content.append(modelDroparea, projectionDroparea);

    section.append(title, content);

    return section;
}

/**
 * Creates a drop area
 * @param {string} type 
 * @returns {HTMLElement}
 */
function createDropArea(type) {
    /** @type {HTMLElement} */
    let droparea = createDiv({
        class: ["drop-area", "editor-home-section__drop-area", `editor-home-section__drop-area--${type}`],
        dataset: { type: type, },
    });

    /** @type {HTMLElement} */
    let btnOpen = createButton({
        class: ["btn", "drop-area__button", "drop-area__button--open"],
        dataset: { action: `open-${type}`, },
    }, "Select a model");

    /** @type {HTMLElement} */
    let instruction = createParagraph({
        class: ["drop-area__instruction"]
    }, [btnOpen, "or drop it here"]);

    droparea.append(instruction);

    return droparea;
}