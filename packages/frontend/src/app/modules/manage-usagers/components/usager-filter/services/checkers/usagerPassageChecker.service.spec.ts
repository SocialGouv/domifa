import { subDays, subMonths, subWeeks } from "date-fns";
import { UsagerLight } from "../../../../../../../_common/model";
import { usagerPassageChecker } from "./usagerPassageChecker.service";

describe("usagerPassageChecker ", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-12-30T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

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
              dateInteraction: new Date("2024-10-30T12:00:00.000Z"),
            },
          } as UsagerLight,
          lastInteractionDate: "PREVIOUS_TWO_MONTHS",
        })
      ).toBeFalsy();

      expect(
        usagerPassageChecker.check({
          usager: {
            decision: {
              statut: "INSTRUCTION",
            },
            lastInteraction: {
              dateInteraction: new Date("2024-10-29T12:00:00.000Z"),
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
