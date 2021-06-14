import { usagerValideMock } from "../../../../_common/mocks/usager.mock";
import {
  ETAPE_DOCUMENTS,
  ETAPE_ENTRETIEN,
  ETAPE_ETAT_CIVIL,
} from "../../../../_common/model/usager/constants";

import { getUrlUsagerProfil } from "./getUrlUsagerProfil.service";

it("getUrlUsagerProfil: redirection vers le profil", () => {
  expect(getUrlUsagerProfil(usagerValideMock)).toEqual("/usager/5");

  // Refus = page profil
  usagerValideMock.decision.statut = "REFUS";
  expect(getUrlUsagerProfil(usagerValideMock)).toEqual("/usager/5");

  // Radié = page profil
  usagerValideMock.decision.statut = "RADIE";
  expect(getUrlUsagerProfil(usagerValideMock)).toEqual("/usager/5");

  // Attente décision = page de décision
  usagerValideMock.decision.statut = "ATTENTE_DECISION";
  expect(getUrlUsagerProfil(usagerValideMock)).toEqual(
    "/usager/5/edit/decision"
  );

  // Renouvellement + instruction = retour à la page profil
  usagerValideMock.decision.statut = "INSTRUCTION";
  expect(getUrlUsagerProfil(usagerValideMock)).toEqual("/usager/5");

  // Premiere demande + instruction = Aller sur le dossier d'instruction
  usagerValideMock.typeDom = "PREMIERE_DOM";
  usagerValideMock.etapeDemande = ETAPE_DOCUMENTS;
  expect(getUrlUsagerProfil(usagerValideMock)).toEqual(
    "/usager/5/edit/documents"
  );

  usagerValideMock.etapeDemande = ETAPE_ENTRETIEN;
  expect(getUrlUsagerProfil(usagerValideMock)).toEqual(
    "/usager/5/edit/entretien"
  );

  usagerValideMock.etapeDemande = ETAPE_ETAT_CIVIL;
  expect(getUrlUsagerProfil(usagerValideMock)).toEqual(
    "/usager/5/edit/etat-civil"
  );

  expect(getUrlUsagerProfil(undefined)).toEqual("/nouveau");
});
