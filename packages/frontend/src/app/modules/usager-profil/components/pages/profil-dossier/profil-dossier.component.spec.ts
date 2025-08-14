/* eslint-disable @typescript-eslint/no-unused-vars */
import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { waitForAsync, ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { ProfilDossierComponent } from "./profil-dossier.component";
import { _usagerReducer } from "../../../../../shared";
import { StoreModule } from "@ngrx/store";
import { USAGER_VALIDE_MOCK } from "../../../../../../_common/mocks";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("ProfilDossierComponent", () => {
  let component: ProfilDossierComponent;
  let fixture: ComponentFixture<ProfilDossierComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProfilDossierComponent],
      imports: [
        NgbModule,
        ReactiveFormsModule,
        RouterModule.forRoot([]),
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilDossierComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_VALIDE_MOCK);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
