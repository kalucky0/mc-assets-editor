const languageSelector = $("#language-selector").first();
const menuItems = $(".sidebar-sticky .nav-link");
const content = $("#content").first();
const title = $("#title").first();
const screens = $(".screen");

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
            editRecipes();
            break;
        case "#blockstates":
            title.html("Blockstates Editor");
            setMenu(2);
            setScreen(2);
            break;
        case "#advancements":
            title.html("Advancements Editor");
            setMenu(3);
            setScreen(3);
            break;
        case "#models":
            title.html("Model Viewer");
            setMenu(4);
            setScreen(4);
            break;
        case "#items":
            title.html("Item Viewer");
            setMenu(5);
            setScreen(5);
            itemsInit();
            break;
        case "#viewer":
            title.html("Texture Viewer");
            setMenu(6);
            setScreen(6);
            viewTextures();
            break;
        case "#tiler":
            title.html("Texture Tiler");
            setMenu(7);
            setScreen(7);
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
    buttons.empty();
    content.html(screens.eq(screen).html());
}

function sleep(ms) {
    return new Promise(cb => setTimeout(cb, ms));
}

window.onhashchange = onHashChange;