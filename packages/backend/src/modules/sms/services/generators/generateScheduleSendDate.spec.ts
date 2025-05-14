import { Structure } from "@domifa/common";
import { generateScheduleSendDate } from "./generateScheduleSendDate";

describe("generateScheduleSendDate", () => {
  let structure: Pick<Structure, "sms">;

  beforeEach(() => {
    structure = {
      sms: {
        enabledByDomifa: false,
        enabledByStructure: false,
        senderDetails: "",
        senderName: "",
        schedule: {
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
        },
      },
    };
  });

  describe("Schedule SMS for same day at 19:00 local time", () => {
    it("Europe/Paris: should schedule for Friday 19:00 when current time is Friday 12:00 UTC", () => {
      // Définir un vendredi pour le test - 10 mai 2024 est un vendredi
      const dateRef = new Date("2024-05-10T12:00:00.000Z");

      // Activer uniquement le vendredi dans le planning
      structure.sms.schedule.friday = true;

      const result = generateScheduleSendDate(
        structure,
        dateRef,
        "Europe/Paris"
      );
      const expected = new Date("2024-05-10T17:00:00.000Z"); // 19:00 Paris time (UTC+2) = 17:00 UTC

      expect(result.toISOString()).toEqual(expected.toISOString());
    });

    it("America/Cayenne: should schedule for Friday 19:00 when current time is Friday 12:00 UTC", () => {
      // Définir un vendredi pour le test - 10 mai 2024 est un vendredi
      const dateRef = new Date("2024-05-10T12:00:00.000Z");

      // Activer uniquement le vendredi dans le planning
      structure.sms.schedule.friday = true;

      const result = generateScheduleSendDate(
        structure,
        dateRef,
        "America/Cayenne"
      );
      const expected = new Date("2024-05-10T22:00:00.000Z"); // 19:00 Cayenne time (UTC-3) = 22:00 UTC

      expect(result.toISOString()).toEqual(expected.toISOString());
    });

    it("Indian/Reunion: should schedule for Friday 19:00 when current time is Friday 12:00 UTC", () => {
      // Définir un vendredi pour le test - 10 mai 2024 est un vendredi
      const dateRef = new Date("2024-05-10T12:00:00.000Z");

      // Activer uniquement le vendredi dans le planning
      structure.sms.schedule.friday = true;

      const result = generateScheduleSendDate(
        structure,
        dateRef,
        "Indian/Reunion"
      );
      const expected = new Date("2024-05-10T15:00:00.000Z"); // 19:00 Reunion time (UTC+4) = 15:00 UTC

      expect(result.toISOString()).toEqual(expected.toISOString());
    });
  });

  describe("Schedule SMS for next Monday at 19:00 local time when Friday after 19:00", () => {
    it("Europe/Paris: should schedule for Monday 19:00 when current time is Friday 18:00 UTC (after 19:00 Paris time)", () => {
      // Définir un vendredi après 19h00 heure locale - 10 mai 2024 est un vendredi
      const dateRef = new Date("2025-05-16T18:00:00.000Z"); // 20:00 Paris time

      // Activer uniquement lundi et vendredi
      structure.sms.schedule.monday = true;
      structure.sms.schedule.friday = true;

      const result = generateScheduleSendDate(
        structure,
        dateRef,
        "Europe/Paris"
      );
      const expected = new Date("2025-05-19T17:00:00.000Z"); // 19:00 Paris time (UTC+2) = 17:00 UTC

      expect(result.toISOString()).toEqual(expected.toISOString());
    });

    it("America/Cayenne: should schedule for Monday 19:00 when current time is Friday 23:00 UTC (after 19:00 Cayenne time)", () => {
      // Définir un vendredi après 19h00 heure locale - 10 mai 2024 est un vendredi
      const dateRef = new Date("2024-05-10T23:00:00.000Z"); // 20:00 Cayenne time

      // Activer uniquement lundi et vendredi
      structure.sms.schedule.friday = true;
      structure.sms.schedule.monday = true;

      const result = generateScheduleSendDate(
        structure,
        dateRef,
        "America/Cayenne"
      );
      const expected = new Date("2024-05-13T22:00:00.000Z"); // 19:00 Cayenne time (UTC-3) = 22:00 UTC

      expect(result.toISOString()).toEqual(expected.toISOString());
    });

    it("Indian/Reunion: should schedule for Monday 19:00 when current time is Friday 16:00 UTC (after 19:00 Reunion time)", () => {
      // Définir un vendredi après 19h00 heure locale - 10 mai 2024 est un vendredi
      const dateRef = new Date("2024-05-10T16:00:00.000Z"); // 20:00 Reunion time

      // Activer uniquement lundi et vendredi
      structure.sms.schedule.friday = true;
      structure.sms.schedule.monday = true;

      const result = generateScheduleSendDate(
        structure,
        dateRef,
        "Indian/Reunion"
      );
      const expected = new Date("2024-05-13T15:00:00.000Z"); // 19:00 Reunion time (UTC+4) = 15:00 UTC

      expect(result.toISOString()).toEqual(expected.toISOString());
    });
  });

  describe("Schedule SMS for next Tuesday at 19:00 local time when Monday is disabled", () => {
    it("Europe/Paris: should schedule for Tuesday 19:00 when Monday is disabled", () => {
      // Définir un vendredi après 19h00 heure locale - 10 mai 2024 est un vendredi
      const dateRef = new Date("2024-05-10T18:00:00.000Z"); // 20:00 Paris time

      // Activer uniquement vendredi et mardi (lundi désactivé)
      structure.sms.schedule.friday = true;
      structure.sms.schedule.tuesday = true;

      const result = generateScheduleSendDate(
        structure,
        dateRef,
        "Europe/Paris"
      );
      const expected = new Date("2024-05-14T17:00:00.000Z"); // 19:00 Paris time (UTC+2) = 17:00 UTC

      expect(result.toISOString()).toEqual(expected.toISOString());
    });

    it("America/Cayenne: should schedule for Tuesday 19:00 when Monday is disabled", () => {
      // Définir un vendredi après 19h00 heure locale - 10 mai 2024 est un vendredi
      const dateRef = new Date("2024-05-10T23:00:00.000Z"); // 20:00 Cayenne time

      // Activer uniquement vendredi et mardi (lundi désactivé)
      structure.sms.schedule.friday = true;
      structure.sms.schedule.tuesday = true;

      const result = generateScheduleSendDate(
        structure,
        dateRef,
        "America/Cayenne"
      );
      const expected = new Date("2024-05-14T22:00:00.000Z"); // 19:00 Cayenne time (UTC-3) = 22:00 UTC

      expect(result.toISOString()).toEqual(expected.toISOString());
    });

    it("Indian/Reunion: should schedule for Tuesday 19:00 when Monday is disabled", () => {
      // Définir un vendredi après 19h00 heure locale - 10 mai 2024 est un vendredi
      const dateRef = new Date("2024-05-10T16:00:00.000Z"); // 20:00 Reunion time

      // Activer uniquement vendredi et mardi (lundi désactivé)
      structure.sms.schedule.friday = true;
      structure.sms.schedule.tuesday = true;

      const result = generateScheduleSendDate(
        structure,
        dateRef,
        "Indian/Reunion"
      );
      const expected = new Date("2024-05-14T15:00:00.000Z"); // 19:00 Reunion time (UTC+4) = 15:00 UTC

      expect(result.toISOString()).toEqual(expected.toISOString());
    });
  });
});
