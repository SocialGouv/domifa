import { subDays, subMonths, subWeeks } from "date-fns";
import { UsagerLight } from "../../../../../../../_common/model";
import { usagerPassageChecker } from "./usagerPassageChecker.service";

describe("usagerPassageChecker ", () => {
  describe("TWO_MONTHS ", () => {
    it("usagerPassageChecker: should return true, last interaction > TWO_MONTHS", () => {
      expect(
        usagerPassageChecker.check({
          usager: {
            decision: {
              statut: "VALIDE",
            },
            lastInteraction: {
              dateInteraction: subMonths(new Date(), 3),
            },
          } as UsagerLight,
          lastInteractionDate: "PREVIOUS_TWO_MONTHS",
        })
      ).toBeTruthy();
    });
    it("usagerPassageChecker: should return false, last interaction < TWO_MONTHS", () => {
      expect(
        usagerPassageChecker.check({
          usager: {
            decision: {
              statut: "INSTRUCTION",
            },
            lastInteraction: {
              dateInteraction: subMonths(new Date(), 1),
            },
          } as UsagerLight,
          lastInteractionDate: "PREVIOUS_TWO_MONTHS",
        })
      ).toBeFalsy();
    });
    it("usagerPassageChecker: should return false, last interaction < TWO_MONTHS", () => {
      expect(
        usagerPassageChecker.check({
          usager: {
            decision: {
              statut: "VALIDE",
            },
            lastInteraction: {
              dateInteraction: subDays(new Date(), 5),
            },
          } as UsagerLight,
          lastInteractionDate: "PREVIOUS_TWO_MONTHS",
        })
      ).toBeFalsy();
    });
  });

  describe("usagerPassageChecker THREE_MONTHS", () => {
    it("usagerPassageChecker: should return true, last interaction > 3 months", () => {
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

    it("usagerPassageChecker: should return false, last interaction < 3 months", () => {
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
