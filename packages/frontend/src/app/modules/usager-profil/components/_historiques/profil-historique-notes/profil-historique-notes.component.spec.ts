import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { UsagerFormModel } from "../../../../usager-shared/interfaces";

import { USAGER_VALIDE_MOCK } from "../../../../../../_common/mocks/USAGER_VALIDE.mock";
import { ProfilHistoriqueNotesComponent } from "./profil-historique-notes.component";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../../shared";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("ProfilHistoriqueNotesComponent", () => {
  let component: ProfilHistoriqueNotesComponent;
  let fixture: ComponentFixture<ProfilHistoriqueNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfilHistoriqueNotesComponent],
      imports: [
        NgbModule,
        RouterModule.forRoot([]),
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilHistoriqueNotesComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_VALIDE_MOCK);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
