#language: fr

@entretien
Fonctionnalité: Entretien sur la page profil
  Pour changer la situation sociale d'un usager
  En tant qu'instructeur
  Je veux éditer les informations du suivi social

Scénario:
  Soit une nouvelle base de donnée
  Soit un navigateur web sur le site
  Soit je me connecte sur Domifa

  Alors j'attends "2" secondes
  Alors je clique sur "KARAMOKO Maurice" dans le tableau des usagers
  Alors je suis redirigé vers la page: "/usager/2"

  Alors je clique sur "Modifier la situation sociale"

  Alors j'attends "2" secondes
  Alors je rentre "une structure au hasard" dans "Par quelle structure ou personne ?"



