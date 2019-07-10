export const Exception = (function () {
    var Unimplemented = {
        create: function (message) {
            var instance = Object.create(this);

            this._message = message;
            return instance;
        },
        get message() { return this._message; },
        get name() { return 'UnimplementedError'; },
        toString() { return this.name + ': ' + this.message; }
    };

    var InvalidModel = {
        create: function (message) {
            var instance = Object.create(this);

            this._message = message;
            return instance;
        },
        get message() { return this._message; },
        get name() { return 'InvalidModelError'; },
        toString() { return this.name + ': ' + this.message; }
    };

    return {
        UnimplementedError: Unimplemented,
        InvalidModelError: InvalidModel
    };
})();