#language: fr

@stats
Fonctionnalité: Statistiques d'utilisation de Domifa
  Afin de visualiser des statistiques d'utilisation
  En tant que visiteur
  Je veux pouvoir aller sur la page de statistiques, et visualiser les données

Contexte: Connexion utilisateur
  Soit une nouvelle base de donnée
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
  Quand je clique sur "Mon compte"
  Quand je clique sur "Statistiques"
  Alors je suis redirigé vers la page: "/rapport-activite"
  Alors je vois "Rapport d'activité de votre structure"

Scénario: Chercher des stats
  Quand je clique sur "Actualiser les statistiques"
  Alors je vois "Nombre de domiciliés"

  Alors je vois le chiffre "7" à la ligne "1"
  Alors je vois le chiffre "3" à la ligne "2"
  Alors je vois le chiffre "4" à la ligne "3"

  Alors je vois le chiffre "3" à la ligne "5"
  Alors je vois le chiffre "0" à la ligne "6"
