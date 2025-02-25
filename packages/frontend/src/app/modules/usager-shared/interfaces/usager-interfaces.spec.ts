import { Entretien } from "./entretien";
import { Rdv } from "./rdv";
import { UsagerFormModel } from "./UsagerFormModel";

describe("Usager Interfaces testing", () => {
  it("Interfaces", () => {
    const usager = new UsagerFormModel();
    const entretien = new Entretien();
    const rdv = new Rdv();

    expect(usager).toBeDefined();
    expect(entretien).toBeDefined();
    expect(rdv).toBeDefined();

    const rdvFull = new Rdv({
      dateRdv: new Date("December 20, 2033 02:12:00"),
      userId: 10,
      userName: "DomiFa",
    });

    expect(rdvFull).toEqual({
      dateRdv: new Date("December 20, 2033 02:12:00"),
      heureRdv: "02:12",
      isNow: false,
      jourRdv: {
        day: 20,
        month: 12,
        year: 2033,
      },
      userId: 10,
      userName: "DomiFa",
    });
  });

  it("Rendez-vous passé", () => {
    const rdvFull = new Rdv({
      dateRdv: new Date("October 12, 2019 15:05:00"),
      userId: 10,
      userName: "DomiFa",
    });
    expect(rdvFull).toEqual({
      dateRdv: new Date("October 12, 2019 15:05:00"),
      heureRdv: "15:05",
      isNow: true,
      jourRdv: {
        day: 12,
        month: 10,
        year: 2019,
      },
      userId: 10,
      userName: "DomiFa",
    });
  });
});
