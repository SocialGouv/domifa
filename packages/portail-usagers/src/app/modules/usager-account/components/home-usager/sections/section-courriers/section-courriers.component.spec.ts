import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SectionCourriersComponent } from "./section-courriers.component";
import { SharedModule } from "../../../../../shared/shared.module";
import { provideHttpClient } from "@angular/common/http";
import { Interaction } from "@domifa/common";
import { unProfilUsager } from "../../../../../../../_tests/mocks/PORTAIL_USAGER_PROFILE.mock";
import { interactionUsager } from "../../../../../../../_tests/mocks/INTERACTION_USAGER.mock";

describe("SectionCourriersComponent", () => {
  let component: SectionCourriersComponent;
  let fixture: ComponentFixture<SectionCourriersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SectionCourriersComponent],
      imports: [SharedModule],
      providers: [provideHttpClient()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SectionCourriersComponent);
    component = fixture.componentInstance;
    component.usager = unProfilUsager.usager;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("agregateItemsByDate", () => {
    it("should aggregate interactions by type and date", () => {
      const interactions: Interaction[] = [
        {
          ...interactionUsager,
          type: "courrierIn",
          dateInteraction: new Date("2025-08-13T00:00:00.000Z"),
          content: "Test courrier 1",
        },
        {
          ...interactionUsager,
          type: "courrierIn",
          dateInteraction: new Date("2025-08-13T00:00:00.000Z"),
          content: "Test courrier 2",
        },
        {
          ...interactionUsager,
          type: "colisIn",
          dateInteraction: new Date("2025-08-14T00:00:00.000Z"),
          content: "Test colis",
        },
      ];

      const result = component.agregateItemsByDate(interactions);
      expect(result.courrierIn).toBeDefined();
      expect(result.courrierIn!["2025-08-13"]).toBeDefined();
      expect(result.courrierIn!["2025-08-13"].numberOfItems).toBe(2);
      expect(result.courrierIn!["2025-08-13"].comments).toEqual([
        "Test courrier 1",
        "Test courrier 2",
      ]);

      expect(result.colisIn).toBeDefined();
      expect(result.colisIn!["2025-08-14"]).toBeDefined();
      expect(result.colisIn!["2025-08-14"].numberOfItems).toBe(1);
      expect(result.colisIn!["2025-08-14"].comments).toEqual(["Test colis"]);
    });

    it("should return empty object when interactions array is empty", () => {
      const interactions: Interaction[] = [];

      const result = component.agregateItemsByDate(interactions);

      expect(result).toEqual({});
    });
  });
});
