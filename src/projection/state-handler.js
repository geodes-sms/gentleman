import {
    isEmpty, isObject, isFunction, isIterable, isNullOrUndefined, toBoolean,
    pascalCase, valOrDefault,
} from "zenkai";


export function StateHandler(schema, states) {
    if (!Array.isArray(states)) {
        return false;
    }

    schema.currentState = null;

    for (let i = 0; i < states.length; i++) {
        const state = states[i];

        const { rule, result } = state;

        if (isNullOrUndefined(rule)) {
            return result;
        }

        let valid = false;

        let handler = ruleHandler[rule.type];

        if (isFunction(handler)) {
            valid = handler.call(this, rule[rule.type]);
        }

        if (valid) {
            schema.currentState = i;

            return result;
        }
    }

    return null;
}

const ruleHandler = {
    "ref": referenceHandler,
    "eq": equalHandler,
    "ne": notEqualHandler,
    "lt": lowerHandler,
    "le": lowerEqualHandler,
    "gt": greaterHandler,
    "ge": greaterEqualHandler,
    "and": conjunctionHandler,
    "or": disjunctionHandler,
    "not": negationHandler,
    "no": noHandler,
};

function referenceHandler(name) {
    const { rule = {} } = valOrDefault(this.model.getRuleSchema(name), {});

    let handler = ruleHandler[rule.type];

    if (isFunction(handler)) {
        return handler.call(this, rule[rule.type]);
    }

    return false;
}

function resolveTerm(term, defValue) {
    if (term && term.type === "property") {
        const { name } = term;
        let propGetter = `get${pascalCase(name)}`;

        if (this[propGetter]) {
            return this[propGetter]();
        }

        return this[name];
    }

    if (term && term.type === "param") {
        const { name } = term;

        return this.projection.getParam(name);
    }

    if (isObject(term)) {
        let propGetter = `get${pascalCase(term.prop)}`;

        if (this[propGetter]) {
            return this[propGetter]();
        }

        return this[term.prop];
    }

    if (defValue) {
        return defValue;
    }

    return term;
}

/**
 * 
 * @param {*} rule 
 * @returns {boolean}
 */
function validateRule(rule) {
    let handler = ruleHandler[rule.type];

    if (isFunction(handler)) {
        return handler.call(this, rule[rule.type]);
    }

    return toBoolean(resolveTerm.call(this, rule));
}


function negationHandler(terms) {
    return !validateRule.call(this, terms[0]);
}

function conjunctionHandler(terms) {
    return validateRule.call(this, terms[0]) && validateRule.call(this, terms[1]);
}

function disjunctionHandler(terms) {
    return validateRule.call(this, terms[0]) || validateRule.call(this, terms[1]);
}

/**
 * Check if two terms are equal
 * @param {*[]} terms 
 */
function equalHandler(terms) {
    if (!Array.isArray(terms)) {
        throw new TypeError("Terms need to be an array");
    }

    if (terms.length < 2) {
        return null;
    }
    let leftTerm = resolveTerm.call(this, terms[0]);
    let rightTerm = resolveTerm.call(this, terms[1]);

    return leftTerm == rightTerm;
}

/**
 * 
 * @param {*[]} terms 
 */
function equalAllHandler(terms) {
    if (!Array.isArray(terms)) {
        throw new TypeError("Terms need to be an array");
    }

    if (isEmpty(terms)) {
        return null;
    }

    const refTerm = resolveTerm.call(this, terms[0]);

    for (let i = 0; i < terms.length; i++) {
        const term = resolveTerm.call(this, terms[i]);

        if (term !== refTerm) {
            return false;
        }
    }

    return true;
}

/**
 * 
 * @param {*[]} terms 
 */
function notEqualHandler(terms) {
    if (!Array.isArray(terms)) {
        throw new TypeError("Terms need to be an array");
    }

    if (terms.length < 2) {
        return null;
    }

    let leftTerm = resolveTerm.call(this, terms[0]);
    let rightTerm = resolveTerm.call(this, terms[1]);

    return leftTerm != rightTerm;
}

/**
 * 
 * @param {*[]} terms 
 */
function lowerHandler(terms) {
    if (!Array.isArray(terms)) {
        throw new TypeError("Terms need to be an array");
    }

    if (terms.length < 2) {
        return null;
    }

    let leftTerm = resolveTerm.call(this, terms[0]);
    let rightTerm = resolveTerm.call(this, terms[1]);

    return leftTerm < rightTerm;
}

/**
 * 
 * @param {*[]} terms 
 */
function lowerEqualHandler(terms) {
    if (!Array.isArray(terms)) {
        throw new TypeError("Terms need to be an array");
    }

    if (terms.length < 2) {
        return null;
    }

    let leftTerm = resolveTerm.call(this, terms[0]);
    let rightTerm = resolveTerm.call(this, terms[1]);

    return leftTerm <= rightTerm;
}

/**
 * 
 * @param {*[]} terms 
 */
function greaterHandler(terms) {
    if (!Array.isArray(terms)) {
        throw new TypeError("Terms need to be an array");
    }

    if (terms.length < 2) {
        return null;
    }

    let leftTerm = resolveTerm.call(this, terms[0]);
    let rightTerm = resolveTerm.call(this, terms[1]);

    return leftTerm > rightTerm;
}

/**
 * 
 * @param {*[]} terms 
 */
function greaterEqualHandler(terms) {
    if (!Array.isArray(terms)) {
        throw new TypeError("Terms need to be an array");
    }

    if (terms.length < 2) {
        return null;
    }

    let leftTerm = resolveTerm.call(this, terms[0]);
    let rightTerm = resolveTerm.call(this, terms[1]);

    return leftTerm >= rightTerm;
}

/**
 * 
 * @param {*[]} term
 */
function noHandler(term) {
    let val = resolveTerm.call(this, term);
    
    if (isIterable(val)) {
        return isEmpty(val);
    }

    return isNullOrUndefined(val);
}