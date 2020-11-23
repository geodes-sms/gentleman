# Gentleman - A lightweight web-based projectional editor generator

[![Build Status](https://travis-ci.org/geodes-sms/gentleman.svg?branch=master)](https://travis-ci.org/geodes-sms/gentleman)

Gentleman aims to **to close the gap between models and domain experts**.

| Concept defintion        | Projection definition           |
|:-------------:|:-------------:|
| ![Gentleman Screenshot](https://geodes-sms.github.io/gentleman/assets/images/concept.png "Concept definition")  | ![Gentleman Screenshot](https://geodes-sms.github.io/gentleman/assets/images/projection.png "projection definition") |

> **Projectional-editing?**
> 1. No parser needed: the user manipulates the AST directly (through projections)
> 2. Support of various notations: tables, math formulas, graphics...
> 3. Composition of any language without introducing syntactic ambiguities

## Worflow

1. **Language enginneer**
   1. Define a model for your DSL concepts or import and Ecore model
   2. Create projections to interact with your DSL concepts

2. **Domain expert**
   1. Use the generated editor to create the model instances
   2. Personnalize freely the presentation of your instance

## Features

- Platform agnostic: Gentleman target the web (no installation required)
- Support textual and tabular notations and multimedia content
- Offer specialized UI units for projection layout and fields
- Integration with Ecore: Define an Ecore model and use it with Gentleman projections

### 👉 Demonstration

Take a look at the [demonstration (MODELS 2020) and see the tool in action](https://youtu.be/wJ4hVZjmrv4).

⭐⭐⭐ **[Play with it](https://geodes-sms.github.io/gentleman/demo)** ⭐⭐⭐


## Integration

### Decorate an HTML Tag

```html
<html>
    <body>
        ...
        <div data-gentleman></div>
        ...
        <script src="gentleman.js"></script>
    </body>
</html>
```

### Create an instance in JS

```javascript
const MODEL = {JSON};
const PROJECTION = {JSON}

var editor = Gentleman.createEdiotr();
editor.init(MODEL, PROJETION)
```

# Installation

⚠️ **Gentleman is currently in alpha.**

## Building the Code

To build the code, follow these steps.

1. Ensure that [NodeJS](http://nodejs.org/) is installed. This provides the platform on which the build tooling runs.
2. From the project folder, execute the following command:

```
$ npm install
```


<!-- # Documentation

You can read the documentation for Gentleman [here](https://geodes-sms.github.io/gentleman/docs). If you would like to help improve this documentation, the source for many of the docs can be found in the doc folder within this repository. -->

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
