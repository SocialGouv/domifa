# Github - tickets / issues

## Titres des tickets

La convention de nommage des tickets s'inspire de celles des commits: <https://github.com/conventional-changelog/commitlint>

__Exemples de titres__:

- __bug__(PUBLIC): [__statistiques__] valeur incorrecte colonne xxx
- __bug__(STRUCTURE): [__domiciliés__] erreur tri colonne xxx

- __feat__(PUBLIC): [__statistiques__] ajouter données xxx
- __feat__(STRUCTURE): [__nouvelle page XXX__] afficher information xxx

- __style__(STRUCTURE_ADMIN): [recherche de domicilié] agrandir la police du nombre de résultats de recherche

Le format recommandé est le suivant: `${prefix}(${CATEGORIE}): [${page/theme}]: ${description}`

__prefix__: l'une des valeurs suivants (liste évolutive en fonction des besoins du projet):

- 'feat': nouvelle fonctionnalité
- 'bug': bug à corriger
- 'style': apparence/UI
- 'docs': documentation
- 'chore': tâche technique de routine
- 'perf': performances
- 'refactor': restructuration du code
- 'revert': annulation d'un commit précédent
- 'test': test de l'application

__CATEGORIE__: regroupement par grande catégorie, par exemple par espace utilisateur si c'est adapté:

- PUBLIC: pages publiques (non connecté)
- STRUCTURE: espace d'une structure (quelque soit le rôle connecté)
- STRUCTURE_ADMIN: admin de structure
- ADMIN_DOMIFA: admin technique

__page/theme__: regroupement plus précis, par exemple par page, ou grande fonctionnalité
