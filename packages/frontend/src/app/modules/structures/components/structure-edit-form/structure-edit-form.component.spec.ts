import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxIntlTelInputModule } from "ngx-intl-tel-input-gg";

import { StructureEditFormComponent } from "./structure-edit-form.component";
import { StructureCommonWeb } from "../../classes";

describe("StructureEditFormComponent", () => {
  let component: StructureEditFormComponent;
  let fixture: ComponentFixture<StructureEditFormComponent>;

  beforeAll(() => {
    TestBed.configureTestingModule({
      declarations: [StructureEditFormComponent],
      imports: [
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule,
        NgxIntlTelInputModule,
        NoopAnimationsModule,
        RouterTestingModule,
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(StructureEditFormComponent);

    component = fixture.componentInstance;
    component.structure = new StructureCommonWeb();
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });
});
