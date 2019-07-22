export const TabularProjection = {
    create: function (schema) {
        var instance = Object.create(this);

        instance.schema = schema;
        return instance;
    },
    schema: null,
    type: "Projection",
    render() {

    }
};