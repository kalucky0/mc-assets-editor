let mcBlocks = [];
class RecipesController {

    static show() {
        buttons.html(`<button class="btn btn-sm btn-outline-secondary" onclick="openJAR()">Open Minecraft JAR</button>`);
        const mcBlocksPicker = $("#recipe-mc-blocks").first();
        if (mcBlocks.length == 0) {
            fetch("./src/blocks.json").then(e => e.json()).then(e => {
                mcBlocks = e;
                for (let i in e)
                    mcBlocksPicker.append(`<div class="col-md-1 m-0 p-1"><img src="${e[i].texture}" draggable="true"></div>`);
            })
        } else {
            for (let i in mcBlocks)
                mcBlocksPicker.append(`<div class="col-md-1 m-0 p-1"><img src="${mcBlocks[i].texture}" draggable="true"></div>`);
        }

        $('#myTab a').on('click', function (e) {
            console.log(this);
            e.preventDefault()
            $(this).tab('show');
        });

        hljs.highlightBlock($(".card pre code").get(0));

        $("#block-search").on('input', (e) => {
            console.log($(e.target).val());
            mcBlocksPicker.empty();
            const temp = mcBlocks.filter(a => {
                return a.id.includes($(e.target).val()) || a.name.includes($(e.target).val());
            });
            for (let i in temp)
                mcBlocksPicker.append(`<div class="col-md-1 m-0 p-1"><img src="${temp[i].texture}" draggable="true"></div>`);
        });
    }
}