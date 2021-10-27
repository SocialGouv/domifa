import { generateScheduleSendDate } from "./generateScheduleSendDate";
describe("generate SMS", () => {
  it("generate SMS", () => {
    // Semaine du 25 Octobre 2021

    // Premier mardi : 26/10/2021
    const tuesdayRef = new Date("2021-10-26T19:00:00.000Z");
    // Jeudi suivant : 28/10/2021
    const thursdayRef = new Date("2021-10-28T19:00:00.000Z");
    // Mardi suivant : 02/11/2021
    const nextTuesdayRef = new Date("2021-11-02T19:00:00.000Z");

    const monday = new Date("2021-10-25T10:00:00.000Z");
    expect(generateScheduleSendDate(monday)).toEqual(tuesdayRef);

    const tuesdayBefore19 = new Date("2021-10-26T10:00:00.000Z");
    const tuesdayAfter19 = new Date("2021-10-26T20:10:00.000Z");
    expect(generateScheduleSendDate(tuesdayBefore19)).toEqual(tuesdayRef);
    expect(generateScheduleSendDate(tuesdayAfter19)).toEqual(thursdayRef);

    const wednesday = new Date("2021-10-27T10:00:00.000Z");
    expect(generateScheduleSendDate(wednesday)).toEqual(thursdayRef);

    const thursdayBefore19 = new Date("2021-10-28T10:00:00.000Z");
    const thursdayAfter19 = new Date("2021-10-28T20:10:00.000Z");
    const friday = new Date("2021-10-29T20:10:00.000Z");
    const saturday = new Date("2021-10-30T20:10:00.000Z");
    const sunday = new Date("2021-11-01T20:10:00.000Z");
    expect(generateScheduleSendDate(thursdayBefore19)).toEqual(thursdayRef);
    expect(generateScheduleSendDate(thursdayAfter19)).toEqual(nextTuesdayRef);
    expect(generateScheduleSendDate(friday)).toEqual(nextTuesdayRef);
    expect(generateScheduleSendDate(saturday)).toEqual(nextTuesdayRef);
    expect(generateScheduleSendDate(sunday)).toEqual(nextTuesdayRef);
  });
});
