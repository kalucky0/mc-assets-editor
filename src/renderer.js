const languageSelector = $("#language-selector").first();
const darkmodeToggle = $("#darkmode-toggle").first();
const ipcRenderer = require('electron').ipcRenderer;
const electron = require('electron').remote;
const generateHTML = require('./src/textureSingleView');
const menuItems = $(".sidebar-sticky .nav-link");
const languagesSelect = $("#languages").first();
const buttons = $("#buttons-bar").first();
const shell = require("electron").shell;
const path = require('path');
const lazyLoadInstance = new LazyLoad();
const content = $("#content").first();
const title = $("#title").first();
const screens = $(".screen");
let isShiftPressed = false;
let defaultLanguage = null;
let tiledTextures = [0];
let languageFiles = [];
let textures = [];
let json = [];
feather.replace();

ipcRenderer.on('textures-data', (event, data) => {
    textures = data;
    onHashChange();
});

ipcRenderer.on('json-data', (event, data) => {
    json = data;
    languageFiles = json.filter(e => e.path.includes("lang"));
    $('#open-lang-folder').on('click', () => {
        shell.showItemInFolder(languageFiles[0]);
    });
    onHashChange();
});

window.onhashchange = onHashChange;
window.onkeydown = e => {
    if (e.key === "Shift") isShiftPressed = true;
};

window.onkeyup = e => {
    if (e.key === "Shift") isShiftPressed = false;
};

darkmodeToggle.on("click", () => $("html").first().toggleClass("darkmode"));
$('body').on('click', '.external', (event) => {
    event.preventDefault();
    let link = event.target.href === undefined ? ($(event.target).parent().attr('href') === undefined ? $(event.target).parent().parent().attr('href') : $(event.target).parent().attr('href')) : event.target.href;
    console.log(event.target);
    shell.openExternal(link);
});

if (location.hash === "") location.hash = "#languages";

function onHashChange() {
    switch (location.hash) {
        case "#languages":
            title.html("Languages Editor");
            setMenu(0);
            setScreen(0);
            editLanguages();
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
    item === 0 ? languageSelector.show() : languageSelector.hide();
    for (let i = 0; i < menuItems.length; i++)
        i === item ? menuItems.eq(i).addClass("active") : menuItems.eq(i).removeClass("active");
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
        viewtxt.append(`<tr id="textureListItem-${i}">
                <td><img class="lazy" data-src="${textures[i].path}"></td>
                <td>${namespace}</td>
                <td>${textures[i].name}</td>
                <td>${type}</td></tr>`);
    }
    lazyLoadInstance.update();

    for (let i = 0; i < textures.length; i++) {
        $(`#textureListItem-${i}`).hover(
            function () {
                $(this).css("background-color","#aad3ff");
            }, 
            function () {
                $(this).css("background-color","");
            }
        );
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

function editLanguages() {
    if(languageFiles.length == 0) return;
    console.log(languageFiles);
    languagesSelect.empty();
    for (let i = 0; i < languageFiles.length; i++) {
        languagesSelect.append(`<a class="dropdown-item clickable" onclick="chooseLanguage(${i})"><img src="https://www.countryflags.io/${languageFiles[i].name.match(/_(.*?)\./)[1]}/flat/16.png">${ISO6391.getName(languageFiles[i].name.split('_')[0])}</a>`);
    }
    chooseLanguage(languageFiles.findIndex(e => e.name.includes("en")));
}

function chooseLanguage(i) {
    const entries = $("#lang-entries").first();
    entries.empty();
    $("#dropdownMenuButton span").text(`${ISO6391.getName(languageFiles[i].name.split('_')[0])} (${languageFiles[i].name.split('.')[0]})`);
    fetch(languageFiles[i].path).then(e => e.json()).then(e => {
        if(defaultLanguage == null) defaultLanguage = e;
        for(let i in e) {
            console.log(i);
            const path = i.split(".");
            entries.append(`<tr>
            <td>${path[0]}</td>
            <td>${path[1]}</td>
            <td>${path[2]}</td>
            <td>${defaultLanguage[i]}</td>
            <td>${e[i]}</td>
          </tr>`);
        }
    });
}