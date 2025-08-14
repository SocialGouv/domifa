import { APP_BASE_HREF, CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/compiler";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { USAGER_VALIDE_MOCK } from "../../../../../../_common/mocks/USAGER_VALIDE.mock";
import { SharedModule } from "../../../../shared/shared.module";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";

import { ProfilEditPortailUsagerPreferenceComponent } from "./profil-edit-portail-usager-preference.component";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../../shared";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("ProfilEditPortailUsagerPreferenceComponent", () => {
  let component: ProfilEditPortailUsagerPreferenceComponent;
  let fixture: ComponentFixture<ProfilEditPortailUsagerPreferenceComponent>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfilEditPortailUsagerPreferenceComponent],
      imports: [
        CommonModule,
        FormsModule,
        RouterModule.forRoot([]),
        NgbModule,
        ReactiveFormsModule,
        SharedModule,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(
      ProfilEditPortailUsagerPreferenceComponent
    );
    component = fixture.debugElement.componentInstance;
    component.usager = new UsagerFormModel(USAGER_VALIDE_MOCK);
    component.ngOnInit();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
