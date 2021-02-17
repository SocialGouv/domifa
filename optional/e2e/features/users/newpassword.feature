#language: fr

@newpassword
Fonctionnalité: Mot de passe oublié
  Pour pouvoir réinitialiser mon mot de passe sur Domifa
  En tant que visiteur
  Je veux pouvoir vérifier si mon adresse email est valide

Scénario:
  Soit un navigateur web sur le site

  Quand je clique sur "Se connecter"
  Alors je vois "Connexion à Domifa"
  Alors je vois "Mot de passe oublié"
  Quand je clique sur "Mot de passe oublié"
  Alors je vois "Adresse email"
  Alors je rentre "ccastest@yopmail.com" dans "Adresse email"
  Quand je clique sur "Envoyer"
  Alors j'attends que le texte "Vous venez de recevoir un mail pour réinitialiser votre mot de passe" s'affiche
