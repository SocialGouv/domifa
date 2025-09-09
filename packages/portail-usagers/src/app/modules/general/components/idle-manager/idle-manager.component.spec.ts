import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { IdleManagerComponent } from "./idle-manager.component";
import { provideHttpClient } from "@angular/common/http";
import { APP_BASE_HREF } from "@angular/common";
import {
  RouterModule,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";
import { AuthGuard } from "../../../../guards/auth-guard";
import { UsagerAuthService } from "../../../usager-auth/services/usager-auth.service";

describe("IdleManagerComponent", () => {
  let component: IdleManagerComponent;
  let fixture: ComponentFixture<IdleManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IdleManagerComponent],
      imports: [NgbModule, RouterModule.forRoot([])],
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
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IdleManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
