import { APP_BASE_HREF } from "@angular/common";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { MatomoModule } from "ngx-matomo";
import {
  MATOMO_INJECTOR_FOR_TESTS,
  USAGER_ACTIF_MOCK,
} from "../../../../../_common/mocks";

import { UsagerFormModel } from "../../../usager-shared/interfaces";

import { UsagersProfilTransfertCourrierComponent } from "./profil-transfert-courrier-component";

describe("UsagersProfilTransfertCourrierComponent", () => {
  let fixture: ComponentFixture<UsagersProfilTransfertCourrierComponent>;
  let component: UsagersProfilTransfertCourrierComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UsagersProfilTransfertCourrierComponent],
      imports: [
        FormsModule,
        HttpClientTestingModule,
        NgbModule,
        ReactiveFormsModule,
        MatomoModule.forRoot(MATOMO_INJECTOR_FOR_TESTS),
        RouterTestingModule.withRoutes([]),
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(UsagersProfilTransfertCourrierComponent);
    component = fixture.debugElement.componentInstance;
    component.usager = new UsagerFormModel(USAGER_ACTIF_MOCK);
    component.ngOnInit();
  }));

  it("0. Create component", () => {
    expect(component).toBeTruthy();
  });
});