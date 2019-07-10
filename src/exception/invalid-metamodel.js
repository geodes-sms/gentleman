export const InvalidMetaModel = {
    create: function (message) {
        var instance = Object.create(this);

        this._message = message;
        return instance;
    },
    get message() { return this._message; },
    get name() { return 'InvalidMetamodelError'; },
    toString() { return `Invalid Metamodel: ${this.message}`; }
};