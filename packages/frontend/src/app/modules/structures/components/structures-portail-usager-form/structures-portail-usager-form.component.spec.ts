import { APP_BASE_HREF } from "@angular/common";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { USER_STRUCTURE_MOCK } from "../../../../../_common/mocks";

import { StructuresPortailUsagerFormComponent } from "./structures-portail-usager-form.component";

describe("StructuresPortailUsagerFormComponent", () => {
  let component: StructuresPortailUsagerFormComponent;
  let fixture: ComponentFixture<StructuresPortailUsagerFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [StructuresPortailUsagerFormComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StructuresPortailUsagerFormComponent);
    component = fixture.componentInstance;
    component.me = USER_STRUCTURE_MOCK;
    component.structure = USER_STRUCTURE_MOCK.structure;

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
