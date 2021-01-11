#language: fr

@stats
Fonctionnalité: Statistiques d'utilisation de Domifa
  Afin de visualiser des statistiques d'utilisation
  En tant que visiteur
  Je veux pouvoir aller sur la page de statistiques, et visualiser les données

Contexte: Connexion utilisateur
  Soit une nouvelle base de donnée
  Soit un navigateur web sur le site
  Soit je me connecte sur Domifa

  Quand je clique sur "Compte"
  Quand je clique sur "Statistiques"
  Alors je suis redirigé vers la page: "/rapport-activite"
  Alors je vois "Rapport d'activité de votre structure"

Scénario: Chercher des stats
  Quand je clique sur "Actualiser les statistiques"
  Alors j'attends "3" secondes
  Alors je vois "Nombre de domiciliés"

  Alors je vois le chiffre "7" à la ligne "1"
  Alors je vois le chiffre "3" à la ligne "2"
  Alors je vois le chiffre "4" à la ligne "3"

  Alors je vois le chiffre "3" à la ligne "5"
  Alors je vois le chiffre "0" à la ligne "6"
