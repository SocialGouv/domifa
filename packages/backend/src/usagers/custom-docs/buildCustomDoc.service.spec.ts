import { buildCustomDoc } from ".";
import { usagerValideMock } from "../../_common/mocks/usagerValideMock.mock";
import { StructureCustomDocTags } from "../../_common/model";
import { generatedAttestationMock, structureMock } from "./mocks";

describe("buildCustomDoc.service", () => {
  it("Generate data for ATTESTATION POSTALE", async () => {
    const date = new Date("2020-12-15 14:30:00");
    const docActif: StructureCustomDocTags = buildCustomDoc({
      usager: usagerValideMock,
      structure: structureMock,
      date,
    });

    expect(docActif).toEqual(generatedAttestationMock);
  });

  it("Generate data for ATTESTATION RADIATION", async () => {
    const date = new Date("2020-12-15 14:30:00");
    const docActif: StructureCustomDocTags = buildCustomDoc({
      usager: usagerValideMock,
      structure: structureMock,
      date,
    });

    expect(docActif).toEqual(generatedAttestationMock);
  });

  it("Generate data for ACCESS ESPACE DOMICILIE", async () => {
    const date = new Date("2020-12-15 14:30:00");
    const extraParameters = {
      ESPACE_DOM_URL: "https://mon-domifa",
      ESPACE_DOM_ID: "my-login",
      ESPACE_DOM_MDP: "my-password",
    };
    const docRadiation: StructureCustomDocTags = buildCustomDoc({
      usager: usagerValideMock,
      structure: structureMock,
      date,
      extraParameters,
    });

    expect(docRadiation).toEqual({
      ...generatedAttestationMock,
      ...extraParameters,
    });
  });

  it("Générer un document avec transfert & procuration", async () => {
    const date = new Date("2020-12-15 14:30:00");

    usagerValideMock.options = {
      transfert: {
        actif: true,
        nom: "Nom de l'établissement",
        adresse: "Adresse du transfert",
        dateDebut: new Date("2022-12-20 10:35:00"),
        dateFin: new Date("2023-09-04 14:30:00"),
      },
      procuration: {
        actif: true,
        nom: "Nom du mandataire",
        prenom: "Prénom du mandataire",
        dateDebut: new Date("2022-12-20 14:30:00"),
        dateFin: new Date("2023-09-04 14:30:00"),
        dateNaissance: new Date("1998-12-12 04:30:00"),
      },
      npai: {
        actif: false,
      },
      historique: {
        transfert: [],
        procuration: [],
      },
    };

    const customDocGenerated: StructureCustomDocTags = buildCustomDoc({
      usager: usagerValideMock,
      structure: structureMock,
      date,
    });

    expect(customDocGenerated.TRANSFERT_ACTIF).toEqual("OUI");
    expect(customDocGenerated.TRANSFERT_NOM).toEqual("Nom de l'établissement");
    expect(customDocGenerated.TRANSFERT_ADRESSE).toEqual(
      "Adresse du transfert"
    );
    expect(customDocGenerated.TRANSFERT_DATE_DEBUT).toEqual("20/12/2022");
    expect(customDocGenerated.TRANSFERT_DATE_FIN).toEqual("04/09/2023");

    // Procuration
    expect(customDocGenerated.PROCURATION_ACTIF).toEqual("OUI");

    expect(customDocGenerated.PROCURATION_PRENOM).toEqual(
      "Prénom du mandataire"
    );
    expect(customDocGenerated.PROCURATION_NOM).toEqual("Nom du mandataire");
    expect(customDocGenerated.PROCURATION_DATE_DEBUT).toEqual("20/12/2022");
    expect(customDocGenerated.PROCURATION_DATE_FIN).toEqual("04/09/2023");
    expect(customDocGenerated.PROCURATION_DATE_NAISSANCE).toEqual("12/12/1998");
    // expect(docActif).toEqual(generatedAttestationMock);
  });
});
