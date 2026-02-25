import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbModule,
} from "@ng-bootstrap/ng-bootstrap";

import { USAGER_VALIDE_MOCK } from "../../../../../_common/mocks/USAGER_VALIDE.mock";
import { NgbDateCustomParserFormatter } from "../../../shared/services/date-formatter.service";
import { CustomDatepickerI18n } from "../../../shared/services/date-french.service";
import { SharedModule } from "../../../shared/shared.module";
import { UsagerFormModel } from "../../../usager-shared/interfaces";

import { DecisionValideFormComponent } from "./decision-valide-form.component";
import { StoreModule } from "@ngrx/store";

import { UsagerDossierModule } from "../../usager-dossier.module";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import {
  parseDateFromNgb,
  _usagerReducer,
  getNextYear,
  getToday,
} from "../../../../shared";

describe("DecisionValideFormComponent", () => {
  let component: DecisionValideFormComponent;
  let fixture: ComponentFixture<DecisionValideFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DecisionValideFormComponent],
      imports: [
        NgbModule,
        RouterModule.forRoot([]),
        SharedModule,
        ReactiveFormsModule,
        FormsModule,
        UsagerDossierModule,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [
        provideHttpClient(),
        { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
        {
          provide: NgbDateParserFormatter,
          useClass: NgbDateCustomParserFormatter,
        },
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

  // ─────────────────────────────────────────────────────────────
  // Tests unitaires de computeEndDate (source de vérité isolée)
  // ─────────────────────────────────────────────────────────────
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
        // addYears(29 fév 2024, 1) = 28 fév 2025 (date-fns clippe au dernier jour de fév)
        // subDays(28 fév 2025, 1)  = 27 fév 2025
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

      it("should be robust for DOM-TOM-equivalent offsets (UTC-4 Guyane, UTC+4 Réunion)", () => {
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
          expect({ ctx, date: result.getUTCDate() }).toEqual({ ctx, date: 14 });
          expect({ ctx, hours: result.getUTCHours() }).toEqual({
            ctx,
            hours: 12,
          });
        });
      });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Tests d'intégration du composant (s'appuient sur computeEndDate)
  // ─────────────────────────────────────────────────────────────
  describe("Date calculation in component", () => {
    it("should initialize dateFin using getNextYear(getToday())", () => {
      const expectedEndDate = getNextYear(getToday());

      const dateFin = component.valideForm.get("dateFin")?.value;
      const dateFinAsDate = parseDateFromNgb(dateFin);

      expect(dateFinAsDate.getFullYear()).toBe(expectedEndDate.getFullYear());
      expect(dateFinAsDate.getMonth()).toBe(expectedEndDate.getMonth());
      expect(dateFinAsDate.getDate()).toBe(expectedEndDate.getDate());
    });

    it("should update dateFin with getNextYear when dateDebut changes", () => {
      const newDateDebut = { day: 15, month: 3, year: 2024 };
      component.valideForm.get("dateDebut")?.setValue(newDateDebut);
      fixture.detectChanges();

      const expectedEndDate = getNextYear(
        new Date(
          Date.UTC(newDateDebut.year, newDateDebut.month - 1, newDateDebut.day)
        )
      );
      const dateFin = component.valideForm.get("dateFin")?.value;

      expect(dateFin.day).toBe(expectedEndDate.getDate());
      expect(dateFin.month).toBe(expectedEndDate.getMonth() + 1);
      expect(dateFin.year).toBe(expectedEndDate.getFullYear());
    });

    it("should keep dateFin consistent for a leap day dateDebut", () => {
      // 29 fév 2024 → getNextYear → 27 fév 2025 (addYears clippe à 28 fév, subDays donne 27)
      const newDateDebut = { day: 29, month: 2, year: 2024 };
      component.valideForm.get("dateDebut")?.setValue(newDateDebut);
      fixture.detectChanges();

      const expectedEndDate = getNextYear(new Date(2024, 1, 29));
      const dateFin = component.valideForm.get("dateFin")?.value;

      expect(dateFin.day).toBe(expectedEndDate.getDate());
      expect(dateFin.month).toBe(expectedEndDate.getMonth() + 1);
      expect(dateFin.year).toBe(expectedEndDate.getFullYear());
    });
  });
});
