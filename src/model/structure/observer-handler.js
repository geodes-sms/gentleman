
export const ObserverHandler = {
    /** @type {*[]} */
    listeners: null,
    initObserver() {
        this.listeners = [];

        return this;
    },
    register(listener) {
        if (!this.listeners.includes(listener)) {
            this.listeners.push(listener);
        }

        return true;
    },
    unregister(listener) {
        var index = this.listeners.indexOf(listener);
        
        if (index !== -1) {
            this.listeners.splice(index, 1);
            
            return true;
        }

        return false;
    },
    unregisterAll() {
        this.listeners = [];
    },
    notify(message, value) {
        this.listeners.forEach(listener => {
            listener.update(message, value, this);
        });
    },
};
