import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { APP_BASE_HREF } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";

import { ImportComponent } from "./import.component";

import { ReactiveFormsModule, FormsModule } from "@angular/forms";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { SharedModule } from "../../../shared/shared.module";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { RouterModule } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";

describe("ImportComponent", () => {
  let fixture: ComponentFixture<ImportComponent>;
  let app: ImportComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ImportComponent],
      imports: [
        NgbModule,
        RouterModule.forRoot([]),
        StoreModule.forRoot({ app: _usagerReducer }),
        SharedModule,
        ReactiveFormsModule,
        FormsModule,
        FontAwesomeModule,
      ],
      providers: [
        provideHttpClient(),
        { provide: APP_BASE_HREF, useValue: "/" },
      ],
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
