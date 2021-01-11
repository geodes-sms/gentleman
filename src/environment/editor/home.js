import {
    createDiv, createH2, createParagraph, createButton, createHeader, createSpan, 
    createSection,
} from 'zenkai';


/**
 * @returns {HTMLElement}
 */
export function createHome() {
    /** @type {HTMLElement} */
    const container = createSection({
        class: ["editor-home"]
    });

    /** @type {HTMLElement} */
    const header = createHeader({
        class: ["menu-header"]
    });

    /** @type {HTMLElement} */
    var title = createH2({
        class: ["editor-home__title"]
    }, "Editor");

    /** @type {HTMLElement} */
    var content = createParagraph({
        class: ["menu-content"],
        html: "Welcome to Gentleman's editor.<br>To begin, please load a model or continue with a previous instance."
    });

    header.append(title, content);

    /** @type {HTMLElement} */
    const body = createDiv({
        class: ["loader-container"],
        tabindex: -1
    });

    /** @type {HTMLElement} */
    var modelOptions = createDiv({
        class: ["loader-options"]
    });

    /** @type {HTMLElement} */
    var modelOptionsTitle = createH2({
        class: ["loader-options-title"]
    }, "Concept");

    /** @type {HTMLElement} */
    var modelOptionsContent = createParagraph({
        class: ["loader-options-content"],
        html: "Create or edit a model."
    });

    /** @type {HTMLElement} */
    var modelOptionsAction = createDiv({
        class: ["loader-options-action"]
    });

    /** @type {HTMLElement} */
    var btnCreateMetaModel = createButton({
        class: ["btn", "loader-option", "loader-option--new"],
        dataset: {
            action: "create-metamodel",
        }
    }, [
        createSpan({
            class: ["loader-option__action"],
            dataset: {
                ignore: "all",
            }
        }, "New"),
        createSpan({
            class: ["loader-option__type"],
            dataset: {
                ignore: "all",
            }
        }, "metamodel")
    ]);

    /** @type {HTMLElement} */
    var btnOpenModel = createButton({
        class: ["btn", "loader-option", "loader-option--open"],
        dataset: {
            action: "open-model",
        },
    }, [
        createSpan({
            class: ["loader-option__action"],
            dataset: {
                ignore: "all",
            }
        }, "Open"),
        createSpan({
            class: ["loader-option__type"],
            dataset: {
                ignore: "all",
            }
        }, "model")
    ]);

    modelOptionsAction.append(btnCreateMetaModel, btnOpenModel);

    modelOptions.append(modelOptionsTitle, modelOptionsContent, modelOptionsAction);


    var projectionOptions = createDiv({
        class: ["loader-options"]
    });

    var projectionOptionsTitle = createH2({
        class: ["loader-options-title"]
    }, "Projection");

    var projectionOptionsContent = createParagraph({
        class: ["loader-options-content"],
        html: "Create or edit a projection."
    });

    var projectionOptionsAction = createDiv({
        class: ["loader-options-action"]
    });

    var btnCreateProjection = createButton({
        class: ["btn", "loader-option", "loader-option--new"],
        dataset: {
            action: "create-projection",
        }
    }, [
        createSpan({
            class: ["loader-option__action"],
            dataset: {
                ignore: "all",
            }
        }, "New"),
        createSpan({
            class: ["loader-option__type"],
            dataset: {
                ignore: "all",
            }
        }, "projection")
    ]);

    var btnOpenProjection = createButton({
        class: ["btn", "loader-option", "loader-option--open"],
        dataset: {
            action: "open-projection",
        }
    }, [
        createSpan({
            class: ["loader-option__action"],
            dataset: {
                ignore: "all",
            }
        }, "Open"),
        createSpan({
            class: ["loader-option__type"],
            dataset: {
                ignore: "all",
            }
        }, "projection")
    ]);

    projectionOptionsAction.append(btnCreateProjection, btnOpenProjection);

    projectionOptions.append(projectionOptionsTitle, projectionOptionsContent, projectionOptionsAction);

    body.append(
        modelOptions
        ,projectionOptions
    );

    container.append(header, body);

    return container;
}
