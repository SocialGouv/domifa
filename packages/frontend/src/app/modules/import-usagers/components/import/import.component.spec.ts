import { RouterTestingModule } from "@angular/router/testing";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";

import { ImportComponent } from "./import.component";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { SharedModule } from "../../../shared/shared.module";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";

describe("ImportComponent", () => {
  let fixture: ComponentFixture<ImportComponent>;
  let app: ImportComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ImportComponent],
      imports: [
        NgbModule,
        HttpClientTestingModule,
        RouterTestingModule,
        StoreModule.forRoot({ app: _usagerReducer }),
        SharedModule,
        ReactiveFormsModule,
        FormsModule,
      ],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportComponent);
    app = fixture.debugElement.componentInstance;
    fixture.detectChanges();
  }));

  it("should create", () => {
    expect(app).toBeTruthy();
  });
});
