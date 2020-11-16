const languageSelector = $("#language-selector").first();
const menuItems = $(".sidebar-sticky .nav-link");
const content = $("#content").first();
const title = $("#title").first();
const screens = $(".screen");

if (location.hash === "") {
    title.html("Minecraft Assets Editor");
    setScreen(10);
}

function onHashChange() {
    switch (location.hash) {
        case "#languages":
            title.html("Language Editor");
            setMenu(0);
            setScreen(0);
            LanguagesController.show();
            break;
        case "#recipes":
            title.html("Recipe Editor");
            setMenu(1);
            setScreen(1);
            RecipesController.show();
            break;
        case "#blockstates":
            title.html("Blockstate Editor");
            setMenu(2);
            setScreen(2);
            break;
        case "#advancements":
            title.html("Advancement Editor");
            setMenu(3);
            setScreen(3);
            break;
        case "#loot":
            title.html("Loot Table Editor");
            setMenu(4);
            setScreen(4);
            break;
        case "#models":
            title.html("Model Viewer");
            setMenu(5);
            setScreen(5);
            ModelsController.init();
            break;
        case "#items":
            title.html("Item Viewer");
            setMenu(6);
            setScreen(6);
            ItemsController.init();
            break;
        case "#viewer":
            title.html("Texture Viewer");
            setMenu(7);
            setScreen(7);
            TexturesController.viewTextures();
            break;
        case "#tiler":
            title.html("Texture Tiler");
            setMenu(8);
            setScreen(8);
            TexturesController.viewTiler();
            break;
        case "#analyzer":
            title.html("Project Analyzer");
            setMenu(9);
            setScreen(9);
            TexturesController.viewTiler();
            break;
    }
}

function setMenu(item) {
    item === 0 ? languageSelector.show() : languageSelector.hide();
    for (let i = 0; i < menuItems.length; i++)
        i === item ? menuItems.eq(i).addClass("active") : menuItems.eq(i).removeClass("active");
}

function setScreen(screen) {
    buttons.empty();
    content.html(screens.eq(screen).html());
}

function sleep(ms) {
    return new Promise(cb => setTimeout(cb, ms));
}