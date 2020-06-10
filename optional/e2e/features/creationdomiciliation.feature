#language: fr

@creationdomiciliation
Fonctionnalité: Création d'une demande de domiciliation
  Pour pouvoir créer une demande de domiciliation sur Domifa
  En tant que visiteur
  Je veux pouvoir me connecter et remplir un formulaire de création

Scénario:
  Soit un navigateur web sur le site
  Alors je clique sur "Continuer sur Domifa"
  Quand je clique sur "Se connecter"
  Alors je vois "Connexion à Domifa"
  Alors je vois "Adresse email"
  Alors je vois "Mot de passe"
  Alors je rentre "ccastest@yopmail.com" dans "Adresse email"
  Alors je rentre "Azerty012345" dans "Mot de passe"
  Quand je clique sur "Connexion"
  Alors je suis redirigé vers la page: "/manage"
  Quand je clique sur "Créer une demande"
  Alors je vois "État-civil du demandeur"
  Quand je clique sur "suivant"
  Alors je vois que l'envoi du formulaire est désactivé
  Alors je clique sur "Monsieur"
  Alors je remplis les champs suivants
    | Nom                                |                         |
    | Prénom(s)                          | Test                    |
    | Nom d'usage / Surnom               | Test                    |
    | Date de naissance                  | 12/08/1990              |
    | Ville de naissance                 | Test                    |
    | Numéro de téléphone                | 0600000000              |
    | Adresse e-mail                     | test@test.com           |
  Alors je clique sur "non"
  Quand je clique sur "suivant"
  Alors je vois que l'envoi du formulaire est désactivé
  Alors je remplis les champs suivants
    | Nom                                | Test                    |
    | Prénom(s)                          |                         |
    | Nom d'usage / Surnom               | Test                    |
    | Date de naissance                  | 12/08/1990              |
    | Ville de naissance                 | Test                    |
    | Numéro de téléphone                | 0600000000              |
    | Adresse e-mail                     | test@test.com           |
  Alors je clique sur "non"
  Quand je clique sur "suivant"
  Alors je vois que l'envoi du formulaire est désactivé
    Alors je remplis les champs suivants
    | Nom                                | Test                    |
    | Prénom(s)                          | Test                    |
    | Nom d'usage / Surnom               | Test                    |
    | Date de naissance                  |                         |
    | Ville de naissance                 | Test                    |
    | Numéro de téléphone                | 0600000000              |
    | Adresse e-mail                     | test@test.com           |
  Alors je clique sur "non"
  Quand je clique sur "suivant"
  Alors je vois que l'envoi du formulaire est désactivé
    Alors je remplis les champs suivants
    | Nom                                | Test                    |
    | Prénom(s)                          | Test                    |
    | Nom d'usage / Surnom               | Test                    |
    | Date de naissance                  | 12/08/1990              |
    | Ville de naissance                 |                         |
    | Numéro de téléphone                | 0600000000              |
    | Adresse e-mail                     | test@test.com           |
  Alors je clique sur "non"
  Quand je clique sur "suivant"
  Alors je vois que l'envoi du formulaire est désactivé
    Alors je remplis les champs suivants
    | Nom                                | Test                    |
    | Prénom(s)                          | Test                    |
    | Nom d'usage / Surnom               | Test                    |
    | Date de naissance                  | 12/08/1990              |
    | Ville de naissance                 | Test                    |
    | Numéro de téléphone                | 0600000000              |
    | Adresse e-mail                     | test@test.com           |
  Alors je clique sur "oui"
  Quand je clique sur "suivant"
  Alors je vois que l'envoi du formulaire est désactivé
  Alors je remplis les champs suivants
    | Nom                                | Test                    |
    | Prénom(s)                          | Test                    |
    | Nom d'usage / Surnom               | Test                    |
    | Date de naissance                  | 12/08/1990              |
    | Ville de naissance                 | Test                    |
    | Numéro de téléphone                | 0600000000              |
    | Adresse e-mail                     | test@test.com           |
  Alors je clique sur "oui"
  Alors je remplis les champs suivants
    | Nom                                |                         |
    | Prénom                             | Test                    |
    | Date de naissance                  | 12/08/1991              |
    | Lien                               | Enfant                  |
  Quand je clique sur "suivant"
  Alors je vois que l'envoi du formulaire est désactivé
    Alors je remplis les champs suivants
    | Nom                                | Test                    |
    | Prénom(s)                          | Test                    |
    | Nom d'usage / Surnom               | Test                    |
    | Date de naissance                  | 12/08/1990              |
    | Ville de naissance                 | Test                    |
    | Numéro de téléphone                | 0600000000              |
    | Adresse e-mail                     | test@test.com           |
  Alors je clique sur "oui"
  Alors je remplis les champs suivants
    | Nom                                | Test                    |
    | Prénom                             |                         |
    | Date de naissance                  | 12/08/1991              |
    | Lien                               | Enfant                  |
  Quand je clique sur "suivant"
  Alors je vois que l'envoi du formulaire est désactivé
    Alors je remplis les champs suivants
    | Nom                                | Test                    |
    | Prénom(s)                          | Test                    |
    | Nom d'usage / Surnom               | Test                    |
    | Date de naissance                  | 12/08/1990              |
    | Ville de naissance                 | Test                    |
    | Numéro de téléphone                | 0600000000              |
    | Adresse e-mail                     | test@test.com           |
  Alors je clique sur "oui"
  Alors je remplis les champs suivants
    | Nom                                | Test                    |
    | Prénom                             | Test                    |
    | Date de naissance                  |                         |
    | Lien                               | Enfant                  |
  Quand je clique sur "suivant"
  Alors je vois que l'envoi du formulaire est désactivé
