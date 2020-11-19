import { ipcRenderer, shell } from 'electron';
import * as $ from "jquery";
import * as feather from "feather-icons";
import * as open from 'open';
import * as path from 'path';
import { onHashChange } from './controllers/menuController';

const darkmodeToggle = $("#darkmode-toggle").first();

export let isShiftPressed: boolean = false;
export let languageFiles: { path: any; }[] = [];
export let textures: any[] = [];
export let json: any[] = [];

feather.replace();

function openProject(projectPath: string | undefined = undefined) {
    ipcRenderer.invoke('open-project', projectPath).then((result) => {
        if (result === null) return;
        textures = result.textures;
        json = result.json;
        languageFiles = json.filter((e: any) => e.path.includes("lang"));
        $('#open-lang-folder').on('click', () => {
            open("file://" + path.dirname(languageFiles[0].path));
        });
        window.onhashchange = onHashChange;
        location.hash = "#languages";

        let recents = localStorage.recent === undefined ? [] : JSON.parse(localStorage.recent);
        if (!recents.some((e: any) => e.path == result.path)) {
            recents.push({
                name: result.name,
                path: result.path
            });
        }
        localStorage.recent = JSON.stringify(recents);
    });
}

window.onkeydown = (e: any) => {
    if (e.key === "Shift") isShiftPressed = true;
};

window.onkeyup = (e: any) => {
    if (e.key === "Shift") isShiftPressed = false;
};

darkmodeToggle.on("click", () => $("html").first().toggleClass("darkmode"));
$('body').on('click', '.external', (event) => {
    event.preventDefault();
    let link = event.target.href === undefined ? ($(event.target).parent().attr('href') === undefined ? $(event.target).parent().parent().attr('href') : $(event.target).parent().attr('href')) : event.target.href;
    shell.openExternal(link);
});