import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NationalStatsComponent } from "./national-stats.component";
import { provideRouter } from "@angular/router";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { MATOMO_INJECTORS } from "../../../../shared";
import { USER_SUPERVISOR_MOCK } from "../../../../mocks/USER_SUPERVISOR.mock";
import { AdminAuthService } from "../../../admin-auth/services/admin-auth.service";
import { provideHttpClient } from "@angular/common/http";

describe("NationalStatsComponent", () => {
  let component: NationalStatsComponent;
  let fixture: ComponentFixture<NationalStatsComponent>;

  beforeEach(async () => {
    const adminAuthServiceMock = {
      currentUserValue: USER_SUPERVISOR_MOCK,
    };
    await TestBed.configureTestingModule({
      imports: [MATOMO_INJECTORS, NationalStatsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: AdminAuthService, useValue: adminAuthServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NationalStatsComponent);
    component = fixture.componentInstance;
    component.user = USER_SUPERVISOR_MOCK;
    fixture.detectChanges();
  });

  it("should create", () => {
    component.user = USER_SUPERVISOR_MOCK;
    expect(component).toBeTruthy();
  });
});
