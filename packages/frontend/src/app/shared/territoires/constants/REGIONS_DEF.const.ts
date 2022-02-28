// constante dupliquée côté frontend

import { RegionDef } from "../types/RegionDef.type";

// https://fr.wikipedia.org/wiki/Liste_des_d%C3%A9partements_fran%C3%A7ais
export const REGIONS_DEF: RegionDef[] = [
  {
    regionCode: "01",
    regionName: "Guadeloupe",
    regionId: "guadeloupe",
    timeZone: "America/Martinique",
    departements: [{ departementCode: "971", departementName: "Guadeloupe" }],
  },
  {
    regionCode: "02",
    regionName: "Martinique",
    regionId: "martinique",
    timeZone: "America/Martinique",
    departements: [{ departementCode: "972", departementName: "Martinique" }],
  },
  {
    regionCode: "03",
    regionName: "Guyane",
    regionId: "guyane",
    timeZone: "America/Guyana",
    departements: [{ departementCode: "973", departementName: "Guyane" }],
  },
  {
    regionCode: "04",
    regionName: "La Réunion",
    regionId: "la-reunion",
    timeZone: "Indian/Reunion",
    departements: [{ departementCode: "974", departementName: "La Réunion" }],
  },
  {
    regionCode: "06",
    regionName: "Mayotte",
    regionId: "mayotte",
    timeZone: "Indian/Mayotte",
    departements: [{ departementCode: "976", departementName: "Mayotte" }],
  },
  {
    regionCode: "11",
    regionName: "Île-de-France",
    timeZone: "Europe/Paris",
    regionId: "ile-de-france",
    departements: [
      { departementCode: "75", departementName: "Paris" },
      { departementCode: "77", departementName: "Seine-et-Marne" },
      { departementCode: "78", departementName: "Yvelines" },
      { departementCode: "91", departementName: "Essonne" },
      { departementCode: "92", departementName: "Hauts-de-Seine" },
      { departementCode: "93", departementName: "Seine-Saint-Denis" },
      { departementCode: "94", departementName: "Val-de-Marne" },
      { departementCode: "95", departementName: "Val-d'oise" },
    ],
  },
  {
    regionCode: "24",
    regionName: "Centre-Val de Loire",
    timeZone: "Europe/Paris",
    regionId: "centre-val-de-loire",
    departements: [
      { departementCode: "18", departementName: "Cher" },
      { departementCode: "28", departementName: "Eure-et-Loir" },
      { departementCode: "36", departementName: "Indre" },
      { departementCode: "37", departementName: "Indre-et-Loire" },
      { departementCode: "41", departementName: "Loir-et-Cher" },
      { departementCode: "45", departementName: "Loiret" },
    ],
  },
  {
    regionCode: "27",
    regionName: "Bourgogne-Franche-Comté",
    timeZone: "Europe/Paris",
    regionId: "bourgogne-franche-comte",
    departements: [
      { departementCode: "21", departementName: "Côte-d'Or" },
      { departementCode: "25", departementName: "Doubs" },
      { departementCode: "39", departementName: "Jura" },
      { departementCode: "58", departementName: "Nièvre" },
      { departementCode: "70", departementName: "Haute-Saône" },
      { departementCode: "71", departementName: "Saône-et-Loire" },
      { departementCode: "89", departementName: "Yonne" },
      { departementCode: "90", departementName: "Territoire de Belfort" },
    ],
  },
  {
    regionCode: "28",
    regionName: "Normandie",
    timeZone: "Europe/Paris",
    regionId: "normandie",
    departements: [
      { departementCode: "14", departementName: "Calvados" },
      { departementCode: "27", departementName: "Eure" },
      { departementCode: "50", departementName: "Manche" },
      { departementCode: "61", departementName: "Orne" },
      { departementCode: "76", departementName: "Seine-Maritime" },
    ],
  },
  {
    regionCode: "32",
    regionName: "Hauts-de-France",
    timeZone: "Europe/Paris",
    regionId: "hauts-de-france",
    departements: [
      { departementCode: "02", departementName: "Aisne" },
      { departementCode: "59", departementName: "Nord" },
      { departementCode: "60", departementName: "Oise" },
      { departementCode: "62", departementName: "Pas-de-Calais" },
      { departementCode: "80", departementName: "Somme" },
    ],
  },
  {
    regionCode: "44",
    regionName: "Grand Est",
    regionId: "grand-est",
    timeZone: "Europe/Paris",
    departements: [
      { departementCode: "08", departementName: "Ardennes" },
      { departementCode: "10", departementName: "Aube" },
      { departementCode: "51", departementName: "Marne" },
      { departementCode: "52", departementName: "Haute-Marne" },
      { departementCode: "54", departementName: "Meurthe-et-Moselle" },
      { departementCode: "55", departementName: "Meuse" },
      { departementCode: "57", departementName: "Moselle" },
      { departementCode: "67", departementName: "Bas-Rhin" },
      { departementCode: "68", departementName: "Haut-Rhin" },
      { departementCode: "88", departementName: "Vosges" },
    ],
  },
  {
    regionCode: "52",
    regionName: "Pays de la Loire",
    regionId: "pays-de-la-loire",
    timeZone: "Europe/Paris",
    departements: [
      { departementCode: "44", departementName: "Loire-Atlantique" },
      { departementCode: "49", departementName: "Maine-et-Loire" },
      { departementCode: "53", departementName: "Mayenne" },
      { departementCode: "72", departementName: "Sarthe" },
      { departementCode: "85", departementName: "Vendée" },
    ],
  },
  {
    regionCode: "53",
    regionName: "Bretagne",
    regionId: "bretagne",
    timeZone: "Europe/Paris",
    departements: [
      { departementCode: "22", departementName: "Côtes-d'armor" },
      { departementCode: "29", departementName: "Finistère" },
      { departementCode: "35", departementName: "Ille-et-Vilaine" },
      { departementCode: "56", departementName: "Morbihan" },
    ],
  },
  {
    regionCode: "75",
    regionName: "Nouvelle-Aquitaine",
    regionId: "nouvelle-aquitaine",
    timeZone: "Europe/Paris",
    departements: [
      { departementCode: "16", departementName: "Charente" },
      { departementCode: "17", departementName: "Charente-Maritime" },
      { departementCode: "19", departementName: "Corrèze" },
      { departementCode: "23", departementName: "Creuse" },
      { departementCode: "24", departementName: "Dordogne" },
      { departementCode: "33", departementName: "Gironde" },
      { departementCode: "40", departementName: "Landes" },
      { departementCode: "47", departementName: "Lot-et-Garonne" },
      { departementCode: "64", departementName: "Pyrénées-Atlantiques" },
      { departementCode: "79", departementName: "Deux-Sèvres" },
      { departementCode: "86", departementName: "Vienne" },
      { departementCode: "87", departementName: "Haute-Vienne" },
    ],
  },
  {
    regionCode: "76",
    regionName: "Occitanie",
    regionId: "occitanie",
    timeZone: "Europe/Paris",
    departements: [
      { departementCode: "09", departementName: "Ariège" },
      { departementCode: "11", departementName: "Aude" },
      { departementCode: "12", departementName: "Aveyron" },
      { departementCode: "30", departementName: "Gard" },
      { departementCode: "31", departementName: "Haute-Garonne" },
      { departementCode: "32", departementName: "Gers" },
      { departementCode: "34", departementName: "Hérault" },
      { departementCode: "46", departementName: "Lot" },
      { departementCode: "48", departementName: "Lozère" },
      { departementCode: "65", departementName: "Hautes-Pyrénées" },
      { departementCode: "66", departementName: "Pyrénées-Orientales" },
      { departementCode: "81", departementName: "Tarn" },
      { departementCode: "82", departementName: "Tarn-et-Garonne" },
    ],
  },
  {
    regionCode: "84",
    regionName: "Auvergne-Rhône-Alpes",
    regionId: "auvergne-rhone-alpes",
    timeZone: "Europe/Paris",
    departements: [
      { departementCode: "01", departementName: "Ain" },
      { departementCode: "03", departementName: "Allier" },
      { departementCode: "07", departementName: "Ardèche" },
      { departementCode: "15", departementName: "Cantal" },
      { departementCode: "26", departementName: "Drôme" },
      { departementCode: "38", departementName: "Isère" },
      { departementCode: "42", departementName: "Loire" },
      { departementCode: "43", departementName: "Haute-Loire" },
      { departementCode: "63", departementName: "Puy-de-Dôme" },
      { departementCode: "69", departementName: "Rhône" },
      { departementCode: "73", departementName: "Savoie" },
      { departementCode: "74", departementName: "Haute-Savoie" },
    ],
  },
  {
    regionCode: "93",
    regionName: "Provence-Alpes-Côte d'Azur",
    regionId: "paca",
    timeZone: "Europe/Paris",
    departements: [
      { departementCode: "04", departementName: "Alpes-de-Haute-Provence" },
      { departementCode: "05", departementName: "Hautes-Alpes" },
      { departementCode: "06", departementName: "Alpes-Maritimes" },
      { departementCode: "13", departementName: "Bouches-du-Rhône" },
      { departementCode: "83", departementName: "Var" },
      { departementCode: "84", departementName: "Vaucluse" },
    ],
  },
  {
    regionCode: "94",
    regionId: "corse",
    regionName: "Corse",
    timeZone: "Europe/Paris",
    departements: [
      { departementCode: "2A", departementName: "Corse-du-Sud" },
      { departementCode: "2B", departementName: "Haute-Corse" },
    ],
  },
  {
    regionCode: "NC",
    regionId: "nouvelle-caledonie",
    regionName: "Nouvelle Calédonie",
    timeZone: "Pacific/Noumea",
    departements: [
      { departementCode: "988", departementName: "Nouvelle Calédonie" },
    ],
  },
  {
    regionCode: "PO",
    regionId: "polynesie-française",
    regionName: "Polynésie Française",
    timeZone: "Pacific/Gambier",
    departements: [
      { departementCode: "987", departementName: "Polynésie Française" },
    ],
  },
  {
    regionCode: "SB",
    regionId: "saint-barthelemy",
    timeZone: "America/Martinique",
    regionName: "Saint-Barthélemy",
    departements: [
      { departementCode: "977", departementName: "Saint-Barthélemy" },
    ],
  },
  {
    regionCode: "SM",
    regionId: "saint-martin",
    regionName: "Saint-Martin",
    timeZone: "America/Martinique",
    departements: [{ departementCode: "978", departementName: "Saint-Martin" }],
  },
  {
    regionCode: "SP",
    regionId: "saint-pierre-et-miquelon",
    regionName: "Saint-Pierre-et-Miquelon",
    timeZone: "America/Miquelon",
    departements: [
      { departementCode: "975", departementName: "Saint-Pierre-et-Miquelon" },
    ],
  },
  {
    regionCode: "WF",
    regionId: "wallis-et-futuna",
    regionName: "Wallis-et-Futuna",
    timeZone: "Pacific/Wallis",
    departements: [
      { departementCode: "986", departementName: "Wallis-et-Futuna" },
    ],
  },
  {
    regionCode: "TF",
    regionId: "terres-australes-francaises",
    regionName: "Terres australes françaises",
    timeZone: "Indian/Maldives",
    departements: [
      {
        departementCode: "984",
        departementName: "Terres australes françaises",
      },
    ],
  },
];
