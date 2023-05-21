import { USAGER_REFUS_MOCK, USAGER_VALIDE_MOCK } from "../../../_common/mocks";

import { generateMotifLabel } from "../generateMotifLabel.service";

describe("generateMotifLabel", () => {
  it("generateMotifLabel  ", async () => {
    expect(generateMotifLabel(USAGER_VALIDE_MOCK.decision)).toEqual("");

    USAGER_REFUS_MOCK.decision.motif = "HORS_AGREMENT";
    expect(generateMotifLabel(USAGER_REFUS_MOCK.decision)).toEqual(
      "En dehors des critères du public domicilié"
    );

    USAGER_REFUS_MOCK.decision.motif = "LIEN_COMMUNE";

    expect(generateMotifLabel(USAGER_REFUS_MOCK.decision)).toEqual(
      "Absence de lien avec la commune"
    );

    USAGER_REFUS_MOCK.decision.motif = "SATURATION";

    expect(generateMotifLabel(USAGER_REFUS_MOCK.decision)).toEqual(
      "Nombre maximal domiciliations atteint"
    );

    USAGER_REFUS_MOCK.decision.motif = "AUTRE";
    USAGER_REFUS_MOCK.decision.motifDetails =
      "Nombre maximal domiciliations atteint";

    expect(generateMotifLabel(USAGER_REFUS_MOCK.decision)).toEqual(
      "Autre motif: Nombre maximal domiciliations atteint"
    );

    USAGER_REFUS_MOCK.decision.motifDetails = null;

    expect(generateMotifLabel(USAGER_REFUS_MOCK.decision)).toEqual(
      "Autre motif: non précisé"
    );
  });
});