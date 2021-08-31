import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { APP_BASE_HREF } from "@angular/common";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { UsersModule } from "src/app/modules/users/users.module";

import { StructuresSearchComponent } from "./structures-search.component";
import { RouterTestingModule } from "@angular/router/testing";

describe("StructuresSearchComponent", () => {
  let component: StructuresSearchComponent;
  let fixture: ComponentFixture<StructuresSearchComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [StructuresSearchComponent],
        imports: [
          UsersModule,
          NgbModule,
          ReactiveFormsModule,
          FormsModule,

          HttpClientTestingModule,
          RouterTestingModule,
        ],
        providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(StructuresSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
