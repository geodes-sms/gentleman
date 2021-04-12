const CMODEL__EDITOR = require('@models/concept-model/editor-config.json');
const CMODEL__CONCEPT = require('@models/concept-model/concept.json');
const CMODEL__PROJECTION = require('@models/concept-model/projection.json');

const PMODEL__EDITOR = require('@models/projection-model/editor-config.json');
const PMODEL__CONCEPT = require('@models/projection-model/concept.json');
const PMODEL__PROJECTION = require('@models/projection-model/projection.json');


if (Gentleman) {
    Gentleman.Models.set("concept-model", Object.assign({}, CMODEL__EDITOR, CMODEL__CONCEPT, CMODEL__PROJECTION));
    Gentleman.Models.set("projection-model", Object.assign({}, PMODEL__EDITOR, PMODEL__CONCEPT, PMODEL__PROJECTION));
} else {
    console.warn("Gentleman Models not added. The library core is not loaded in the page");
}