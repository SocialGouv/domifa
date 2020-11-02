const { Soit, Quand, Alors } = require("./_fr");
const { I } = inject();

Soit("un navigateur web sur le site", () => {
  I.amOnPage("/");
});

Quand("je pause le test", () => {
  pause();
});

Quand("je recherche {string}", (searchText) => {
  I.fillField("q", searchText);
});

Quand("je rentre {string} dans {string}", (value, placeholder) => {
  I.fillField(placeholder, value);
});

Quand("je remplis les champs suivants", (table) => {
  table.rows.forEach(({ cells: [{ value: label }, { value }] }) => {
    I.fillField(label, value);
  });
});

Quand(
  "je cherche {string} dans le champ {string}",
  (searchText, searchInput) => {
    I.fillField(searchInput, searchText);
  }
);

Quand("je clique sur {string}", (text) => {
  I.click(text);
});

Alors("je vois {string}", (text) => {
  I.see(text);
});

Alors("je vois l'élément {string}", (text) => {
  I.seeElement(text);
});

Alors("je suis redirigé vers la page: {string}", (url) => {
  I.waitInUrl(url, 5);
});

Alors("le lien {string} pointe sur {string}", (text, url) => {
  I.seeElement(
    `//a[starts-with(., "${text}") and contains(./@href, "${url}")]`
  );
});

Alors("je vois le bouton {string}", (text) => {
  I.seeElement(`//button[contains(., "${text}")]`);
});

Alors("je vois que le bouton {string} est désactivé", (text) => {
  I.seeElement(`//button[contains(., "${text}") and @disabled="disabled"]`);
});

Alors("je vois que l'envoi du formulaire est désactivé", () => {
  I.seeElement("input[type=submit]:disabled");
});

Quand("j'attends que le message {string} apparaisse", (title) => {
  I.scrollPageToTop();
  I.waitForElement(`//h3[contains(., "${title}")]`, 3);
});

Quand("j'attends que le texte {string} s'affiche", (title) => {
  I.scrollPageToTop();
  I.waitForText(title, 3);
});

Alors("je coche la case {string}", (text) => {
  I.checkOption(text);
});

Alors("je vois un message d'erreur s'afficher {string}", (text) => {
  I.waitForElement(`.toast-error`, 2);
});

Alors("j'actualise", () => {
  I.refreshPage();
});

Alors(
  "je vois le chiffre {string} à la ligne {string}",
  (resultat, position) => {
    I.see(resultat, '//*[@id="table-stats"]/tbody/tr[' + position + "]/td[2]");
  }
);
