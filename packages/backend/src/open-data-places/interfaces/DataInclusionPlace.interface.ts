export interface DataInclusionPlace {
  _di_geocodage_code_insee: string;
  _di_geocodage_score: 1;
  id: string;
  siret: string;
  rna: string;
  nom: string;
  commune: string;
  code_postal: string;
  code_insee: string;
  adresse: string;
  complement_adresse: string;
  longitude: number;
  latitude: number;
  typologie: string;
  telephone: string;
  courriel: string;
  site_web: string;
  presentation_resume: string;
  presentation_detail: string;
  source: string;
  date_maj: Date;
  antenne: true;
  lien_source: string;
  horaires_ouverture: string;
  accessibilite: string;
  labels_nationaux: string[];
  labels_autres: string[];
  thematiques: string[];
}

export interface DataInclusionResults {
  items: DataInclusionPlace[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
