import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";

import { RouterTestingModule } from "@angular/router/testing";
import { StepDocumentsComponent } from "./step-documents.component";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { APP_BASE_HREF } from "@angular/common";
import { StoreModule } from "@ngrx/store";
import { _usagerReducer } from "../../../../shared";
import { NGRX_PROVIDERS_TESTING } from "../../../../shared/store/tests";

describe("StepDocumentsComponent", () => {
  let component: StepDocumentsComponent;
  let fixture: ComponentFixture<StepDocumentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        NgbModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule,
        StoreModule.forRoot({ app: _usagerReducer }),
      ],
      providers: [
        { provide: APP_BASE_HREF, useValue: "/" },
        ...NGRX_PROVIDERS_TESTING,
      ],
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [StepDocumentsComponent],
    });
    fixture = TestBed.createComponent(StepDocumentsComponent);
    component = fixture.componentInstance;
  });

  it("can load instance", () => {
    expect(component).toBeTruthy();
  });
});
