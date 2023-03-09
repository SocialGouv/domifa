import { SharedModule } from "../../../../shared/shared.module";
import { CommonModule, APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { waitForAsync, ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { ProfilDossierComponent } from "./profil-dossier.component";

describe("ProfilDossierComponent", () => {
  let component: ProfilDossierComponent;
  let fixture: ComponentFixture<ProfilDossierComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProfilDossierComponent],
      imports: [
        NgbModule,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        SharedModule,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilDossierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
