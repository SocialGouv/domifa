#language: fr

@connection
Fonctionnalité: Connexion
  Pour pouvoir me connecter sur Domifa
  En tant que visiteur
  Je veux pouvoir vérifier si mon adresse email et mot de passe sont valides

Scénario:
  Soit un navigateur web sur le site
  Quand je clique sur "Se connecter"
  Alors je vois "Connexion à Domifa"
  Alors je vois "Adresse email"
  Alors je vois "Mot de passe"
  Alors je rentre "ccastest@yopmail.com" dans "Adresse email"
  Alors je rentre "Azerty012345!" dans "Mot de passe"
  Quand je clique sur "Connexion"
  Alors je vois la page "Échéance de la domicliation"
