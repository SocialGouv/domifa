import { USAGER_ACTIF_MOCK } from "./../../../../../_common/mocks/USAGER_ACTIF.mock";
import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { ProfilHistoriqueSmsComponent } from "./profil-historique-sms.component";
import { UsagerFormModel } from "../../../usager-shared/interfaces";

describe("ProfilHistoriqueSmsComponent", () => {
  let component: ProfilHistoriqueSmsComponent;
  let fixture: ComponentFixture<ProfilHistoriqueSmsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfilHistoriqueSmsComponent],
      imports: [
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule,
        ReactiveFormsModule,
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilHistoriqueSmsComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_ACTIF_MOCK);

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
