export interface TUsager {
  IDDomicilie: number;
  Nom: string;
  Nom_epouse: string | null;
  prénom: string;
  genre: number;
  date_naissance: any; // ou date_naissance: number; selon ce que vous préférez
  Nationalité: number;
  Pays_naissance: number;
  Remarques: string;
  Piece_identité: number;
  date_validité_PI: string; // ou date_validité_PI: number; selon ce que vous préférez
  Service_presc: number;
  valide: number; // peut-être considéré comme un boolean si cela représente une valeur booléenne (1 ou 0)
  du: string; // ou du: number; selon ce que vous préférez
  au: string; // ou au: number; selon ce que vous préférez
  Num_domici: number;
  enfant: number; // peut-être considéré comme un boolean si cela représente une valeur booléenne (1 ou 0)
  enfant_de: number; // peut-être considéré comme un boolean si cela représente une valeur booléenne (1 ou 0)
  relation: string | null;
  motif: number;
  dernier_retrait: string; // ou dernier_retrait: number; selon ce que vous préférez
  date_creation: string | null;
  lieu_naiss: string;
  codeb: number;
  ame: number; // peut-être considéré comme un boolean si cela représente une valeur booléenne (1 ou 0)
  courrier_sens: number; // peut-être considéré comme un boolean si cela représente une valeur booléenne (1 ou 0)
  comportement: number;
  procuration: number; // peut-être considéré comme un boolean si cela représente une valeur booléenne (1 ou 0)
  nom_procuration: string | null;
  telephone: string | null;
  email: string | null;
  nomenveloppe: number; // peut-être considéré comme un boolean si cela représente une valeur booléenne (1 ou 0)
}
