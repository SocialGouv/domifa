import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { UsagerFormModel } from "../../../../usager-shared/interfaces";

import { ProfilHistoriqueCourriersComponent } from "./profil-historique-courriers.component";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../../shared";

describe("ProfilHistoriqueCourriersComponent", () => {
  let component: ProfilHistoriqueCourriersComponent;
  let fixture: ComponentFixture<ProfilHistoriqueCourriersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfilHistoriqueCourriersComponent],
      imports: [
        ReactiveFormsModule,
        NgbModule,
        StoreModule.forRoot({ app: _usagerReducer }),
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilHistoriqueCourriersComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
