import { UsagerLight } from "../../../../../../../../_common/model";
import { usagerStatutChecker } from "./usagerStatutChecker.service";

const usager1 = {
  decision: {
    statut: "INSTRUCTION",
  },
} as UsagerLight;

const usager2 = {
  decision: {
    statut: "ATTENTE_DECISION",
  },
  typeDom: "RENOUVELLEMENT",
} as UsagerLight;

const usager3 = {
  decision: {
    statut: "INSTRUCTION",
  },
  typeDom: "RENOUVELLEMENT",
} as UsagerLight;

it("usagerStatutChecker INSTRUCTION", () => {
  expect(
    usagerStatutChecker.check({
      usager: usager1,
      statut: "INSTRUCTION",
    })
  ).toBeTruthy();
  expect(
    usagerStatutChecker.check({
      usager: usager2,
      statut: "INSTRUCTION",
    })
  ).toBeFalsy();
});

it("usagerStatutChecker RENOUVELLEMENT", () => {
  expect(
    usagerStatutChecker.check({
      usager: usager2,
      statut: "RENOUVELLEMENT",
    })
  ).toBeTruthy();
  expect(
    usagerStatutChecker.check({
      usager: usager3,
      statut: "RENOUVELLEMENT",
    })
  ).toBeTruthy();
  expect(
    usagerStatutChecker.check({
      usager: usager1,
      statut: "RENOUVELLEMENT",
    })
  ).toBeFalsy();
});
