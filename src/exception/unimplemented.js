export const Unimplemented = {
    create: function (message) {
        var instance = Object.create(this);

        this._message = message;
        return instance;
    },
    get message() { return this._message; },
    get name() { return 'UnimplementedError'; },
    toString() { return this.name + ': ' + this.message; }
};
