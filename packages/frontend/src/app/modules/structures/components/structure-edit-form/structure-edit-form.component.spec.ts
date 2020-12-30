import { APP_BASE_HREF } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ToastrModule } from "ngx-toastr";
import { Structure } from "../../structure.interface";

import { StructureEditFormComponent } from "./structure-edit-form.component";

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
        HttpClientModule,
        HttpClientTestingModule,
        ToastrModule.forRoot(),
        RouterModule.forRoot([]),
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(StructureEditFormComponent);

    component = fixture.componentInstance;
    component.structure = new Structure();
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });
});
