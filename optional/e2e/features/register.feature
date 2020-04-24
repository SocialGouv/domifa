#language: fr

@register
Fonctionnalité: Inscription
  Pour pouvoir m'inscrire sur Domifa
  En tant que visiteur
  Je veux pouvoir vérifier si ma structure existe déjà

Scénario:
  Soit un navigateur web sur le site
  Quand je clique sur "S'inscrire"
  Alors je vois "Prêt(e) à faciliter la domiciliation ?"
  Alors je vois "Quel est le code-postal de votre structure ?"
  Alors je rentre "92600" dans "Code-postal"
  Quand je clique sur "Rechercher"
  Quand j'attends "3" secondes
  Alors je vois "Si vous appartenez à l’une de ces structures, cliquez dessus pour vous inscrire :"
