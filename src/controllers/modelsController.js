class ModelsController {

    viewer;
    virtViewer;

    static init() {
        const container = $("#item-viewer");
        this.viewer = new ModelViewer(container[0]);
        window.addEventListener('resize', this.viewer.resize);
        const virtContainer = document.createElement('div');;
        this.virtViewer = new ModelViewer(virtContainer, true, 150, 150);
        this.virtViewer.camera.position.set(0, 0, 40);

        (async () => {
            const blockModels = json.filter(e => e.path.includes("models") && e.path.includes("block"));
            const blockTextures = textures.filter(e => e.path.includes("block"));
            console.log(blockTextures);
            for (let i = 0; i < blockModels.length; i++) {
                // TODO: implement
            }
        })();
    }

    static renderModel(name, json) {
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