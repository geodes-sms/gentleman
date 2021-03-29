# Editor

## Getting started

Gentleman is a modelling tool that combines concepts and projections to create a personnalized experience for all.  
Concepts and projections are the core elements of Gentleman where they maintain a mutual dependency.

- A projection gives purpose to a concept by defining elements that you can see and interact with.
- A concept gives meaning to a projection by defining a structure that can parse your entries and validate your interactions.

Thus, every modelling activity, begins by loading an aggregate of concepts and projections, stored as separate JSON files, which activates the editor.

![Editor settings screenshot](https://geodes-sms.github.io/gentleman/assets/images/doc_editor_getting_started.png "Editor Setting")

### **Metamodelling**

The *metamodelling* workflow is reserved for the creation of concepts and projections. This unique workflow comes with a crucial step: the **build step** where the artefacts (metamodel or projections) are generated.

#### Task

- **Create concepts**
  1. Open the editor
  2. New or edit existing?
     1. New concepts (from scratch): Select `[Create a metamodel]`
     2. Edit existing: Load the saved model in the model area (on the left)
  3. Start metamodelling
  4. Build the concepts: Select `[Build]` from the floating menu
- **Create projections**
  1. Open the editor
  2. New or edit existing?
     1. New projections (from scratch): Select `[Create a projection]`
     2. Edit existing: Load the saved model in the model area (on the left)
  3. Start metamodelling
  4. Preview the projections
     1. Load the concepts: Select `[Concepts]` from the floating menu
     2. Select `[Preview]` from the floating menu
  5. Build the projections: Select `[Build]` from the floating menu

When *Build* is selected, it validates the model and generates a metamodel or a collection of projections depending on the task, which can then be used in the *[modelling workflow](#modelling)*

### **Modelling**

The *modelling* workflow is reserved for the creation of concept instances using a projection ensemble.

#### Task

- **Create instances**
  1. Open the editor
  2. New or edit existing?
     1. New model: Load both the JSON files for the concepts and the one for the projections
     2. Edit existing: Load the saved model in the model area (on the left)
  3. Start modelling

## User interface

Gentleman adopts a minimalistic approach to its design. The UI is divided between a
header which contains support elements (in [Ribbon](#ribbon)) and a body where you will play with your instances.

![Editor UI screenshot](https://geodes-sms.github.io/gentleman/assets/images/doc_editor_ui.png "Editor User interface")

### Ribbon

The header's main component is the ribbon (set of tabs). Each tab's content is presented in a collapsible card

- **concept**: Concepts found in the loaded model, ready to be instanciated
  - The expanded view gives you an overview of the concept structure
  - The `[CREATE]` button creates an instance of the concept
- **value**: Values saved during the editing experience
  - The expanded view gives you an overview of the instance internal values
  - The `[COPY]` button copies the value to the clipboard
  - The `[DELETE]` button removes the value from the list
- **resource**: Resources added to the editor
  - The expanded view gives you an overview of the resource metadata
  - The `[DELETE]` button removes the resource from the list

![Editor ribbon](https://geodes-sms.github.io/gentleman/assets/images/doc_editor_ribbon.png "Editor Ribbon")

### Settings

The menu bar provides you with two buttons to access the editor settings and simply close the editor respectively.

### Breadcrumbs

The editor has a navigation bar at the top of the body called *Breadcrumbs*, telling you the current location in an active instance.

![Editor breadcrumbs screenshot](https://geodes-sms.github.io/gentleman/assets/images/doc_editor_breadcrumbs.png "Editor breadcrumbs")

### Instances

Every concept instance created have a corresponding window with a header containing its name and a toolbar.  
As they are windows, they can be collapsed, resized (resize or fullscreen) or closed (delete instance).

![Editor instances screenshot](https://geodes-sms.github.io/gentleman/assets/images/doc_editor_instance.png "Editor instances")

### Menu

The floating menu (*you can drag it*) groups the actions found in the editor configuration file.

## Interaction

### Create an instance

Every editor exposes the concepts available for instanciation in the Ribbon concept tab.
To create a new instance, select `[CREATE]` on the desired concept.

### Navigation

Gentleman supports both mouse and keyboard navigation.
With the mouse it's simply a matter of clicking on the element you want to focus on.
With the keyboard you can use the arrows to access close-by elements or the `Tab` key to iterate over the elements. When the focus element has children elements, press `Enter` to focus on its children and `Esc` to exit the container.

### Focus on element

An instance can quickly become too crowded as you modify it. Fortunately, because the view is a composition
of projections, they can each be manipulated separetely.
To open a projection in a separate window (instance),

1. Select an element
2. Open in new window: `Ctrl + E`

> Note: As this is a projection window and not an actual instance, closing it will have no side effects on your values.

### Copy/Paste

In Gentleman copy/paste works just as with any editor.

1. Select source element
2. Copy value: `Ctrl + C`
3. Select target element
4. Copy value: `Ctrl + V`

> Note: A value is attached to a concept, not a projection. Therefore copying does not include the projection (visuals) but only the value attached to the concept.

### Save value

In Gentleman values can be manipulated freely. As such any value can be saved and retrived at any moment.

1. Select source element
2. Save value: `Ctrl + S`
3. Value shows up in the Ribbon

When you need a value, head to the ribbon and select `[COPY]` on the desired value.
This action will copy the value which you can then paste in a valid instance.

## Configuration

The editor configuration is done through a JSON file.
It can be used to define elements of the Ribbon and register actions that will be made available in the floating menu.

- **name** `[string]`: name of the editor (displayed in the header)
- **concepts** `[array:concept]`: list of concepts available for instanciation
  - **name** `[string]`: name of the concept
- **resources** `[array:resource]`: list of resources available for registered handlers
  - **name** `[string]`: name of the resource used as reference
  - **type** `[string=json-model]`: type of resource
  - **required** `[boolean]`: indicates whether the resource is required
- **actions** `[array:action]`: list of actions available in the floating menu
  - **name** `[string]`: name of the action used as reference by the registered handlers
  - **content** `[string]`: content displayed in the menu
  - **help** `[string]`: content displayed in tooltip
  - **options** `[object]`: list of options

### Example

``` json
{
    "editor": {
        "name": "Gentleman projection",
        "concepts": [
            { "name": "projection" },
            { "name": "template" },
            { "name": "style rule" }
        ],
        "resources": [
            { 
                "name": "metamodel", 
                "type": "json-model",
                "required": true 
            }
        ],
        "actions": [
            {
                "name": "preview-projection",
                "content": "Preview",
                "help": "Preview the projections"
            },
            {
                "name": "build-projection",
                "content": "Build",
                "help": "Build the projections",
                "options": {
                    "download": true
                }
            }
        ]
    }
}

```

## Register actions

Every action declared in the configuration will need a handler.

``` js
  const handler = {
      "preview-projection": function (target) {
        if (!this.hasResource("metamodel")) {
            ...
            return false;
        }

        this.triggerEvent({ "name": "build-projection", options: { download: false } }, (pmodel) => {
            ...
        });
    }
  }
```
