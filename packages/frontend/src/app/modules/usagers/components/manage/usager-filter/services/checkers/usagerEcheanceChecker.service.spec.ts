import { UsagerLight } from "../../../../../../../../_common/model";
import { usagerEcheanceChecker } from "./usagerEcheanceChecker.service";
const dayMs = 24 * 3600 * 1000;
const weekMs = 7 * dayMs;
const refDateNow = new Date(Date.UTC(2021, 1, 15));

it("usagerEcheanceChecker DEPASSEE", () => {
  expect(
    usagerEcheanceChecker.check({
      usager: {
        decision: {
          statut: "VALIDE",
          dateFin: new Date(refDateNow.getTime() - 1 * dayMs), // hier
        },
      } as UsagerLight,
      echeance: "DEPASSEE",
      refDateNow,
    })
  ).toBeTruthy();
  expect(
    usagerEcheanceChecker.check({
      usager: {
        decision: {
          statut: "REFUS",
          dateFin: new Date(refDateNow.getTime() - 1 * dayMs), // hier
        },
      } as UsagerLight,
      echeance: "DEPASSEE",
      refDateNow,
    })
  ).toBeFalsy();
  expect(
    usagerEcheanceChecker.check({
      usager: {
        decision: {
          statut: "VALIDE",
          dateFin: new Date(refDateNow.getTime() + 1 * dayMs), // demain
        },
      } as UsagerLight,
      echeance: "DEPASSEE",
      refDateNow,
    })
  ).toBeFalsy();
});

it("usagerEcheanceChecker DEUX_MOIS", () => {
  expect(
    usagerEcheanceChecker.check({
      usager: {
        decision: {
          statut: "VALIDE",
          dateFin: new Date(refDateNow.getTime() + 1 * weekMs), // dans 1 semaine
        },
      } as UsagerLight,
      echeance: "DEUX_MOIS",
      refDateNow,
    })
  ).toBeTruthy();
  expect(
    usagerEcheanceChecker.check({
      usager: {
        decision: {
          statut: "RADIE",
          dateFin: new Date(refDateNow.getTime() + 1 * weekMs), // dans 1 semaines
        },
      } as UsagerLight,
      echeance: "DEUX_MOIS",
      refDateNow,
    })
  ).toBeFalsy();
  expect(
    usagerEcheanceChecker.check({
      usager: {
        decision: {
          statut: "VALIDE",
          dateFin: new Date(refDateNow.getTime() + 3 * weekMs), // dans 3 semaines
        },
      } as UsagerLight,
      echeance: "DEUX_MOIS",
      refDateNow,
    })
  ).toBeTruthy();
  expect(
    usagerEcheanceChecker.check({
      usager: {
        decision: {
          statut: "VALIDE",
          dateFin: new Date(refDateNow.getTime() + 10 * weekMs), // dans 10 semaines
        },
      } as UsagerLight,
      echeance: "DEUX_MOIS",
      refDateNow,
    })
  ).toBeFalsy();
  expect(
    usagerEcheanceChecker.check({
      usager: {
        decision: {
          statut: "VALIDE",
          dateFin: new Date(refDateNow.getTime() - 1 * dayMs), // hier
        },
      } as UsagerLight,
      echeance: "DEUX_MOIS",
      refDateNow,
    })
  ).toBeFalsy();
});

it("usagerEcheanceChecker DEUX_SEMAINES", () => {
  expect(
    usagerEcheanceChecker.check({
      usager: {
        decision: {
          statut: "VALIDE",
          dateFin: new Date(refDateNow.getTime() + 1 * weekMs), // dans 1 semaine
        },
      } as UsagerLight,
      echeance: "DEUX_SEMAINES",
      refDateNow,
    })
  ).toBeTruthy();
  expect(
    usagerEcheanceChecker.check({
      usager: {
        decision: {
          statut: "RADIE",
          dateFin: new Date(refDateNow.getTime() + 1 * weekMs), // dans 1 semaines
        },
      } as UsagerLight,
      echeance: "DEUX_SEMAINES",
      refDateNow,
    })
  ).toBeFalsy();
  expect(
    usagerEcheanceChecker.check({
      usager: {
        decision: {
          statut: "VALIDE",
          dateFin: new Date(refDateNow.getTime() + 3 * weekMs), // dans 3 semaines
        },
      } as UsagerLight,
      echeance: "DEUX_SEMAINES",
      refDateNow,
    })
  ).toBeFalsy();
  expect(
    usagerEcheanceChecker.check({
      usager: {
        decision: {
          statut: "VALIDE",
          dateFin: new Date(refDateNow.getTime() - 1 * dayMs), // hier
        },
      } as UsagerLight,
      echeance: "DEUX_SEMAINES",
      refDateNow,
    })
  ).toBeFalsy();
});
