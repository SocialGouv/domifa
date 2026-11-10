// Email domains of the DDETS / DDETS-PP agents, by department code.
// Source: lannuaire.service-public.gouv.fr (service emails), October 2026.
//
// Overseas regions have a single department, so a domain shared between them
// (deets.gouv.fr) cannot widen access: the region check already pins the
// department.
//
// In 75, 92, 93 and 94 domiciliation is handled by the DRIHL, whose agents use
// the ministry-wide developpement-durable.gouv.fr domain. It is shared between
// these departments, all in Ile-de-France: the domain does not pin the
// department, the inviting DRIEETS chooses it.
//
// Deliberately left out, so their accounts stay created by the DomiFa team:
// - 977, 978, 986, 987, 988: no competent service found in the directory
export const DDETS_SHARED_EMAIL_DOMAINS: readonly string[] = ["deets.gouv.fr"];

// Shared between departments of a single region only
export const DDETS_REGION_SHARED_EMAIL_DOMAINS: readonly string[] = [
  "developpement-durable.gouv.fr",
];

const DRIHL_EMAIL_DOMAINS: readonly string[] = [
  "developpement-durable.gouv.fr",
];

export const DDETS_EMAIL_DOMAINS: Readonly<Record<string, readonly string[]>> =
  {
    "01": ["ain.gouv.fr"],
    "02": ["aisne.gouv.fr"],
    "03": ["allier.gouv.fr"],
    "04": ["alpes-de-haute-provence.gouv.fr"],
    "05": ["hautes-alpes.gouv.fr"],
    "06": ["alpes-maritimes.gouv.fr"],
    "07": ["ardeche.gouv.fr"],
    "08": ["ardennes.gouv.fr"],
    "09": ["ariege.gouv.fr"],
    "10": ["aube.gouv.fr"],
    "11": ["aude.gouv.fr"],
    "12": ["aveyron.gouv.fr"],
    "13": ["bouches-du-rhone.gouv.fr"], // not confirmed by a service email
    "14": ["calvados.gouv.fr"],
    "15": ["cantal.gouv.fr"],
    "16": ["charente.gouv.fr"],
    "17": ["charente-maritime.gouv.fr"],
    "18": ["cher.gouv.fr"],
    "19": ["correze.gouv.fr"],
    "2A": ["corse-du-sud.gouv.fr"],
    "2B": ["haute-corse.gouv.fr"],
    "21": ["cote-dor.gouv.fr"],
    "22": ["cotes-darmor.gouv.fr"],
    "23": ["creuse.gouv.fr"],
    "24": ["dordogne.gouv.fr"],
    "25": ["doubs.gouv.fr"],
    "26": ["drome.gouv.fr"],
    "27": ["eure.gouv.fr"],
    "28": ["eure-et-loir.gouv.fr"],
    "29": ["finistere.gouv.fr"],
    "30": ["gard.gouv.fr"], // not confirmed by a service email
    "31": ["haute-garonne.gouv.fr"],
    "32": ["gers.gouv.fr"],
    "33": ["gironde.gouv.fr"],
    "34": ["herault.gouv.fr"],
    "35": ["ille-et-vilaine.gouv.fr"],
    "36": ["indre.gouv.fr"],
    "37": ["indre-et-loire.gouv.fr"],
    "38": ["isere.gouv.fr"],
    "39": ["jura.gouv.fr"],
    "40": ["landes.gouv.fr"],
    "41": ["loir-et-cher.gouv.fr"],
    "42": ["loire.gouv.fr"], // not confirmed by a service email
    "43": ["haute-loire.gouv.fr"],
    "44": ["loire-atlantique.gouv.fr"],
    "45": ["loiret.gouv.fr"],
    "46": ["lot.gouv.fr"],
    "47": ["lot-et-garonne.gouv.fr"],
    "48": ["lozere.gouv.fr"],
    "49": ["maine-et-loire.gouv.fr"],
    "50": ["manche.gouv.fr"],
    "51": ["marne.gouv.fr"],
    "52": ["haute-marne.gouv.fr"],
    "53": ["mayenne.gouv.fr"],
    "54": ["meurthe-et-moselle.gouv.fr"],
    "55": ["meuse.gouv.fr"],
    "56": ["morbihan.gouv.fr"],
    "57": ["moselle.gouv.fr"],
    "58": ["nievre.gouv.fr"],
    "59": ["nord.gouv.fr"],
    "60": ["oise.gouv.fr"],
    "61": ["orne.gouv.fr"],
    "62": ["pas-de-calais.gouv.fr"],
    "63": ["puy-de-dome.gouv.fr"],
    "64": ["pyrenees-atlantiques.gouv.fr"],
    "65": ["hautes-pyrenees.gouv.fr"],
    "66": ["pyrenees-orientales.gouv.fr"],
    "67": ["bas-rhin.gouv.fr"],
    "68": ["haut-rhin.gouv.fr"],
    "69": ["rhone.gouv.fr"],
    "70": ["haute-saone.gouv.fr"],
    "71": ["saone-et-loire.gouv.fr"],
    "72": ["sarthe.gouv.fr"],
    "73": ["savoie.gouv.fr"],
    "74": ["haute-savoie.gouv.fr"],
    "75": DRIHL_EMAIL_DOMAINS,
    "76": ["seine-maritime.gouv.fr"],
    "77": ["seine-et-marne.gouv.fr"],
    "78": ["yvelines.gouv.fr"],
    "79": ["deux-sevres.gouv.fr"],
    "80": ["somme.gouv.fr"],
    "81": ["tarn.gouv.fr"],
    "82": ["tarn-et-garonne.gouv.fr"],
    "83": ["var.gouv.fr"],
    "84": ["vaucluse.gouv.fr"],
    "85": ["vendee.gouv.fr"],
    "86": ["vienne.gouv.fr"],
    "87": ["haute-vienne.gouv.fr"],
    "88": ["vosges.gouv.fr"],
    "89": ["yonne.gouv.fr"],
    "90": ["territoire-de-belfort.gouv.fr"],
    "91": ["essonne.gouv.fr"],
    "92": DRIHL_EMAIL_DOMAINS,
    "93": DRIHL_EMAIL_DOMAINS,
    "94": DRIHL_EMAIL_DOMAINS,
    "95": ["val-doise.gouv.fr"],
    "971": ["deets.gouv.fr"],
    "972": ["deets.gouv.fr"],
    "973": ["guyane.gouv.fr"], // DGCOPOP, part of the prefecture
    "974": ["deets.gouv.fr"],
    "975": ["dcstep.gouv.fr"],
    "976": ["deets.gouv.fr"],
  };
