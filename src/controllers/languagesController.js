class LanguagesController {

    static languagesSelect = $("#languages").first();
    static defaultLanguage = null;

    static show() {
        if (languageFiles.length == 0) return;
        this.languagesSelect.empty();
        buttons.html(`<button class="btn btn-sm btn-outline-secondary" id="open-lang-folder">Open Languages Folder</button>`);
        for (let i = 0; i < languageFiles.length; i++) {
            this.languagesSelect.append(`<a class="dropdown-item clickable" onclick="LanguagesController.chooseLanguage(${i})"><img src="https://www.countryflags.io/${languageFiles[i].name.match(/_(.*?)\./)[1]}/flat/16.png">${ISO6391.getName(languageFiles[i].name.split('_')[0])}</a>`);
        }
        this.chooseLanguage(languageFiles.findIndex(e => e.name.includes("en")));
    }

    static chooseLanguage(i) {
        const entries = $("#lang-entries").first();
        entries.empty();
        $("#dropdownMenuButton span").text(`${ISO6391.getName(languageFiles[i].name.split('_')[0])} (${languageFiles[i].name.split('.')[0]})`);
        fetch(languageFiles[i].path).then(e => e.json()).then(e => {
            if (this.defaultLanguage == null) this.defaultLanguage = e;
            for (let i in e) {
                const path = i.split(".");
                entries.append(`<tr>
            <td>${path[0]}</td>
            <td>${path[1]}</td>
            <td>${path[2]}</td>
            <td>${this.defaultLanguage[i]}</td>
            <td>${e[i]}</td>
          </tr>`);
            }
        });
    }
}