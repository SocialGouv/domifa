#language: fr

@creationdomiciliation
Fonctionnalité: Création d'une demande de domiciliation
  Pour pouvoir créer une demande de domiciliation sur Domifa
  En tant que visiteur
  Je veux pouvoir me connecter et remplir un formulaire de création


Contexte: Connexion utilisateur
  Soit un navigateur web sur le site
  Soit je me connecte sur Domifa
  Quand je clique sur "Créer une demande"
  Alors je vois "État-civil du demandeur"

#
#  #
#  #   TESTS ETAT CIVIL
#  #

Scénario: Champs vides
  Quand je clique sur "Suivant"
  Alors je vois "Un des champs du formulaire n'est pas rempli ou contient une erreur"

Scénario: Champs nom vide

  Alors je coche la case "Monsieur"
  Alors je remplis les champs suivants
    | Prénom(s)                          | Test NOM VIDE           |
    | Nom d'usage / Surnom               | Test                    |
    | Date de naissance                  | 12/08/1990              |
    | Ville de naissance                 | Test                    |
    | Numéro de téléphone                | 0600000000              |
    | Adresse e-mail                     | test@test.com           |
  Alors je coche la case "Non"
  Quand je clique sur "Suivant"
  Alors je vois "Le nom du demandeur est obligatoire"

Scénario: Champs prénom vide

  Alors je coche la case "Monsieur"
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

  Alors je coche la case "Monsieur"
  Alors je remplis les champs suivants
    | Nom                                | Test DATE NAISSANCE VIDE|
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
    | Nom                                | Test VILLENAISSANCE VIDE|
    | Prénom(s)                          | Test                    |
    | Nom d'usage / Surnom               | Test                    |
    | Date de naissance                  | 12/08/1990              |
    | Numéro de téléphone                | 0600000000              |
    | Adresse e-mail                     | test@test.com           |
  Alors je coche la case "Non"
  Quand je clique sur "Suivant"
  Alors je vois "La ville de naissance est obligatoire"

#
#  #
#  #   TESTS AYANT-DROITS
#  #
#
#Scénario: Ayants-droit : aucune donnée
#
  #Alors je remplis les champs suivants
    #| Nom                                | Test AYANT DROIT VIDE   |
    #| Prénom(s)                          | Test                    |
    #| Nom d'usage / Surnom               | Test                    |
    #| Date de naissance                  | 12/08/1990              |
    #| Ville de naissance                 | Test                    |
    #| Numéro de téléphone                | 0600000000              |
    #| Adresse e-mail                     | test@test.com           |
  #Alors je coche la case "Oui"
  #Quand je clique sur "Suivant"
  #Alors je vois "Le prénom est obligatoire"
#
#
#Scénario: Ayants-droit : nom vide
#
  #Alors je remplis les champs suivants
    #| Nom                                | Test AD NOM VIDE        |
    #| Prénom(s)                          | Test                    |
    #| Nom d'usage / Surnom               | Test                    |
    #| Date de naissance                  | 12/08/1990              |
    #| Ville de naissance                 | Test                    |
    #| Numéro de téléphone                | 0600000000              |
    #| Adresse e-mail                     | test@test.com           |
  #Alors je coche la case "Oui"
  #Alors je remplis les champs suivants
    #| Prénom                             | Test                    |
    #| Date de naissance                  | 12/08/1991              |
    #| Lien                               | Enfant                  |
  #Quand je clique sur "Suivant"
  #Alors je vois "Le nom est obligatoire"
#
#Scénario: Ayants-droit : prénom vide
#
  #Alors je remplis les champs suivants
    #| Nom                                | Test AD PRENOM VIDE     |
    #| Prénom(s)                          | Test                    |
    #| Nom d'usage / Surnom               | Test                    |
    #| Date de naissance                  | 12/08/1990              |
    #| Ville de naissance                 | Test                    |
    #| Numéro de téléphone                | 0600000000              |
    #| Adresse e-mail                     | test@test.com           |
  #Alors je coche la case "Oui"
  #Alors je remplis les champs suivants
    #| Nom                                | Test nom                |
    #| Date de naissance                  | 12/08/1991              |
    #| Lien                               | Enfant                  |
  #Quand je clique sur "Suivant"
  #Alors je vois "Le prénom est obligatoire"
