export const InvalidModel = {
    create: function (message) {
        var instance = Object.create(this);

        this._message = message;
        return instance;
    },
    get message() { return this._message; },
    get name() { return 'InvalidModelError'; },
    toString() { return `Invalid Model: ${this.message}`; }
};