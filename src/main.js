const electron = require("electron");
const path = require("path");
const dirTree = require("directory-tree");
const {
    mkdirSync,
    copyFileSync,
    readFileSync
} = require("fs");
const {
    default: getAppDataPath
} = require("appdata-path");
let textures = [];
let json = [];

function createWindow() {
    var mainWindow = new electron.BrowserWindow({
        title: "Minecraft Assets Editor",
        icon: path.join(__dirname, "../icon.ico"),
        height: 720,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true,
            enableRemoteModule: true
        },
        width: 1180,
        minWidth: 1180
    });
    mainWindow.loadFile(path.join(__dirname, "../index.html"));
    mainWindow.setMenuBarVisibility(false);
    // mainWindow.webContents.openDevTools();
}

electron.app.on("ready", () => {
    mkdirSync(getAppDataPath('mc-asset-editor') + "/cache/dist", {
        recursive: true
    });
    copyFileSync(path.join(__dirname, "../node_modules/jquery/dist/jquery.js"), getAppDataPath('mc-asset-editor') + "/cache/dist/jquery.js");
    copyFileSync(path.join(__dirname, "../node_modules/bootstrap/dist/js/bootstrap.js"), getAppDataPath('mc-asset-editor') + "/cache/dist/bootstrap.js");
    copyFileSync(path.join(__dirname, "../dist/app.css"), getAppDataPath('mc-asset-editor') + "/cache/dist/app.css");
    createWindow();
});

electron.app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        electron.app.quit();
});

electron.ipcMain.handle('open-project', async (event, resourcesPath) => {
    if (resourcesPath === undefined) {
        const result = await electron.dialog.showOpenDialog({
            properties: ['openDirectory'],
            title: "Select Resource folder.",
        });

        if (result.canceled) return null;
        resourcesPath = result.filePaths[0];
    }

    console.log(JSON.stringify(resourcesPath));

    const tree = dirTree(resourcesPath);
    if (tree.children.some(e => e.name == "assets")) {
        dirTree(path.join(resourcesPath, "assets"), {
            extensions: /(\.png)|(\.jpg)/
        }, null, (item, PATH, stats) => {
            textures = textures.concat(item.children);
        });
        textures = textures.filter(e => e.type == "file");

        dirTree(path.join(resourcesPath, "assets"), {
            extensions: /(\.json)/
        }, null, (item, PATH, stats) => {
            json = json.concat(item.children);
        });
        json = json.filter(e => e.type == "file");
    }
    if (tree.children.some(e => e.name == "data")) {

    }

    let name = undefined;
    try {
        name = JSON.parse(readFileSync(path.join(resourcesPath, "fabric.mod.json"))).name;
    } catch (e) {
        try {
            name = readFileSync(path.join(resourcesPath, "mods.toml"), {
                encoding: 'utf-8'
            }).match(/displayName(.*?)"(.*?)"/);
            name = name[name.length - 1];
        } catch (e) {
            return null;
        }
    }
    return {
        name: name,
        path: resourcesPath,
        json: json,
        textures: textures
    };
});