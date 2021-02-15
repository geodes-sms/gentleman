import { isEmpty, isObject, isFunction, isIterable, isNullOrUndefined, toBoolean, } from "zenkai";


export function StateHandler(states) {
    if (!Array.isArray(states)) {
        return false;
    }

    var out = null;

    for (let i = 0; i < states.length; i++) {
        const state = states[i];

        const { rule, result } = state;

        let valid = false;

        let handler = ruleHandler[rule.type];

        if (isFunction(handler)) {
            valid = handler.call(this, rule[rule.type]);
        }

        if (valid) {
            out = result;
        }
    }

    this.state = out;

    return out;
}

const ruleHandler = {
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

function resolveTerm(term, defValue) {
    if (isObject(term)) {
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