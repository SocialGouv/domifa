import { Structure } from "@domifa/common";
import { generateScheduleSendDate } from "./generateScheduleSendDate";

const structure: Pick<Structure, "sms"> = {
  sms: {
    enabledByDomifa: false,
    enabledByStructure: false,
    senderDetails: "",
    senderName: "",
    schedule: {
      monday: false,
      tuesday: true,
      wednesday: false,
      thursday: true,
      friday: false,
    },
  },
};

describe("Generate SMS Schedule Date", () => {
  it("Should set scheduled date for the next tuesday, because it's monday", () => {
    const monday = new Date("2021-10-25T10:00:00.000Z");
    const tuesdayRef = new Date("2021-10-26T19:00:00.000Z");
    expect(generateScheduleSendDate(structure, monday)).toEqual(tuesdayRef);
  });

  it("Should set scheduled date for the next friday, because it's monday", () => {
    const monday = new Date("2021-10-25T10:00:00.000Z");
    structure.sms.schedule.tuesday = false;
    structure.sms.schedule.friday = true;
    const friday = new Date("2021-10-28T19:00:00.000Z");
    expect(generateScheduleSendDate(structure, monday)).toEqual(friday);
  });
});
