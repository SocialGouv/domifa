import { inject, TestBed } from "@angular/core/testing";
import { CustomDatepickerI18n } from "./date-french";

describe("CustomDatepickerI18n", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CustomDatepickerI18n]
    });
  });

  it("0. Création", inject(
    [CustomDatepickerI18n],
    (service: CustomDatepickerI18n) => {
      expect(service).toBeTruthy();
    }
  ));

  it("1. Functions", inject(
    [CustomDatepickerI18n],
    (service: CustomDatepickerI18n) => {
      expect(service.getWeekdayShortName(1)).toEqual("Lu");
      expect(service.getMonthShortName(7)).toEqual("Juillet");
      expect(service.getMonthFullName(7)).toEqual("Juillet");
      expect(
        service.getDayAriaLabel({
          day: 20,
          month: 12,
          year: 1991
        })
      ).toEqual("20-12-1991");
    }
  ));
});
