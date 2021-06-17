import { usagerRefusMock } from "../../../../_common/mocks/usagerRefus.mock";
import { usagerValideMock } from "../../../../_common/mocks/usagerValideMock.mock";
import { generateMotifLabel } from "./generateMotifLabel.service";

describe("generateMotifLabel", () => {
  it("generateMotifLabel  ", async () => {
    expect(generateMotifLabel(usagerValideMock)).toEqual("");

    usagerRefusMock.decision.motif = "HORS_AGREMENT";
    expect(generateMotifLabel(usagerRefusMock)).toEqual(
      "En dehors des critères du public domicilié"
    );

    usagerRefusMock.decision.motif = "LIEN_COMMUNE";

    expect(generateMotifLabel(usagerRefusMock)).toEqual(
      "Absence de lien avec la commune"
    );

    usagerRefusMock.decision.motif = "SATURATION";

    expect(generateMotifLabel(usagerRefusMock)).toEqual(
      "Nombre maximal domiciliations atteint"
    );

    usagerRefusMock.decision.motif = "AUTRE";
    usagerRefusMock.decision.motifDetails =
      "Nombre maximal domiciliations atteint";

    expect(generateMotifLabel(usagerRefusMock)).toEqual(
      "Autre motif : Nombre maximal domiciliations atteint"
    );

    usagerRefusMock.decision.motifDetails = null;

    expect(generateMotifLabel(usagerRefusMock)).toEqual(
      "Autre motif non précisé"
    );
  });
});
