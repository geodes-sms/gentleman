import { ContentHandler } from "./../content-handler";
import { createDocFragment, isHTMLElement, createDiv, valOrDefault, isNullOrUndefined, isEmpty } from "zenkai";
import { Algorithm } from "./algorithm";

const BasePatternAlgorithm = {
    init() {
        /*Svg dimensions*/
        this.width = valOrDefault(this.schema.dimensions.width, 500);
        this.height = valOrDefault(this.schema.dimensions.height, 500);

        this.buttons = [];
        this.anchors = new Map();
        this.items = {};
        this.patterns = [];
        this.augmentCount = 0;
        this.anchorIndex = 0;
        this.arrowInventory = new Map();
        this.childs = new Map();
        this.holders = new Map();

        return this;
    },

    render() {

        const { pattern, dimensions, arrow, attributes, anchorAttr } = this.schema;

        const fragment = createDocFragment();

        if (!isHTMLElement(this.container)) {
            this.container = createDiv({
                class: ["pattern-container"],
                dataset: {
                    nature: "algorithm",
                    algorithm: "pattern",
                    id: this.id,
                },
                tabindex: 1
            });
        }

        if (!isHTMLElement(this.interactionsArea)) {
            this.interactionsArea = createDiv({
                class: ["layout-container", "projection"],
                dataset: {
                    nature: "layout",
                    layout: "flex",
                    orientation: "row",
                    id: "iA" + this.id,
                    projection: -1
                },
                tabindex: 1
            });

            fragment.append(this.interactionsArea);

            this.interactionsArea.style["backgroundColor"] = "white";
        }

        if (!isEmpty(attributes) && isNullOrUndefined(this.attributes)) {
            this.attributes = [];
            attributes.forEach(a => {
                let k = ContentHandler.call(this, a);
                this.attributes.push(k);
                this.interactionsArea.append(k);
            });
        }


        if (!isNullOrUndefined(pattern.size.ratio) && isNullOrUndefined(this.patternInventory)) {
            this.patternInventory = new Map();
            this.anchorInventory = new Map();

            let attribute = ContentHandler.call(this, pattern.attribute);

            let button = this.environment.resolveElement(attribute);
            button.buttonIndex = this.buttons.length;
            this.buttons.push(button);

            this.registerPattern(pattern, attribute);

            this.interactionsArea.append(attribute);
        }

        if (!isEmpty(anchorAttr) && isNullOrUndefined(this.anchorAttr)) {
            this.anchorAttr = new Map();
            anchorAttr.forEach(a => {
                let attr = ContentHandler.call(this, a.attribute);
                this.anchorAttr.set(attr, a.placement);
                this.registerPattern(a, attr);
                this.interactionsArea.append(attr);
            });
        }


        if (!isHTMLElement(this.svgArea)) {
            this.svgArea = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.svgArea.setAttribute("width", this.width);
            this.svgArea.setAttribute("height", this.height);

            this.arrowsArea = document.createElementNS("http://www.w3.org/2000/svg", "g");
            this.svgArea.append(this.arrowsArea);

            this.arrowsArea.classList.add("arrowArea");

            this.definitionsArea = document.createElementNS("http://www.w3.org/2000/svg", "g");
            this.svgArea.append(this.definitionsArea);

            this.definitionsArea.classList.add("definitionArea");

            this.patternArea = document.createElementNS("http://www.w3.org/2000/svg", "g");
            this.svgArea.append(this.patternArea);

            this.waitingArea = document.createElementNS("http://www.w3.org/2000/svg", "g");
            this.svgArea.append(this.waitingArea);


            fragment.appendChild(this.svgArea);
        }


        if (isNullOrUndefined(this.openArrow) && !isNullOrUndefined(arrow)) {
            this.openArrow = createDiv({
                class: ["button-container", "projection"],
                dataset: {
                    nature: "layout",
                    layout: "flex",
                    id: "iA" + this.id,
                    projection: -1
                },
                tabindex: 1
            });

            this.openArrow.innerHTML = arrow.content;

            this.openArrow.addEventListener("click", (event) => {

                let window = this.environment.findWindow("side-instance");
                if (isNullOrUndefined(window)) {
                    window = this.environment.createWindow("side-instance");
                    window.container.classList.add("model-projection-sideview");
                }

                if (window.instances.size > 0) {
                    let instance = Array.from(window.instances)[0];
                    instance.delete();
                }


                arrow.attribute.forEach(a => {
                    let concept = this.source.getAttributeByName(a.dynamic.name).target;

                    let projection = this.environment.createProjection(concept, a.dynamic.tag);
                    let instance = this.environment.createInstance(concept, projection, {
                        type: "projection",
                        close: "DELETE-PROJECTION"
                    });


                    window.addInstance(instance);
                });


                if (!isNullOrUndefined(arrow.ranking)) {
                    this.orderRef = arrow.ranking.target;
                    this.order = arrow.ranking.order;

                    this.setOrderFunctions();
                }


                this.environment.setActiveReceiver(this, this.projection.rtags[0])

            });

            this.interactionsArea.append(this.openArrow);
        }

        if (fragment.hasChildNodes()) {
            this.container.append(fragment);
        }

        return this.container;
    },

    registerPattern(pattern, attribute) {

        let schema = {};

        let p = pattern.placement;
        let placement = {};
        switch (p.type) {
            case "evolutive-anchors":

                placement.type = "fixed";
                placement.current = { x: p.first.x, y: p.first.y };
                placement.next = { x: p.next.x, y: p.next.y };

                schema.placement = placement;
                console.log(schema.placement);
                break;
            case "anchor-based":
                placement.type = "duo";
                placement.from = "start";
                placement.to = "end";

                schema.placement = placement;
                break;
        }

        if (pattern.size) {
            let s = pattern.size;
            let size = {};

            switch (s.type) {
                case "ratio-sized":
                    size.type = "parent";
                    size.ratio = s.ratio
                    break;
                case "absolute-sized":
                    size.type = "auto";
                    size.ratio = s.ratio;
                    break
                case "inherited-size":
                    size.type = "relative";
                    size.marker = s.marker;
                    size.property = s.property;
                    break;
            }

            schema.size = size;
        }


        this.patternInventory.set(attribute, schema);
        this.anchorInventory.set(attribute, { data: { first: { x: 0.5, y: 0.5 }, next: { x: 0, y: 40 } }, inventory: new Map() });
    },

    setOrderFunctions() {

        switch (this.order) {
            case "Ascending":
                this.acceptOrder = this.acceptAscending;
                this.modifyOrder = this.modifyAscending;
                break;
            case "Descending":
                break;
            case "MinMax":
                this.acceptOrder = this.acceptMinMax;
                this.modifyOrder = this.modifyMinMax;
                break;
            case "MaxMin":
                break;
        }
    },

    createItem(object, button) {
        const n = button.item;

        /*PRETEND RATIO 0.1*/

        if (!this.model.hasProjectionSchema(object, n.tag)) {
            return "";
        }

        let itemProjection = this.model.createProjection(object, n.tag);
        itemProjection.optional = true;
        itemProjection.parent = this.projection;

        let container = itemProjection.init().render()


        return container;
    },

    addItem(value, button) {
        let schema = this.patternInventory.get(button.element);

        let position = { x: 0, y: 0 };

        let client = this.computePlacement(schema, position);

        if (client) {
            this.addToWaitingList(button, schema.placement, value);

            return;
        }

        let item = this.createItem(value, button);


        let holder = this.createHolder(item);

        if (isNullOrUndefined(this.refHolder) && !client) {
            this.refHolder = holder;
        }



        holder.setAttribute("x", position.x);
        holder.setAttribute("y", position.y);

        holder.dataset["source"] = value.id
        holder.dataset["buttonIndex"] = button.buttonIndex;
        if (isNullOrUndefined(this.items[button.element])) {
            this.items[button.element] = [];
        }
        holder.dataset["items"] = this.items[button.element].length;
        this.items[button.element].push(holder);
        this.patternArea.append(holder);

        this.patterns.push(value.id);

        this.holders.set(value.id, holder)


        this.adapt(item, schema.size);

        this.registerAnchor(this.anchorInventory.get(button.element), holder, value);


        if (this.augmentCount > 0) {
            let temp = holder;
            for (let i = 0; i < this.augmentCount; i++) {
                temp = this.augmentItem(temp);
            }

            for (let i = 0; i < this.anchorIndex; i++) {
                this.nextAnchor(temp.dataset["source"]);
            }
        }


    },

    computePlacement(schema, position) {
        let p = schema.placement;
        switch (p.type) {
            case "fixed":
                position.x = p.current.x;
                position.y = p.current.y;

                let c = p.current;
                c.x += p.next.x;
                c.y += p.next.y;

                schema.placement.current = c;
                return false

            case "duo":
                return true;;

        }
    },

    computePlacementChild(holder, item, source, target, projection) {
        let sourceAnchors = this.anchors.get(source);
        let targetAnchors = this.anchors.get(target);

        let arrowIndex = this.findFreeIndex(sourceAnchors, targetAnchors);

        if (arrowIndex === -1) {
            let newIndex = this.nextAnchor(source);

            if (targetAnchors.index < newIndex) {
                let tIndex = targetAnchors.index;
                while (tIndex < newIndex) {
                    tIndex = this.nextAnchor(target)
                }
            }
            arrowIndex = newIndex;
            sourceAnchors = this.anchors.get(source);
            targetAnchors = this.anchors.get(target);
        }

        let sourcePoint = sourceAnchors.indexes[arrowIndex];
        let targetPoint = targetAnchors.indexes[arrowIndex];

        let dx = sourcePoint.x - targetPoint.x;
        let dy = sourcePoint.y - targetPoint.y;

        let dr = Math.sqrt((dx * dx) + (dy * dy));

        projection.updateWidth(dr);
        projection.updateHeight(sourceAnchors.next.y);

        this.adaptSimple(item, dr)

        holder.setAttribute("x", Math.min(sourcePoint.x, targetPoint.x));
        holder.setAttribute("y", Math.min(sourcePoint.y, targetPoint.y));

        holder.style.boder = "solid black 3";

        this.svgArea.append(holder);

        this.registerAnchorOccupation(source, arrowIndex);
        this.registerAnchorOccupation(target, arrowIndex);

        return arrowIndex;
    },


    addToWaitingList(button, size, value) {
        if (isNullOrUndefined(this.waiting)) {
            this.waiting = [];
        }

        let window = this.environment.findWindow("side-instance");
        if (isNullOrUndefined(window)) {
            window = this.environment.createWindow("side-instance");
            window.container.classList.add("model-projection-sideview");
        }

        if (window.instances.size > 0) {
            let instance = Array.from(window.instances)[0];
            instance.delete();
        }

        let concept = value;

        let projection = this.environment.createProjection(concept, button.item.tag);
        let instance = this.environment.createInstance(concept, projection, {
            type: "projection",
            close: "DELETE-PROJECTION"
        });


        window.addInstance(instance);

        console.log(projection);
        console.log(concept);

        concept.getAttributeByName(size.from).target.register(projection);
        concept.getAttributeByName(size.to).target.register(projection);
        projection.registerHandler("value.changed", (value) => {
            this.notifyValue(projection);
        });

        this.waiting.push({
            projection: projection,
            from: size.from,
            to: size.to
        })

    },

    setForWaiting(holder, item, projection, size) {
        this.interactionsArea.appendChild(projection.interactionsArea);
        this.adaptForWaiting(projection.interactionsArea, item);
        this.waitingRoom.append(holder);

        projection.registerWaiter(this, size);

    },

    registerAnchor(schema, holder, key) {

        let anchor = schema.data;

        switch (anchor.type) {
            default:
                let current = {
                    x: holder.x.baseVal.value + schema.data.first.x * holder.width.baseVal.value,
                    y: holder.y.baseVal.value + schema.data.first.y * holder.height.baseVal.value
                }


                let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttribute("cx", current.x);
                circle.setAttribute("cy", current.y);
                circle.setAttribute("r", 3);
                circle.style.fill = "red";
                this.svgArea.append(circle);

                this.anchors.set(key.id, { current: current, next: anchor.next, index: 0, free: [0], indexes: [current] })

        }
    },

    nextAnchor(value, augment = true) {

        let anchor = this.anchors.get(value);

        let c = { x: anchor.current.x, y: anchor.current.y };
        c.x += anchor.next.x;
        c.y += anchor.next.y;

        let newIndex = anchor.index + 1;
        let indexes = anchor.indexes;
        indexes.push(c);

        let free = anchor.free;
        free.push(anchor.index + 1);

        this.anchors.set(value, {
            current: c,
            next: anchor.next,
            indexes: indexes,
            index: newIndex,
            free: free
        })
        if (newIndex > this.anchorIndex) {
            this.anchorIndex = newIndex;
        }

        if (augment) {
            this.checkAugment(this.holders.get(value));
        }

        return newIndex;

    },

    nextAnchorChild(value, child) {
        let childAnchors = this.childAnchors.get(child);

        let anchor = childAnchors.get(value);

        let c = anchor.current;
        c.x += anchor.next.x;
        c.y += anchor.next.y;

        let newIndex = anchor.index + 1;
        let indexes = anchor.indexes;
        indexes.push(c);
        let free = anchor.free;
        free.push(anchor.index + 1);
        childAnchors.set(value, {
            current: c,
            next: anchor.next,
            index: anchor.index + 1,
            free: free,
            indexes: indexes
        });

        this.childAnchors.set(child, childAnchors);

        return newIndex;
    },

    createHolder(element) {
        let holder = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        let foreign = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");

        holder.appendChild(foreign);
        foreign.appendChild(element);

        return holder;
    },

    adapt(item, size) {
        this.adaptForeign(item.parentNode, item);
        this.adaptSVG(item.parentNode.parentNode, item.parentNode, size);
    },

    adaptSimple(item, dr) {
        this.adaptForeign(item.parentNode, item);
        this.adaptSVGSimple(item.parentNode.parentNode, item.parentNode, dr);
    },

    adaptForeign(container, element) {
        element.style.width = "fit-content";

        let rect = element.getBoundingClientRect();

        container.setAttribute("width", rect.width);
        container.setAttribute("height", rect.height);
    },

    adaptSVG(container, foreign, size) {
        let w = Number(foreign.getAttribute("width"));
        let h = Number(foreign.getAttribute("height"));
        container.setAttribute("viewBox", "0 0 " + w + " " + h);

        switch (size.type) {
            case "parent":
                let wRatio = this.width * size.ratio;
                let hRatio = h * (wRatio / w);

                container.setAttribute("width", wRatio);
                container.setAttribute("height", hRatio);
                break;
            case "auto":
                container.setAttribute("width", w * size.ratio);
                container.setAttribute("height", h * size.ratio);
                break;

            case "relative":
                let base = this.items[this.buttons[0].element][0].dataset["source"]
                let target = this.items[this.buttons[0].element][3].dataset["source"]

                let index = this.findFreeIndex(this.anchors.get(base), this.anchors.get(target));

                this.registerAnchorOccupation(base, index);
                this.registerAnchorOccupation(target, index);

                let baseAnchors = this.anchors.get(base);
                let targetAnchors = this.anchors.get(target);

                let start = baseAnchors.indexes[index];
                let end = targetAnchors.indexes[index];

                this.adaptRelative(container, start, end, size);

        }
    },

    adaptSVGSimple(container, foreign, dr) {
        container.setAttribute("width", dr);
        container.setAttribute("height", (dr / Number(foreign.getAttribute("width"))) * Number(foreign.getAttribute("height")));


        container.setAttribute("viewBox", "0 0 " + foreign.getAttribute("width") + " " + foreign.getAttribute("height"));
    },

    adaptRatioSVG(container, foreign, ratio) {
        container.setAttribute("width", this.width * ratio);
        container.setAttribute("height", this.width * ratio * Number(foreign.getAttribute("height")) / Number(foreign.getAttribute("width")));

        container.setAttribute("viewBox", "0 0 " + foreign.getAttribute("width") + " " + foreign.getAttribute("height"));
    },

    adaptForWaiting(interaction, item) {
        /*projection.updateWidth(100);
        projection.updateHeight(100);*/

        let rect = interaction.getBoundingClientRect();

        let foreign = item.parentNode;
        foreign.setAttribute("width", 400);
        foreign.setAttribute("height", rect.height + 100);

        let holder = foreign.parentNode;
        holder.setAttribute("width", 400);
        holder.setAttribute("height", rect.height + 100);
        holder.setAttribute("viewBox", "0 0 " + 400 + " " + rect.height + 100)

        this.waitingRoom.setAttribute("width", 400);
        this.waitingRoom.setAttribute("height", rect.height + 100);

        item.remove();

        foreign.appendChild(interaction);

    },

    focusIn() {

    },

    focusOut() {

    },

    clickHandler(target) {
    },

    updateWidth(value) {
        this.width = value;
        this.svgArea.setAttribute("width", value);

    },

    updateHeight(value) {
        this.height = value;
        this.svgArea.setAttribute("height", value);

    },

    augmentItem(i) {

        this.local(i.querySelector("svg"));

        i.remove();

        let holder = this.createHolder(i.childNodes[0].childNodes[0]);

        holder.setAttribute("x", Number(i.getAttribute("x")));
        holder.setAttribute("y", Number(i.getAttribute("y")));
        holder.dataset["source"] = i.dataset["source"];
        holder.dataset["buttonIndex"] = i.dataset["buttonIndex"];
        holder.dataset["items"] = i.dataset["items"];

        this.items[this.buttons[holder.dataset["buttonIndex"]].element][holder.dataset["items"]] = holder;

        this.patternArea.append(holder);

        let schema = this.patternInventory.get(this.buttons[Number(holder.dataset["buttonIndex"])].element);

        this.adapt(holder.childNodes[0].childNodes[0], schema.size);

        this.holders.set(i.dataset["source"], holder);

        return holder;
    },

    local(i) {
        let item = i.querySelector("[data-extension]");

        let attribute = item.getAttribute("data-extension");

        let previous = Number(item.getAttribute(attribute));
        let add = Number(item.getAttribute("data-add"));

        item.setAttribute(attribute, previous + add);

        this.arrange(i, attribute, add);
    },

    arrange(i, attribute, add) {
        switch (attribute) {
            case "height":
                i.height.baseVal.valueInSpecifiedUnits += add;
                i.viewBox.baseVal.height += add;

                //        box.split(/\s+|,/);
                break;
            case "width":
                i.width.baseVal.valueInSpecifiedUnits += add;
                i.viewBox.baseVal.width += add;
                break;
        }
    },

    augmentChild(child, next) {
        let foreign = child.container.parentNode;

        let holder = foreign.parentNode;

        holder.setAttribute("height", Number(holder.getAttribute("height")) + next.y);

        let bh = Number(holder.getAttribute("height"));
        let k = Number(foreign.getAttribute("width"));
        let w = Number(holder.getAttribute("width"));

        let newH = (k / w) * bh;
        foreign.setAttribute("height", newH);

        holder.setAttribute("viewBox", "0 0 " + k + " " + newH);

        if (holder.x.baseVal.value + holder.width.baseVal.value > this.refHolder.width.baseVal.value ||
            holder.y.baseVal.value + holder.height.baseVal.value > this.refHolder.height.baseVal.value) {
            this.items[this.buttons[0].element].forEach(i => {
                this.augmentItem(i);
            })
        }
    },

    arrangeAbsolute(i, attribute, add) {
        switch (attribute) {
            case "height":
                i.height.baseVal.valueInSpecifiedUnits = add;
                i.viewBox.baseVal.height = add;

                break;
            case "width":
                i.width.baseVal.valueInSpecifiedUnits = add;
                i.viewBox.baseVal.width = add;

                break;
        }
    },

    branch() {
        this.buttons.forEach(b => {
            b.refresh()
        }
        );
        //this.openArrow.click();
    },

    checkAugment(holder) {
        let schema = this.anchors.get(holder.dataset["source"]);

        if (holder.x.baseVal.value + holder.width.baseVal.value < schema.current.x || holder.y.baseVal.value + holder.height.baseVal.value < schema.current.y) {
            let newH = this.augmentItem(holder);
            this.augmentCount++;
            this.items[this.buttons[holder.dataset["buttonIndex"]].element].filter((t) => t !== newH).forEach((i) => {
                while (this.nextAnchor(i.dataset["source"], false) < schema.index) { }
                this.augmentItem(i);
            }
            )
            this.refHolder = this.items[this.buttons[holder.dataset["buttonIndex"]].element][0];
        }
    },

    checkForChildGrowth(child, p1, next) {
        let container = this.childs.get(child);
        if (container.x.baseVal.value + container.width.baseVal.value < p1.x || container.y.baseVal.value + container.height.baseVal.value < p1.y) {
            this.augmentChild(child, next);
        }
    },

    accept(source, target, arrow) {

        let sourcePoint, targetPoint;
        if (!isNullOrUndefined(this.targetWaiter)) {
            this.targetWaiter.acceptAsChild(source, target, arrow, this);
            return;
        }
        let arInv = this.arrowInventory.get(arrow.source.id);

        if (!isNullOrUndefined(arInv)) {
            if (arInv.projID !== arrow.id) {
                return;
            }

            this.modifyArrow(source, target, arrow, arInv.index)
            return;
        }
        if (!isNullOrUndefined(this.orderRef)) {
            this.acceptOrder(source, target, arrow);
            return;
        }

        let sourceAnchors = this.anchors.get(source);
        let targetAnchors = this.anchors.get(target);

        if (source === target) {
            let selfIndex;
            if (isEmpty(sourceAnchors.free)) {
                selfIndex = this.nextAnchor(source);
                sourceAnchors = this.anchors.get(source);
            } else {
                selfIndex = sourceAnchors.free[0];
            }

            arrow.setPath("M " + sourceAnchors.indexes[selfIndex].x + " " + sourceAnchors.indexes[selfIndex].y +
                "l 30 0 l 0 20 l -30 0"
            )


            if (arrow.definitions) {
                this.definitionsArea.append(arrow.definitions);
            }

            this.arrowsArea.append(arrow.element);

            this.registerArrow(source, target, arrow, arrowIndex);

            return;


        }


        let arrowIndex = this.findFreeIndex(sourceAnchors, targetAnchors);

        if (arrowIndex === -1) {
            let newIndex = this.nextAnchor(source);

            if (targetAnchors.index < newIndex) {
                let tIndex = targetAnchors.index;
                while (tIndex < newIndex) {
                    tIndex = this.nextAnchor(target)
                }
                return this.accept(source, target, arrow);
            }
        }

        sourcePoint = sourceAnchors.indexes[arrowIndex];
        targetPoint = targetAnchors.indexes[arrowIndex];

        arrow.setLine(sourcePoint, targetPoint);
        if (arrow.definitions) {
            this.definitionsArea.append(arrow.definitions);
        }

        this.arrowsArea.append(arrow.element);

        if (arrow.decorator) {
            this.createDecorator(arrow);
            this.placeDecorator(arrow, sourcePoint, targetPoint, arrow.decorator.parentNode.parentNode);
        }

        this.registerArrow(source, target, arrow, arrowIndex);

    },

    acceptAscending(source, target, arrow) {
        arrow.register(this.orderRef);

        let nb = arrow.get(this.orderRef);
        let sourcePoint, targetPoint;

        if (isNullOrUndefined(nb)) {
            return;
        }
        sourcePoint = this.findAnchorIndex(source, nb);
        targetPoint = this.findAnchorIndex(target, nb);

        arrow.setLine(sourcePoint, targetPoint);

        if (arrow.definitions) {
            this.definitionsArea.append(arrow.definitions);
        }

        if (arrow.decorator) {
            this.createDecorator(arrow);
            this.placeDecorator(arrow, sourcePoint, targetPoint, arrow.decorator.parentNode.parentNode);
        }

        this.arrowsArea.append(arrow.element);


        this.registerArrowOrder(source, target, arrow, nb)

        return;
    },

    modifyAscending(source, target, arrow) {
        let nb = arrow.get(this.orderRef);

        if (isNullOrUndefined(nb)) {
            arrow.remove();
            return;
        }

        let sourcePoint = this.findAnchorIndex(source, nb);
        let targetPoint = this.findAnchorIndex(target, nb);

        arrow.setLine(sourcePoint, targetPoint);

        if (arrow.definitions) {
            this.definitionsArea.append(arrow.definitions);
        }

        this.arrowsArea.append(arrow.element);

        this.registerArrowOrder(source, target, arrow, nb)

        this.placeDecorator(arrow, sourcePoint, targetPoint, arrow.decorator.parentNode.parentNode)

        return;
    },

    acceptMinMax(source, target, arrow) {
        arrow.register(this.orderRef);

        let nb = arrow.get(this.orderRef);

        if (isNullOrUndefined(nb)) {
            return;
        }

        let targetIndex;

        if (isNullOrUndefined(this.orderRanking)) {
            this.orderRanking = [{ value: nb, arrow: arrow }];
            targetIndex = 0;
        } else {
            let schema = this.injectOrderMinMax(nb, arrow);
            targetIndex = schema.index;

            if (schema.move) {
                this.moveAfterMinMax(schema.index);
            }
        }
        let sourcePoint, targetPoint;

        if (source === target) {
            sourcePoint = this.findAnchorIndex(source, targetIndex);
            arrow.setPath(
                "M " + sourcePoint.x + " " + sourcePoint.y +
                "l 30 0 l 0 20 l -30 0"
            )

            this.arrowsArea.append(arrow.element);

            if (arrow.definitions) {
                this.definitionsArea.append(arrow.definitions);
            }

            this.registerArrowOrder(source, target, arrow, targetIndex)
            return;
        }

        sourcePoint = this.findAnchorIndex(source, targetIndex);
        targetPoint = this.findAnchorIndex(target, targetIndex);

        arrow.setLine(sourcePoint, targetPoint);

        if (arrow.definitions) {
            this.definitionsArea.append(arrow.definitions);
        }

        if (arrow.decorator) {
            this.createDecorator(arrow);
            this.placeDecorator(arrow, sourcePoint, targetPoint, arrow.decorator.parentNode.parentNode);
        }

        this.arrowsArea.append(arrow.element);


        this.registerArrowOrder(source, target, arrow, targetIndex)

        return;
    },

    injectOrderMinMax(value, arrow) {
        let i = 0;
        while (i < this.orderRanking.length && this.orderRanking[i].value < value) {
            i++;
        }

        if (i === this.orderRanking.length) {
            this.orderRanking.push({ value: value, arrow: arrow });
            return { index: i, move: false };
        }

        this.orderRanking.splice(i, 0, { value: value, arrow: arrow });

        return { index: i, move: true };
    },

    moveAfterMinMax(value) {
        for (let i = value + 1; i < this.orderRanking.length; i++) {
            let schema = this.orderRanking[i];

            let arrowInv = this.arrowInventory.get(schema.arrow.source.id);
            let arrow = schema.arrow;

            /*{source : source, target : target, index : arrowIndex, projID : arrow.id}*/

            let sourcePoint, targetPoint;

            let sourceAnchors = this.anchors.get(arrowInv.source);
            let targetAnchors = this.anchors.get(arrowInv.target);



            while (sourceAnchors.index < i) {
                this.nextAnchor(arrowInv.source);
                sourceAnchors = this.anchors.get(arrowInv.source);
            }

            if (arrowInv.source === arrowInv.target) {
                sourceAnchors.indexes[i];

                arrow.setPath("M " + sourcePoint.x + " " + sourcePoint.y +
                    "l 30 0 l 0 20 l -30 0")

            } else {
                while (targetAnchors.index < i) {
                    this.nextAnchor(arrowInv.target);
                    targetAnchors = this.anchors.get(arrowInv.target);
                }



                sourcePoint = sourceAnchors.indexes[i];
                targetPoint = targetAnchors.indexes[i];


                arrow.setLine(sourcePoint, targetPoint);

                if (arrow.decorator) {
                    this.placeDecorator(arrow, sourcePoint, targetPoint, arrow.decorator.parentNode.parentNode);
                }
            }

            arrowInv.index = i;

        }
    },

    moveBeforeMinMax(value, stop) {
        for (let i = value - 1; i >= stop; i--) {
            let schema = this.orderRanking[i];


            let arrowInv = this.arrowInventory.get(schema.arrow.source.id);
            let arrow = schema.arrow;

            /*{source : source, target : target, index : arrowIndex, projID : arrow.id}*/

            let sourcePoint, targetPoint;

            let sourceAnchors = this.anchors.get(arrowInv.source);

            if (arrowInv.source === arrowInv.target) {
                sourceAnchors.indexes[i];

                arrow.setPath("M " + sourcePoint.x + " " + sourcePoint.y +
                    "l 30 0 l 0 20 l -30 0");

            } else {
                let targetAnchors = this.anchors.get(arrowInv.target);


                sourcePoint = sourceAnchors.indexes[i];
                targetPoint = targetAnchors.indexes[i];

                arrow.setLine(sourcePoint, targetPoint);

                if (arrow.decorator) {
                    this.placeDecorator(arrow, sourcePoint, targetPoint, arrow.decorator.parentNode.parentNode);
                }

            }

            arrowInv.index = i;

        }
    },

    modifyMinMax(source, target, arrow) {
        let nb = arrow.get(this.orderRef);

        if (this.orderRanking.length === 1) {
            return;
        }

        let i = 0;

        while (i < this.orderRanking.length && this.orderRanking[i].arrow.id !== arrow.id) {
            i++;
        }

        this.orderRanking.splice(i, 1);

        let schema = this.injectOrderMinMax(nb, arrow);

        if (schema.index < this.orderRanking.length - 1) {
            this.moveAfterMinMax(schema.index);
        }

        if (schema.index > i) {
            this.moveBeforeMinMax(schema.index, i);
        }

        let sourceAnchors = this.anchors.get(source);
        let targetAnchors = this.anchors.get(target);

        while (sourceAnchors.index < schema.index) {
            this.nextAnchor(source);
            sourceAnchors = this.anchors.get(source);
        }

        if (source === target) {
            let point = sourceAnchors.indexes[schema.index];

            arrow.setPath("M " + point.x + " " + point.y +
                "l 30 0 l 0 20 l -30 0");

            this.registerArrowOrder(source, target, arrow, nb);

            return;
        }

        while (targetAnchors.index < schema.index) {
            this.nextAnchor(target);
            targetAnchors = this.anchors.get(target);
        }

        let sourcePoint = sourceAnchors.indexes[schema.index];
        let targetPoint = targetAnchors.indexes[schema.index];

        arrow.setLine(sourcePoint, targetPoint);

        if (arrow.decorator) {
            this.placeDecorator(arrow, sourcePoint, targetPoint, arrow.decorator.parentNode.parentNode);
        }

        this.registerArrowOrder(source, target, arrow, nb);
    },

    findAnchorIndex(elem, number) {
        let anchors = this.anchors.get(elem);

        if (anchors.indexes.length <= number) {
            for (let i = anchors.indexes.length; i <= number; i++) {
                this.nextAnchor(elem);
            }
            anchors = this.anchors.get(elem);
        }

        return anchors.indexes[number];
    },

    acceptAsChild(source, target, arrow, child) {
        let anchors = this.childAnchors.get(child);

        let sourceAnchors = anchors.get(source);
        let targetAnchors = anchors.get(target);

        let arrowIndex = this.findFreeIndex(sourceAnchors, targetAnchors);

        if (arrowIndex === -1) {
            let newIndex = this.nextAnchorChild(source, child);

            while (targetAnchors.index < newIndex) {
                this.nextAnchorChild(target, child);
                anchors = this.childAnchors.get(child);
                targetAnchors = anchors.get(target);
            }

            anchors = this.childAnchors.get(child);

            sourceAnchors = anchors.get(source);
            targetAnchors = anchors.get(target);

            arrowIndex = newIndex;
        }

        let sourcePoint = sourceAnchors.indexes[arrowIndex];
        let targetPoint = targetAnchors.indexes[arrowIndex];

        arrow.setLine(sourcePoint, targetPoint);
        if (arrow.definitions) {
            this.definitionsArea.append(arrow.definitions);
        }

        this.arrowsArea.append(arrow.element);
        this.checkForChildGrowth(child, sourcePoint, sourceAnchors.next);
        /*child.registerArrow(source, target, arrow, arrowIndex);*/
        this.registerAnchorOccupationChild(source, child, arrowIndex);
        this.registerAnchorOccupationChild(target, child, arrowIndex);
    },

    modifyArrow(source, target, arrow, index) {

        let informations = this.arrowInventory.get(arrow.source.id);
        let sourceAnchors, targetAnchors, arrowIndex, tIndex, sourcePoint, targetPoint;


        if ((informations.source !== source || informations.target !== target) && (!informations.order)) {


            this.freeAnchor(informations.source, index);
            this.freeAnchor(informations.target, index);

            sourceAnchors = this.anchors.get(source);
            targetAnchors = this.anchors.get(target);

            arrowIndex = this.findFreeIndex(sourceAnchors, targetAnchors);
            if (arrowIndex === -1) {
                arrowIndex = this.nextAnchor(source);

                tIndex = targetAnchors.index
                while (tIndex < arrowIndex) {
                    tIndex = this.nextAnchor(target)
                }
                sourceAnchors = this.anchors.get(source);
                targetAnchors = this.anchors.get(target);
            }

            sourcePoint = sourceAnchors.indexes[arrowIndex];
            targetPoint = targetAnchors.indexes[arrowIndex];

            arrow.setLine(sourcePoint, targetPoint);

            this.arrowInventory.set(arrow.source.id, { source: source, target: target, index: arrowIndex, projID: arrow.id });

            this.registerAnchorOccupation(source, arrowIndex);
            this.registerAnchorOccupation(target, arrowIndex);

            this.placeDecorator(arrow, sourcePoint, targetPoint, arrow.decorator.parentNode.parentNode)
            return;
        }


        if (informations.order) {
            this.modifyOrder(source, target, arrow, index);
        }

    },


    registerArrow(source, target, arrow, index) {
        this.arrowInventory.set(arrow.source.id, { source: source, target: target, index: index, projID: arrow.id });

        this.registerAnchorOccupation(source, index);

        if (source !== target) {
            this.registerAnchorOccupation(target, index);
        }
    },

    registerArrowOrder(source, target, arrow, index) {
        this.arrowInventory.set(arrow.source.id, { source: source, target: target, index: index, projID: arrow.id, order: true })
    },

    createDecorator(arrow) {
        let holder = this.createHolder(arrow.decorator);

        this.patternArea.append(holder);

        this.adaptForeign(arrow.decorator.parentNode, arrow.decorator);
        this.adaptRatioSVG(arrow.decorator.parentNode.parentNode, arrow.decorator.parentNode, arrow.ratio);
    },

    placeDecorator(arrow, source, target, holder) {
        let baseX, baseY, baseTarget;

        if (source.x < target.x) {
            baseTarget = source;
        } else {
            baseTarget = target;
        }

        switch (arrow.base) {
            case "center":
                let dx = source.x - target.x;
                let dy = source.y - target.y;
                let dr = Math.sqrt(dx * dx + dy * dy);

                baseX = baseTarget.x + dr / 2 - (Number(holder.getAttribute("width")) / 2);
                baseY = baseTarget.y - Number(holder.getAttribute("height"));

                break;
            case "left":

                baseX = baseTarget.x + 3;
                baseY = baseTarget.y - Number(holder.getAttribute("height"));
                break;
            case "right":

                if (source.x > target.x) {
                    baseTarget = source;
                } else {
                    baseTarget = target;
                }

                baseX = baseTarget.x - 3 - Number(holder.getAttribute("width"));
                baseY = baseTarget.y - Number(holder.getAttribute("height"));
                break;
        }

        holder.setAttribute("x", baseX);
        holder.setAttribute("y", baseY);

    },

    freeAnchor(value, index) {
        let anchors = this.anchors.get(value);

        let free = anchors.free;
        free.push(index);

        this.anchors.set(value, {
            current: anchors.current,
            next: anchors.next,
            index: anchors.index,
            free: free,
            indexes: anchors.indexes
        })
    },

    registerAnchorOccupation(value, index) {
        let anchors = this.anchors.get(value);

        let free = anchors.free;

        let freeIndex;
        for (let i = 0; i < free.length; i++) {
            if (free[i] === index) {
                freeIndex = i;
                break;
            }
        }

        free.splice(freeIndex, 1);

        this.anchors.set(value, {
            current: anchors.current,
            next: anchors.next,
            index: anchors.index,
            free: free,
            indexes: anchors.indexes
        })

    },

    registerAnchorOccupationChild(value, child, index) {

        let anchorsChild = this.childAnchors.get(child);

        let anchors = anchorsChild.get(value);

        let free = anchors.free;

        let freeIndex;
        for (let i = 0; i < free.length; i++) {
            if (free[i] === index) {
                freeIndex = i;
                break;
            }
        }

        free.splice(freeIndex, 1);

        anchorsChild.set(value, {
            current: anchors.current,
            next: anchors.next,
            index: anchors.index,
            free: free,
            indexes: anchors.indexes
        })

        this.childAnchors.set(anchorsChild);
    },

    findFreeIndex(source, target) {
        for (let i = 0; i < source.free.length; i++) {
            let candidate = source.free[i];
            if (target.free.includes(candidate)) {
                return candidate;
            }
        }
        return -1;
    },


    removeArrow(arrow) {
        arrow.element.remove();

        if (arrow.decorator) {
            arrow.decorator.parentNode.parentNode.remove();
        }

        let informations = this.arrowInventory.get(arrow.source.id);

        if (isNullOrUndefined(informations)) {
            return;
        }

        this.freeAnchor(informations.source, informations.index);
        this.freeAnchor(informations.target, informations.index);

        this.arrowInventory.delete(arrow.source.id);


    },

    registerWaiter(target) {
        this.targetWaiter = target;

        this.attributes[0].addEventListener("click", (event) => {
            this.exit(target);
        })

        this.attributes[1].addEventListener("click", (event) => {
            this.exit(target);
        })

    },

    setValues() {
        if (!isNullOrUndefined(this.source.getAttributeByName("to").target.value)) {
            this.valTarget = this.source.getAttributeByName("to").target.value;
        }

        if (!isNullOrUndefined(this.source.getAttributeByName("from").target.value)) {
            this.valSource = this.source.getAttributeByName("from").target.value;
        }

    },

    exit(target) {
        this.setValues();
        this.tryToExit(target);
    },

    joinSvgArea(projection, source, target) {
        console.log("Exiting");
        console.log(projection);
        console.log(source);
        console.log(target);

        let element = projection.element;

        element.svgArea.remove();

        let holder = this.createHolder(element.container);

        let sourceAnchors = this.anchors.get(source);
        let targetAnchors = this.anchors.get(target);

        let arrowIndex = this.findFreeIndex(sourceAnchors, targetAnchors);

        if (arrowIndex === -1) {
            let newIndex = this.nextAnchor(source);

            if (targetAnchors.index < newIndex) {
                let tIndex = targetAnchors.index;
                while (tIndex < newIndex) {
                    tIndex = this.nextAnchor(target)
                }
            }

            arrowIndex = newIndex;
            sourceAnchors = this.anchors.get(source);
            targetAnchors = this.anchors.get(target);
        }

        let s = sourceAnchors.indexes[arrowIndex];
        let t = targetAnchors.indexes[arrowIndex];

        let dx = s.x - t.x;
        let dy = s.y - t.y;
        let dr = Math.sqrt(dx * dx + dy * dy);

        holder.setAttribute("x", Math.min(s.x, t.x));
        holder.setAttribute("y", s.y);
        holder.setAttribute("width", dr);

        let foreign = element.container.parentNode;
        foreign.setAttribute("width", dr);



        this.svgArea.append(holder);

        let rect = element.container.getBoundingClientRect();

        foreign.setAttribute("height", rect.height);
        holder.setAttribute("height", rect.height);

    },

    setChildAnchors(index, source, target, child) {
        if (isNullOrUndefined(this.childAnchors)) {
            this.childAnchors = new Map();
        }

        let containment = [];

        let anchors = new Map();

        let sIndex, tIndex;

        for (let i = 0; i < this.patterns.length; i++) {
            if (this.patterns[i] === source) {
                sIndex = i;
            }

            if (this.patterns[i] === target) {
                tIndex = i;
            }
        }

        for (let i = Math.min(tIndex, sIndex); i <= Math.max(tIndex, sIndex); i++) {
            containment.push(this.patterns[i]);
        }

        containment.forEach(p => {
            let anchor = this.anchors.get(p);
            anchors.set(p, {
                current: {
                    x: anchor.indexes[index].x + ((Math.max(tIndex, sIndex) - Math.min(tIndex, sIndex) + 1) * anchor.next.x),
                    y: anchor.indexes[index].y + ((Math.max(tIndex, sIndex) - Math.min(tIndex, sIndex) + 1) * anchor.next.y)
                },
                next: anchor.next,
                index: 0,
                free: [0],
                indexes: [{
                    x: anchor.indexes[index].x + ((Math.max(tIndex, sIndex) - Math.min(tIndex, sIndex) + 1) * anchor.next.x),
                    y: anchor.indexes[index].y + ((Math.max(tIndex, sIndex) - Math.min(tIndex, sIndex) + 1) * anchor.next.y)
                }]
            });

        })

        this.childAnchors.set(child, anchors);
    },

    place() {
        this.container.prepend(this.interactionsArea);
    },

    notifyValue(projection) {
        console.log(projection);
        for (let i = 0; i < this.waiting.length; i++) {
            if (this.waiting[i].projection === projection) {
                let from = projection.element.source.getAttributeByName(
                    this.waiting[i].from
                ).target.value;

                let to = projection.element.source.getAttributeByName(
                    this.waiting[i].to
                ).target.value;

                console.log(projection.element.source);

                if (!isNullOrUndefined(from) && !isNullOrUndefined(to)) {
                    this.waiting.splice(i, 1);

                    this.joinSvgArea(projection, from, to);

                    return;
                }
            }
        }
    }

}

export const PatternAlgorithm = Object.assign({},
    Algorithm,
    BasePatternAlgorithm
);