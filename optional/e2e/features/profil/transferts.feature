#language: fr

@transferts
Fonctionnalité: Transferts sur le profil
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

  Alors je clique sur "Activer le transfert de courrier"

  Alors j'attends "2" secondes
  Alors je rentre "Un établissement qui veut recoit des transferts" dans "Nom de l'établissement"
  Alors je rentre "Test lng" dans "Adresse de l'établissement"

  # CAS : adresse minimum 10 caractères
  Alors je vois "L'adresse doit contenir 10 caractères minimum"

  Alors je rentre "Adresse de l'établissement" dans "Adresse de l'établissement"

  Alors je rentre "Nouvelle adresse complete" dans "Adresse de l'établissement"
  Alors je rentre "20/12/2020" dans "Valide du"
  Alors je rentre "20/12/2019" dans "Valide jusqu'au"

  # CAS : Date de fin inférieur à date début
  Alors je vois "La date de fin est incorrecte"

  Alors je rentre "20/12/2022" dans "Valide jusqu'au"

  Alors je clique sur "Enregistrer le transfert"

  Alors je vois "Historique des transferts"
