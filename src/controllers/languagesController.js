const languagesSelect = $("#languages").first();
let defaultLanguage = null;

function editLanguages() {
    if (languageFiles.length == 0) return;
    languagesSelect.empty();
    for (let i = 0; i < languageFiles.length; i++) {
        languagesSelect.append(`<a class="dropdown-item clickable" onclick="chooseLanguage(${i})"><img src="https://www.countryflags.io/${languageFiles[i].name.match(/_(.*?)\./)[1]}/flat/16.png">${ISO6391.getName(languageFiles[i].name.split('_')[0])}</a>`);
    }
    chooseLanguage(languageFiles.findIndex(e => e.name.includes("en")));
}

function chooseLanguage(i) {
    const entries = $("#lang-entries").first();
    entries.empty();
    $("#dropdownMenuButton span").text(`${ISO6391.getName(languageFiles[i].name.split('_')[0])} (${languageFiles[i].name.split('.')[0]})`);
    fetch(languageFiles[i].path).then(e => e.json()).then(e => {
        if (defaultLanguage == null) defaultLanguage = e;
        for (let i in e) {
            const path = i.split(".");
            entries.append(`<tr>
            <td>${path[0]}</td>
            <td>${path[1]}</td>
            <td>${path[2]}</td>
            <td>${defaultLanguage[i]}</td>
            <td>${e[i]}</td>
          </tr>`);
        }
    });
}