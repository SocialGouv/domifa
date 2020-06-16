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

  Quand je clique sur "Suivant"
  Alors je vois "Le nom du demandeur est obligatoire"

  # Test 1 :
  Alors je coche la case "Monsieur"
  Alors je remplis les champs suivants
    | Prénom(s)                          | Test                    |
    | Nom                                |                         |
    | Nom d'usage / Surnom               | Test                    |
    | Date de naissance                  | 12/08/1990              |
    | Ville de naissance                 | Test                    |
    | Numéro de téléphone                | 0600000000              |
    | Adresse e-mail                     | test@test.com           |
  Alors je coche la case "Non"
  Quand je clique sur "Suivant"
  Alors je vois "Le nom du demandeur est obligatoire"


  # Test 2 : Champ prénom vide
  Quand je clique sur "Liste des usagers"

  Quand je clique sur "Créer une demande"

  Alors je vois "État-civil du demandeur"

#
#  Alors je remplis les champs suivants
#    | Prénom(s)                          |                         |
#    | Nom                                | Test                    |
#    | Nom d'usage / Surnom               | Test                    |
#    | Date de naissance                  | 12/08/1990              |
#    | Ville de naissance                 | Test                    |
#    | Numéro de téléphone                | 0600000000              |
#    | Adresse e-mail                     | test@test.com           |
#  Alors je coche la case "Non"
#
#  Quand je clique sur "Suivant"
#  Alors je vois "Le prénom du demandeur est obligatoire"
#
#
#  # Test 3 : Date de naissance
#  Quand je clique sur "Liste des usagers"
#  Quand je clique sur "Créer une demande"
#  Alors je vois "État-civil du demandeur"
#
#  Alors je remplis les champs suivants
#    | Nom                                | Test                    |
#    | Prénom(s)                          | Test                    |
#    | Nom d'usage / Surnom               | Test                    |
#    | Date de naissance                  |                         |
#    | Ville de naissance                 | Test                    |
#    | Numéro de téléphone                | 0600000000              |
#    | Adresse e-mail                     | test@test.com           |
#  Alors je coche la case "Non"
#  Quand je clique sur "Suivant"
#  Alors je vois "La date de naissance est obligatoire"
#
#
#  # Test 3 : Ville de naissance
#  Quand je clique sur "Liste des usagers"
#  Quand je clique sur "Créer une demande"
#  Alors je vois "État-civil du demandeur"
#
#  Alors je remplis les champs suivants
#    | Nom                                | Test                    |
#    | Prénom(s)                          | Test                    |
#    | Nom d'usage / Surnom               | Test                    |
#    | Date de naissance                  | 12/08/1990              |
#    | Ville de naissance                 |                         |
#    | Numéro de téléphone                | 0600000000              |
#    | Adresse e-mail                     | test@test.com           |
#  Alors je coche la case "Non"
#  Quand je clique sur "Suivant"
#  Alors je vois "La ville de naissance est obligatoire"
#
#
#  #
#  #   TESTS AYANT-DROITS
#  #
#  Alors je remplis les champs suivants
#    | Nom                                | Test                    |
#    | Prénom(s)                          | Test                    |
#    | Nom d'usage / Surnom               | Test                    |
#    | Date de naissance                  | 12/08/1990              |
#    | Ville de naissance                 | Test                    |
#    | Numéro de téléphone                | 0600000000              |
#    | Adresse e-mail                     | test@test.com           |
#  Alors je coche la case "Oui"
#  Quand je clique sur "Suivant"
#  Alors je vois "Le prénom est obligatoire"
#
#
#  Quand je clique sur "Liste des usagers"
#  Quand je clique sur "Créer une demande"
#  Alors je remplis les champs suivants
#    | Nom                                | Test                    |
#    | Prénom(s)                          | Test                    |
#    | Nom d'usage / Surnom               | Test                    |
#    | Date de naissance                  | 12/08/1990              |
#    | Ville de naissance                 | Test                    |
#    | Numéro de téléphone                | 0600000000              |
#    | Adresse e-mail                     | test@test.com           |
#  Alors je coche la case "Oui"
#  Alors je remplis les champs suivants
#    | Nom                                |                         |
#    | Prénom                             | Test                    |
#    | Date de naissance                  | 12/08/1991              |
#    | Lien                               | Enfant                  |
#  Quand je clique sur "Suivant"
#  Alors je vois "Le nom est obligatoire"
#
#
#  Quand je clique sur "Liste des usagers"
#  Quand je clique sur "Créer une demande"
#  Alors je remplis les champs suivants
#    | Nom                                | Test                    |
#    | Prénom(s)                          | Test                    |
#    | Nom d'usage / Surnom               | Test                    |
#    | Date de naissance                  | 12/08/1990              |
#    | Ville de naissance                 | Test                    |
#    | Numéro de téléphone                | 0600000000              |
#    | Adresse e-mail                     | test@test.com           |
#  Alors je coche la case "Oui"
#  Alors je remplis les champs suivants
#    | Nom                                |                         |
#    | Prénom                             | Test                    |
#    | Date de naissance                  | 12/08/1991              |
#    | Lien                               | Enfant                  |
#  Quand je clique sur "Suivant"
#  Alors je vois "Le nom est obligatoire"
#
#  Quand je clique sur "Liste des usagers"
#  Quand je clique sur "Créer une demande"
#  Alors je remplis les champs suivants
#    | Nom                                | Test                    |
#    | Prénom(s)                          | Test                    |
#    | Nom d'usage / Surnom               | Test                    |
#    | Date de naissance                  | 12/08/1990              |
#    | Ville de naissance                 | Test                    |
#    | Numéro de téléphone                | 0600000000              |
#    | Adresse e-mail                     | test@test.com           |
#  Alors je coche la case "Oui"
#  Alors je remplis les champs suivants
#    | Nom                                | Test                    |
#    | Prénom                             |                         |
#    | Date de naissance                  | 12/08/1991              |
#    | Lien                               | Enfant                  |
#  Quand je clique sur "Suivant"
#  Alors je vois "Le prénom est obligatoire"
#
#
#  Quand je clique sur "Liste des usagers"
#  Quand je clique sur "Créer une demande"
#  Alors je remplis les champs suivants
#    | Nom                                | Test                    |
#    | Prénom(s)                          | Test                    |
#    | Nom d'usage / Surnom               | Test                    |
#    | Date de naissance                  | 12/08/1990              |
#    | Ville de naissance                 | Test                    |
#    | Numéro de téléphone                | 0600000000              |
#    | Adresse e-mail                     | test@test.com           |
#  Alors je coche la case "Oui"
#  Alors je remplis les champs suivants
#    | Nom                                | Test                    |
#    | Prénom                             | Test                    |
#    | Date de naissance                  |                         |
#    | Lien                               | Enfant                  |
#  Quand je clique sur "Suivant"
#  Alors je vois "La date de naissance est obligatoire"


