const { isNullOrUndefined, isNullOrWhitespace } = require("zenkai");

const Tree = {

    render(){
        const { dimensions, orientation, duration, depth } = this.schema;
        
        if(isNullOrUndefined(this.container)){
            this.container = document.createElementNS("http://www.w3.org/2000/svg", "svg");

            this.container.classList.add("algorithm-container");
            this.container.dataset.nature = "algorithm";
            this.container.dataset.algorithm = "tree";
            this.container.dataset.id = this.id;
            this.container.tabindex = 1;
            this.container.id = this.id;

            this.container.setAttribute("width", this.width);
            this.container.setAttribute("height", this.height);
        }

        if(isNullOrUndefined(this.linkSpace)){
            this.linkSpace = document.createElementNS("http://www.w3.org/2000/svg", "g");

            this.linkSpace.classList("linkSpace" + this.id);
        }

        
        if(isNullOrUndefined(this.nodeSpace)){
            this.nodeSpace = document.createElementNS("http://www.w3.org/2000/svg", "g");

            this.nodeSpace.classList("nodeSpace" + this.id);
        }

        if(isNullOrUndefined(this.root)){
            this.createRoot();
        }
    },

    createRoot(){
        const {tag, treeId } = this.schema.tag;

        this.root = this.model.createProjection(this.source, this.rootTag).init();
        this.root.parent = this.projection;

        let projection = this.root.render();
        projection.setAttribute("data-tree", treeId);

        this.rootProj = projection;

        let holder = this.createHolder();

        holder.setAttribute('id', root.getAttribute("data-concept"));

        switch(this.orientation){
            case "horizontal":
                holder.setAttribute("x", 0);
                holder.setAttribute("y", this.height / 2 - this.rootProj.element.height / 2);
                break;
            case "vertical":
                holder.setAttribute("y", 0);
                holder.setAttribute("x", this.width / 2 - this.rootProj.element.width / 2);
                break;
        }
    

        holder.append(root);
        this.nodeSpace.appendChild(holder);

        this.data = [
            {
                name: "root",
                index: 0,
                id: this.rootProj.getAttribute("data-concept")
            }
        ]
    },

    accept(){
        
    },

    createHolder(){
        let holder = document.createElementNS("http://www.w3.org/2000/svg", "g");
        holder.classList.add("node");

        return holder;
    }
}