# Ajout des attributs title pour les liens target="\_blank" - Conformité RGAA

Ce document liste tous les liens avec `target="_blank"` qui ont été modifiés pour ajouter l'attribut `title` avec le format "contenu - nouvelle fenêtre" pour assurer la conformité au RGAA.

## Fichiers modifiés

1. ✅ src/app/app.component.html
2. ✅ src/app/modules/general/components/static-pages/politique/politique.component.html

## Fichiers en cours de modification

Les fichiers suivants contiennent des liens `target="_blank"` et doivent être modifiés:

- src/app/modules/general/components/static-pages/rgaa/rgaa.component.html
- src/app/modules/general/components/static-pages/landing-page-portail/landing-page-portail.component.html
- src/app/modules/general/components/faq/fragments/faq-usage/faq-usage.component.html
- src/app/modules/general/components/faq/fragments/faq-fiches/faq-fiches.component.html
- src/app/modules/general/components/faq/fragments/faq-discover/faq-discover.component.html
- src/app/modules/general/components/faq/fragments/faq-security/faq-security.component.html
- src/app/modules/general/components/home/home.component.html
- src/app/modules/general/components/decouvrir-domifa/decouvrir-domifa.component.html
- src/app/modules/general/components/plan-site/plan-site.component.html
- src/app/modules/structures/components/structures-form/structures-form.component.html
- src/app/modules/structures/components/structures-sms-form/structures-sms-form.component.html
- src/app/modules/structures/components/structures-custom-docs/structures-custom-docs.component.html
- src/app/modules/import-usagers/components/import/import.component.html
- src/app/modules/admin-portail-usagers/components/admin-portail-usagers-menu/admin-portail-usagers-menu.component.html
- src/app/modules/usager-shared/components/display-duplicates-usager/display-duplicates-usager.component.html
- src/app/modules/shared/components/faq-section/faq-section.component.html
- src/app/modules/structures/components/structures-upload-docs/structures-upload-docs.component.html

## Format à respecter

Pour chaque lien avec `target="_blank"`, ajouter un attribut `title` avec le format:

```html
title="Contenu du lien - nouvelle fenêtre"
```

Exemples:

- `title="Site du Ministère - nouvelle fenêtre"`
- `title="Formulaire de contact - nouvelle fenêtre"`
- `title="Guide utilisateur - nouvelle fenêtre"`
