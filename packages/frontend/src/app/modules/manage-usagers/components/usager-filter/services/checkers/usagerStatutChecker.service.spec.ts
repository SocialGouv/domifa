import { UsagersFilterCriteriaStatut } from "@domifa/common";
import { UsagerLight } from "../../../../../../../_common/model";
import { usagerStatutChecker } from "./usagerStatutChecker.service";

const usager1 = {
  statut: "INSTRUCTION",
} as UsagerLight;

const usager2 = {
  statut: "ATTENTE_DECISION",
  typeDom: "RENOUVELLEMENT",
} as UsagerLight;

it("usagerStatutChecker INSTRUCTION", () => {
  expect(
    usagerStatutChecker.check({
      usager: usager1,
      statut: UsagersFilterCriteriaStatut.INSTRUCTION,
    })
  ).toBeTruthy();
  expect(
    usagerStatutChecker.check({
      usager: usager2,
      statut: UsagersFilterCriteriaStatut.INSTRUCTION,
    })
  ).toBeFalsy();
});
