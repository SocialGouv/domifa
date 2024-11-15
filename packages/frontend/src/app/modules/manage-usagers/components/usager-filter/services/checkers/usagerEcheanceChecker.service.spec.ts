import { addMonths, addYears, subDays, subMonths, subYears } from "date-fns";
import { UsagerLight } from "../../../../../../../_common/model";
import { usagerEcheanceChecker } from "./usagerEcheanceChecker.service";

describe("usagerEcheanceChecker EXCEEDED", () => {
  it("Should return true: excedeed yesterday", () => {
    expect(
      usagerEcheanceChecker.check({
        usager: {
          decision: {
            statut: "VALIDE",
            dateFin: subDays(new Date(), 1),
          },
        } as UsagerLight,
        echeance: "EXCEEDED",
      })
    ).toBeTruthy();
  });
  it("Should return true: excedeed last year", () => {
    expect(
      usagerEcheanceChecker.check({
        usager: {
          decision: {
            statut: "RADIE",
            dateFin: subDays(new Date(), 365),
          },
        } as UsagerLight,
        echeance: "EXCEEDED",
      })
    ).toBeTruthy();
  });
});
describe("NEXT_TWO_MONTHS: dateFin should be between today and +60 days", () => {
  it("Should return true: dateFin in 1 months", () => {
    expect(
      usagerEcheanceChecker.check({
        usager: {
          decision: {
            statut: "VALIDE",
            dateFin: addMonths(new Date(), 1),
          },
        } as UsagerLight,
        echeance: "NEXT_TWO_MONTHS",
      })
    ).toBeTruthy();
  });
  it("Should return false: dateFin in 6 months", () => {
    expect(
      usagerEcheanceChecker.check({
        usager: {
          decision: {
            statut: "VALIDE",
            dateFin: addMonths(new Date(), 6),
          },
        } as UsagerLight,
        echeance: "NEXT_TWO_MONTHS",
      })
    ).toBeFalsy();
  });
  it("Should return false: dateFin 6 months ago", () => {
    expect(
      usagerEcheanceChecker.check({
        usager: {
          decision: {
            statut: "VALIDE",
            dateFin: subMonths(new Date(), 6),
          },
        } as UsagerLight,
        echeance: "NEXT_TWO_MONTHS",
      })
    ).toBeFalsy();
  });
});

describe("PREVIOUS_TWO_YEARS: dateFin should be before 2 years ago", () => {
  it("Should return true: dateFin 3 years ago", () => {
    expect(
      usagerEcheanceChecker.check({
        usager: {
          decision: {
            statut: "RADIE",
            dateFin: subYears(new Date(), 3),
          },
        } as UsagerLight,
        echeance: "PREVIOUS_TWO_YEARS",
      })
    ).toBeTruthy();
  });

  it("Should return false: dateFin 1 year ago", () => {
    expect(
      usagerEcheanceChecker.check({
        usager: {
          decision: {
            statut: "RADIE",
            dateFin: subYears(new Date(), 1),
          },
        } as UsagerLight,
        echeance: "PREVIOUS_TWO_YEARS",
      })
    ).toBeFalsy();
  });
});
describe("PREVIOUS_YEAR: dateFin should be before a year ago", () => {
  it("Should return true: dateFin 3 years ago", () => {
    expect(
      usagerEcheanceChecker.check({
        usager: {
          decision: {
            statut: "RADIE",
            dateFin: subYears(new Date(), 3),
          },
        } as UsagerLight,
        echeance: "PREVIOUS_YEAR",
      })
    ).toBeTruthy();
  });

  it("Should return false: dateFin 1 month ago", () => {
    expect(
      usagerEcheanceChecker.check({
        usager: {
          decision: {
            statut: "RADIE",
            dateFin: subMonths(new Date(), 1),
          },
        } as UsagerLight,
        echeance: "PREVIOUS_YEAR",
      })
    ).toBeFalsy();
  });

  it("Should return false: dateFin in 2 years", () => {
    expect(
      usagerEcheanceChecker.check({
        usager: {
          decision: {
            statut: "RADIE",
            dateFin: addYears(new Date(), 2),
          },
        } as UsagerLight,
        echeance: "PREVIOUS_YEAR",
      })
    ).toBeFalsy();
  });
});
