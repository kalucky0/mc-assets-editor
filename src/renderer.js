const darkmodeToggle = $("#darkmode-toggle").first();
const ipcRenderer = require('electron').ipcRenderer;
const buttons = $("#buttons-bar").first();
const shell = require("electron").shell;
const path = require('path');
const open = require('open');
let isShiftPressed = false;
let languageFiles = [];
let textures = [];
let json = [];
feather.replace();

function openProject(path = undefined) {
    ipcRenderer.invoke('open-project', path).then((result) => {
        if (result === null) return;
        textures = result.textures;
        json = result.json;
        languageFiles = json.filter(e => e.path.includes("lang"));
        $('#open-lang-folder').on('click', () => {
            open("file://" + path.dirname(languageFiles[0].path));
        });
        window.onhashchange = onHashChange;
        location.hash = "#languages";

        let recents = localStorage.recent === undefined ? [] : JSON.parse(localStorage.recent);
        if (!recents.some(e => e.path == result.path)) {
            recents.push({
                name: result.name,
                path: result.path
            });
        }
        localStorage.recent = JSON.stringify(recents);
    });
}

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
    shell.openExternal(link);
});