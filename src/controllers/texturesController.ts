import { isShiftPressed, textures } from "../renderer";
import LazyLoad from "vanilla-lazyload";
import * as $ from "jquery";

const lazyLoadInstance = new LazyLoad();

export class TexturesController {
    // static generateHTML = require('./src/controllers/textureSingleView');
    static tiledTextures: number[] = [0];

    static viewTextures(buttons: any) {
        buttons.empty();
        const viewtxt = $("#view-txt").first();
        viewtxt.empty();
        for (let i = 0; i < textures.length; i++) {
            let namespace = textures[i].path.match(/assets(\/|\\)(.*?)(\/|\\)/)[2];
            let type = textures[i].path.split(/(\/|\\)/);
            type = type[type.length - 3];
            viewtxt.append(`<tr id="textureListItem-${i}">
                <td><img class="lazy" data-src="${textures[i].path}"></td>
                <td>${namespace}</td>
                <td>${textures[i].name}</td>
                <td>${type}</td></tr>`);
        }
        lazyLoadInstance.update();

        for (let i = 0; i < textures.length; i++) {
            $(`#textureListItem-${i}`).on('click', async () => {
                // await this.generateHTML(textures[i])
            });
        }
    }

    static viewTiler(buttons: any) {
        buttons.html(`<button class="btn btn-sm btn-outline-secondary" onclick="TexturesController.shuffleTiles()">Shuffle</button>
    <button class="btn btn-sm btn-outline-secondary" onclick="TexturesController.rotateTiles()">Randomize rotation</button>`);
        const viewtxt = $("#tiler-textures").first();
        viewtxt.empty();
        for (let i = 0; i < textures.length; i++) {
            let type = textures[i].path.split(/(\/|\\)/);
            type = type[type.length - 3];
            if (type !== "block") continue;
            viewtxt.append(`<img data-src="${textures[i].path}" class="lazy" onclick="TexturesController.chooseBlock(${i})">`);
        }
        lazyLoadInstance.update();
    }

    static chooseBlock(i: number) {
        const tiler = $("#tiler").first();
        tiler.empty();
        if (isShiftPressed) {
            this.tiledTextures.push(i);
            for (let j = 0; j < 9; j++) {
                let r = this.tiledTextures[Math.floor(Math.random() * this.tiledTextures.length)];
                tiler.append(`<img src="${textures[r].path}">`);
            }
        } else {
            this.tiledTextures = [];
            this.tiledTextures.push(i);
            for (let j = 0; j < 9; j++)
                tiler.append(`<img src="${textures[i].path}">`);
        }
    }

    static shuffleTiles() {
        const tiler = $("#tiler").first();
        tiler.empty();
        for (let j = 0; j < 9; j++) {
            let r = this.tiledTextures[Math.floor(Math.random() * this.tiledTextures.length)];
            tiler.append(`<img src="${textures[r].path}">`);
        }
    }

    static rotateTiles() {
        const tiler = $("#tiler").first();
        tiler.empty();
        for (let j = 0; j < 9; j++) {
            let r = this.tiledTextures[Math.floor(Math.random() * this.tiledTextures.length)];
            tiler.append(`<img src="${textures[r].path}" style="transform: rotate(${((Math.floor(Math.random() * 4)) * 90)}deg);">`);
        }
    }
}