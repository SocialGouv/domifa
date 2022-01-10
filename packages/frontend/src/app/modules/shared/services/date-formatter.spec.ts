import { inject, TestBed } from "@angular/core/testing";
import {
  isDefined,
  isInteger,
  isNumber,
  isToday,
  padNumber,
  toInteger,
} from "../../../shared/bootstrap-util";

import { NgbDateCustomParserFormatter } from "./date-formatter";
describe("NgbDateCustomParserFormatter", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NgbDateCustomParserFormatter],
    });
  });

  it("should be created", inject(
    [NgbDateCustomParserFormatter],
    (service: NgbDateCustomParserFormatter) => {
      expect(service).toBeTruthy();
    }
  ));

  it("Date formatter : invalid state", inject(
    [NgbDateCustomParserFormatter],
    (service: NgbDateCustomParserFormatter) => {
      expect(service.parse("Toz")).toEqual(null);
    }
  ));

  it("Date formatter : invalid state", inject(
    [NgbDateCustomParserFormatter],
    () => {
      expect(isDefined(1)).toBeDefined();
      expect(isInteger(1)).toBeTruthy();
      expect(isInteger("A")).toBeFalsy();
      expect(isNumber("A")).toBeFalsy();
      expect(isNumber(1)).toBeTruthy();
      expect(padNumber(1)).toEqual("01");

      expect(isToday()).toBeFalsy();
      expect(isToday(new Date())).toBeTruthy();
      expect(isToday(new Date("2018-10-10"))).toBeFalsy();

      expect(toInteger("10")).toEqual(10);
    }
  ));

  it("Date formatter : date complete", inject(
    [NgbDateCustomParserFormatter],
    (service: NgbDateCustomParserFormatter) => {
      expect(service.parse("20/12/1991")).toEqual({
        day: 20,
        month: 12,
        year: 1991,
      });
    }
  ));

  it("Date formatter : dd/mm seulement", inject(
    [NgbDateCustomParserFormatter],
    (service: NgbDateCustomParserFormatter) => {
      expect(service.parse("20/12")).toEqual({
        day: 20,
        month: 12,
        year: null,
      });
    }
  ));

  it("Date formatter : dd seulement", inject(
    [NgbDateCustomParserFormatter],
    (service: NgbDateCustomParserFormatter) => {
      expect(service.parse("20")).toEqual({
        day: 20,
        month: null,
        year: null,
      });
    }
  ));

  it("FORMAT ENGLISH", inject(
    [NgbDateCustomParserFormatter],
    (service: NgbDateCustomParserFormatter) => {
      expect(
        service.format({
          day: 20,
          month: 12,
          year: 1991,
        })
      ).toEqual("20/12/1991");
      expect(
        service.format({
          day: 1,
          month: 2,
          year: 1991,
        })
      ).toEqual("01/02/1991");

      expect(
        service.format({
          day: 8,
          month: 9,
          year: 1991,
        })
      ).toEqual("08/09/1991");

      expect(
        service.formatEn({
          day: 20,
          month: 12,
          year: 1991,
        })
      ).toEqual("1991-12-20");

      expect(
        service.formatEn({
          day: 8,
          month: 2,
          year: 1909,
        })
      ).toEqual("1909-02-08");
    }
  ));
});
