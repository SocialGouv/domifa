name: 🐞 Ticket de Bug
description: Signaler un bug sur l'une des applications DomiFa
labels: ["bug"]
body:
  - type: markdown
    attributes:
      value: |
        # 🐞 Ticket de Bug

  - type: dropdown
    id: site-concerne
    attributes:
      label: 🖥️ Site(s) concerné(s)
      multiple: true
      options:
        - DomiFa - côté structures
        - Mon DomiFa - portail domiciliés
        - Admin DomiFa
        - Metabase
    validations:
      required: true

  - type: textarea
    id: description
    attributes:
      label: 🚫 Description du problème
      description: Précisez les étapes pour reproduire directement
      placeholder: Décrivez ce qui se passe actuellement
    validations:
      required: true

  - type: input
    id: structure-id
    attributes:
      label: Structure concernée (ID)
      placeholder: Entrez l'ID de la structure
    validations:
      required: false

  - type: textarea
    id: screenshots
    attributes:
      label: 📸 Captures d'écran
      description: 🧨 Attention à n'indiquer aucune information d'identification 🧨
      placeholder: Glissez-déposez vos captures d'écran ici

  - type: textarea
    id: expected
    attributes:
      label: 🔮 Comportement attendu
      placeholder: Décrivez ce qui devrait se passer normalement
    validations:
      required: true
