#language: fr

@procurations
Fonctionnalité: Procurations sur le profil
  Pour ajouter ou supprimer des procurations
  En tant que visiteur
  Je veux remplir le formulaire et voir l'historique des procurations

Scénario:
  Soit une nouvelle base de donnée
  Soit un navigateur web sur le site
  Soit je me connecte sur Domifa

  Alors j'attends "2" secondes
  Alors je clique sur "KARAMOKO Maurice" dans le tableau des usagers
  Alors je suis redirigé vers la page: "/usager/2"

  Alors je clique sur "Activer la procuration"

  Alors je rentre "Dupont" dans "Nom"
  Alors je rentre "Maurice" dans "Prénom"
  Alors je rentre "20/12/1991" dans "Date de naissance"
  Alors je rentre "20/12/2021" dans "Date de début de validité"
  Alors je rentre "20/12/2020" dans "Date de fin de validité"

  # CAS : Date de fin inférieur à date début
  Alors je vois "La date de fin est incorrecte"

  Alors je rentre "20/12/2022" dans "Date de fin de validité"

  Alors je clique sur "Enregistrer la procuration"

  Alors je vois "Historique des procurations"
  Alors je vois "DATES DE VALIDITÉ"
  Alors je vois "Du 20/12/2021 au 20/12/2022"
