import { UsagerLight } from "../../../../../../../../_common/model";
import { usagerPassageChecker } from "./usagerPassageChecker.service";
const dayMs = 24 * 3600 * 1000;
const weekMs = 7 * dayMs;
const refDateNow = new Date(Date.UTC(2021, 1, 15));

it("usagerPassageChecker DEUX_MOIS", () => {
  expect(
    usagerPassageChecker.check({
      usager: {
        decision: {
          statut: "VALIDE",
        },
        lastInteraction: {
          dateInteraction: new Date(refDateNow.getTime() - 10 * weekMs), // il y a 10 semaines
        },
      } as UsagerLight,
      passage: "DEUX_MOIS",
      refDateNow,
    })
  ).toBeTruthy();
  expect(
    usagerPassageChecker.check({
      usager: {
        decision: {
          statut: "INSTRUCTION", // NON VALIDE
        },
        lastInteraction: {
          dateInteraction: new Date(refDateNow.getTime() - 10 * weekMs), // il y a 10 semaines
        },
      } as UsagerLight,
      passage: "DEUX_MOIS",
      refDateNow,
    })
  ).toBeFalsy();
  expect(
    usagerPassageChecker.check({
      usager: {
        decision: {
          statut: "VALIDE",
        },
        lastInteraction: {
          dateInteraction: new Date(refDateNow.getTime() - 5 * weekMs), // il y a 5 semaines
        },
      } as UsagerLight,
      passage: "DEUX_MOIS",
      refDateNow,
    })
  ).toBeFalsy();
});

it("usagerPassageChecker TROIS_MOIS", () => {
  expect(
    usagerPassageChecker.check({
      usager: {
        decision: {
          statut: "VALIDE",
        },
        lastInteraction: {
          dateInteraction: new Date(refDateNow.getTime() - 16 * weekMs), // il y a 16 semaines
        },
      } as UsagerLight,
      passage: "TROIS_MOIS",
      refDateNow,
    })
  ).toBeTruthy();
  expect(
    usagerPassageChecker.check({
      usager: {
        decision: {
          statut: "INSTRUCTION", // NON VALIDE
        },
        lastInteraction: {
          dateInteraction: new Date(refDateNow.getTime() - 16 * weekMs), // il y a 16 semaines
        },
      } as UsagerLight,
      passage: "TROIS_MOIS",
      refDateNow,
    })
  ).toBeFalsy();
  expect(
    usagerPassageChecker.check({
      usager: {
        decision: {
          statut: "VALIDE",
        },
        lastInteraction: {
          dateInteraction: new Date(refDateNow.getTime() - 10 * weekMs), // il y a 10 semaines
        },
      } as UsagerLight,
      passage: "TROIS_MOIS",
      refDateNow,
    })
  ).toBeFalsy();
});
