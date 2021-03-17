# Gentleman - A lightweight web-based projectional editor generator

[![Build Status](https://travis-ci.org/geodes-sms/gentleman.svg?branch=master)](https://travis-ci.org/geodes-sms/gentleman)

Gentleman aims to **to close the gap between models and domain experts**.

| Concept defintion        | Projection definition           |
|:-------------:|:-------------:|
| ![Gentleman Screenshot](https://geodes-sms.github.io/gentleman/assets/images/concept.png "Concept definition")  | ![Gentleman Screenshot](https://geodes-sms.github.io/gentleman/assets/images/projection.png "projection definition") |

## Workflow

### **Design**

The *design* workflow includes every activity required to build an editor

- `[M]` Create a metamodel
- `[P]` Create projections
- `[E]` Configure the editor

### **Model**

The *model* workflow begins with every design artefacts (M.P.E.) in place

- `[m]` Create a model
- `[p]` Manipulate projections
- `[e]` Personnalize the editor

## Features

- Platform agnostic: Gentleman target the web (no installation required)
- Support textual and tabular notations and multimedia content
- Offer specialized UI units for projection layout and fields
- Integration with Ecore: Define an Ecore model and use it with Gentleman projections

### 👉 Demonstration

Take a look at the [demonstration (MODELS 2020) and see the tool in action](https://youtu.be/wJ4hVZjmrv4).

⭐⭐⭐ **[Play with it](https://geodes-sms.github.io/gentleman/demo/index.html)** ⭐⭐⭐


## Integration

### Decorate an HTML Tag

```html
<html>
    <body>
        ...
        <div data-gentleman="editor"></div>
        ...
        <script src="gentleman.mod.js"></script>  <!-- optional -->
        <script src="gentleman.app.js"></script>
    </body>
</html>
```

### Create an instance in JS

```javascript
const CONCEPT_MODEL = {JSON};
const PROJECTION_MODEL = {JSON}

var editor = Gentleman.createEdiotr();
editor.init(CONCEPT_MODEL, PROJECTION_MODEL)
```

# Documentation

## Editor

The editor configuration is done through a JSON file.
It can be used to define the style of the editor components and register actions that will be made available in the menu.

### Base config

- **name**: name of the editor
- **root**: list of concepts made available for direct instanciation
- **header**: header section config
  - **css**: css classes added to the header container
- **body**: body section config
  - **css**: css classes added to the body container
- **resource**: resource config
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

### Register actions

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

### Require resource

``` json
{
    "resource": {
        "files": [
            { "name": "...", "required": true }
        ],
        "css": ["editor-menu"]
    }
}
```

## Concept

Gentleman defines a metamodel though concepts.

## Projection

A projection is a representation of a concept that can be visualized and interacted with in the graphical user interface (GUI).
Multiple projections may be defined for a single concept so as to allow different representation and level of granularity.

> **Example**  
> Consider the concept `Person` with attributes such as `name`, `age`, `height`, `shape`, and `type`.  
To manipulate a collection of `Person`, a *Table* is a highly efficient notation to make changes, but does not offer
enough flexibility for viewing purposes. However, a *List* which is less rigid in both structure and presentation
fit perfectly with this scenario.  
Therefore, a good strategy would be to define a projection per use cases:  
**(1)** Edit a *Person* and view all their attributes `->` Table projection  
**(2)** Enumerate all the defined *Person* showing only their *name* `->` List projection

Every projection is a composition of *layout*, *field* and *static* elements; all rendered as HTML elements.
They can be customized, individually or globally, directly with *style* rules or though external *CSS*.

### Layout

A layout element is used to organize elements presented in the GUI.
Gentleman defines the following layouts:

- WrapLayout
- StackLayout
- CellLayout

### Field

A field element is used to receive and process input and output.
Gentleman defines the following fields:

- TextField
- BinaryField
- ChoiceField
- ListField
- TableField

### Static

A static element is used to add element that do not accept any input and may only react to changes in the environment.

- Text
- Image
- Link
- HTML

# Installation

⚠️ **Gentleman is not recommended to be used in production.** ⚠️

## Building the Code

To build the code, follow these steps.

1. Ensure that [NodeJS](http://nodejs.org/) is installed. This provides the platform on which the build tooling runs.
2. From the project folder, execute the following command:

```
$ npm install
```


<!-- You can read the documentation for Gentleman [here](https://geodes-sms.github.io/gentleman/docs). If you would like to help improve this documentation, the source for many of the docs can be found in the doc folder within this repository.  -->
  
# Publication

[1] L-E Lafontant, E. Syriani. *Gentleman: a light-weight web-based projectional editor generator* [PDF](https://dl.acm.org/doi/pdf/10.1145/3417990.3421998)

# Distribution

This distribution contains the following files and folders:

- src: the source code
- demo: contains some metamodels
- assets: contains static files
<!-- - doc: the source code documentation -->

# License

The source code is licensed under a [GNU GENERAL PUBLIC LICENSE 3](https://www.gnu.org/copyleft/gpl.html) ![GNU GPL v3](https://img.shields.io/badge/license-GPLv3-blue.svg)
