#language: fr

@interactions
Fonctionnalité: Interactions sur la page Manage
  Pour ajouter ou supprimer des interactions depuis la page courrier
  En tant que visiteur
  Je veux cliquer sur les boutons d'interaction

Scénario:
  Soit une nouvelle base de donnée
  Soit un navigateur web sur le site
  Soit je me connecte sur Domifa

  Alors j'attends "5" secondes
  Alors je clique sur "KARAMOKO Maurice" dans le tableau des usagers
  Alors je suis redirigé vers la page: "/usager/2"

  Alors je vois "2 courriers en attente"
  Alors je vois "SUIVI DU COURRIER ET DES PASSAGES"

  Alors je clique sur "Confirmer la distribution"

  Alors je rentre "2" dans "Nouveaux courriers"
  Alors je rentre "3" dans "Nouveaux avis de passage"
  Alors je rentre "4" dans "Nombre colis"

  Alors je clique sur "Enregistrer"

  Alors j'attends "2" secondes

  Alors je vois "2 courriers en attente"
  Alors je vois "3 avis de passage en attente"
  Alors je vois "4 colis en attente"


