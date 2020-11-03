#language: fr

@interactions
Fonctionnalité: Interactions sur la page Manage
  Pour ajouter ou supprimer des interactions depuis la page courrier
  En tant que visiteur
  Je veux cliquer sur les boutons d'interaction

Scénario:
  Soit une nouvelle base de donnée
  Soit un navigateur web sur le site

  Alors je clique sur "KARAMOKO Maurice"
  Alors je suis redirigé vers la page: "/usager/2"

  Alors je vois "2 courriers en attente"
  Alors je vois "SUIVI DU COURRIER ET DES PASSAGES"
