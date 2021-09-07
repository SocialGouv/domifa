import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatomoInjector, MatomoModule, MatomoTracker } from "ngx-matomo";
import { ToastrModule } from "ngx-toastr";
import { UsagerFormModel } from "../../../usagers/components/form/UsagerFormModel";
import { USAGER_ACTIF_MOCK } from "./../../../../../_common/mocks/USAGER_ACTIF.mock";
import { ProfilHistoriqueNotesComponent } from "./profil-historique-notes.component";

describe("ProfilHistoriqueNotesComponent", () => {
  let component: ProfilHistoriqueNotesComponent;
  let fixture: ComponentFixture<ProfilHistoriqueNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfilHistoriqueNotesComponent],
      imports: [
        NgbModule,
        MatomoModule,
        ReactiveFormsModule,
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
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilHistoriqueNotesComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_ACTIF_MOCK);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
