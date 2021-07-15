import { USAGER_ACTIF_MOCK } from "../../../../_common/mocks/USAGER_ACTIF.mock";
import {
  ETAPE_DOCUMENTS,
  ETAPE_ENTRETIEN,
  ETAPE_ETAT_CIVIL,
} from "../../../../_common/model/usager/constants";

import { getUrlUsagerProfil } from "./getUrlUsagerProfil.service";

it("getUrlUsagerProfil: redirection vers le profil", () => {
  expect(getUrlUsagerProfil(USAGER_ACTIF_MOCK)).toEqual("/profil/general/5");

  // Refus = page profil
  USAGER_ACTIF_MOCK.decision.statut = "REFUS";
  expect(getUrlUsagerProfil(USAGER_ACTIF_MOCK)).toEqual("/profil/general/5");

  // Radié = page profil
  USAGER_ACTIF_MOCK.decision.statut = "RADIE";
  expect(getUrlUsagerProfil(USAGER_ACTIF_MOCK)).toEqual("/profil/general/5");

  // Attente décision = page de décision
  USAGER_ACTIF_MOCK.decision.statut = "ATTENTE_DECISION";
  expect(getUrlUsagerProfil(USAGER_ACTIF_MOCK)).toEqual(
    "/usager/5/edit/decision"
  );

  // Renouvellement + instruction = retour à la page profil
  USAGER_ACTIF_MOCK.decision.statut = "INSTRUCTION";
  expect(getUrlUsagerProfil(USAGER_ACTIF_MOCK)).toEqual("/profil/general/5");

  // Premiere demande + instruction = Aller sur le dossier d'instruction
  USAGER_ACTIF_MOCK.typeDom = "PREMIERE_DOM";
  USAGER_ACTIF_MOCK.etapeDemande = ETAPE_DOCUMENTS;
  expect(getUrlUsagerProfil(USAGER_ACTIF_MOCK)).toEqual(
    "/usager/5/edit/documents"
  );

  USAGER_ACTIF_MOCK.etapeDemande = ETAPE_ENTRETIEN;
  expect(getUrlUsagerProfil(USAGER_ACTIF_MOCK)).toEqual(
    "/usager/5/edit/entretien"
  );

  USAGER_ACTIF_MOCK.etapeDemande = ETAPE_ETAT_CIVIL;
  expect(getUrlUsagerProfil(USAGER_ACTIF_MOCK)).toEqual(
    "/usager/5/edit/etat-civil"
  );

  expect(getUrlUsagerProfil(undefined)).toEqual("/nouveau");
});
