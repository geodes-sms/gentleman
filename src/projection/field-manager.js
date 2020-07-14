const { FieldFactory } = require("./field/factory.js");

const fields = [];

export const FieldManager = {
    createField(schema, source) {
        var field = FieldFactory.createField(schema, source);
        field.active = true;

        fields.push(field);
        
        return field;
    },
};