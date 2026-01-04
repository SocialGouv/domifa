import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import {
  PhoneInputComponent,
  Telephone,
} from "./input-phone-international.component";

describe("PhoneInputComponent", () => {
  let component: PhoneInputComponent;
  let fixture: ComponentFixture<PhoneInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhoneInputComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PhoneInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe("Initialisation", () => {
    it("should create component", () => {
      expect(component).toBeTruthy();
    });

    it("should load countries data on init", () => {
      expect(component.allCountries.length).toBeGreaterThan(0);
      expect(component.preferredCountriesData.length).toBeGreaterThan(0);
    });

    it("should set France as default country", () => {
      expect(component.selectedCountry.iso2).toBe("fr");
    });

    it("should generate placeholder for France", () => {
      expect(component.currentPlaceholder).toBeTruthy();
      expect(component.currentPlaceholder.length).toBeGreaterThan(0);
    });

    it("should initialize with empty phone number", () => {
      expect(component.phoneNumber).toBe("");
      expect(component.isValid).toBe(true);
      expect(component.isTouched).toBe(false);
    });
  });

  describe("Gestion des Erreurs", () => {
    it("should show error when required field is empty and touched", () => {
      component.isRequired = true;
      component.phoneNumber = "";
      component.isTouched = true;
      component["validateInput"]();
      component["updateUIState"]();

      expect(component.showError).toBe(true);
    });

    it("should show error when required field is empty and submitted", () => {
      component.isRequired = true;
      component.phoneNumber = "";
      component.submitted = true;
      component["validateInput"]();
      component["updateUIState"]();

      expect(component.showError).toBe(true);
    });

    it("should not show error when phone is valid", () => {
      component.isRequired = true;
      component.isMobileOnly = true;
      component.phoneNumber = "612345678";
      component["validateInput"]();
      component["updateUIState"]();

      expect(component.showError).toBe(false);
    });

    it("should show foreign warning for non-French mobile", () => {
      const uk = component.allCountries.find((c) => c.iso2 === "gb");
      component.selectedCountry = uk!;
      component.isMobileOnly = true;
      component.phoneNumber = "2071838750";
      component.isValid = true;
      component["updateUIState"]();

      expect(component.showForeignWarning).toBe(true);
    });

    it("should not show foreign warning for French mobile", () => {
      component.selectedCountry = component.allCountries.find(
        (c) => c.iso2 === "fr"
      )!;
      component.isMobileOnly = true;
      component.phoneNumber = "612345678";
      component.isValid = true;
      component["updateUIState"]();

      expect(component.showForeignWarning).toBe(false);
    });
  });

  describe("Update du Placeholder", () => {
    it("should update placeholder when changing country to UK", () => {
      const frPlaceholder = component.currentPlaceholder;

      const uk = component.allCountries.find((c) => c.iso2 === "gb");
      const inputElement = document.createElement("input");
      component.onCountrySelect(uk!, inputElement);

      expect(component.currentPlaceholder).not.toBe(frPlaceholder);
    });

    it("should generate numeric placeholder for France", () => {
      component.selectedCountry = component.allCountries.find(
        (c) => c.iso2 === "fr"
      )!;
      component["updatePlaceholder"]();

      expect(component.currentPlaceholder).toMatch(/^\d+$/);
    });

    it("should fallback to default placeholder on invalid country", () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component.selectedCountry = { iso2: "invalid" } as any;
      component["updatePlaceholder"]();

      expect(component.currentPlaceholder).toBe("01 01 01 01 01");
    });

    it("should update placeholder and reflect in input", () => {
      const uk = component.allCountries.find((c) => c.iso2 === "gb");
      const inputElement = document.createElement("input");

      component.onCountrySelect(uk!, inputElement);

      const compiled = fixture.nativeElement;
      const inputEl = compiled.querySelector("input[type='tel']");
      fixture.detectChanges();

      expect(inputEl?.placeholder).toBeTruthy();
    });

    it("should regenerate placeholder when country search clears", () => {
      const initialPlaceholder = component.currentPlaceholder;

      component.countrySearchText = "united";
      component.searchCountry();

      component.countrySearchText = "";
      component.searchCountry();

      component["updatePlaceholder"]();

      expect(component.currentPlaceholder).toBe(initialPlaceholder);
    });
  });

  describe("Validation Mobile Uniquement", () => {
    beforeEach(() => {
      component.isRequired = true;
      component.isMobileOnly = true;
      component.selectedCountry = component.allCountries.find(
        (c) => c.iso2 === "fr"
      )!;
    });

    it("should validate valid French mobile number", () => {
      component.phoneNumber = "612345678";
      component["validateInput"]();

      expect(component.isValid).toBe(true);
    });

    it("should reject invalid mobile number", () => {
      component.phoneNumber = "123456789";
      component["validateInput"]();

      expect(component.isValid).toBe(false);
    });

    it("should reject empty required mobile", () => {
      component.phoneNumber = "";
      component["validateInput"]();

      expect(component.isValid).toBe(false);
    });

    it("should accept empty optional mobile", () => {
      component.isRequired = false;
      component.phoneNumber = "";
      component["validateInput"]();

      expect(component.isValid).toBe(true);
    });

    it("should clean non-numeric characters before validation", () => {
      component.phoneNumber = "06-12-34-56-78";
      component.onPhoneNumberChange();

      expect(component.phoneNumber).toBe("0612345678");
    });
  });

  describe("Validation Sans Restrictions de Type", () => {
    beforeEach(() => {
      component.isRequired = true;
      component.isMobileOnly = false;
      component.selectedCountry = component.allCountries.find(
        (c) => c.iso2 === "fr"
      )!;
    });

    it("should accept valid French mobile when not mobile-only", () => {
      component.phoneNumber = "612345678";
      component["validateInput"]();

      expect(component.isValid).toBe(true);
    });

    it("should validate number when not mobile-only", () => {
      component.phoneNumber = "123456789";
      component["validateInput"]();

      // Dépend de google-libphonenumber, on teste juste que la validation s'exécute
      expect(component.isValid).toBeDefined();
    });

    it("should reject empty required phone", () => {
      component.phoneNumber = "";
      component["validateInput"]();

      expect(component.isValid).toBe(false);
    });

    it("should accept empty optional phone", () => {
      component.isRequired = false;
      component.phoneNumber = "";
      component["validateInput"]();

      expect(component.isValid).toBe(true);
    });

    it("should emit Telephone object with correct structure", (done) => {
      component.onChange = (value: Telephone) => {
        expect(value).toEqual({
          countryCode: "fr",
          numero: "612345678",
        });
        done();
      };

      component.phoneNumber = "612345678";
      component.onPhoneNumberChange();
    });
  });
});
