import { isNullOrUndefined, isFunction, valOrDefault, isHTMLElement } from 'zenkai';

export const FnHandler = {
    /**
 * Get Handlers registered to this name
 * @param {string} name 
 * @returns {*[]} List of registered handlers
 */
    getHandlers(name) {
        return valOrDefault(this.handlers.get(name), []);
    },
    /**
     * Triggers an event, invoking the attached handler in the registered order
     * @param {*} event 
     */
    triggerEvent(event, callback, oneach = true) {

        const { name, options, args } = event;

        const handlers = this.getHandlers(name);

        const hasCallback = isFunction(callback);
        let halt = false;

        handlers.forEach((handler) => {
            let result = handler.call(this, args, options);

            if (result === false) {
                halt = true;
                return;
            }

            if (oneach && hasCallback) {
                callback.call(this, result);
            }
        });

        if (halt) {
            return false;
        }

        if (!oneach && hasCallback) {
            callback.call(this);
        }

        return true;
    },
    /**
     * Sets up a function that will be called whenever the specified event is triggered
     * @param {string} name 
     * @param {Function} handler The function that receives a notification
     */
    registerHandler(name, handler) {
        if (!this.hasHanlder(name)) {
            this.handlers.set(name, []);
        }

        this.handlers.get(name).push(handler);

        return true;
    },
    /**
     * Removes an event handler previously registered with `registerHandler()`
     * @param {string} name 
     * @param {Function} handler The function that receives a notification
     */
    unregisterHandler(name, handler) {
        if (!this.hasHanlder(name)) {
            return false;
        }

        let handlers = this.getHandlers(name);
        for (let i = 0; i < handlers.length; i++) {
            if (handlers[i] === handler) {
                handlers.splice(i, 1);

                return true;
            }
        }

        return false;
    },
    hasHanlder(name) {
        return this.handlers.has(name);
    },
    
    registerReceiver(proj, rtag) {
        if (isNullOrUndefined(this.activeReceiver[rtag])) {
            this.activeReceiver[rtag] = proj;
        }

        if (isNullOrUndefined(this.receivers[rtag])) {
            this.receivers[rtag] = {
                root: proj,
                projections: []
            };

            proj.isRoot = true;
        }


        this.receivers[rtag].projections.push(proj);
    },

    saturationRevolved(proj, rtag){
        console.log("Revolving");
        console.log(rtag);
        console.log(this.receivers);

        let projections = this.receivers[rtag].projections;

        let index;

        for(let i = 0; i < projections.length; i++){
            if(proj.id === projections[i].id){
                index = i;
            }
        }

        if(index >= projections.length){
            this.setActiveReceiver(proj, rtag);
            return;
        }

        let element = projections[index + 1].transmitFirst();

        console.log("Transmitting first");
        console.log(element);

        proj.acceptAnchor(element);
    },

    getActiveReceiver(rtag) {
        return this.activeReceiver[rtag];
    },

    setActiveReceiver(proj, rtag) {
        this.activeReceiver[rtag] = proj;
    },

    getRootReceiver(rtag) {
        return this.receivers[rtag].root;
    },

    findReceiverInstance(instance, rtag) {
        let candidates = this.receivers[rtag].projections;

        for (let i = 0; i < candidates.length; i++) {
            let res = candidates[i].instances.get(instance);
            if (isHTMLElement(res)) {
                return { container: candidates[i], instance: res };
            }
        }


        alert("Not Found");
    },
};