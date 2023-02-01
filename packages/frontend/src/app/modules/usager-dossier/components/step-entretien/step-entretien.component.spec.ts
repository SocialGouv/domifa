import { APP_BASE_HREF } from "@angular/common";

import { HttpClientTestingModule } from "@angular/common/http/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RouterTestingModule } from "@angular/router/testing";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { StepEntretienComponent } from "./step-entretien.component";

describe("StepEntretienComponent", () => {
  let component: StepEntretienComponent;
  let fixture: ComponentFixture<StepEntretienComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      imports: [RouterTestingModule, NgbModule, HttpClientTestingModule],
      declarations: [StepEntretienComponent],
      providers: [{ provide: APP_BASE_HREF, useValue: "/" }],
    });
    fixture = TestBed.createComponent(StepEntretienComponent);
    component = fixture.componentInstance;
  });

  it("can load instance", () => {
    expect(component).toBeTruthy();
  });
});
