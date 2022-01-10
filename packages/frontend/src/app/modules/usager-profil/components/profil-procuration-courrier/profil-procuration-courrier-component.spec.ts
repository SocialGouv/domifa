import { APP_BASE_HREF, CommonModule } from "@angular/common";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatomoInjector, MatomoModule, MatomoTracker } from "ngx-matomo";

import { USAGER_ACTIF_MOCK } from "../../../../../_common/mocks/USAGER_ACTIF.mock";
import { NotFoundComponent } from "../../../general/components/errors/not-found/not-found.component";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { UsagersProfilProcurationCourrierComponent } from "./profil-procuration-courrier-component";

describe("UsagersProfilProcurationCourrierComponent", () => {
  let fixture: ComponentFixture<UsagersProfilProcurationCourrierComponent>;
  let component: UsagersProfilProcurationCourrierComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        UsagersProfilProcurationCourrierComponent,
        NotFoundComponent,
      ],
      imports: [
        NgbModule,
        MatomoModule,
        CommonModule,
        RouterTestingModule.withRoutes([
          { path: "404", component: NotFoundComponent },
        ]),
        NgbModule,
        ReactiveFormsModule,
        FormsModule,

        HttpClientTestingModule,
        ReactiveFormsModule,
        FormsModule,
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
      UsagersProfilProcurationCourrierComponent
    );
    component = fixture.debugElement.componentInstance;
    component.usager = new UsagerFormModel(USAGER_ACTIF_MOCK);
    component.ngOnInit();
  });

  it("0. Create component", () => {
    expect(component).toBeTruthy();
  });
});
