import { NgbDateCustomParserFormatter } from "./../../../shared/services/date-formatter";
import { UsagerSharedModule } from "./../../../usager-shared/usager-shared.module";
import { CommonModule, APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { waitForAsync, ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatomoModule, MatomoInjector, MatomoTracker } from "ngx-matomo";
import { ToastrModule } from "ngx-toastr";

import { ProfilHistoriqueComponent } from "./profil-historique.component";

import { UsagerFormModel } from "../../../usagers/components/form/UsagerFormModel";
import { USAGER_ACTIF_MOCK } from "../../../../../_common/mocks/USAGER_ACTIF.mock";

describe("ProfilHistoriqueComponent", () => {
  let component: ProfilHistoriqueComponent;
  let fixture: ComponentFixture<ProfilHistoriqueComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ProfilHistoriqueComponent],
        imports: [
          MatomoModule,
          ReactiveFormsModule,
          NgbModule,
          FormsModule,
          HttpClientTestingModule,
          ToastrModule.forRoot(),
          RouterTestingModule,
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
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilHistoriqueComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_ACTIF_MOCK);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
