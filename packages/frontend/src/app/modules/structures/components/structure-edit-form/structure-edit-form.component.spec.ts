import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxIntlTelInputModule } from "@khazii/ngx-intl-tel-input";

import { StructureEditFormComponent } from "./structure-edit-form.component";
import { StructureCommonWeb } from "../../classes";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

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
        RouterModule.forRoot([]),
        NgxIntlTelInputModule,
        NoopAnimationsModule,
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
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
