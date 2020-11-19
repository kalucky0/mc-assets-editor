import { ModelViewer, JsonModel } from '../modelViewer';
import { json, textures } from "../renderer";

export class ItemsController {

    static viewer: any;
    static virtViewer: any;

    static init() {
        const container = $("#item-viewer");
        container.empty();
        this.viewer = new (ModelViewer as any)(container[0]);
        window.addEventListener('resize', this.viewer.resize);
        const virtContainer = document.createElement('div');
        this.virtViewer = new (ModelViewer as any)(virtContainer, true, 150, 150);
        this.virtViewer.camera.position.set(0, 0, 40);

        (async () => {
            const itemModels = json.filter((e: { path: string | string[]; }) => e.path.includes("models") && e.path.includes("item"));
            const itemTextures = textures.filter((e: { path: string | string[]; }) => e.path.includes("item"));
            for (let i = 0; i < itemModels.length; i++) {
                // TODO: implement generated items
            }
        })();
    }

    static renderItem(name: any, json: any) {
        const model = new (JsonModel as any)(name, json, [{
            name: "aerogel",
            texture: "https://kalucky.b-cdn.net/aether/textures/block/holystone_alt.png"
        }])
        this.viewer.load(model);
    }

    static async renderIcon(name: any, json: any) {
        const model = new (JsonModel as any)(name, json, [{
            name: "aerogel",
            texture: "https://kalucky.b-cdn.net/aether/textures/block/holystone_alt.png"
        }])
        model.applyDisplay("gui");
        this.virtViewer.load(model);
        return await this.virtViewer.toImage();
    }
}