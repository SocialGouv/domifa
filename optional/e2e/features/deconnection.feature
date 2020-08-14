#language: fr

@deconnection
Fonctionnalité: Déconnexion
  Pour pouvoir me deconnecter sur Domifa
  En tant que visiteur
  Je veux pouvoir vérifier si je peux me connecter

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
  Alors je vois "CCAS de test"
  Quand je clique sur "Mon compte"
  Alors je vois "Déconnexion"
  # Quand je clique sur "Déconnexion"
  # Alors je suis redirigé vers la page: "/connexion"
