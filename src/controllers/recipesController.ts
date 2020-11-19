import * as hljs from 'highlight.js';

export class RecipesController {

    static mcBlocks: any[] = [];

    static show(buttons: any) {
        buttons.html(`<button class="btn btn-sm btn-outline-secondary" onclick="openJAR()">Open Minecraft JAR</button>`);
        const mcBlocksPicker = $("#recipe-mc-blocks").first();
        if (this.mcBlocks.length == 0) {
            fetch("./src/blocks.json").then(e => e.json()).then(e => {
                this.mcBlocks = e;
                for (let i in e)
                    mcBlocksPicker.append(`<div class="col-md-1 m-0 p-1"><img src="${e[i].texture}" draggable="true"></div>`);
            })
        } else {
            for (let i in this.mcBlocks)
                mcBlocksPicker.append(`<div class="col-md-1 m-0 p-1"><img src="${this.mcBlocks[i].texture}" draggable="true"></div>`);
        }

        hljs.highlightBlock($(".card pre code").get(0));

        $("#block-search").on('input', (e) => {
            console.log($(e.target).val());
            mcBlocksPicker.empty();
            const temp = this.mcBlocks.filter(a => {
                return a.id.includes($(e.target).val()) || a.name.includes($(e.target).val());
            });
            for (let i in temp)
                mcBlocksPicker.append(`<div class="col-md-1 m-0 p-1"><img src="${temp[i].texture}" draggable="true"></div>`);
        });
    }
}