import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { APP_BASE_HREF } from "@angular/common";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ToastrModule } from "ngx-toastr";
import { StructuresEditComponent } from "./structures-edit.component";
import { RouterTestingModule } from "@angular/router/testing";

describe("StructuresEditComponent", () => {
  let component: StructuresEditComponent;
  let fixture: ComponentFixture<StructuresEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StructuresEditComponent],
      imports: [
        NgbModule,
        ReactiveFormsModule,
        FormsModule,

        HttpClientTestingModule,
        ToastrModule.forRoot(),
        RouterTestingModule,
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StructuresEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
