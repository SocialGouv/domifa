const { Soit, Quand, Alors } = require("./_fr");

//

const { I } = inject();

//

Soit("un navigateur web sur le site", () => {
  I.amOnPage("/");
});

//

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

Alors("je suis redirigé vers la page: {string}", (url) => {
  I.waitInUrl(url, 5);
});
