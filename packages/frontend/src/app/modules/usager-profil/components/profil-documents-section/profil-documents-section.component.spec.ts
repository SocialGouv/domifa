import { SharedModule } from "../../../../modules/shared/shared.module";
import { CommonModule, APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatomoModule, MatomoInjector, MatomoTracker } from "ngx-matomo";
import { ToastrModule } from "ngx-toastr";

import { ProfilDocumentsSectionComponent } from "./profil-documents-section.component";

import { USAGER_ACTIF_MOCK } from "../../../../../_common/mocks/USAGER_ACTIF.mock";
import { UsagerFormModel } from "../../../usager-shared/interfaces";

describe("ProfilDocumentsSectionComponent", () => {
  let component: ProfilDocumentsSectionComponent;
  let fixture: ComponentFixture<ProfilDocumentsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfilDocumentsSectionComponent],
      imports: [
        NgbModule,
        MatomoModule,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        SharedModule,
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
    fixture = TestBed.createComponent(ProfilDocumentsSectionComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_ACTIF_MOCK);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
