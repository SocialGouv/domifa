import { USAGER_REFUS_MOCK } from "../../../../_common/mocks/USAGER_REFUS.mock";
import { DEFAULT_USAGER } from "./../../../../_common/mocks/DEFAULT_USAGER.const";
import { generateMotifLabel } from "./generateMotifLabel.service";

describe("generateMotifLabel", () => {
  it("generateMotifLabel  ", async () => {
    expect(generateMotifLabel(DEFAULT_USAGER.decision)).toEqual("");

    USAGER_REFUS_MOCK.decision.motif = "HORS_AGREMENT";
    expect(generateMotifLabel(USAGER_REFUS_MOCK.decision)).toEqual(
      "En dehors des critères du public domicilié",
    );

    USAGER_REFUS_MOCK.decision.motif = "LIEN_COMMUNE";

    expect(generateMotifLabel(USAGER_REFUS_MOCK.decision)).toEqual(
      "Absence de lien avec la commune",
    );

    USAGER_REFUS_MOCK.decision.motif = "SATURATION";

    expect(generateMotifLabel(USAGER_REFUS_MOCK.decision)).toEqual(
      "Nombre maximal domiciliations atteint",
    );

    USAGER_REFUS_MOCK.decision.motif = "AUTRE";
    USAGER_REFUS_MOCK.decision.motifDetails =
      "Nombre maximal domiciliations atteint";

    expect(generateMotifLabel(USAGER_REFUS_MOCK.decision)).toEqual(
      "Autre motif: Nombre maximal domiciliations atteint",
    );

    USAGER_REFUS_MOCK.decision.motifDetails = "";

    expect(generateMotifLabel(USAGER_REFUS_MOCK.decision)).toEqual(
      "Autre motif: non précisé",
    );
  });
});
