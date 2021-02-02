import { UsagerLight } from "../../../../../../../../_common/model";
import { usagerInteractionTypeChecker } from "./usagerInteractionTypeChecker.service";

const usager1 = {
  lastInteraction: {
    courrierIn: 1,
    enAttente: true,
  },
} as UsagerLight;

const usager2 = {
  lastInteraction: {
    courrierIn: 0,
  },
} as UsagerLight;

it("usagerInteractionTypeChecker enAttente", () => {
  expect(
    usagerInteractionTypeChecker.check({
      usager: usager1,
      interactionType: "courrierIn",
    })
  ).toBeTruthy();
  expect(
    usagerInteractionTypeChecker.check({
      usager: usager2,
      interactionType: "courrierIn",
    })
  ).toBeFalsy();
});
