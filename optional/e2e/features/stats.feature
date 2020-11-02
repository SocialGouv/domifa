#language: fr

@statistiques
Fonctionnalité: Statistiques d'utilisation de Domifa
  Afin de visualiser des statistiques d'utilisation
  En tant que visiteur
  Je veux pouvoir aller sur la page de statistiques, et visualiser les données

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
