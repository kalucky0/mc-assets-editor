import { app, BrowserWindow, ipcMain,dialog } from "electron";
import * as path from "path";
import * as dirTree from "directory-tree";
import { readFileSync } from "fs";

let textures: any[] = [];
let json: any[] = [];

function createWindow() {
    const win = new BrowserWindow({
        title: "Minecraft Assets Editor",
        icon: path.join(__dirname, "../icon.ico"),
        height: 720,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        },
        width: 1180,
        minWidth: 1180
    });
    win.loadFile(path.join(__dirname, "../index.html"));
    win.setMenuBarVisibility(false);
    // win.webContents.openDevTools();
}

app.on("ready", () => createWindow());

app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        app.quit();
});

ipcMain.handle('open-project', async (event, resourcesPath) => {
    if (resourcesPath === undefined) {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory'],
            title: "Select Resource folder.",
        });

        if (result.canceled) return null;
        resourcesPath = result.filePaths[0];
    }

    console.log(JSON.stringify(resourcesPath));

    const tree = dirTree(resourcesPath);
    // if(tree.children === null) tree.children = [];

    if (tree.children!.some((e: { name: string; }) => e.name == "assets")) {
        dirTree(path.join(resourcesPath, "assets"), {
            extensions: /(\.png)|(\.jpg)/
        }, undefined, (item: dirTree.DirectoryTree, PATH: any, stats: any) => {
            textures = textures.concat(item.children);
        });
        textures = textures.filter(e => e.type == "file");

        dirTree(path.join(resourcesPath, "assets"), {
            extensions: /(\.json)/
        }, undefined, (item: dirTree.DirectoryTree, PATH: any, stats: any) => {
            json = json.concat(item.children);
        });
        json = json.filter(e => e.type == "file");
    }
    if (tree.children!.some((e: { name: string; }) => e.name == "data")) {

    }

    let name = undefined;
    try {
        name = JSON.parse(readFileSync(path.join(resourcesPath, "fabric.mod.json")).toString()).name;
    } catch (e) {
        try {
            name = readFileSync(path.join(resourcesPath, "mods.toml"), {
                encoding: 'utf-8'
            }).match(/displayName(.*?)"(.*?)"/);
            name = name![name!.length - 1];
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