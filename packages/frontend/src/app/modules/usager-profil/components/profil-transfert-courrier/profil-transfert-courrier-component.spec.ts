import { APP_BASE_HREF } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatomoInjector, MatomoModule, MatomoTracker } from "ngx-matomo";
import { ToastrModule } from "ngx-toastr";
import { USAGER_ACTIF_MOCK } from "../../../../../_common/mocks/USAGER_ACTIF.mock";
import { NotFoundComponent } from "../../../general/components/errors/not-found/not-found.component";
import { UsagerFormModel } from "../../../usagers/components/form/UsagerFormModel";

import { UsagersProfilTransfertCourrierComponent } from "./profil-transfert-courrier-component";

describe("UsagersProfilTransfertCourrierComponent", () => {
  let fixture: ComponentFixture<UsagersProfilTransfertCourrierComponent>;
  let component: UsagersProfilTransfertCourrierComponent;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [UsagersProfilTransfertCourrierComponent],
        imports: [
          NgbModule,
          MatomoModule,
          RouterTestingModule.withRoutes([]),
          NgbModule,
          ReactiveFormsModule,
          FormsModule,
          ToastrModule.forRoot(),
          HttpClientTestingModule,
          ReactiveFormsModule,
        ],
        providers: [
          {
            provide: MatomoInjector,
            useValue: {
              init: jest.fn(),
            },
          },
          {
            provide: MatomoTracker,
            useValue: {
              setUserId: jest.fn(),
            },
          },
          { provide: APP_BASE_HREF, useValue: "/" },
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
      }).compileComponents();

      fixture = TestBed.createComponent(
        UsagersProfilTransfertCourrierComponent
      );
      component = fixture.debugElement.componentInstance;
      component.usager = new UsagerFormModel(USAGER_ACTIF_MOCK);
      component.ngOnInit();
    })
  );

  it("0. Create component", () => {
    expect(component).toBeTruthy();
  });
});
