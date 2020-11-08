const electron = require("electron");
const path = require("path");
const dirTree = require("directory-tree");
let resourcesPath;
let textures = [];
let json = [];

function createWindow() {
    var mainWindow = new electron.BrowserWindow({
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true
        },
        width: 800
    });
    mainWindow.loadFile(path.join(__dirname, "../index.html"));
    mainWindow.webContents.openDevTools();

    const tree = dirTree(resourcesPath);
    if (tree.children.some(e => e.name == "assets")) {
        dirTree(path.join(resourcesPath, "assets"), {
            extensions: /(\.png)|(\.jpg)/
        }, null, (item, PATH, stats) => {
            textures = textures.concat(item.children);
        });
        textures = textures.filter(e => e.type == "file");
        mainWindow.webContents.once('did-finish-load', () => {
            mainWindow.webContents.send('textures-data', textures);
            console.log(textures);
        });
    }
    if (tree.children.some(e => e.name == "data")) {

    }
}

electron.app.on("ready", function () {
    electron.dialog.showOpenDialog({
        properties: ['openDirectory']
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