#
#
#Scénario: Ayants-droit : Date de naissance vide
#
  #Alors je remplis les champs suivants
    #| Nom                                | Test AD DDN VIDE        |
    #| Prénom(s)                          | Test                    |
    #| Nom d'usage / Surnom               | Test                    |
    #| Date de naissance                  | 12/08/1990              |
    #| Ville de naissance                 | Test                    |
    #| Numéro de téléphone                | 0600000000              |
    #| Adresse e-mail                     | test@test.com           |
  #Alors je coche la case "Oui"
  #Alors je remplis les champs suivants
    #| Nom                                | Test                    |
    #| Prénom                             | Test                    |
    #| Lien                               | Enfant                  |
  #Quand je clique sur "Suivant"
  #Alors je vois "La date de naissance est obligatoire"
#
#
#Scénario: Ayants-droit : Lien vide
#
  #Alors je remplis les champs suivants
    #| Nom                                | Test AD LIEN VIDE       |
    #| Prénom(s)                          | Test                    |
    #| Nom d'usage / Surnom               | Test                    |
    #| Date de naissance                  | 12/08/1990              |
    #| Ville de naissance                 | Test                    |
    #| Numéro de téléphone                | 0600000000              |
    #| Adresse e-mail                     | test@test.com           |
  #Alors je coche la case "Oui"
  #Alors je remplis les champs suivants
    #| Nom                                | Test                    |
    #| Prénom                             | Test                    |
    #| Date de naissance                  | 12/08/1991              |
  #Quand je clique sur "Suivant"
  #Alors je vois "Un des champs du formulaire n'est pas rempli ou contient une erreur"
#

  #
#  #
#  #   TESTS PRISE RDV ENTRETIEN
#  #

#
#Scénario: Entretien a lieu maintenant
#
  #Alors je remplis les champs suivants
    #| Nom                                | Test ENTRETIEN NOW      |
    #| Prénom(s)                          | Test                    |
    #| Nom d'usage / Surnom               | Test                    |
    #| Date de naissance                  | 12/08/1990              |
    #| Ville de naissance                 | Test                    |
    #| Numéro de téléphone                | 0600000000              |
    #| Adresse e-mail                     | test@test.com           |
  #Alors je coche la case "Oui"
  #Alors je remplis les champs suivants
    #| Nom                                | Test                    |
    #| Prénom                             | Test                    |
    #| Date de naissance                  | 12/08/1991              |
    #| Lien                               | Enfant                  |
  #Quand je clique sur "Suivant"
  #Alors je vois "Quand souhaitez-vous réaliser l'entretien"
#
  #Alors je coche la case "L'entretien a lieu maintenant"
  #Quand je clique sur "Suivant"
  #Alors je vois "Entretien avec le demandeur"
#
  #Scénario: Entretien à fixer
#
  #Alors je remplis les champs suivants
    #| Nom                                | Test ENTRETIEN LATER    |
    #| Prénom(s)                          | Test                    |
    #| Nom d'usage / Surnom               | Test                    |
    #| Date de naissance                  | 12/08/1990              |
    #| Ville de naissance                 | Test                    |
    #| Numéro de téléphone                | 0600000000              |
    #| Adresse e-mail                     | test@test.com           |
  #Alors je coche la case "Oui"
  #Alors je remplis les champs suivants
    #| Nom                                | Test                    |
    #| Prénom                             | Test                    |
    #| Date de naissance                  | 12/08/1991              |
    #| Lien                               | Enfant                  |
  #Quand je clique sur "Suivant"
  #Alors je vois "Quand souhaitez-vous réaliser l'entretien"
#
  #Alors je coche la case "Fixer une date de rendez-vous"
  #Alors je remplis les champs suivants
    #| Avec quel collaborateur ?          | RIFFI Yassine           |
    #| Date du rendez-vous                | 02/02/2022              |
    #| Heure du rendez-vous               | 10:20                   |
  #Quand je clique sur "Suivant"
  #Alors je vois "Prise de rendez-vous entre le demandeur et un collaborateur"
#
    #Scénario: Entretien fixé puis réalisé maintenant
