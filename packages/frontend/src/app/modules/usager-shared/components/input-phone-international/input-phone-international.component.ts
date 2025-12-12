/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/no-output-native */
import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  forwardRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  Validator,
  AbstractControl,
  ValidationErrors,
} from "@angular/forms";
import intlTelInput from "intl-tel-input";
import { Iti } from "intl-tel-input";

export const PHONE_ERROR_MESSAGES: { [key: number]: string } = {
  0: "Numéro invalide",
  1: "Code pays invalide",
  2: "Numéro trop court",
  3: "Numéro trop long",
  4: "Format invalide",
};

export interface PhoneValidation {
  isValid: boolean;
  countryCode: string;
  countryName: string;
  internationalFormat: string;
  nationalFormat: string;
  e164Format: string;
  isPossible: boolean;
  errorCode: number | null;
  errorMessage: string;
}

@Component({
  selector: "app-input-phone-international",
  templateUrl: "./input-phone-international.component.html",
  styleUrls: ["./input-phone-international.component.css"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputPhoneInternationalComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => InputPhoneInternationalComponent),
      multi: true,
    },
  ],
})
export class InputPhoneInternationalComponent
  implements
    OnInit,
    AfterViewInit,
    OnDestroy,
    OnChanges,
    ControlValueAccessor,
    Validator
{
  @ViewChild("phoneInput", { static: false })
  phoneInputRef!: ElementRef<HTMLInputElement>;

  // Inputs
  @Input() id = "phone-input-" + Math.random().toString(36).substr(2, 9);
  @Input() label = "Numéro de téléphone";
  @Input() placeholder = "Entrez votre numéro";
  @Input() hint = "Format international accepté";
  @Input() initialCountry = "fr";
  @Input() preferredCountries: string[] = ["fr", "es", "de", "be", "ch"];
  @Input() disabled = false;
  @Input() required = false;
  @Input() usePreciseValidation = true;
  @Input() showValidationDetails = true;
  @Input() allowedCountries?: string[];
  @Input() excludedCountries?: string[];

  // Outputs
  @Output() numberChange = new EventEmitter<string>();
  @Output() countryChange = new EventEmitter<string>();
  @Output() validityChange = new EventEmitter<boolean>();
  @Output() phoneValidationChange = new EventEmitter<PhoneValidation>();
  @Output() readonly blur = new EventEmitter<FocusEvent>();
  @Output() readonly focus = new EventEmitter<FocusEvent>();

  // State
  private iti: Iti | null = null;
  private countryChangeHandler = () => this.handlePhoneInput();
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private onValidatorChange: () => void = () => {};

  phoneValidation: PhoneValidation | null = null;
  isFieldTouched = false;
  hasError = false;
  errorMessage = "";
  successMessage = "";

  readonly errorMessagesMap = PHONE_ERROR_MESSAGES;

  ngOnInit() {
    this.initializeIntlTelInput();
  }

  ngAfterViewInit() {
    if (!this.iti) {
      return;
    }

    // Appliquer la valeur initiale
    if (this.phoneInputRef?.nativeElement?.value) {
      this.setPhoneNumber(this.phoneInputRef.nativeElement.value);
    }

    // Appliquer l'état désactivé
    if (this.disabled) {
      this.setDisabledState(true);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["disabled"] && !changes["disabled"].firstChange) {
      this.iti?.setDisabled(this.disabled);
    }

    if (changes["initialCountry"] && !changes["initialCountry"].firstChange) {
      this.iti?.setCountry(this.initialCountry);
    }
  }

  ngOnDestroy() {
    this.cleanup();
  }

  // ============ Initialization ============

  private initializeIntlTelInput() {
    if (!this.phoneInputRef?.nativeElement) {
      // Retry après un cycle
      setTimeout(() => this.initializeIntlTelInput(), 0);
      return;
    }

    const element = this.phoneInputRef.nativeElement;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = {
      initialCountry: this.initialCountry,
      preferredCountries: this.preferredCountries,
      strictMode: true,
      utilsScript:
        "https://cdn.jsdelivr.net/npm/intl-tel-input@24.5.0/build/js/utils.js",
    };

    // Ajouter les pays autorisés/exclus si spécifiés
    if (this.allowedCountries?.length) {
      options.onlyCountries = this.allowedCountries;
    }
    if (this.excludedCountries?.length) {
      options.excludeCountries = this.excludedCountries;
    }

    this.iti = intlTelInput(element, options);

    // Ajouter les listeners
    element.addEventListener("countrychange", this.countryChangeHandler);
    element.addEventListener("input", () => this.handlePhoneInput());
  }

  // ============ Event Handlers ============

  handlePhoneInput() {
    if (!this.iti) return;

    const phoneNumber = this.iti.getNumber() || "";
    const selectedCountry = this.iti.getSelectedCountryData();

    this.numberChange.emit(phoneNumber);
    this.countryChange.emit(selectedCountry.iso2);

    this.validatePhoneNumber();
    this.onChange(phoneNumber);
    this.onValidatorChange();
  }

  handleBlur(event: FocusEvent) {
    this.isFieldTouched = true;
    this.onTouched();
    this.validatePhoneNumber();
    this.blur.emit(event);
  }

  handleFocus(event: FocusEvent) {
    this.focus.emit(event);
  }

  // ============ Validation ============

  private validatePhoneNumber() {
    if (!this.iti) {
      this.phoneValidation = null;
      this.hasError = false;
      this.errorMessage = "";
      return;
    }

    const phoneNumber = this.iti.getNumber() || "";
    const selectedCountry = this.iti.getSelectedCountryData();

    // Si le champ est vide
    if (!phoneNumber.trim()) {
      this.phoneValidation = null;
      this.hasError = this.required && this.isFieldTouched;
      this.errorMessage = this.hasError
        ? "Le numéro de téléphone est requis"
        : "";
      this.successMessage = "";
      return;
    }

    const isValid = this.usePreciseValidation
      ? this.iti.isValidNumberPrecise()
      : this.iti.isValidNumber();

    const isPossible = this.iti.isPossibleNumber();
    const errorCode = this.iti.getValidationError();

    this.phoneValidation = {
      isValid,
      isPossible,
      countryCode: selectedCountry.iso2.toUpperCase(),
      countryName: selectedCountry.name,
      internationalFormat: this.iti.getNumber("INTERNATIONAL"),
      nationalFormat: this.iti.getNumber("NATIONAL"),
      e164Format: this.iti.getNumber("E164"),
      errorCode,
      errorMessage: isValid ? "" : this.getErrorMessage(errorCode),
    };

    this.hasError = !isValid && this.isFieldTouched;
    this.errorMessage = this.hasError ? this.phoneValidation.errorMessage : "";
    this.successMessage = isValid && this.isFieldTouched ? "Numéro valide" : "";

    this.phoneValidationChange.emit(this.phoneValidation);
    this.validityChange.emit(isValid);
  }

  private getErrorMessage(errorCode: number | null): string {
    if (errorCode === null) {
      return "Numéro invalide";
    }
    return PHONE_ERROR_MESSAGES[errorCode] || "Numéro invalide";
  }

  // ============ Public Methods ============

  setPhoneNumber(value: string) {
    if (this.iti) {
      this.iti.setNumber(value);
      this.handlePhoneInput();
    }
  }

  setCountry(countryCode: string) {
    if (this.iti) {
      this.iti.setCountry(countryCode);
    }
  }

  getPhoneNumber(): string | null {
    return this.phoneValidation?.isValid
      ? this.phoneValidation.e164Format
      : null;
  }

  getCountryCode(): string | null {
    return this.phoneValidation?.countryCode || null;
  }

  getFormattedNumber(): string | null {
    return this.phoneValidation?.internationalFormat || null;
  }

  isValid(): boolean {
    return this.phoneValidation?.isValid || false;
  }

  reset() {
    if (this.phoneInputRef?.nativeElement) {
      this.phoneInputRef.nativeElement.value = "";
    }
    this.phoneValidation = null;
    this.isFieldTouched = false;
    this.hasError = false;
    this.errorMessage = "";
    this.successMessage = "";
    this.onChange("");
  }

  getInstance(): Iti | null {
    return this.iti;
  }

  getInputElement(): HTMLInputElement | null {
    return this.phoneInputRef?.nativeElement || null;
  }

  // ============ ControlValueAccessor Implementation ============

  writeValue(value: string | null): void {
    if (this.iti && value) {
      this.iti.setNumber(value);
      this.validatePhoneNumber();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (this.phoneInputRef?.nativeElement) {
      this.phoneInputRef.nativeElement.disabled = isDisabled;
    }
    this.iti?.setDisabled(isDisabled);
  }

  // ============ Validator Implementation ============

  validate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return this.required ? { required: true } : null;
    }

    if (!this.iti) {
      return null;
    }

    const isValid = this.usePreciseValidation
      ? this.iti.isValidNumberPrecise()
      : this.iti.isValidNumber();

    if (isValid) {
      return null;
    }

    const errorCode = this.iti.getValidationError();
    return {
      invalidPhone: {
        errorCode,
        errorMessage: this.getErrorMessage(errorCode),
      },
    };
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  // ============ Cleanup ============

  private cleanup() {
    if (!this.phoneInputRef?.nativeElement) return;

    const element = this.phoneInputRef.nativeElement;
    element.removeEventListener("countrychange", this.countryChangeHandler);
    element.removeEventListener("input", () => this.handlePhoneInput());

    this.iti?.destroy();
    this.iti = null;
  }
}
