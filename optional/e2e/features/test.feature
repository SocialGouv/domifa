#language: fr

@test
Fonctionnalité: Test
  Je fais un test
  En tant que visiteur

Contexte: nouvelle DB
  Soit une nouvelle base de donnée
  Soit un navigateur web sur le site

Scénario:
  Alors je clique sur "Continuer sur Domifa"
