import { getNextClosestDay } from "./generateScheduleSendDate";

describe("getNextClosestDay", () => {
  describe("Input validation", () => {
    it("should throw error when no working days are provided", () => {
      const date = new Date("2024-03-15T10:00:00"); // Friday
      expect(() => getNextClosestDay([], date)).toThrow(
        "No working days enabled in schedule"
      );
    });

    it("should throw error when only weekend days are provided", () => {
      const date = new Date("2024-03-15T10:00:00"); // Friday
      expect(() => getNextClosestDay(["saturday", "sunday"], date)).toThrow(
        "No working days enabled in schedule"
      );
    });

    it("should handle case insensitive day names", () => {
      const date = new Date("2024-03-15T10:00:00"); // Friday
      const result = getNextClosestDay(
        ["MONDAY", "Tuesday", "wEdNeSdAy"],
        date
      );
      expect(result).toBe(1); // Monday
    });
  });

  describe("Weekend cases", () => {
    it("should return first available day when current day is Saturday", () => {
      const date = new Date("2024-03-16T10:00:00"); // Saturday
      const result = getNextClosestDay(["monday", "wednesday", "friday"], date);
      expect(result).toBe(1); // Monday
    });

    it("should return first available day when current day is Sunday", () => {
      const date = new Date("2024-03-17T10:00:00"); // Sunday
      const result = getNextClosestDay(["tuesday", "thursday"], date);
      expect(result).toBe(2); // Tuesday
    });
  });

  describe("Friday after hours cases", () => {
    it("should return first available day when Friday at exactly 19h", () => {
      const date = new Date("2024-03-15T19:00:00"); // Friday 19h
      const result = getNextClosestDay(["monday", "wednesday"], date);
      expect(result).toBe(1); // Monday
    });

    it("should return first available day when Friday after 19h", () => {
      const date = new Date("2024-03-15T20:30:00"); // Friday 20h30
      const result = getNextClosestDay(["tuesday", "thursday"], date);
      expect(result).toBe(2); // Tuesday
    });

    it("should not trigger after hours logic when Friday before 19h", () => {
      const date = new Date("2024-03-15T18:59:00"); // Friday 18h59
      const result = getNextClosestDay(["friday", "monday"], date);
      expect(result).toBe(5); // Friday (same day)
    });
  });

  describe("Weekday before 19h cases", () => {
    it("should return same day if available and before 19h on Monday", () => {
      const date = new Date("2024-03-11T10:00:00"); // Monday 10h
      const result = getNextClosestDay(["monday", "wednesday"], date);
      expect(result).toBe(1); // Monday
    });

    it("should return same day if available and before 19h on Tuesday", () => {
      const date = new Date("2024-03-12T15:00:00"); // Tuesday 15h
      const result = getNextClosestDay(["tuesday", "friday"], date);
      expect(result).toBe(2); // Tuesday
    });

    it("should return next available day if current day not in schedule", () => {
      const date = new Date("2024-03-12T10:00:00"); // Tuesday 10h
      const result = getNextClosestDay(["wednesday", "friday"], date);
      expect(result).toBe(3); // Wednesday
    });

    it("should wrap to first day of next week if no more days this week", () => {
      const date = new Date("2024-03-14T10:00:00"); // Thursday 10h
      const result = getNextClosestDay(["monday", "tuesday"], date);
      expect(result).toBe(1); // Monday (next week)
    });
  });

  describe("Weekday after 19h cases", () => {
    it("should return next day when Monday after 19h", () => {
      const date = new Date("2024-03-11T19:30:00"); // Monday 19h30
      const result = getNextClosestDay(
        ["monday", "tuesday", "wednesday"],
        date
      );
      expect(result).toBe(2); // Tuesday
    });

    it("should return next day when Tuesday after 19h", () => {
      const date = new Date("2024-03-12T20:00:00"); // Tuesday 20h
      const result = getNextClosestDay(["tuesday", "thursday"], date);
      expect(result).toBe(4); // Thursday
    });

    it("should wrap to next week when Thursday after 19h and Friday not available", () => {
      const date = new Date("2024-03-14T19:30:00"); // Thursday 19h30
      const result = getNextClosestDay(["monday", "tuesday", "thursday"], date);
      expect(result).toBe(1); // Monday (next week)
    });
  });

  describe("Complex scheduling scenarios", () => {
    it("should handle case: Thursday enabled, current day is Friday - should return Thursday next week", () => {
      const date = new Date("2024-03-15T10:00:00"); // Friday 10h
      const result = getNextClosestDay(["thursday"], date);
      expect(result).toBe(4); // Thursday (next week)
    });

    it("should handle multiple non-consecutive days", () => {
      const date = new Date("2024-03-12T20:00:00"); // Tuesday after 19h
      const result = getNextClosestDay(["monday", "thursday", "friday"], date);
      expect(result).toBe(4); // Thursday
    });

    it("should handle single day scheduling", () => {
      const date = new Date("2024-03-13T10:00:00"); // Wednesday 10h
      const result = getNextClosestDay(["friday"], date);
      expect(result).toBe(5); // Friday
    });

    it("should handle all working days enabled", () => {
      const date = new Date("2024-03-13T20:00:00"); // Wednesday after 19h
      const result = getNextClosestDay(
        ["monday", "tuesday", "wednesday", "thursday", "friday"],
        date
      );
      expect(result).toBe(4); // Thursday
    });
  });

  describe("Edge cases with hour boundaries", () => {
    it("should handle exactly 18h59 (before cutoff)", () => {
      const date = new Date("2024-03-13T18:59:59"); // Wednesday 18h59m59s
      const result = getNextClosestDay(["wednesday", "friday"], date);
      expect(result).toBe(3); // Wednesday (same day)
    });

    it("should handle exactly 19h00 (at cutoff)", () => {
      const date = new Date("2024-03-13T19:00:00"); // Wednesday 19h00
      const result = getNextClosestDay(["wednesday", "friday"], date);
      expect(result).toBe(5); // Friday (next day)
    });

    it("should handle midnight (0h00)", () => {
      const date = new Date("2024-03-13T00:00:00"); // Wednesday 0h00
      const result = getNextClosestDay(["wednesday", "friday"], date);
      expect(result).toBe(3); // Wednesday (same day)
    });
  });
});
