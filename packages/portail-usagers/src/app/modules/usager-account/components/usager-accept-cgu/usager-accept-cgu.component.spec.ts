import { ComponentFixture, TestBed } from "@angular/core/testing";

import { UsagerAcceptCguComponent } from "./usager-accept-cgu.component";
import { provideHttpClient } from "@angular/common/http";
import { APP_BASE_HREF } from "@angular/common";
import {
  provideRouter,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";
import { AuthGuard } from "../../../../guards/auth-guard";
import { UsagerAuthService } from "../../../usager-auth/services/usager-auth.service";
import { PortailUsagerProfile } from "@domifa/common";

describe("UsagerAcceptCguComponent", () => {
  let component: UsagerAcceptCguComponent;
  let fixture: ComponentFixture<UsagerAcceptCguComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsagerAcceptCguComponent],
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

    fixture = TestBed.createComponent(UsagerAcceptCguComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("focuses the first checkbox in error once its message is rendered", () => {
    component.usagerProfile = {
      acceptTerms: null,
    } as unknown as PortailUsagerProfile;
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;

    // record what assistive technologies get at the exact moment of the focus
    const focusCalls: { element: HTMLElement; message: string | null }[] = [];
    jest
      .spyOn(HTMLElement.prototype, "focus")
      .mockImplementation(function (this: HTMLElement) {
        const describedBy = this.getAttribute("aria-describedby");
        focusCalls.push({
          element: this,
          message: describedBy
            ? host.querySelector(`#${describedBy}`)?.textContent?.trim() ?? null
            : null,
        });
      });

    component.acceptTermsForm.controls.readTerms.setValue(true);
    component.submitAcceptTerms();

    expect(focusCalls).toHaveLength(1);
    expect(focusCalls[0].element).toBe(host.querySelector("#acceptTerms"));
    expect(focusCalls[0].message).toBe(
      "Cochez cette case pour accepter les CGU et continuer."
    );
  });
});
