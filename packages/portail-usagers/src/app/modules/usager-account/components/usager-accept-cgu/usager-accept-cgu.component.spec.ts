import { ComponentFixture, TestBed } from "@angular/core/testing";

import { UsagerAcceptCguComponent } from "./usager-accept-cgu.component";
import { provideHttpClient } from "@angular/common/http";
import { APP_BASE_HREF } from "@angular/common";
import {
  RouterModule,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";
import { AuthGuard } from "../../../../guards/auth-guard";
import { UsagerAuthService } from "../../../usager-auth/services/usager-auth.service";

describe("UsagerAcceptCguComponent", () => {
  let component: UsagerAcceptCguComponent;
  let fixture: ComponentFixture<UsagerAcceptCguComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UsagerAcceptCguComponent],
      imports: [RouterModule.forRoot([])],
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

    fixture = TestBed.createComponent(UsagerAcceptCguComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
