import { normalizeString } from "../../search";
import { NetworkMapping } from "../interfaces";

export const NETWORKS: NetworkMapping[] = [
  {
    canonicalName: "Armée du Salut",
    synonyms: [
      "armee du salut",
      "ads",
      "salvation army",
      "foundation armee du salut",
    ],
  },
  {
    canonicalName: "ASNIT",
    synonyms: ["association sociale nationale internationale tzigane", "asnit"],
  },
  {
    canonicalName: "Aurore Association",
    synonyms: ["aurore", "association aurore", "l aurore"],
  },
  {
    canonicalName: "CIDFF",
    synonyms: [
      "centre d information sur les droits des femmes et des familles",
      "centre information droits femmes familles",
      "cidff",
    ],
  },
  {
    canonicalName: "Croix Rouge Française",
    synonyms: [
      "crf",
      "unite locale",
      "croix rouge",
      "croixrouge",
      "french red cross",
      "croix rouge locale",
    ],
  },
  {
    canonicalName: "Emmaüs",
    synonyms: ["emmaus", "communaute emmaus", "fondation abbe pierre emmaus"],
  },
  {
    canonicalName: "Samu Social",
    synonyms: [
      "samusocial",
      "samu social",
      "samu social international",
      "samusocial de paris",
      "115",
    ],
  },
  {
    canonicalName: "Société Saint Vincent de Paul",
    synonyms: [
      "ssvp",
      "saint vincent de paul",
      "st vincent de paul",
      "societe st vincent de paul",
      "conference saint vincent de paul",
    ],
  },
  {
    canonicalName: "Secours Catholique Caritas France",
    synonyms: ["secours catholique", "caritas france", "caritas", "sccf"],
  },
  {
    canonicalName: "Secours Populaire Français",
    synonyms: [
      "spf",
      "secours pop",
      "secours populaire",
      "secours populaire",
      "spfrancais",
      "secours pop francais",
    ],
  },
  {
    canonicalName: "Restos du Cœur",
    synonyms: [
      "restaurants du coeur",
      "restos",
      "resto du coeur",
      "les restos",
      "restaurants du coeur",
      "association des restaurants du coeur",
    ],
  },
  {
    canonicalName: "L'amicale du nid",
    synonyms: ["amicale du nid", "l amicale du nid", "adn", "amicale nid"],
  },
  {
    canonicalName: "Apprentis d'Auteuil",
    synonyms: [
      "apprentis d auteuil",
      "fondation d auteuil",
      "fondation apprentis d auteuil",
      "oeuvre d auteuil",
    ],
  },
  {
    canonicalName: "Diaconat Protestant",
    synonyms: [
      "diaconat protestant",
      "le diaconat protestant",
      "federation de l entraide protestante",
      "fep",
      "entraide protestante",
    ],
  },
  {
    canonicalName: "Coallia",
    synonyms: [
      "aftam",
      "coallia",
      "association coallia",
      "coallia habitat",
      "coallia solidaire",
    ],
  },
  {
    canonicalName: "Fondation Abbé Pierre",
    synonyms: [
      "fap",
      "fondation abbe pierre",
      "abbe pierre",
      "fondation l abbe pierre",
    ],
  },
  {
    canonicalName: "SOLIHA",
    synonyms: ["soliha"],
  },
  {
    canonicalName: "DOM’ASILE",
    synonyms: ["dom asile", "domasile"],
  },
  {
    canonicalName: "UDAF",
    synonyms: ["udaf"],
  },
  {
    canonicalName: "Groupe SOS",
    synonyms: ["groupe sos"],
  },
  {
    canonicalName: "SPADA",
    synonyms: ["spada"],
  },
  {
    canonicalName: "udaf",
    synonyms: ["udaf"],
  },
  {
    canonicalName: "L'Escale-Solidarité Femmes",
    synonyms: ["escale solidarite femmes"],
  },
  {
    canonicalName: "Secteur d'Action Sociale",
    synonyms: ["secteur action sociale", "secteur d'action sociale"],
  },
  {
    canonicalName: "IMANIS",
    synonyms: ["imanis"],
  },
  {
    canonicalName: "VISTA",
    synonyms: ["vista"],
  },
];

export const NORMALIZED_NETWORKS = NETWORKS.map((network) => {
  return {
    canonicalName: network.canonicalName,
    normalizedSynonyms: network.synonyms.map((syn) => normalizeString(syn)),
  };
});
