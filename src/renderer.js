const darkmodeToggle = $("#darkmode-toggle").first();
const ipcRenderer = require('electron').ipcRenderer;
const menuItems = $(".sidebar-sticky .nav-link");
const languageSelector = $("#langSel").first();
const buttons = $("#buttons-bar").first();
const lazyLoadInstance = new LazyLoad();
const content = $("#content").first();
const title = $("#title").first();
const screens = $(".screen");
let isShiftPressed = false;
let tiledTextures = [0];
let textures = [];
feather.replace();

ipcRenderer.on('textures-data', (event, data) => {
    textures = data;
    onHashChange();
});

window.onhashchange = onHashChange;
window.onkeydown = e => {
    if (e.key === "Shift") isShiftPressed = true;
};

window.onkeyup = e => {
    if (e.key === "Shift") isShiftPressed = false;
};

darkmodeToggle.on( "click", () => $("html").first().toggleClass("darkmode"));

if (location.hash === "") location.hash = "#languages";
onHashChange();

function onHashChange() {
    switch (location.hash) {
        case "#languages":
            title.html("Languages Editor");
            setMenu(0);
            setScreen(0);
            break;
        case "#recipes":
            title.html("Recipes Editor");
            setMenu(1);
            setScreen(1);
            break;
        case "#blockstates":
            title.html("Blockstates Editor");
            setMenu(2);
            setScreen(2);
            break;
        case "#models":
            title.html("Model Viewer");
            setMenu(3);
            setScreen(3);
            break;
        case "#items":
            title.html("Item Viewer");
            setMenu(4);
            setScreen(4);
            break;
        case "#viewer":
            title.html("Texture Viewer");
            setMenu(5);
            setScreen(5);
            viewTextures();
            break;
        case "#tiler":
            title.html("Texture Tiler");
            setMenu(6);
            setScreen(6);
            viewTiler();
            break;
    }
}

function setMenu(item) {
    for (let i = 0; i < menuItems.length; i++) {
        if (i === item)
            menuItems.eq(i).addClass("active");
        else
            menuItems.eq(i).removeClass("active");
    }
}

function setScreen(screen) {
    content.html(screens.eq(screen).html());
}

function viewTextures() {
    buttons.empty();
    const viewtxt = $("#view-txt").first();
    console.log(textures[0]);
    viewtxt.empty();
    for (let i = 0; i < textures.length; i++) {
        let namespace = textures[i].path.match(/assets(\/|\\)(.*?)(\/|\\)/)[2];
        let type = textures[i].path.split(/(\/|\\)/);
        type = type[type.length - 3];
        viewtxt.append(`<tr>
                <td><img class="lazy" data-src="${textures[i].path}"></td>
                <td>${namespace}</td>
                <td>${textures[i].name}</td>
                <td>${type}</td></tr>`);
    }
    lazyLoadInstance.update();
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