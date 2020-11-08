const electron = require("electron");
const path = require("path");
const dirTree = require("directory-tree");
const { mkdirSync, copyFileSync } = require("fs");
const { default: getAppDataPath } = require("appdata-path");
let resourcesPath;
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
            nodeIntegration: true
        },
        width: 1100,
        minWidth: 1020
    });
    mainWindow.loadFile(path.join(__dirname, "../index.html"));
    mainWindow.setMenuBarVisibility(false);
    mainWindow.webContents.openDevTools();

    const tree = dirTree(resourcesPath);
    if (tree.children.some(e => e.name == "assets")) {
        dirTree(path.join(resourcesPath, "assets"), {
            extensions: /(\.png)|(\.jpg)/
        }, null, (item, PATH, stats) => {
            textures = textures.concat(item.children);
        });
        textures = textures.filter(e => e.type == "file");
        mainWindow.webContents.on('did-finish-load', () =>
            mainWindow.webContents.send('textures-data', textures));

        dirTree(path.join(resourcesPath, "assets"), {
            extensions: /(\.json)/
        }, null, (item, PATH, stats) => {
            json = json.concat(item.children);
        });
        json = json.filter(e => e.type == "file");
        mainWindow.webContents.on('did-finish-load', () =>
            mainWindow.webContents.send('json-data', json));
    }
    if (tree.children.some(e => e.name == "data")) {

    }
}

electron.app.on("ready", function () {
    mkdirSync(getAppDataPath('mc-asset-editor') + "/cache/dist", {recursive: true});
    copyFileSync(path.join(__dirname, "../node_modules/jquery/dist/jquery.js"), getAppDataPath('mc-asset-editor') + "/cache/dist/jquery.js");
    copyFileSync(path.join(__dirname, "../node_modules/bootstrap/dist/js/bootstrap.js"), getAppDataPath('mc-asset-editor') + "/cache/dist/bootstrap.js");
    electron.dialog.showOpenDialog({
        properties: ['openDirectory'],
        title: "Select Resource folder.",     
    }).then((a) => {
        if (a.canceled) electron.app.quit();
        resourcesPath = a.filePaths[0];
        createWindow();
        electron.app.on("activate", function () {
            if (electron.BrowserWindow.getAllWindows().length === 0)
                createWindow();
        });
    });
});

electron.app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        electron.app.quit();
    }
});

function flatten(arr) {
    return arr.reduce(function (flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
}