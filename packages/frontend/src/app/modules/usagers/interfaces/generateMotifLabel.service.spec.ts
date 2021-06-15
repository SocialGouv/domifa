import { usagerRefusMock } from "../../../../_common/mocks/usagerRefus.mock";
import { usagerValideMock } from "../../../../_common/mocks/usagerValideMock.mock";
import { generateMotifLabel } from "./generateMotifLabel.service";

describe("generateMotifLabel", () => {
  it("generateMotifLabel  ", async () => {
    expect(generateMotifLabel(usagerValideMock)).toEqual("");

    expect(generateMotifLabel(usagerRefusMock)).toEqual(
      "Non-manifestation de la personne pendant plus de 3 mois consécutifs"
    );

    usagerRefusMock.decision.motif = "A_SA_DEMANDE";
    expect(generateMotifLabel(usagerRefusMock)).toEqual(
      "À la demande de la personne"
    );

    usagerRefusMock.decision.motif = "AUTRE";
    usagerRefusMock.decision.motifDetails =
      "Il y un autre motif que ceux dans la liste";
  });
});
