import { type UsagerDecision } from "../interfaces";
import { generateMotifLabel } from "./generateMotifLabel.service";

describe("generateMotifLabel", () => {
  const decisionValide: UsagerDecision = {
    statut: "VALIDE",
    dateDebut: new Date("2020-02-12T00:00:00.000Z"),
    dateDecision: new Date("2020-02-12T00:00:00.000Z"),
    dateFin: new Date("2021-02-12T00:00:00.000Z"),
    motif: "LIEN_COMMUNE",
    typeDom: "PREMIERE_DOM",
    orientation: "other",
    orientationDetails: "DETAILS",
    motifDetails: "DETAILS",
    userId: 30,
    userName: "Testeur Robin",
    uuid: "x",
  };

  const decisionRefus: UsagerDecision = {
    statut: "REFUS",
    dateDebut: new Date("2020-02-12T00:00:00.000Z"),
    dateDecision: new Date("2020-02-12T00:00:00.000Z"),
    dateFin: new Date("2021-02-12T00:00:00.000Z"),
    motif: "NON_MANIFESTATION_3_MOIS",
    typeDom: "PREMIERE_DOM",
    motifDetails: "",
    userId: 30,
    userName: "Testeur Robin",
    uuid: "x",
  };

  it("generateMotifLabel  ", async () => {
    expect(generateMotifLabel(decisionValide)).toEqual("");

    decisionRefus.motif = "HORS_AGREMENT";
    expect(generateMotifLabel(decisionRefus)).toEqual(
      "En dehors des critères du public domicilié"
    );

    decisionRefus.motif = "LIEN_COMMUNE";

    expect(generateMotifLabel(decisionRefus)).toEqual(
      "Absence de lien avec la commune"
    );

    decisionRefus.motif = "SATURATION";

    expect(generateMotifLabel(decisionRefus)).toEqual(
      "Nombre maximal domiciliations atteint"
    );

    decisionRefus.motif = "AUTRE";
    decisionRefus.motifDetails = "Nombre maximal domiciliations atteint";

    expect(generateMotifLabel(decisionRefus)).toEqual(
      "Autre motif: Nombre maximal domiciliations atteint"
    );

    decisionRefus.motifDetails = undefined;

    expect(generateMotifLabel(decisionRefus)).toEqual(
      "Autre motif: non précisé"
    );
  });
});
