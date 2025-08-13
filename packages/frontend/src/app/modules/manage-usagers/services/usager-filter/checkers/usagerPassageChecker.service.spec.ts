import { subDays, subMonths, subWeeks, subYears } from "date-fns";
import { UsagerLight } from "../../../../../../_common/model";
import { usagerPassageChecker } from "./usagerPassageChecker.service";

describe("usagerPassageChecker ", () => {
  describe("Previous two months ", () => {
    it("usagerPassageChecker: should return true, Last Interaction date < Two months ago", () => {
      expect(
        usagerPassageChecker.check({
          usager: {
            decision: {
              statut: "VALIDE",
            },
            lastInteraction: {
              dateInteraction: subMonths(new Date(), 5),
            },
          } as UsagerLight,
          lastInteractionDate: "PREVIOUS_TWO_MONTHS",
        })
      ).toBeTruthy();

      expect(
        usagerPassageChecker.check({
          usager: {
            decision: {
              statut: "INSTRUCTION",
            },
            lastInteraction: {
              dateInteraction: subYears(new Date(), 1),
            },
          } as UsagerLight,
          lastInteractionDate: "PREVIOUS_TWO_MONTHS",
        })
      ).toBeTruthy();
    });

    it("usagerPassageChecker: should return false, last interaction > two months ago", () => {
      expect(
        usagerPassageChecker.check({
          usager: {
            decision: {
              statut: "INSTRUCTION",
            },
            lastInteraction: {
              dateInteraction: subDays(new Date(), 2),
            },
          } as UsagerLight,
          lastInteractionDate: "PREVIOUS_TWO_MONTHS",
        })
      ).toBeFalsy();

      expect(
        usagerPassageChecker.check({
          usager: {
            decision: {
              statut: "VALIDE",
            },
            lastInteraction: {
              dateInteraction: subMonths(new Date(), 2),
            },
          } as UsagerLight,
          lastInteractionDate: "PREVIOUS_TWO_MONTHS",
        })
      ).toBeFalsy();
    });
  });

  describe("Previous three months", () => {
    it("usagerPassageChecker: should return true, last interaction < 3 months", () => {
      expect(
        usagerPassageChecker.check({
          usager: {
            decision: {
              statut: "VALIDE",
            },
            lastInteraction: {
              dateInteraction: subMonths(new Date(), 6),
            },
          } as UsagerLight,
          lastInteractionDate: "PREVIOUS_THREE_MONTHS",
        })
      ).toBeTruthy();
    });

    it("usagerPassageChecker: should return false, last interaction > 3 months", () => {
      expect(
        usagerPassageChecker.check({
          usager: {
            decision: {
              statut: "INSTRUCTION",
            },
            lastInteraction: {
              dateInteraction: subWeeks(new Date(), 1),
            },
          } as UsagerLight,
          lastInteractionDate: "PREVIOUS_THREE_MONTHS",
        })
      ).toBeFalsy();
    });
  });
});
