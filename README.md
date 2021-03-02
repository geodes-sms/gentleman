# Gentleman - A lightweight web-based projectional editor generator

[![Build Status](https://travis-ci.org/geodes-sms/gentleman.svg?branch=master)](https://travis-ci.org/geodes-sms/gentleman)

Gentleman aims to **to close the gap between models and domain experts**.

| Concept defintion        | Projection definition           |
|:-------------:|:-------------:|
| ![Gentleman Screenshot](https://geodes-sms.github.io/gentleman/assets/images/concept.png "Concept definition")  | ![Gentleman Screenshot](https://geodes-sms.github.io/gentleman/assets/images/projection.png "projection definition") |

> **Projectional-editing characteristics**
> 1. No parser needed: the user manipulates the AST directly (through projections)
> 2. Support of various notations: tables, math formulas, graphics...
> 3. Composition of any language without introducing syntactic ambiguities

## Workflow

1. **Design (Language enginneer)**
   1. Create a metamodel, by defining your DSL concepts or import and Ecore model
   2. Create a set of projections to interact with your DSL concepts

2. **Model (Domain expert)**
   1. Create instances of a model with the chosen projections
   2. Personnalize freely the presentation of your instance

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
        <script src="gentleman.js"></script>
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

# Installation

⚠️ **Gentleman is not recommended to be used in production.** ⚠️

## Building the Code

To build the code, follow these steps.

1. Ensure that [NodeJS](http://nodejs.org/) is installed. This provides the platform on which the build tooling runs.
2. From the project folder, execute the following command:

```
$ npm install
```

# Documentation

## Editor

The editor configuration is done through a JSON file.


<!-- You can read the documentation for Gentleman [here](https://geodes-sms.github.io/gentleman/docs). If you would like to help improve this documentation, the source for many of the docs can be found in the doc folder within this repository.  -->

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
Predefined layouts:

- Wrap
- Stack
- Cell

### Field

A field element is used to receive and process input and output

- Text
- Binary
- Choice
- List
- Table

### Static

A static element is used to add element that do not accept any input and may only react to changes in the environment.

- Text
- Image
- Link
- HTML
  
# Publication

[1] L-E Lafontant, E. Syriani. *Gentleman: a light-weight web-based projectional editor generator* [PDF](https://dl.acm.org/doi/pdf/10.1145/3417990.3421998)

# Distribution

This distribution contains the following files and folders:

- src: the source code
- demo: contains some metamodels
- doc: the source code documentation
- assets: contains static files

# License

The source code is licensed under a [GNU GENERAL PUBLIC LICENSE 3](https://www.gnu.org/copyleft/gpl.html) ![GNU GPL v3](https://img.shields.io/badge/license-GPLv3-blue.svg)
