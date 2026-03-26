import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { USAGER_VALIDE_MOCK } from "../../../../../_common/mocks/USAGER_VALIDE.mock";
import { SharedModule } from "../../../shared/shared.module";
import { UsagerFormModel } from "../../../usager-shared/interfaces";

import { DecisionValideFormComponent } from "./decision-valide-form.component";
import { StoreModule } from "@ngrx/store";

import { UsagerDossierModule } from "../../usager-dossier.module";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import {
  _usagerReducer,
  getNextYear,
  getToday,
  parseFrDate,
} from "../../../../shared";
import { format } from "date-fns";

const FR_DATE_FORMAT = "dd/MM/yyyy";

describe("DecisionValideFormComponent", () => {
  let component: DecisionValideFormComponent;
  let fixture: ComponentFixture<DecisionValideFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DecisionValideFormComponent],
      imports: [
        RouterModule.forRoot([]),
        SharedModule,
        ReactiveFormsModule,
        FormsModule,
        UsagerDossierModule,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DecisionValideFormComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_VALIDE_MOCK);
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  describe("parseFrDate", () => {
    it("should parse a valid dd/MM/yyyy date to UTC noon", () => {
      const result = parseFrDate("15/03/2024");
      expect(result).not.toBeNull();
      expect(result!.getUTCFullYear()).toBe(2024);
      expect(result!.getUTCMonth()).toBe(2);
      expect(result!.getUTCDate()).toBe(15);
      expect(result!.getUTCHours()).toBe(12);
    });

    it("should return null for empty string", () => {
      expect(parseFrDate("")).toBeNull();
    });

    it("should return null for invalid date", () => {
      expect(parseFrDate("invalid")).toBeNull();
      expect(parseFrDate("2024-03-15")).toBeNull();
    });

    it("should handle leap day", () => {
      const result = parseFrDate("29/02/2024");
      expect(result).not.toBeNull();
      expect(result!.getUTCDate()).toBe(29);
      expect(result!.getUTCMonth()).toBe(1);
    });
  });

  describe("date.utils", () => {
    describe("getToday", () => {
      it("should return current date at noon UTC", () => {
        const result = getToday();
        expect(result.getUTCHours()).toBe(12);
        expect(result.getUTCMinutes()).toBe(0);
        expect(result.getUTCDate()).toBe(new Date().getUTCDate());
      });
    });

    describe("getNextYear", () => {
      it("should always return a date at noon UTC", () => {
        const result = getNextYear(new Date(Date.UTC(2024, 0, 15, 0, 0, 0)));
        expect(result.getUTCHours()).toBe(12);
        expect(result.getUTCMinutes()).toBe(0);
      });

      it("should return the same result regardless of the input time-of-day", () => {
        const hours = [0, 1, 3, 12, 15, 22, 23];
        const results = hours.map((h) =>
          getNextYear(new Date(Date.UTC(2024, 0, 15, h, 0, 0)))
        );
        const first = results[0].getTime();
        results.forEach((r, i) =>
          expect({ hour: hours[i], time: r.getTime() }).toEqual({
            hour: hours[i],
            time: first,
          })
        );
      });

      it("should compute startDate + 1 year - 1 day (nominal case)", () => {
        const result = getNextYear(new Date(Date.UTC(2024, 0, 15)));
        expect(result.getUTCFullYear()).toBe(2025);
        expect(result.getUTCMonth()).toBe(0);
        expect(result.getUTCDate()).toBe(14);
      });

      it("should handle leap year: 29 feb 2024 → 27 feb 2025", () => {
        const result = getNextYear(new Date(Date.UTC(2024, 1, 29)));
        expect(result.getUTCFullYear()).toBe(2025);
        expect(result.getUTCMonth()).toBe(1);
        expect(result.getUTCDate()).toBe(27);
      });

      it("should handle year boundary: 31 dec 2024 → 30 dec 2025", () => {
        const result = getNextYear(new Date(Date.UTC(2024, 11, 31)));
        expect(result.getUTCFullYear()).toBe(2025);
        expect(result.getUTCMonth()).toBe(11);
        expect(result.getUTCDate()).toBe(30);
      });

      it("should be robust for DOM-TOM-equivalent offsets", () => {
        const extremeHours = [0, 1, 23];
        extremeHours.forEach((h) => {
          const result = getNextYear(new Date(Date.UTC(2024, 5, 15, h, 0, 0)));
          const ctx = `heure d'entrée ${h}h`;
          expect({ ctx, year: result.getUTCFullYear() }).toEqual({
            ctx,
            year: 2025,
          });
          expect({ ctx, month: result.getUTCMonth() }).toEqual({
            ctx,
            month: 5,
          });
          expect({ ctx, date: result.getUTCDate() }).toEqual({
            ctx,
            date: 14,
          });
          expect({ ctx, hours: result.getUTCHours() }).toEqual({
            ctx,
            hours: 12,
          });
        });
      });
    });
  });

  describe("Date calculation in component", () => {
    it("should initialize dateFin using getNextYear(getToday())", () => {
      const expectedEndDate = getNextYear(getToday());
      const dateFin = component.valideForm.get("dateFin")?.value;
      const dateFinAsDate = parseFrDate(dateFin);

      expect(dateFinAsDate!.getUTCFullYear()).toBe(
        expectedEndDate.getUTCFullYear()
      );
      expect(dateFinAsDate!.getUTCMonth()).toBe(expectedEndDate.getUTCMonth());
      expect(dateFinAsDate!.getUTCDate()).toBe(expectedEndDate.getUTCDate());
    });

    it("should update dateFin with getNextYear when dateDebut changes", () => {
      component.valideForm.get("dateDebut")?.setValue("15/03/2024");
      fixture.detectChanges();

      const expectedEndDate = getNextYear(
        new Date(Date.UTC(2024, 2, 15, 12, 0, 0))
      );
      const dateFinAsDate = parseFrDate(
        component.valideForm.get("dateFin")?.value
      );

      expect(dateFinAsDate!.getUTCFullYear()).toBe(
        expectedEndDate.getUTCFullYear()
      );
      expect(dateFinAsDate!.getUTCMonth()).toBe(expectedEndDate.getUTCMonth());
      expect(dateFinAsDate!.getUTCDate()).toBe(expectedEndDate.getUTCDate());
    });

    it("should keep dateFin consistent for a leap day dateDebut", () => {
      component.valideForm.get("dateDebut")?.setValue("29/02/2024");
      fixture.detectChanges();

      const expectedEndDate = getNextYear(
        new Date(Date.UTC(2024, 1, 29, 12, 0, 0))
      );
      const dateFinAsDate = parseFrDate(
        component.valideForm.get("dateFin")?.value
      );

      expect(dateFinAsDate!.getUTCFullYear()).toBe(
        expectedEndDate.getUTCFullYear()
      );
      expect(dateFinAsDate!.getUTCMonth()).toBe(expectedEndDate.getUTCMonth());
      expect(dateFinAsDate!.getUTCDate()).toBe(expectedEndDate.getUTCDate());
    });
  });

  describe("Validator error keys", () => {
    it("should have no errors with default dates", () => {
      expect(component.valideForm.errors).toBeNull();
    });

    it("should set START_DATE_EMPTY when dateDebut is cleared", () => {
      component.valideForm.get("dateDebut")?.setValue("");
      expect(component.valideForm.errors?.["START_DATE_EMPTY"]).toBeTruthy();
    });

    it("should set END_DATE_EMPTY when dateFin is cleared", () => {
      component.valideForm.get("dateFin")?.setValue("");
      expect(component.valideForm.errors?.["END_DATE_EMPTY"]).toBeTruthy();
    });

    it("should set START_DATE_INVALID for malformed dateDebut", () => {
      component.valideForm.get("dateDebut")?.setValue("abc");
      expect(component.valideForm.errors?.["START_DATE_INVALID"]).toBeTruthy();
    });

    it("should set END_DATE_INVALID for malformed dateFin", () => {
      component.valideForm.get("dateFin")?.setValue("abc");
      expect(component.valideForm.errors?.["END_DATE_INVALID"]).toBeTruthy();
    });

    it("should set START_DATE_TOO_LOW for date before minDate", () => {
      const tooEarly = `01/01/${new Date().getFullYear() - 2}`;
      component.valideForm.get("dateDebut")?.setValue(tooEarly);
      expect(component.valideForm.errors?.["START_DATE_TOO_LOW"]).toBeTruthy();
    });

    it("should set START_DATE_TOO_HIGH for date after maxDate", () => {
      const tooLate = `01/01/${new Date().getFullYear() + 3}`;
      component.valideForm.get("dateDebut")?.setValue(tooLate);
      expect(component.valideForm.errors?.["START_DATE_TOO_HIGH"]).toBeTruthy();
    });

    it("should set START_DATE_MUST_BEFORE_END when dateDebut >= dateFin", () => {
      const today = format(getToday(), FR_DATE_FORMAT);
      component.valideForm.get("dateDebut")?.setValue(today, {
        emitEvent: false,
      });
      component.valideForm.get("dateFin")?.setValue(today);
      expect(
        component.valideForm.errors?.["START_DATE_MUST_BEFORE_END"]
      ).toBeTruthy();
    });
  });

  describe("Error message methods", () => {
    it("should return empty string when not submitted and not touched", () => {
      expect(component.getStartDateMessage()).toBe("");
      expect(component.getEndDateMessage()).toBe("");
    });

    it("should return error message after submit with invalid dateDebut", () => {
      component.valideForm.get("dateDebut")?.setValue("");
      component.submitted = true;
      expect(component.getStartDateMessage()).toBe(
        "La date de début est obligatoire"
      );
    });

    it("should return error message after submit with invalid dateFin", () => {
      component.valideForm.get("dateFin")?.setValue("");
      component.submitted = true;
      expect(component.getEndDateMessage()).toBe(
        "La date de fin est obligatoire"
      );
    });

    it("should return error message when field is touched", () => {
      component.valideForm.get("dateDebut")?.setValue("abc");
      component.valideForm.get("dateDebut")?.markAsTouched();
      expect(component.getStartDateMessage()).toBe(
        "La date de début est incorrecte, exemple: 20/12/1996"
      );
    });
  });
});
