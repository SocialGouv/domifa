import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  ReactiveFormsModule,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";

import {
  GENERIC_EMAIL_ACKNOWLEDGEMENT_CONTROL,
  GenericEmailAcknowledgementComponent,
} from "./generic-email-acknowledgement.component";

describe("GenericEmailAcknowledgementComponent", () => {
  let component: GenericEmailAcknowledgementComponent;
  let fixture: ComponentFixture<GenericEmailAcknowledgementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GenericEmailAcknowledgementComponent],
      imports: [ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(GenericEmailAcknowledgementComponent);
    component = fixture.componentInstance;
    component.parentFormGroup = new UntypedFormGroup({
      [GENERIC_EMAIL_ACKNOWLEDGEMENT_CONTROL]: new UntypedFormControl(false, [
        Validators.requiredTrue,
      ]),
    });
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("checking the box validates the parent form", () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(component.parentFormGroup.valid).toBe(false);

    el.querySelector<HTMLInputElement>(
      `#${GENERIC_EMAIL_ACKNOWLEDGEMENT_CONTROL}`
    )?.click();
    fixture.detectChanges();

    expect(component.parentFormGroup.valid).toBe(true);
  });

  it("shows the error only once submitted", () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector(".fr-message--error")).toBeNull();

    fixture.componentRef.setInput("submitted", true);
    fixture.detectChanges();

    expect(el.querySelector(".fr-message--error")).not.toBeNull();
  });
});
