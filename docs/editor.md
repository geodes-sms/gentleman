# Editor

## Getting started

To begin your experience with Gentleman, load the JSON files for the concepts (model) and the projections (matching those concepts).
Once loaded and validated (automatically), you will be able to start or resume your modelling activity.

> Note: If you are creating a metamodel or a projection, then selecting it in the menu will automatically load the concepts and projections required for it.

![Editor settings screenshot](https://geodes-sms.github.io/gentleman/assets/images/doc_editor_getting_started.png "Editor Setting")

## User interface

Gentleman adopts a minimalistic approach to its design. The UI is divided between a
header which contains global actions (model and editor) and a body where you will play with your instaces.

![Editor UI screenshot](https://geodes-sms.github.io/gentleman/assets/images/doc_editor_ui.png "Editor User interface")

### Ribbon

The header's main component is the ribbon which gives you access to

- **concept**: Concepts found in the loaded model, ready to be instanciated
- **value**: Values saved during the editing experience
- **resource**: Resources added to the editor

![Editor ribbon](https://geodes-sms.github.io/gentleman/assets/images/doc_editor_ribbon.png "Editor Ribbon")

### Toolbar

The toolbar provides you with two buttons to either access the editor settings or simply close the editor

### Breadcrumbs

The editor has a navigation bar at the top of the body called Breadcrumbs, telling you the current location.

![Editor breadcrumbs screenshot](https://geodes-sms.github.io/gentleman/assets/images/doc_editor_breadcrumbs.png "Editor breadcrumbs")

### Instances

Every concept instance created have a corresponding window with a header containing its name and a toolbar.  
As they are windows, they can be collapsed, resized (enlarged or fullscreen) or closed.

![Editor instances screenshot](https://geodes-sms.github.io/gentleman/assets/images/doc_editor_instance.png "Editor instances")

### Menu

The floating menu (*you can drag it*) groups the actions found in the editor configuration file.

## Interaction

### Copy/Paste

In Gentleman copy/paste works just as with any editor.

1. Select source element
2. Copy value: `Ctrl + C`
3. Select target element
4. Copy value: `Ctrl + V`

> A value is attached to a concept, not a projection. Therefore copying does not include the projection (visuals) but only the value attached to the concept.

### Save value

In Gentleman values can be manipulated freely. As such any value can be saved and retrived at any moment.

1. Select source element
2. Save value: `Ctrl + S`
3. Value shows up in the Ribbon

When you need a value, head to the ribbon and select `copy` on the desired value.
This action will copy the value and you can paste it in a valid instance.

### Navigation

Gentleman support mouse and keyboard navigation.
With the mouse it's simply a matter of clicking on the element you want to focus on.
With the keyboard you can use the arrows for a direction based navigation or the `tab` key to iterate over the elements. When the focus element has children elements, press `enter` to focus on its children.

## Configuration

The editor configuration is done through a JSON file.
It can be used to define the style of the editor components and register actions that will be made available in the menu.

- **name**: name of the editor
- **root**: list of concepts made available for direct instanciation
- **header**: header section config
  - **css**: css classes added to the header container
- **body**: body section config
  - **css**: css classes added to the body container
- **menu**: menu config
  - **actions**: list of actions available in the menu
    - **name**: name of the action.
    - **content**: content displayed in the menu
    - **require**: list of resource dependancies
  - **css**: css classes added to the menu container

``` json
{
    "editor": {
        "name": "...",
        "root": ["..."],
        "header": {
            "css": ["..."]
        },
        "body": {
            "css": ["..."]
        },
        "menu": {
            "actions": [
                { "name": "...", "content": "...", "downloadable": true }
            ],
            "css": ["..."]
        }
    }
}

```

## Register actions

### Declare action in the menu

``` json
{
    "menu": {
        "actions": [
            { "name": "...", "content": "..." }
        ]
    }
}
```

### Define a handler for the action

``` js
  const handler = {
      "preview-projection": function (target) {
        this.triggerEvent({ "name": "build-projection", options: { download: false } }, (pmodel) => {
            ...
        });
    }
  }
```

## Workflow

### Metamodelling

Tutorial coming soon...

### Modelling

Tutorial coming soon...
