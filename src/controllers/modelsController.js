class ModelsController {

    viewer;
    virtViewer;

    static init() {
        const container = $("#model-viewer");
        this.viewer = new ModelViewer(container[0], true);
        window.addEventListener('resize', this.viewer.resize);
        const virtContainer = document.createElement('div');;
        this.virtViewer = new ModelViewer(virtContainer, true, 150, 150);
        this.viewer.camera.position.set(0, 0, 40);

        (async () => {
            const blockModels = json.filter(e => e.path.includes("models") && e.path.includes("block"));
            const blockTextures = textures.filter(e => e.path.includes("block")).map(e => {return {'name': e.name.split('.')[0], 'texture': e.path}});
            console.log(blockModels);
            // for (let i = 0; i < blockModels.length; i++) {
            for (let i = 3; i < blockModels.length; i++) {
                try {
                    const json = await fetch(blockModels[i].path).then(e => e.json());
                    const icon = await this.renderIcon(blockModels[i].name, json, blockTextures);
                    console.log(i);
                    this.renderModel(blockModels[i].name, json, blockTextures);
                } catch (e) {
                    // console.log(e); 
                    // console.log(blockModels[i].path); 
                }
            }
        })();
    }

    static async showModel(i) {
        const blockModels = json.filter(e => e.path.includes("models") && e.path.includes("block"));
        const blockTextures = textures.filter(e => e.path.includes("block")).map(e => {return {'name': e.name.split('.')[0], 'texture': e.path}});
        console.log(blockTextures);
        const model = await fetch(blockModels[i].path).then(e => e.json());
        
        this.renderModel(blockModels[i].name, model, blockTextures);
    }

    static renderModel(name, json, txt) {
        this.viewer.removeAll();
        const model = new JsonModel(name, json, txt)
        model.applyDisplay("ground");
        this.viewer.load(model);
    }

    static async renderIcon(name, json, txt) {
        const model = new JsonModel(name, json, txt)
        model.applyDisplay("gui");
        this.virtViewer.load(model);
        return await this.virtViewer.toImage();
    }
}