#
  #Alors je remplis les champs suivants
    #| Nom                                | Test ENT LATER BUT NOW  |
    #| Prénom(s)                          | Test                    |
    #| Nom d'usage / Surnom               | Test                    |
    #| Date de naissance                  | 12/08/1990              |
    #| Ville de naissance                 | Test                    |
    #| Numéro de téléphone                | 0600000000              |
    #| Adresse e-mail                     | test@test.com           |
  #Alors je coche la case "Oui"
  #Alors je remplis les champs suivants
    #| Nom                                | Test                    |
    #| Prénom                             | Test                    |
    #| Date de naissance                  | 12/08/1991              |
    #| Lien                               | Enfant                  |
  #Quand je clique sur "Suivant"
  #Alors je vois "Quand souhaitez-vous réaliser l'entretien"
#
  #Alors je coche la case "Fixer une date de rendez-vous"
  #Alors je remplis les champs suivants
    #| Avec quel collaborateur ?          | RIFFI Yassine           |
    #| Date du rendez-vous                | 02/02/2022              |
    #| Heure du rendez-vous               | 10:20                   |
  #Quand je clique sur "Suivant"
  #Alors je vois "Prise de rendez-vous entre le demandeur et un collaborateur"
  #Quand je clique sur "Réaliser l'entretien maintenant"
  #Alors je vois "Entretien avec le demandeur"
#
#
  ##
##  #
##  #   TESTS ENTRETIEN
##  #
#
#
#Scénario: Entretien non passé cas 1
#
  #Alors je remplis les champs suivants
    #| Nom                                | Test ENTRETIEN SKIPPED1 |
    #| Prénom(s)                          | Test                    |
    #| Nom d'usage / Surnom               | Test                    |
    #| Date de naissance                  | 12/08/1990              |
    #| Ville de naissance                 | Test                    |
    #| Numéro de téléphone                | 0600000000              |
    #| Adresse e-mail                     | test@test.com           |
  #Alors je coche la case "Non"
  #Quand je clique sur "Suivant"
  #Alors je vois "Quand souhaitez-vous réaliser l'entretien"
#
  #Alors je coche la case "L'entretien a lieu maintenant"
  #Quand je clique sur "Suivant"
  #Alors je vois "Entretien avec le demandeur"
#
  #Quand je clique sur "Continuer plus tard"
  #Alors je vois "L’entretien préalable est obligatoire"
#
  #Quand je clique sur "Continuer sans entretien"
  #Alors je vois "Pièces justificatives complétant le dossier"
#
  #Scénario: Entretien non passé cas 2
#
  #Alors je remplis les champs suivants
    #| Nom                                | Test ENTRETIEN SKIPPED2 |
    #| Prénom(s)                          | Test                    |
    #| Nom d'usage / Surnom               | Test                    |
    #| Date de naissance                  | 12/08/1990              |
    #| Ville de naissance                 | Test                    |
    #| Numéro de téléphone                | 0600000000              |
    #| Adresse e-mail                     | test@test.com           |
  #Alors je coche la case "Non"
  #Quand je clique sur "Suivant"
  #Alors je vois "Quand souhaitez-vous réaliser l'entretien"
#
  #Alors je coche la case "L'entretien a lieu maintenant"
  #Quand je clique sur "Suivant"
  #Alors je vois "Entretien avec le demandeur"
#
  #Quand je clique sur "Continuer plus tard"
  #Alors je vois "L’entretien préalable est obligatoire"
#
  #Quand je clique sur "Revenir à l'entretien"
  #Alors je vois "Entretien avec le demandeur"
#
#Scénario: Entretien vide
#
  #Alors je remplis les champs suivants
    #| Nom                                | Test ENTRETIEN VIDE     |
    #| Prénom(s)                          | Test                    |
    #| Nom d'usage / Surnom               | Test                    |
    #| Date de naissance                  | 12/08/1990              |
    #| Ville de naissance                 | Test                    |
    #| Numéro de téléphone                | 0600000000              |
    #| Adresse e-mail                     | test@test.com           |
  #Alors je coche la case "Non"
  #Quand je clique sur "Suivant"
  #Alors je vois "Quand souhaitez-vous réaliser l'entretien"
#
  #Alors je coche la case "L'entretien a lieu maintenant"
  #Quand je clique sur "Suivant"
  #Alors je vois "Entretien avec le demandeur"
#
  #Alors je coche la case "Non"
  #Alors je coche la case "Non"
  #Alors je coche la case "Non"
  #Quand je clique sur "Enregistrer"
  #Alors je vois "Pièces justificatives complétant le dossier"
#
#
