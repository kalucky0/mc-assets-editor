const {
    readFile,
    writeFile,
    mkdirSync
} = require("fs");
const {
    join
} = require("path");
const electron = require('electron').remote;
const getAppDataPath = require("appdata-path").default;

async function generateHTML(texture) {
    console.log(join(__dirname, "./views/templates/textureViewer.html"))
    readFile(join(__dirname, "./views/templates/textureViewer.html"), {encoding: 'utf-8'}, (err, html) => {
        if(err) return;
        html = html.replace("%textureName0%", texture.name);
        html = html.replace("%textureName1%", texture.name);
        html = html.replace("%textureSource%", texture.path);
        html = html.replace("%textureInfo%", `${texture.path} <br> ${texture.size} bytes <br> ${texture.extension.replace(".", "")}`);
        mkdirSync(getAppDataPath('mc-asset-editor') + `/cache/`, {
            recursive: true
        });
        writeFile(getAppDataPath('mc-asset-editor') + `/cache/${texture.name}.html`, html, () => {
            let tempViewWindow = new electron.BrowserWindow({
                icon: texture.path
            });
            tempViewWindow.setMenuBarVisibility(false);
            tempViewWindow.loadFile(getAppDataPath('mc-asset-editor') + `/cache/${texture.name}.html`);
            tempViewWindow.show();
        });
    });


}

module.exports = generateHTML;