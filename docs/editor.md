# Editor

The editor configuration is done through a JSON file.
It can be used to define the style of the editor components and register actions that will be made available in the menu.

## Base config

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
    - **downloadable**: flag to indicate whether the result is downloadable
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
            { "name": "...", "content": "...", "downloadable": true }
        ],
        "css": ["editor-menu"]
    }
}
```

### Define a handler for the action

``` js
  const handler = {
      "preview-projection": function (target) {
        this.triggerEvent({ "name": "build-projection" }, (pmodel) => {
            ...
        });
    }
  }
```
