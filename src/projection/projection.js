export const Projection = {
    create(args) {
        var instance = Object.create(this);
        Object.assign(instance, args);
        return instance;
    },
    schema: null,
    attributes: null,
};