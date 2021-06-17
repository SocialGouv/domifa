import { APP_BASE_HREF, CommonModule } from "@angular/common";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/compiler";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";

import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatomoInjector, MatomoModule, MatomoTracker } from "ngx-matomo";
import { ToastrModule } from "ngx-toastr";

import { UsagerFormModel } from "../../form/UsagerFormModel";

import { ProfilEditPreferenceComponent } from "./profil-edit-preference.component";

import { usagerValideMock } from "../../../../../../_common/mocks/usagerValideMock.mock";

describe("ProfilEditPreferenceComponent", () => {
  let component: ProfilEditPreferenceComponent;
  let fixture: ComponentFixture<ProfilEditPreferenceComponent>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfilEditPreferenceComponent],
      imports: [
        NgbModule,
        MatomoModule,
        CommonModule,
        RouterTestingModule,
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        ToastrModule.forRoot(),
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

    fixture = TestBed.createComponent(ProfilEditPreferenceComponent);
    component = fixture.debugElement.componentInstance;
    component.usager = new UsagerFormModel(usagerValideMock);
    component.ngOnInit();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
