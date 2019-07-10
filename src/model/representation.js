const Representation = (function () {

    var BaseRepresentation = {
        create: function (values) {
            var instance = Object.create(this);

            Object.assign(instance, values);

            // private members

            return instance;
        },

        prepare: function (id, val, mAttr, type) {
            return Object.freeze({
                _id: id,
                _val: val,
                _mAttribute: mAttr,
                _type: type
            });
        },
        get modelAttribute() { return this._mAttribute; },

        render: function (editable) {
            var self = this;
        }
    };

    var TextRepresentation = {
        create: function (values) {
            var instance = Object.create(this);

            Object.assign(instance, values);


            // private members
            instance._val = values.val;
            return instance;
        },

        get value() { return this._val; }
    };

    var TableRepresentation = {
        create: function (values) {
            var instance = Object.create(this);

            Object.assign(instance, values);

            // private members
            instance._cols = values.cols;
            instance._rows = values.rows;
            instance._cells = values.cells;

            return instance;
        },

        get cols() { return this._cols; },
        get rows() { return this._rows; },
        get cells() { return this._cells; }
    };

    return {
        Base: BaseRepresentation,
        Text: TextRepresentation,
        Table: TableRepresentation
    };
})();