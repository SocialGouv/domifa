import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FonctionSelectionComponent } from "./fonction-selection.component";
import {
  AbstractControl,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { USER_FONCTION_LABELS } from "@domifa/common";
import { By } from "@angular/platform-browser";
import { Component, ViewChild } from "@angular/core";

// Test host component to test the component with a parent form
@Component({
  template: `
    <form [formGroup]="parentForm">
      <app-fonction-selection
        [parentFormGroup]="parentForm"
        [fonctionFormControl]="parentForm.controls.fonction"
        [submitted]="submitted"
        [invalidFeedbackText]="errorText"
        [required]="isRequired"
        [label]="labelText"
        [displayLabel]="showLabel"
      ></app-fonction-selection>
    </form>
  `,
})
class TestHostComponent {
  @ViewChild(FonctionSelectionComponent)
  fonctionComponent!: FonctionSelectionComponent;

  public parentForm: UntypedFormGroup;
  public submitted = false;
  public errorText = "Error message";
  public isRequired = true;
  public labelText = "Test Label";
  public showLabel = true;

  constructor(private fb: UntypedFormBuilder) {
    this.parentForm = this.fb.group({
      fonction: [null, Validators.required],
    });
  }
}

// Test host component to test the component with output events
@Component({
  template: `
    <app-fonction-selection
      [submitted]="submitted"
      [invalidFeedbackText]="errorText"
      [fonction]="selectedFonction"
      (outputFunction)="onFonctionChange($event)"
    ></app-fonction-selection>
  `,
})
class TestHostWithOutputComponent {
  @ViewChild(FonctionSelectionComponent)
  fonctionComponent!: FonctionSelectionComponent;

  public submitted = false;
  public errorText = "Error message";
  public selectedFonction: string | null = null;
  public emittedFonction: string | null = null;

  onFonctionChange(fonction: string | null) {
    this.emittedFonction = fonction;
  }
}

describe("FonctionSelectionComponent", () => {
  describe("Basic component tests", () => {
    let component: FonctionSelectionComponent;
    let fixture: ComponentFixture<FonctionSelectionComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [FonctionSelectionComponent],
        imports: [FormsModule],
      }).compileComponents();

      fixture = TestBed.createComponent(FonctionSelectionComponent);
      component = fixture.componentInstance;
      component.submitted = false;
      component.invalidFeedbackText = "Error message";
      fixture.detectChanges();
    });

    it("should create", () => {
      expect(component).toBeTruthy();
    });

    it("should have default values", () => {
      expect(component.fonction).toBeNull();
      expect(component.required).toBeFalsy();
      expect(component.label).toBe("Fonction");
      expect(component.displayLabel).toBeTruthy();
      expect(component.USER_FONCTION_LABELS).toEqual(USER_FONCTION_LABELS);
    });

    it("should render the select element", () => {
      const selectElement = fixture.debugElement.query(By.css("select"));
      expect(selectElement).toBeTruthy();
    });

    it("should render all options from USER_FONCTION_LABELS", () => {
      const selectElement = fixture.debugElement.query(By.css("select"));
      const options = selectElement.queryAll(By.css("option"));

      // +1 for the default "Sélectionnez une option" option
      expect(options.length).toBe(Object.keys(USER_FONCTION_LABELS).length + 1);

      // Check the default option
      expect(options[0].nativeElement.textContent.trim()).toBe(
        "Sélectionnez une option"
      );

      // Check that all function labels are present
      Object.values(USER_FONCTION_LABELS).forEach((label) => {
        const optionExists = options.some(
          (option) => option.nativeElement.textContent.trim() === label
        );
        expect(optionExists).toBeTruthy();
      });
    });
  });

  describe("With parent form", () => {
    let hostComponent: TestHostComponent;
    let hostFixture: ComponentFixture<TestHostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [FonctionSelectionComponent, TestHostComponent],
        imports: [FormsModule, ReactiveFormsModule],
      }).compileComponents();

      hostFixture = TestBed.createComponent(TestHostComponent);
      hostComponent = hostFixture.componentInstance;
      hostFixture.detectChanges();
    });

    it("should bind to parent form control", () => {
      const selectElement = hostFixture.debugElement.query(By.css("select"));

      // Select a value
      selectElement.nativeElement.value =
        Object.values(USER_FONCTION_LABELS)[0];
      selectElement.nativeElement.dispatchEvent(new Event("change"));
      hostFixture.detectChanges();

      expect(hostComponent.parentForm.controls.fonction.value).toBe(
        Object.values(USER_FONCTION_LABELS)[0]
      );
    });

    it("should show validation error when submitted with invalid value", () => {
      // Mark as submitted
      hostComponent.submitted = true;
      hostFixture.detectChanges();

      // Check for error message
      const errorElement = hostFixture.debugElement.query(
        By.css(".invalid-feedback")
      );
      expect(errorElement).toBeTruthy();
      expect(errorElement.nativeElement.textContent.trim()).toBe(
        hostComponent.errorText
      );
    });

    it("should apply is-invalid class when form control is invalid and submitted", () => {
      // Mark as submitted
      hostComponent.submitted = true;
      hostFixture.detectChanges();

      const selectElement = hostFixture.debugElement.query(By.css("select"));
      expect(selectElement.nativeElement.classList).toContain("is-invalid");
    });

    it("should not show error when form control is valid", () => {
      // Set a valid value
      hostComponent.parentForm.controls.fonction.setValue(
        Object.values(USER_FONCTION_LABELS)[0]
      );
      hostComponent.submitted = true;
      hostFixture.detectChanges();

      const errorElement = hostFixture.debugElement.query(
        By.css(".invalid-feedback")
      );
      expect(errorElement).toBeFalsy();
    });

    it("should respect the required attribute", () => {
      const selectElement = hostFixture.debugElement.query(By.css("select"));
      expect(selectElement.nativeElement.required).toBeTruthy();

      // Change required to false
      hostComponent.isRequired = false;
      hostFixture.detectChanges();

      expect(selectElement.nativeElement.required).toBeFalsy();
    });

    it("should customize the label text", () => {
      const labelElement = hostFixture.debugElement.query(By.css("label"));
      expect(labelElement.nativeElement.textContent.trim()).toBe(
        hostComponent.labelText
      );

      // Change label text
      hostComponent.labelText = "New Label";
      hostFixture.detectChanges();

      expect(labelElement.nativeElement.textContent.trim()).toBe("New Label");
    });

    it("should hide label when displayLabel is false", () => {
      // Initially label is visible
      let labelElement = hostFixture.debugElement.query(By.css("label"));
      expect(labelElement.nativeElement.classList).not.toContain(
        "visually-hidden"
      );

      // Hide label
      hostComponent.showLabel = false;
      hostFixture.detectChanges();

      labelElement = hostFixture.debugElement.query(By.css("label"));
      expect(labelElement.nativeElement.classList).toContain("visually-hidden");
    });
  });

  describe("With output events", () => {
    let hostComponent: TestHostWithOutputComponent;
    let hostFixture: ComponentFixture<TestHostWithOutputComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [FonctionSelectionComponent, TestHostWithOutputComponent],
        imports: [FormsModule],
      }).compileComponents();

      hostFixture = TestBed.createComponent(TestHostWithOutputComponent);
      hostComponent = hostFixture.componentInstance;
      hostFixture.detectChanges();
    });

    it("should emit selected value when changed", () => {
      const selectElement = hostFixture.debugElement.query(By.css("select"));

      // Select a value
      const testValue = Object.values(USER_FONCTION_LABELS)[0];
      selectElement.nativeElement.value = testValue;
      selectElement.nativeElement.dispatchEvent(new Event("change"));
      hostFixture.detectChanges();

      expect(hostComponent.emittedFonction).toBe(testValue);
    });

    it("should bind to the fonction input property", () => {
      // Set a value through the input property
      const testValue = Object.values(USER_FONCTION_LABELS)[0];
      hostComponent.selectedFonction = testValue;
      hostFixture.detectChanges();

      const selectElement = hostFixture.debugElement.query(By.css("select"));
      expect(selectElement.nativeElement.value).toBe(testValue);
    });
  });

  describe("Edge cases", () => {
    let component: FonctionSelectionComponent;
    let fixture: ComponentFixture<FonctionSelectionComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [FonctionSelectionComponent],
        imports: [FormsModule],
      }).compileComponents();

      fixture = TestBed.createComponent(FonctionSelectionComponent);
      component = fixture.componentInstance;
      component.submitted = false;
      component.invalidFeedbackText = "Error message";
      fixture.detectChanges();
    });

    it("should handle null fonction value", () => {
      component.fonction = null;
      fixture.detectChanges();

      const selectElement = fixture.debugElement.query(By.css("select"));
      expect(selectElement.nativeElement.value).toBe("");
    });

    it("should handle undefined fonctionFormControl", () => {
      // This should not throw an error
      component.fonctionFormControl = undefined as unknown as AbstractControl;
      component.submitted = true;
      fixture.detectChanges();

      // No error should be shown
      const errorElement = fixture.debugElement.query(
        By.css(".invalid-feedback")
      );
      expect(errorElement).toBeFalsy();
    });

    it("should handle compareOriginalOrder function", () => {
      // The function should always return 0 to maintain original order
      expect(component.compareOriginalOrder()).toBe(0);
    });
  });
});
