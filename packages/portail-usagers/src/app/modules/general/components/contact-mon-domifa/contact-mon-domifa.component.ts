import { KeyValuePipe } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterModule } from "@angular/router";
import {
  DEPARTEMENTS_MAP,
  MON_DOMIFA_CONTACT_RULES,
  MON_DOMIFA_CONTACT_SUBJECTS,
  MON_DOMIFA_CONTACT_SUBJECTS_DEF,
  MonDomifaContactSubject,
  REGIONS_LISTE,
} from "@domifa/common";
import { MatomoTracker } from "ngx-matomo-client";
import { Subscription } from "rxjs";

import { environment } from "../../../../../environments/environment";
import { SeoService } from "../../../shared/services/seo.service";
import {
  EmailValidator,
  NotBlankValidator,
  optionalMinLengthValidator,
  phoneValidator,
} from "../../../shared/validators/form.validators";
import {
  ContactMonDomifaService,
  MonDomifaContactPayload,
} from "../../services/contact-mon-domifa.service";

const MATOMO_CATEGORY = "contact-mon-domifa";
// Phone numbers are typed without a country selector: French numbers only
const PHONE_COUNTRY_CODE = "fr";
const RULES = MON_DOMIFA_CONTACT_RULES;

@Component({
  selector: "app-contact-mon-domifa",
  imports: [KeyValuePipe, ReactiveFormsModule, RouterModule],
  templateUrl: "./contact-mon-domifa.component.html",
})
export class ContactMonDomifaComponent implements OnInit, OnDestroy {
  public readonly SUBJECTS = MON_DOMIFA_CONTACT_SUBJECTS.map((value) => ({
    value,
    ...MON_DOMIFA_CONTACT_SUBJECTS_DEF[value],
  }));

  public readonly REGIONS_LISTE = REGIONS_LISTE;
  public readonly DEPARTEMENTS_MAP = DEPARTEMENTS_MAP;

  public readonly RULES = RULES;

  public readonly contactForm = this.formBuilder.nonNullable.group({
    nom: [
      "",
      [
        Validators.required,
        NotBlankValidator,
        Validators.maxLength(RULES.nameMaxLength),
      ],
    ],
    prenom: [
      "",
      [
        Validators.required,
        NotBlankValidator,
        Validators.maxLength(RULES.nameMaxLength),
      ],
    ],
    email: [
      "",
      [
        Validators.required,
        EmailValidator,
        Validators.maxLength(RULES.emailMaxLength),
      ],
    ],
    phone: ["", [phoneValidator(PHONE_COUNTRY_CODE)]],
    regionCode: [""],
    departement: [""],
    structureName: [
      "",
      [
        Validators.required,
        NotBlankValidator,
        Validators.minLength(RULES.structureNameMinLength),
        Validators.maxLength(RULES.structureNameMaxLength),
      ],
    ],
    subject: ["" as MonDomifaContactSubject | "", [Validators.required]],
    content: ["", [Validators.maxLength(RULES.contentMaxLength)]],
  });

  // Structures sign in on the DomiFa frontend (URL set per environment)
  public readonly domifaStructuresUrl = environment.frontendUrl;

  public submitted = false;
  public loading = false;
  public success = false;
  public error: string | null = null;

  private readonly subscription = new Subscription();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly contactService: ContactMonDomifaService,
    private readonly seoService: SeoService,
    private readonly matomo: MatomoTracker
  ) {}

  public get f() {
    return this.contactForm.controls;
  }

  public get selectedSubject() {
    const subject = this.f.subject.value;
    return subject ? MON_DOMIFA_CONTACT_SUBJECTS_DEF[subject] : null;
  }

  // Information displayed as soon as the subject is selected
  public get response(): string | null {
    return this.selectedSubject?.response ?? null;
  }

  public get needsMessage(): boolean {
    return !!this.selectedSubject?.requiresMessage;
  }

  public ngOnInit(): void {
    this.seoService.updateTitleAndTags(
      "Contacter le support Mon DomiFa",
      "Besoin d'aide ? Contactez le support Mon DomiFa pour toute question liée à votre domiciliation"
    );

    this.subscription.add(
      this.f.subject.valueChanges.subscribe(() => {
        this.error = null;
        this.success = false;
        this.updateMessageValidators();
      })
    );

    // Keep region and departement consistent
    this.subscription.add(
      this.f.regionCode.valueChanges.subscribe((regionCode) => {
        const departement = this.f.departement.value;
        if (
          departement &&
          regionCode &&
          DEPARTEMENTS_MAP[departement]?.regionCode !== regionCode
        ) {
          this.f.departement.setValue("", { emitEvent: false });
        }
      })
    );
    this.subscription.add(
      this.f.departement.valueChanges.subscribe((departement) => {
        const regionCode = DEPARTEMENTS_MAP[departement]?.regionCode;
        if (regionCode && regionCode !== this.f.regionCode.value) {
          this.f.regionCode.setValue(regionCode, { emitEvent: false });
        }
      })
    );
  }

  public showError(name: keyof typeof this.contactForm.controls): boolean {
    const control = this.f[name];
    return (this.submitted || control.touched) && control.invalid;
  }

  public sendContactMessage(): void {
    this.submitted = true;
    this.error = null;

    if (this.contactForm.invalid) {
      return;
    }

    this.loading = true;
    const { phone, ...values } = this.contactForm.getRawValue();
    const payload = {
      ...values,
      phone: phone.trim()
        ? { numero: phone.trim(), countryCode: PHONE_COUNTRY_CODE }
        : null,
    } as MonDomifaContactPayload;

    this.subscription.add(
      this.contactService.sendContact(payload).subscribe({
        next: () => {
          // Only the subject is sent to Matomo: personal data and free text
          // must never leave the form for confidentiality reasons
          this.matomo.trackEvent(
            MATOMO_CATEGORY,
            "envoi_formulaire",
            payload.subject
          );
          // Reset first: clearing the subject also clears the success flag
          this.contactForm.reset();
          this.loading = false;
          this.submitted = false;
          this.success = true;
        },
        error: () => {
          this.loading = false;
          this.error =
            "Votre message n'a pas pu être envoyé. Veuillez réessayer.";
        },
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private updateMessageValidators(): void {
    const content = this.f.content;
    if (this.needsMessage) {
      content.setValidators([
        Validators.required,
        NotBlankValidator,
        Validators.minLength(RULES.contentMinLength),
        Validators.maxLength(RULES.contentMaxLength),
      ]);
    } else {
      // Optional message, still bounded
      content.setValidators([
        optionalMinLengthValidator(RULES.contentMinLength),
        Validators.maxLength(RULES.contentMaxLength),
      ]);
    }
    content.updateValueAndValidity();
  }
}
