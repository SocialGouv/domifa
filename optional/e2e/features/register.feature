#language: fr

@register
Fonctionnalité: Inscription
  Pour pouvoir m'inscrire sur Domifa
  En tant que visiteur
  Je veux pouvoir vérifier si ma structure existe déjà

Scénario:
  Soit un navigateur web sur le site
  Alors je clique sur "Continuer sur Domifa"
  Quand je clique sur "S'inscrire"
  Alors je vois "Prêt(e) à faciliter la domiciliation ?"
  Alors je vois "Quel est le code-postal de votre structure ?"
  Alors je rentre "92600" dans "Code-postal"
  Quand je clique sur "Rechercher"
  Alors je vois "Si vous appartenez à l’une de ces structures, cliquez dessus pour vous inscrire :"

  Alors je clique sur "CCAS de test"

  Alors je vois "Vous pouvez désormais créer votre compte"

  Alors je vois que l'envoi du formulaire est désactivé
  
   Alors je remplis les champs suivants
    | Votre adresse email                |              |
    | Mot de passe                       | JaimeLesFrites123456?        |
    | Confirmer votre mot de passe       | JaimeLesFrites123456?         |
    | Nom                                | Caribou                      |
    | Prénom                             | Jean                         |
    | Fonction                           | Président                    |

  Alors je vois que l'envoi du formulaire est désactivé
  
   Alors je remplis les champs suivants
    | Votre adresse email                | ccastest@yopmail.com         |
    | Mot de passe                       | JaimeLesFrites123456?        |
    | Confirmer votre mot de passe       |          |
    | Nom                                | Caribou                      |
    | Prénom                             | Jean                         |
    | Fonction                           | Président                    |

  Alors je vois que l'envoi du formulaire est désactivé
  
     Alors je remplis les champs suivants
    | Votre adresse email                | ccastest@yopmail.com         |
    | Mot de passe                       |         |
    | Confirmer votre mot de passe       | JaimeLesFrites123456?        |
    | Nom                                | Caribou                      |
    | Prénom                             | Jean                         |
    | Fonction                           | Président                    |

  Alors je vois que l'envoi du formulaire est désactivé
  
       Alors je remplis les champs suivants
    | Votre adresse email                | ccastest@yopmail.com         |
    | Mot de passe                       | JaimeLesFrites123456?        |
    | Confirmer votre mot de passe       | JaimeLesFrites123456?        |
    | Nom                                |                      |
    | Prénom                             | Jean                         |
    | Fonction                           | Président                    |

  Alors je vois que l'envoi du formulaire est désactivé
  
  Alors je remplis les champs suivants
    | Votre adresse email                | ccastest@yopmail.com         |
    | Mot de passe                       | JaimeLesFrites123456?        |
    | Confirmer votre mot de passe       | JaimeLesFrites123456?        |
    | Nom                                | Caribou                      |
    | Prénom                             |                          |
    | Fonction                           | Président                    |

  Alors je vois que l'envoi du formulaire est désactivé
  
    Alors je remplis les champs suivants
    | Votre adresse email                | ccastest@yopmail.com         |
    | Mot de passe                       | JaimeLesFrites123456?        |
    | Confirmer votre mot de passe       | JaimeLesFrites123456?        |
    | Nom                                | Caribou                      |
    | Prénom                             | Jean                         |
    | Fonction                           |                     |

  Alors je vois que l'envoi du formulaire est désactivé

  Alors je remplis les champs suivants
    | Votre adresse email                | caribou@email.com            |
    | Mot de passe                       | JaimeLesFrites123456?        |
    | Confirmer votre mot de passe       | JaimeLesFrites12345?         |
    | Nom                                | Caribou                      |
    | Prénom                             | Jean                         |
    | Fonction                           | Président                    |

  Alors je vois que l'envoi du formulaire est désactivé

  Alors je remplis les champs suivants
    | Votre adresse email                | ccastest@yopmail.com         |
    | Mot de passe                       | JaimeLesFrites123456?        |
    | Confirmer votre mot de passe       | JaimeLesFrites123456?        |
    | Nom                                | Caribou                      |
    | Prénom                             | Jean                         |
    | Fonction                           | Président                    |

  Alors je vois "L'adresse email est déjà utilisée"
  
  Alors je vois que l'envoi du formulaire est désactivé

  Alors je remplis les champs suivants
      | Votre adresse email                | caribou12@email.com          |
      | Mot de passe                       | JaimeLesFrites123456?        |
      | Confirmer votre mot de passe       | JaimeLesFrites123456?        |
      | Nom                                | Caribou                      |
      | Prénom                             | Jean                         |
      | Fonction                           | Président                    |

  Alors je clique sur "Créer mon compte"

  Alors j'attends que le message "Félicitations, votre demande de création de compte a bien été prise en compte." apparaisse
