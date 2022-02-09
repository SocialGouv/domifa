import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { waitForAsync, ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatomoModule, MatomoInjector, MatomoTracker } from "ngx-matomo";

import { ProfilHistoriqueComponent } from "./profil-historique.component";

import { USAGER_ACTIF_MOCK } from "../../../../../_common/mocks/USAGER_ACTIF.mock";
import { USER_STRUCTURE_MOCK } from "../../../../../_common/mocks/USER_STRUCTURE.mock";
import { UsagerFormModel } from "../../../usager-shared/interfaces";

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
    component.me = USER_STRUCTURE_MOCK;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
