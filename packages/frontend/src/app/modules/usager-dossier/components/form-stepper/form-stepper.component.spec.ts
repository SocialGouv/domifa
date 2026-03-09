import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FormStepperComponent } from "./form-stepper.component";

describe("FormStepperComponent", () => {
  let component: FormStepperComponent;
  let fixture: ComponentFixture<FormStepperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormStepperComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
