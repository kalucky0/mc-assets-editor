let viewer;
let virtViewer;

function itemsInit() {
    const container = $("#item-viewer");
    viewer = new ModelViewer(container[0]);
    window.addEventListener('resize', viewer.resize);
    const virtContainer = document.createElement('div');;
    virtViewer = new ModelViewer(virtContainer, true, 150, 150);
    virtViewer.camera.position.set(0,0,40);

    (async() => {
        const blockModels = json.filter(e => e.path.includes("models") && e.path.includes("block"));
        const blockTextures = textures.filter(e => e.path.includes("block"));
        console.log(blockTextures);
        for(let i = 0; i < blockModels.length; i++) {
            // TODO: implement
        }
    })();
}

function renderModel(name, json) {
    const model = new JsonModel(name, json, [{name: "aerogel", texture: "https://kalucky.b-cdn.net/aether/textures/block/holystone_alt.png"}])
    viewer.load(model);
}

async function renderIcon(name, json) {
    const model = new JsonModel(name, json, [{name: "aerogel", texture: "https://kalucky.b-cdn.net/aether/textures/block/holystone_alt.png"}])
    model.applyDisplay("gui");
    virtViewer.load(model);
    return await virtViewer.toImage();
}