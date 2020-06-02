#language: fr

@import
Fonctionnalité: Import
  Pour pouvoir importer mes données sur Domifa
  En tant que visiteur
  Je veux pouvoir accéder à la page d'import

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
  Quand je clique sur "Importer"
  Alors je vois "Étape 1 : Télécharger et compléter le modèle"
  Alors je vois "Étape 2 : importer le fichier complété"
