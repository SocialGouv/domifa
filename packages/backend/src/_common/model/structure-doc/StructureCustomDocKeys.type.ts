export type StructureCustomDocKeys =
  // DATES UTILES
  | "DATE_JOUR"
  | "DATE_JOUR_HEURE"
  | "DATE_JOUR_LONG"
  // RESPONSABLE STRUCTURE
  | "RESPONSABLE_NOM"
  | "RESPONSABLE_PRENOM"
  | "RESPONSABLE_FONCTION"

  // INFOS STRUCTURE
  | "STRUCTURE_NOM"
  | "STRUCTURE_TYPE"
  | "STRUCTURE_ADRESSE"
  | "STRUCTURE_VILLE"
  | "STRUCTURE_CODE_POSTAL"

  // SI ADRESSE COURRIER DIFFERENTE
  | "STRUCTURE_COURRIER_ADRESSE"
  | "STRUCTURE_COURRIER_VILLE"
  | "STRUCTURE_COURRIER_CODE_POSTAL"
  //
  | "USAGER_REF"
  | "USAGER_CUSTOM_REF"
  | "USAGER_CIVILITE"
  | "USAGER_NOM"
  | "USAGER_PRENOM"
  | "USAGER_SURNOM"
  | "USAGER_DATE_NAISSANCE"
  | "USAGER_LIEU_NAISSANCE"
  | "USAGER_PHONE"
  | "USAGER_EMAIL"
  | "USAGER_NUMERO_DISTRIBUTION"
  //
  | "STATUT_DOM"
  | "TYPE_DOM"
  | "DATE_DEBUT_DOM"
  | "DATE_FIN_DOM"
  | "DATE_PREMIERE_DOM"
  | "DATE_DERNIER_PASSAGE"
  //  RADIATIONS
  | "DATE_RADIATION"
  | "MOTIF_RADIATION"
  // ENTRETIEN
  | "ENTRETIEN_ORIENTE_PAR"
  | "ENTRETIEN_DOMICILIATION_EXISTANTE"
  | "ENTRETIEN_REVENUS"
  | "ENTRETIEN_LIEN_COMMUNE"
  | "ENTRETIEN_COMPOSITION_MENAGE"
  | "ENTRETIEN_SITUATION_RESIDENTIELLE"
  | "ENTRETIEN_CAUSE_INSTABILITE"
  | "ENTRETIEN_RAISON_DEMANDE"
  | "ENTRETIEN_ACCOMPAGNEMENT"
  // Transferts
  | "TRANSFERT_ACTIF"
  | "TRANSFERT_NOM"
  | "TRANSFERT_ADRESSE"
  | "TRANSFERT_DATE_DEBUT"
  | "TRANSFERT_DATE_FIN"
  // Procuration
  | "PROCURATION_ACTIF"
  | "PROCURATION_NOM"
  | "PROCURATION_PRENOM"
  | "PROCURATION_DATE_DEBUT"
  | "PROCURATION_DATE_FIN"
  | "PROCURATION_DATE_NAISSANCE"
  // et aussi, seulement pour le document d'accès à l'espace domicilié
  | "ESPACE_DOM_URL"
  | "ESPACE_DOM_ID"
  | "ESPACE_DOM_MDP";
