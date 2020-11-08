const menuItems = document.querySelectorAll(".sidebar-sticky .nav-link");
const languageSelector = document.querySelector("#langSel");
const buttons = document.querySelector("#buttons-bar");
const screens = document.querySelectorAll(".screen");
const ipcRenderer = require('electron').ipcRenderer;
const content = document.querySelector("#content");
const title = document.querySelector("#title");
let isShiftPressed = false;
let tiledTextures = [0];
let textures = [];
feather.replace();

ipcRenderer.on('textures-data', function (event, data) {
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

if (location.hash === "") location.hash = "#languages";
onHashChange();

function onHashChange() {
    switch (location.hash) {
        case "#languages":
            title.innerHTML = "Languages Editor";
            setMenu(0);
            setScreen(0);
            break;
        case "#recipes":
            title.innerHTML = "Recipes Editor";
            setMenu(1);
            setScreen(1);
            break;
        case "#blockstates":
            title.innerHTML = "Blockstates Editor";
            setMenu(2);
            setScreen(2);
            break;
        case "#models":
            title.innerHTML = "Model Viewer";
            setMenu(3);
            setScreen(3);
            break;
        case "#items":
            title.innerHTML = "Item Viewer";
            setMenu(4);
            setScreen(4);
            break;
        case "#viewer":
            title.innerHTML = "Texture Viewer";
            setMenu(5);
            setScreen(5);
            viewTextures();
            break;
        case "#tiler":
            title.innerHTML = "Texture Tiler";
            setMenu(6);
            setScreen(6);
            viewTiler();
            break;
    }
}

function setMenu(item) {
    languageSelector.style.display = item === 0 ? "" : "none";
    for (let i = 0; i < menuItems.length; i++) {
        if (i === item)
            menuItems[i].className += " active";
        else
            menuItems[i].className = menuItems[i].className.replace(/\bactive\b/g, "");
    }
}

function setScreen(screen) {
    content.innerHTML = screens[screen].innerHTML;
}

function viewTextures() {
    buttons.innerHTML = '';
    const viewtxt = document.querySelector("#view-txt");
    console.log(textures[0]);
    viewtxt.innerHTML = '';
    for (let i = 0; i < textures.length; i++) {
        let namespace = textures[i].path.match(/assets(\/|\\)(.*?)(\/|\\)/)[2];
        let type = textures[i].path.split(/(\/|\\)/);
        type = type[type.length - 3];
        viewtxt.innerHTML += `<tr>
                <td><img src="${textures[i].path}"></td>
                <td>${namespace}</td>
                <td>${textures[i].name}</td>
                <td>${type}</td></tr>`;
    }
}

function viewTiler() {
    buttons.innerHTML = `<button class="btn btn-sm btn-outline-secondary" onclick="shuffleTiles()">Shuffle</button>`;
    buttons.innerHTML += `<button class="btn btn-sm btn-outline-secondary" onclick="rotateTiles()">Randomize rotation</button>`;
    const viewtxt = document.querySelector("#tiler-textures");

    // TODO: Show textures from directory
    /*
            textures = e;
            viewtxt.innerHTML = '';
            for (let i = 0; i < e.length; i++) {
                if (e[i].t !== "block") continue;
                viewtxt.innerHTML += `<img src="https://kalucky.b-cdn.net${e[i].p}/${e[i].n}" onclick="chooseBlock(${i})">`;
            }
        */
}

function chooseBlock(i) {
    const tiler = document.querySelector("#tiler");
    tiler.innerHTML = '';
    if (isShiftPressed) {
        tiledTextures.push(i);
        for (let j = 0; j < 9; j++) {
            let r = tiledTextures[Math.floor(Math.random() * tiledTextures.length)];
            tiler.innerHTML += `<img src="${textures[r].p}/${textures[r].n}">`;
        }
    } else {
        tiledTextures = [];
        tiledTextures.push(i);
        for (let j = 0; j < 9; j++)
            tiler.innerHTML += `<img src="${textures[i].p}/${textures[i].n}">`;
    }
}

function shuffleTiles() {
    const tiler = document.querySelector("#tiler");
    tiler.innerHTML = '';
    for (let j = 0; j < 9; j++) {
        let r = tiledTextures[Math.floor(Math.random() * tiledTextures.length)];
        tiler.innerHTML += `<img src="${textures[r].p}/${textures[r].n}">`;
    }
}

function rotateTiles() {
    const tiler = document.querySelector("#tiler");
    tiler.innerHTML = '';
    for (let j = 0; j < 9; j++) {
        let r = tiledTextures[Math.floor(Math.random() * tiledTextures.length)];
        tiler.innerHTML += `<img src="${textures[r].p}/${textures[r].n}" style="transform: rotate(${((Math.floor(Math.random() * 4)) * 90)}deg);">`;
    }
}