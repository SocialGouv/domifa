import { ComponentFixture, TestBed } from "@angular/core/testing";
import { APP_BASE_HREF, registerLocaleData } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID } from "@angular/core";
import localeFr from "@angular/common/locales/fr";
import { subDays, subMonths } from "date-fns";

import { ColumnLastInteractionComponent } from "./column-last-interaction.component";
import { UsagerFormModel } from "../../../usager-shared/interfaces/UsagerFormModel";
import { USAGER_VALIDE_MOCK } from "../../../../../_common/mocks";

registerLocaleData(localeFr);

describe("ColumnLastInteractionComponent", () => {
  let component: ColumnLastInteractionComponent;
  let fixture: ComponentFixture<ColumnLastInteractionComponent>;

  const buildUsager = (dateInteraction: Date) =>
    new UsagerFormModel({
      ...USAGER_VALIDE_MOCK,
      decision: { ...USAGER_VALIDE_MOCK.decision, statut: "VALIDE" },
      lastInteraction: {
        ...USAGER_VALIDE_MOCK.lastInteraction,
        dateInteraction,
      },
    });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnLastInteractionComponent],
      providers: [
        { provide: APP_BASE_HREF, useValue: "/" },
        { provide: LOCALE_ID, useValue: "fr-FR" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ColumnLastInteractionComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    component.usager = buildUsager(new Date());
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it("shows no badge when the last passage is recent", () => {
    component.usager = buildUsager(subMonths(new Date(), 1));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector(".statut-signal")).toBeNull();
  });

  it("shows the orange badge between 2 and 3 months without passage", () => {
    component.usager = buildUsager(subDays(subMonths(new Date(), 2), 3));
    fixture.detectChanges();

    const signal = fixture.nativeElement.querySelector(".statut-signal");
    expect(signal).not.toBeNull();
    expect(signal.classList).toContain("bg-warning");
    expect(fixture.nativeElement.textContent).toContain(
      "Plus de 2 mois sans passage"
    );
  });

  it("shows the red badge beyond 3 months without passage", () => {
    component.usager = buildUsager(subMonths(new Date(), 6));
    fixture.detectChanges();

    const signal = fixture.nativeElement.querySelector(".statut-signal");
    expect(signal).not.toBeNull();
    expect(signal.classList).toContain("bg-danger");
    expect(fixture.nativeElement.textContent).toContain(
      "Plus de 3 mois sans passage"
    );
  });
});
