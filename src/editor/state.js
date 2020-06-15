import { cloneObject } from 'zenkai';

/**
 * State management
 * @lends state#
 */
export const State = {
    /**
     * Creates a `state` instance
     * @returns {state} state instance
     */
    create: function () {
        var instance = Object.create(this);

        var past = [];
        var future = [];

        /**
         * @memberof state#
         */
        var undo = function () {
            future = [instance.current, ...future];
            instance.current = past.pop();
        };

        var redo = function () {
            past = [...past, instance.current];
            instance.current = future[0];
            future = future.slice(1);
        };

        var set = function (val) {
            past = [...past, instance.current];
            instance.current = cloneObject(val);
            future = [];
        };

        var clear = function () {
            past = [];
            future = [];
        };

        Object.defineProperty(instance, 'hasUndo', {
            get() { return past.length > 0; },
        });
        Object.defineProperty(instance, 'hasRedo', {
            get() { return future.length > 0; },
        });

        Object.assign(instance, { undo, redo, set, clear });

        return instance;
    },
    init(val) {
        this.clear();
        this.current = cloneObject(val);
    },
    current: undefined
};