import { isEmpty, isObject, isFunction, } from "zenkai";


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
}

const ruleHandler = {
    "eq": equalHandler,
    "lt": lowerHandler,
    "gt": greaterHandler,
};

function resolveTerm(term) {
    if (isObject(term)) {
        return this[term.prop];
    }

    return term;
}

function equalHandler(terms) {
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