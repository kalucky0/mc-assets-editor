const generateHTML = require('./src/controllers/textureSingleView');
const lazyLoadInstance = new LazyLoad();
let tiledTextures = [0];

function viewTextures() {
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
            await generateHTML(textures[i])
        });
    }
}

function viewTiler() {
    buttons.html(`<button class="btn btn-sm btn-outline-secondary" onclick="shuffleTiles()">Shuffle</button>
    <button class="btn btn-sm btn-outline-secondary" onclick="rotateTiles()">Randomize rotation</button>`);
    const viewtxt = $("#tiler-textures").first();
    viewtxt.empty();
    for (let i = 0; i < textures.length; i++) {
        let type = textures[i].path.split(/(\/|\\)/);
        type = type[type.length - 3];
        if (type !== "block") continue;
        viewtxt.append(`<img data-src="${textures[i].path}" class="lazy" onclick="chooseBlock(${i})">`);
    }
    lazyLoadInstance.update();
}

function chooseBlock(i) {
    const tiler = $("#tiler").first();
    tiler.empty();
    if (isShiftPressed) {
        tiledTextures.push(i);
        for (let j = 0; j < 9; j++) {
            let r = tiledTextures[Math.floor(Math.random() * tiledTextures.length)];
            tiler.append(`<img src="${textures[r].path}">`);
        }
    } else {
        tiledTextures = [];
        tiledTextures.push(i);
        for (let j = 0; j < 9; j++)
            tiler.append(`<img src="${textures[i].path}">`);
    }
}

function shuffleTiles() {
    const tiler = $("#tiler").first();
    tiler.empty();
    for (let j = 0; j < 9; j++) {
        let r = tiledTextures[Math.floor(Math.random() * tiledTextures.length)];
        tiler.append(`<img src="${textures[r].path}">`);
    }
}

function rotateTiles() {
    const tiler = $("#tiler").first();
    tiler.empty();
    for (let j = 0; j < 9; j++) {
        let r = tiledTextures[Math.floor(Math.random() * tiledTextures.length)];
        tiler.append(`<img src="${textures[r].path}" style="transform: rotate(${((Math.floor(Math.random() * 4)) * 90)}deg);">`);
    }
}