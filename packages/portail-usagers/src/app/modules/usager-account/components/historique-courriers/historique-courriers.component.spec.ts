import { ComponentFixture, TestBed } from "@angular/core/testing";

import { HistoriqueCourriersComponent } from "./historique-courriers.component";
import { SharedModule } from "../../../shared/shared.module";
import { NgbPagination } from "@ng-bootstrap/ng-bootstrap";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import "@angular/localize/init";
import { provideHttpClient } from "@angular/common/http";
import { APP_BASE_HREF } from "@angular/common";
import {
  RouterModule,
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
      declarations: [HistoriqueCourriersComponent],
      imports: [
        SharedModule,
        NgbPagination,
        FontAwesomeModule,
        RouterModule.forRoot([]),
      ],
      providers: [
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
