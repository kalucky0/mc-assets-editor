class ItemsController {

    viewer;
    virtViewer;

    static init() {
        const container = $("#item-viewer");
        container.empty();
        this.viewer = new ModelViewer(container[0]);
        window.addEventListener('resize', this.viewer.resize);
        const virtContainer = document.createElement('div');
        this.virtViewer = new ModelViewer(virtContainer, true, 150, 150);
        this.virtViewer.camera.position.set(0, 0, 40);

        (async () => {
            const itemModels = json.filter(e => e.path.includes("models") && e.path.includes("item"));
            const itemTextures = textures.filter(e => e.path.includes("item"));
            for (let i = 0; i < itemModels.length; i++) {
                // TODO: implement generated items
            }
        })();
    }

    static renderItem(name, json) {
        const model = new JsonModel(name, json, [{
            name: "aerogel",
            texture: "https://kalucky.b-cdn.net/aether/textures/block/holystone_alt.png"
        }])
        this.viewer.load(model);
    }

    static async renderIcon(name, json) {
        const model = new JsonModel(name, json, [{
            name: "aerogel",
            texture: "https://kalucky.b-cdn.net/aether/textures/block/holystone_alt.png"
        }])
        model.applyDisplay("gui");
        this.virtViewer.load(model);
        return await this.virtViewer.toImage();
    }
}