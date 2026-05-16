import { ComponentFixture, TestBed } from "@angular/core/testing";

import { HistoriqueCourriersComponent } from "./historique-courriers.component";
import "@angular/localize/init";
import { provideHttpClient } from "@angular/common/http";
import { APP_BASE_HREF } from "@angular/common";
import {
  provideRouter,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";
import { AuthGuard } from "../../../../guards/auth-guard";
import { UsagerAuthService } from "../../../usager-auth/services/usager-auth.service";
describe("HistoriqueCourriersComponent", () => {
  let component: HistoriqueCourriersComponent;
  let fixture: ComponentFixture<HistoriqueCourriersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoriqueCourriersComponent],
      providers: [
        provideRouter([]),
        AuthGuard,
        provideHttpClient(),
        {
          provide: ActivatedRouteSnapshot,
          useValue: {
            params: { id: 1 },
          },
        },
        {
          provide: RouterStateSnapshot,
          useValue: {
            params: { url: "/connexion" },
          },
        },
        UsagerAuthService,
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoriqueCourriersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
