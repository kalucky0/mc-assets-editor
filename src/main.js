var electron = require("electron");
var path = require("path");
const filePath = __dirname;

function createWindow() {
    var mainWindow = new electron.BrowserWindow({
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        },
        width: 800
    });
    mainWindow.loadFile(path.join(__dirname, "../index.html"));
    mainWindow.webContents.openDevTools();
}

electron.app.on("ready", function () {
    electron.dialog.showOpenDialog({
        properties: ['openDirectory']
    }).then((a) => {
        if (a.canceled) electron.app.quit();
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