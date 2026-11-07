import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import { PortailAdminUser } from "@domifa/common";
import { PortailStatsAuthService } from "../../../../auth/services/portail-stats-auth.service";
import { PlanSiteComponent } from "./plan-site.component";

describe("PlanSiteComponent", () => {
  let component: PlanSiteComponent;
  let fixture: ComponentFixture<PlanSiteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PlanSiteComponent],
      providers: [provideRouter([]), provideHttpClient()],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanSiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("shows the users page to DREETS only", () => {
    const authService = TestBed.inject(PortailStatsAuthService);
    const paths = () =>
      component.siteMapLinksLogged.flatMap((s) => s.links.map((l) => l.path));

    authService.currentUserSubject.next({
      role: "region",
      territories: ["53"],
    } as PortailAdminUser);
    expect(paths()).toEqual(["/stats", "/utilisateurs"]);

    authService.currentUserSubject.next({
      role: "department",
      territories: ["35"],
    } as PortailAdminUser);
    expect(paths()).toEqual(["/stats"]);

    authService.currentUserSubject.next(null);
    expect(paths()).toEqual([]);
  });
});
