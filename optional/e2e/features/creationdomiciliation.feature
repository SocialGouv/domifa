#language: fr

@creationdomiciliation
Fonctionnalité: Création d'une demande de domiciliation
  Pour pouvoir créer une demande de domiciliation sur Domifa
  En tant que visiteur
  Je veux pouvoir me connecter et remplir un formulaire de création


Contexte: Connexion utilisateur
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
Scénario: Champs nom vide
  Quand je clique sur "Suivant"
  Alors je vois "Le nom du demandeur est obligatoire"

  # Test 1 :
  Alors je coche la case "Monsieur"
  Alors je remplis les champs suivants
    | Prénom(s)                          | Test NOM VIDE           |
    | Nom                                |                         |
    | Nom d'usage / Surnom               | Test                    |
    | Date de naissance                  | 12/08/1990              |
    | Ville de naissance                 | Test                    |
    | Numéro de téléphone                | 0600000000              |
    | Adresse e-mail                     | test@test.com           |
  Alors je coche la case "Non"
  Quand je clique sur "Suivant"
  Alors je vois "Le nom du demandeur est obligatoire"

Scénario: Champs prénom vide

  Alors je remplis les champs suivants
    | Nom                                | Test PRENOM VIDE        |
    | Nom d'usage / Surnom               | Test                    |
    | Date de naissance                  | 12/08/1990              |
    | Ville de naissance                 | Test                    |
    | Numéro de téléphone                | 0600000000              |
    | Adresse e-mail                     | test@test.com           |
  Alors je coche la case "Non"
  Quand je clique sur "Suivant"
  Alors je vois "Le prénom du demandeur est obligatoire"


Scénario: Champs date de naissance vide

  Alors je remplis les champs suivants
    | Nom                                | Test  DATE  NAISSANCE   |
    | Prénom(s)                          | Test                    |
    | Nom d'usage / Surnom               | Test                    |
    | Ville de naissance                 | Test                    |
    | Numéro de téléphone                | 0600000000              |
    | Adresse e-mail                     | test@test.com           |
  Alors je coche la case "Non"
  Quand je clique sur "Suivant"
  Alors je vois "La date de naissance est obligatoire"

Scénario: Champs ville de naissance vide
  Alors je remplis les champs suivants
    | Nom                                | Test                    |
    | Prénom(s)                          | Test                    |
    | Nom d'usage / Surnom               | Test                    |
    | Date de naissance                  | 12/08/1990              |
    | Ville de naissance                 |                         |
    | Numéro de téléphone                | 0600000000              |
    | Adresse e-mail                     | test@test.com           |
  Alors je coche la case "Non"
  Quand je clique sur "Suivant"
  Alors je vois "La ville de naissance est obligatoire"

#
#  #
#  #   TESTS AYANT-DROITS
#  #

Scénario: Ayants-droit : aucune donnée
  Alors je remplis les champs suivants
    | Nom                                | Test                    |
    | Prénom(s)                          | Test                    |
    | Nom d'usage / Surnom               | Test                    |
    | Date de naissance                  | 12/08/1990              |
    | Ville de naissance                 | Test                    |
    | Numéro de téléphone                | 0600000000              |
    | Adresse e-mail                     | test@test.com           |
  Alors je coche la case "Oui"
  Quand je clique sur "Suivant"
  Alors je vois "Le prénom est obligatoire"


Scénario: Ayants-droit : nom vide
  Alors je remplis les champs suivants
    | Nom                                | Test                    |
    | Prénom(s)                          | Test                    |
    | Nom d'usage / Surnom               | Test                    |
    | Date de naissance                  | 12/08/1990              |
    | Ville de naissance                 | Test                    |
    | Numéro de téléphone                | 0600000000              |
    | Adresse e-mail                     | test@test.com           |
  Alors je coche la case "Oui"
  Alors je remplis les champs suivants
    | Nom                                |                         |
    | Prénom                             | Test                    |
    | Date de naissance                  | 12/08/1991              |
    | Lien                               | Enfant                  |
  Quand je clique sur "Suivant"
  Alors je vois "Le nom est obligatoire"

Scénario: Ayants-droit : aucune donnée
  Alors je remplis les champs suivants
    | Nom                                | Test                    |
    | Prénom(s)                          | Test                    |
    | Nom d'usage / Surnom               | Test                    |
    | Date de naissance                  | 12/08/1990              |
    | Ville de naissance                 | Test                    |
    | Numéro de téléphone                | 0600000000              |
    | Adresse e-mail                     | test@test.com           |
  Alors je coche la case "Oui"
  Alors je remplis les champs suivants
    | Nom                                | Test nom                |
    | Date de naissance                  | 12/08/1991              |
    | Lien                               | Enfant                  |
  Quand je clique sur "Suivant"
  Alors je vois "Le prénom est obligatoire"


Scénario: Ayants-droit : Date de naissance
  Alors je remplis les champs suivants
    | Nom                                | Test                    |
    | Prénom(s)                          | Test                    |
    | Nom d'usage / Surnom               | Test                    |
    | Date de naissance                  | 12/08/1990              |
    | Ville de naissance                 | Test                    |
    | Numéro de téléphone                | 0600000000              |
    | Adresse e-mail                     | test@test.com           |
  Alors je coche la case "Oui"
  Alors je remplis les champs suivants
    | Nom                                | Test                    |
    | Prénom                             | Test                    |
    | Date de naissance                  |                         |
    | Lien                               | Enfant                  |
  Quand je clique sur "Suivant"
  Alors je vois "La date de naissance est obligatoire"


