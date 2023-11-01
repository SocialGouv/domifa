import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { waitForAsync, ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { ProfilHistoriqueComponent } from "./profil-historique.component";

import { USAGER_ACTIF_MOCK } from "../../../../../../_common/mocks/USAGER_ACTIF.mock";
import { USER_STRUCTURE_MOCK } from "../../../../../../_common/mocks/USER_STRUCTURE.mock";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../../shared";
import { SortArrayPipe } from "../../../../shared/pipes/sort-array.pipe";

describe("ProfilHistoriqueComponent", () => {
  let component: ProfilHistoriqueComponent;
  let fixture: ComponentFixture<ProfilHistoriqueComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProfilHistoriqueComponent, SortArrayPipe],
      imports: [
        FormsModule,
        HttpClientTestingModule,
        NgbModule,
        ReactiveFormsModule,
        RouterTestingModule,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilHistoriqueComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_ACTIF_MOCK);
    component.me = USER_STRUCTURE_MOCK;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
