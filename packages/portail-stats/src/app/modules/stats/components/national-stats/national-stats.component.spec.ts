import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import { MATOMO_INJECTORS } from "../../../shared/constants";
import { PORTAIL_STATS_USER_MOCK } from "../../../../mocks";
import { PortailStatsAuthService } from "../../../auth/services/portail-stats-auth.service";
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
});
