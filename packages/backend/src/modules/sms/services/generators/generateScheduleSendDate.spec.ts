import { Structure } from "@domifa/common";
import { generateScheduleSendDate } from "./generateScheduleSendDate";
import { utcToZonedTime } from "date-fns-tz";

const structure: Pick<Structure, "sms"> = {
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

describe("Generate SMS Schedule Date", () => {
  it("Should set scheduled date for the next tuesday, because it's monday", () => {
    const monday = new Date("2024-05-06T10:00:00.000Z");
    const tuesdayRef = new Date("2024-05-07T19:00:00.000Z");
    structure.sms.schedule.tuesday = true;

    const expectedDate = utcToZonedTime(
      generateScheduleSendDate(structure, monday),
      "Europe/Paris"
    );

    expect(expectedDate).toEqual(tuesdayRef);
  });

  it("Receive & Send on same day: friday 10 may 2024, before 19:00", () => {
    const friday = new Date("2024-05-10T18:00:00.000Z");
    const fridayRef = new Date("2024-05-10T19:00:00.000Z");
    structure.sms.schedule.tuesday = false;
    structure.sms.schedule.friday = true;
    const expectedDate = utcToZonedTime(
      generateScheduleSendDate(structure, friday),
      "Europe/Paris"
    );

    expect(expectedDate).toEqual(fridayRef);
  });
  it("Receive after 19:00, send next week", () => {
    const friday = new Date("2024-05-10T21:05:00.000Z");
    const fridayRef = new Date("2024-05-17T19:00:00.000Z");
    structure.sms.schedule.tuesday = false;
    structure.sms.schedule.friday = true;
    const expectedDate = utcToZonedTime(
      generateScheduleSendDate(structure, friday),
      "Europe/Paris"
    );

    expect(expectedDate).toEqual(fridayRef);
  });
});
