import { CommonModule, APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxIntlTelInputModule } from "ngx-intl-tel-input";
import { USAGER_ACTIF_MOCK } from "../../../../../_common/mocks";
import { UsagerFormModel } from "../../interfaces";

import { EtatCivilParentFormComponent } from "./etat-civil-parent-form.component";

describe("EtatCivilParentFormComponent", () => {
  let component: EtatCivilParentFormComponent;
  let fixture: ComponentFixture<EtatCivilParentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EtatCivilParentFormComponent],
      imports: [
        NgbModule,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule,
        NgxIntlTelInputModule,
        RouterTestingModule,
        BrowserAnimationsModule,
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EtatCivilParentFormComponent);
    component = fixture.componentInstance;
    component.usager = new UsagerFormModel(USAGER_ACTIF_MOCK);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
