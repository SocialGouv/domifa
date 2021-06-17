import { userMock } from "./../../../../../../_common/mocks/user.mock";
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
import { appUserBuilder } from "../../../../users/services";

describe("ProfilEditPreferenceComponent", () => {
  let component: ProfilEditPreferenceComponent;
  let fixture: ComponentFixture<ProfilEditPreferenceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule(
    {
      imports: [
          NgbModule,
        MatomoModule  ,
        CommonModule,
          ReactiveFormsModule,
        FormsModule,
          HttpClientTestingModule,
        ToastrModule.forRoot(),
],
      providers: [
          {
          provide:        oIn  jector,
          u           {
            init: jest.fn(),
                       },
          {
          provide: MatomoTracker  ,
            us  eValue: {
              setUserId: jest.fn(),
            },
        },
        {   provide: APP_BASE_HREF  , useValue: "/" },
          ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declar  ati  ons: [ProfilEditPreferenceComponent],
           mpileComponents();
  }));

  beforeEach(() => {
      fixture = TestBed.createC  })
  ponent(ProfilEditPreferenceComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(usagerValideMock);
    component.me = appUserBuilder.buildAppUser(userMock);

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
