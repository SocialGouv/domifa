import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import { MATOMO_INJECTORS } from "../../../shared/constants";
import { PORTAIL_STATS_USER_MOCK } from "../../../../mocks";
import { PortailStatsAuthService } from "../../../auth/services/portail-stats-auth.service";
import { MetabaseParams } from "@domifa/common";
import { NationalStatsComponent } from "./national-stats.component";

describe("NationalStatsComponent", () => {
  let component: NationalStatsComponent;
  let fixture: ComponentFixture<NationalStatsComponent>;

  beforeEach(async () => {
    const authServiceMock = {
      currentUserValue: PORTAIL_STATS_USER_MOCK,
    };
    await TestBed.configureTestingModule({
      imports: [MATOMO_INJECTORS, NationalStatsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: PortailStatsAuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NationalStatsComponent);
    component = fixture.componentInstance;
    component.user = PORTAIL_STATS_USER_MOCK;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should label a national user as 'En France'", () => {
    expect(component.getTitleLabel(PORTAIL_STATS_USER_MOCK)).toBe("En France");
  });

  it("should label a department user with its department", () => {
    expect(
      component.getTitleLabel({
        ...PORTAIL_STATS_USER_MOCK,
        role: "department",
        territories: ["33"],
      })
    ).toContain("dans le département");
  });

  describe("filters by role", () => {
    beforeEach(() => {
      jest.spyOn(component, "getStructures").mockImplementation(() => {});
      component.metabaseParams = new MetabaseParams();
    });

    it("gives a DDETS its department only, without region filter", () => {
      component.user = {
        ...PORTAIL_STATS_USER_MOCK,
        role: "department",
        territories: ["59"],
      };
      component.generateTablesByRole();

      expect(component.showRegionFilter).toBe(false);
      expect(component.canSelectAllDepartments).toBe(false);
      expect(component.departmentTable).toEqual({ "59": "Nord" });
      expect(component.metabaseParams.department).toEqual("59");
    });

    it("gives a DREETS its region and the departments of its region", () => {
      component.user = {
        ...PORTAIL_STATS_USER_MOCK,
        role: "region",
        territories: ["53"],
      };
      component.generateTablesByRole();

      expect(component.showRegionFilter).toBe(true);
      expect(component.canSelectAllRegions).toBe(false);
      expect(component.canSelectAllDepartments).toBe(true);
      expect(Object.keys(component.regionTable)).toEqual(["53"]);
      expect(Object.keys(component.departmentTable).sort()).toEqual([
        "22",
        "29",
        "35",
        "56",
      ]);
      expect(component.metabaseParams.region).toEqual("53");
    });

    it("drops a national department filter outside the new region", () => {
      component.user = PORTAIL_STATS_USER_MOCK;
      component.metabaseParams.department = "59";
      component.metabaseParams.region = "53";
      component.generateTablesByRole();

      expect(component.canSelectAllRegions).toBe(true);
      expect(component.metabaseParams.department).toBeUndefined();
      expect(component.departmentTable["35"]).toBeDefined();
    });
  });
});
