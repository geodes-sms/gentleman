import {
    createDiv, createUnorderedList, createListItem, createButton, createSpan,
} from 'zenkai';

/**
 * @returns {HTMLElement}
 * @this {Editor}
 */
export function createEditorHeader() {
    this.header = createDiv({
        class: ["editor-header"],
    });

    this.headerTitle = createSpan({
        class: ["editor-header-title"],
    }, "Editor");

    this.selectorList = createUnorderedList({
        class: ["bare-list", "editor-selector"],
    }, ["model", "concept"].map(item => createListItem({
        class: ["editor-selector-item"],
        tabindex: 0,
        dataset: {
            "value": item,
            "action": `selector-${item}`
        }
    }, item)));
    this.selectorItem = this.selectorList.children[0];
    this.selectorItem.classList.add("selected");
    this.selectorValue = this.selectorItem.dataset.value;


    let btnClose = createButton({
        class: ["btn", "btn-close"],
        dataset: {
            action: "close"
        }
    });

    let btnStyle = createButton({
        class: ["btn", "btn-style", "hidden"],
        dataset: {
            action: "style"
        }
    });

    let toolbar = createDiv({
        class: ["editor-toolbar"],
    }, [btnStyle, btnClose]);

    let menu = createDiv({
        class: ["editor-header-menu"]
    }, [this.headerTitle, this.selectorList, toolbar]);

    this.headerBody = createDiv({
        class: ["editor-header-main"],
    });

    this.header.append(menu, this.headerBody);

    return this.header;
}