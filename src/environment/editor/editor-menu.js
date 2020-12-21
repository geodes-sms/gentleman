import {
    createDiv, createButton, createHeader, createAnchor, createSpan
} from 'zenkai';

/**
 * @returns {HTMLElement}
 */
export function createEditorMenu(options) {
    const menu = createDiv({
        class: ["menu"],
        draggable: true,
        title: "Click to access the import, export and build actions"
    });

    const title = createSpan({
        class: ["menu-title"],
        dataset: {
            "ignore": "all",
        }
    }, "Menu");

    const btnExport = createButton({
        class: ["btn", "btn-export"],
        dataset: {
            "context": "model",
            "action": "export",
        }
    }, "Export");

    const btnImport = createButton({
        class: ["btn", "btn-import"],
        dataset: {
            "context": "model",
            "action": "import"
        }
    }, "Import");

    const btnBuild = createButton({
        class: ["btn", "btn-build"],
        dataset: {
            "context": "model",
            "action": "build"
        }
    }, "Build");

    menu.append(title, btnExport, btnImport, btnBuild);

    menu.addEventListener('click', (event) => {
        menu.classList.toggle("open");
    });

    return menu;
}