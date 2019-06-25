import { inject, TestBed } from "@angular/core/testing";

import { NgbDateCustomParserFormatter } from "./date-formatter";

describe("NgbDateCustomParserFormatter", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NgbDateCustomParserFormatter]
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

  it("Date formatter : date complete", inject(
    [NgbDateCustomParserFormatter],
    (service: NgbDateCustomParserFormatter) => {
      expect(service.parse("20/12/1991")).toEqual({
        day: 20,
        month: 12,
        year: 1991
      });
    }
  ));

  it("Date formatter : dd/mm seulement", inject(
    [NgbDateCustomParserFormatter],
    (service: NgbDateCustomParserFormatter) => {
      expect(service.parse("20/12")).toEqual({
        day: 20,
        month: 12,
        year: null
      });
    }
  ));

  it("Date formatter : dd seulement", inject(
    [NgbDateCustomParserFormatter],
    (service: NgbDateCustomParserFormatter) => {
      expect(service.parse("20")).toEqual({
        day: 20,
        month: null,
        year: null
      });
    }
  ));

  it("NgbDate to date", inject(
    [NgbDateCustomParserFormatter],
    (service: NgbDateCustomParserFormatter) => {
      expect(
        service.format({
          day: 20,
          month: 12,
          year: 1991
        })
      ).toEqual("20/12/1991");
    }
  ));
});
