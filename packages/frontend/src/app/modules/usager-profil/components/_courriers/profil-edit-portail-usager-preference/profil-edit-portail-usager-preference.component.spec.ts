import { APP_BASE_HREF, CommonModule } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/compiler";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { USAGER_ACTIF_MOCK } from "../../../../../../_common/mocks/USAGER_ACTIF.mock";
import { SharedModule } from "../../../../shared/shared.module";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";

import { ProfilEditPortailUsagerPreferenceComponent } from "./profil-edit-portail-usager-preference.component";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../../shared";

describe("ProfilEditPortailUsagerPreferenceComponent", () => {
  let component: ProfilEditPortailUsagerPreferenceComponent;
  let fixture: ComponentFixture<ProfilEditPortailUsagerPreferenceComponent>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfilEditPortailUsagerPreferenceComponent],
      imports: [
        CommonModule,
        FormsModule,
        HttpClientTestingModule,
        NgbModule,
        ReactiveFormsModule,
        RouterTestingModule,
        SharedModule,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(
      ProfilEditPortailUsagerPreferenceComponent
    );
    component = fixture.debugElement.componentInstance;
    component.usager = new UsagerFormModel(USAGER_ACTIF_MOCK);
    component.ngOnInit();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
