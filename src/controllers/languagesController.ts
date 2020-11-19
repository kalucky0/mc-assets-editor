import * as ISO6391 from "iso-639-1";

export class LanguagesController {
    static languagesSelect = $("#languages").first();
    static defaultLanguage: { [x: string]: any; } = null;
    static languageFiles: any[] = null;

    static show(langFiles: any[], buttons: any) {
        if (langFiles.length == 0) return;
        this.languageFiles = langFiles;
        this.languagesSelect.empty();
        buttons.html(`<button class="btn btn-sm btn-outline-secondary" id="open-lang-folder">Open Languages Folder</button>`);
        for (let i = 0; i < langFiles.length; i++) {
            this.languagesSelect.append(`<a class="dropdown-item clickable" onclick="LanguagesController.chooseLanguage(${i})"><img src="https://www.countryflags.io/${this.languageFiles[i].name.match(/_(.*?)\./)[1]}/flat/16.png">${(ISO6391 as any).getName(this.languageFiles[i].name.split('_')[0])}</a>`);
        }
        this.chooseLanguage(langFiles.findIndex(e => e.name.includes("en")));
    }

    static chooseLanguage(i: number) {
        const entries = $("#lang-entries").first();
        entries.empty();
        $("#dropdownMenuButton span").text(`${(ISO6391 as any).getName(this.languageFiles[i].name.split('_')[0])} (${this.languageFiles[i].name.split('.')[0]})`);
        fetch(this.languageFiles[i].path).then(e => e.json()).then(e => {
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