/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from "@angular/common";
import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  forwardRef,
  OnInit,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import {
  ControlValueAccessor,
  ReactiveFormsModule,
  NG_VALUE_ACCESSOR,
  FormsModule,
} from "@angular/forms";
import {
  NgbDropdown,
  NgbDropdownToggle,
  NgbDropdownMenu,
  NgbDropdownItem,
} from "@ng-bootstrap/ng-bootstrap";

import intlTelInput from "intl-tel-input";
import { Country, Iso2 } from "intl-tel-input/data";
import frCountries from "intl-tel-input/build/js/i18n/fr/countries.js";
import { PhoneNumberUtil } from "google-libphonenumber";

export type Telephone = {
  countryCode: Iso2;
  numero: string;
};

export const PREFERRED_COUNTRIES: Iso2[] = [
  "fr",
  "gp",
  "mq",
  "gf",
  "re",
  "yt",
  "pm",
  "bl",
  "mf",
  "wf",
  "pf",
  "nc",
];

@Component({
  selector: "app-phone-input",
  standalone: true,
  templateUrl: "./input-phone-international.component.html",
  styleUrl: "./input-phone-international.component.scss",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu,
    NgbDropdownItem,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true,
    },
  ],
})
export class PhoneInputComponent
  implements OnInit, ControlValueAccessor, OnChanges
{
  @Input() public inputId: string = "phone-input-id";
  @Input() public label: string = "Numéro de téléphone";
  @Input() public searchCountryPlaceholder: string = "Rechercher un pays";

  @Input({ required: true }) public isRequired: boolean = false;
  @Input({ required: true }) public isMobileOnly: boolean = false;

  @Input() public displayErrors: boolean = false;
  @Input() public submitted: boolean = false;

  @Input() public errorMessage: string = "Numéro de téléphone incorrect";
  @Input() public foreignSmsWarning: string =
    "Attention: les SMS ne sont pas envoyés aux numéros étrangers";

  public preferredCountriesData: Country[] = [];
  public allCountries: Country[] = [];
  public selectedCountry: Country;

  public phoneNumber: string = "";
  public countrySearchText: string = "";

  public isValid: boolean = true;
  public isTouched: boolean = false;

  public showError: boolean = false;
  public showForeignWarning: boolean = false;
  public currentPlaceholder: string = "Numéro";

  @ViewChild("focusable") focusableElement: ElementRef;

  private readonly phoneUtil: PhoneNumberUtil = PhoneNumberUtil.getInstance();

  onChange: any = () => {};
  onTouched: any = () => {};

  ngOnInit(): void {
    this.fetchCountryData();
    this.updateUIState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["displayErrors"] || changes["submitted"]) {
      this.updateUIState();
    }
  }

  private fetchCountryData(): void {
    const rawData = intlTelInput.getCountryData();

    this.preferredCountriesData = rawData.filter((c) =>
      PREFERRED_COUNTRIES.includes(c.iso2)
    );
    const otherCountries = rawData.filter(
      (c) => !PREFERRED_COUNTRIES.includes(c.iso2)
    );

    this.allCountries = [...this.preferredCountriesData, ...otherCountries].map(
      (country) => ({
        ...country,
        name: frCountries[country.iso2] || country.name,
      })
    );

    if (!this.selectedCountry && this.preferredCountriesData.length > 0) {
      this.selectedCountry = this.preferredCountriesData[0];
    }
    this.updatePlaceholder();
  }

  public searchCountry(): void {
    if (!this.countrySearchText) {
      this.fetchCountryData();
      return;
    }
    const term = this.countrySearchText.toLowerCase();
    this.allCountries = this.allCountries.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.dialCode.includes(term) ||
        c.iso2.includes(term)
    );
  }

  public onCountrySelect(
    country: Country,
    inputElement: HTMLInputElement
  ): void {
    this.selectedCountry = country;
    this.countrySearchText = "";
    this.searchCountry();
    this.updatePlaceholder();
    this.validateInput();
    this.updateUIState();
    this.onChange({
      countryCode: this.selectedCountry.iso2,
      numero: this.phoneNumber,
    });
    if (inputElement) inputElement.focus();
  }

  public onInputKeyPress(event: KeyboardEvent): void {
    const pattern = /[0-9]/;
    if (!pattern.test(String.fromCodePoint(event.charCode))) {
      event.preventDefault();
    }
  }

  onPhoneNumberChange(event?: Event): void {
    if (event?.target) {
      this.phoneNumber = (event.target as HTMLInputElement).value;
    }

    this.isTouched = true;
    let cleanValue = this.phoneNumber.replaceAll(/[^0-9]/g, "");
    if (cleanValue.length > 15) cleanValue = cleanValue.substring(0, 15);

    if (this.phoneNumber !== cleanValue) this.phoneNumber = cleanValue;

    this.validateInput();

    const outputValue: Telephone = {
      countryCode: this.selectedCountry.iso2,
      numero: this.phoneNumber,
    };

    this.updateUIState();
    this.onChange(outputValue);
  }

  onBlur(): void {
    this.isTouched = true;
    this.updateUIState();
    this.onTouched();
  }

  private validateInput(): void {
    // Si vide et requis
    if (
      this.isRequired &&
      (!this.phoneNumber || this.phoneNumber.trim() === "")
    ) {
      this.isValid = false;
      return;
    }

    if (!this?.phoneNumber || this?.phoneNumber?.trim() === "") {
      this.isValid = true;
      return;
    }

    try {
      const parsedNumber = this.phoneUtil.parse(
        this.phoneNumber,
        this.selectedCountry.iso2
      );

      if (!this.phoneUtil.isValidNumber(parsedNumber)) {
        this.isValid = false;
        return;
      }

      if (this.isMobileOnly) {
        const numberType = this.phoneUtil.getNumberType(parsedNumber);
        // MOBILE = 1
        this.isValid = numberType === 1;
      } else {
        this.isValid = true;
      }
    } catch (e) {
      console.log(e);
      this.isValid = false;
    }
  }

  private updateUIState(): void {
    this.showError =
      !this.isValid && (this.isTouched || this.displayErrors || this.submitted);

    if (!this.phoneNumber || this.showError) {
      this.showForeignWarning = false;
    } else {
      const isForeign = !PREFERRED_COUNTRIES.includes(
        this.selectedCountry.iso2
      );
      this.showForeignWarning = this.isMobileOnly && isForeign;
    }
  }

  private updatePlaceholder(): void {
    try {
      const exampleNumber = this.phoneUtil.getExampleNumber(
        this.selectedCountry.iso2
      );

      if (exampleNumber) {
        this.currentPlaceholder =
          this.phoneUtil.getNationalSignificantNumber(exampleNumber);
        return;
      }
    } catch (e) {
      console.log("Cannot generate placeholder", e);
    }

    this.currentPlaceholder = this.isMobileOnly
      ? "06 12 34 56 78"
      : "01 01 01 01 01";
  }

  trackByCountryIso(_index: number, item: Country): string {
    return item.iso2;
  }

  writeValue(value: Telephone | null): void {
    if (!this.allCountries || this.allCountries.length === 0)
      this.fetchCountryData();

    if (value && typeof value === "object") {
      this.phoneNumber = value.numero || "";
      const foundCountry = this.allCountries.find(
        (c) => c.iso2 === value.countryCode
      );
      if (foundCountry) this.selectedCountry = foundCountry;
    } else {
      this.phoneNumber = "";
    }

    this.validateInput();
    this.updatePlaceholder();
    // On ne met pas à jour showError ici pour ne pas afficher de rouge au chargement initial
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
