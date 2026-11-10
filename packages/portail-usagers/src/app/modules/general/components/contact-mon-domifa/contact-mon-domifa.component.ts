import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { RouterModule } from "@angular/router";
import {
  DEPARTEMENTS_MAP,
  MON_DOMIFA_CONTACT_SUBJECTS,
  MON_DOMIFA_CONTACT_SUBJECTS_DEF,
  MonDomifaContactSubject,
  REGIONS_DEF,
} from "@domifa/common";
import { MatomoTracker } from "ngx-matomo-client";
import { Subscription } from "rxjs";

import { SeoService } from "../../../shared/services/seo.service";
import {
  ContactMonDomifaService,
  MonDomifaContactPayload,
} from "../../services/contact-mon-domifa.service";

const MATOMO_CATEGORY = "contact-mon-domifa";
const PHONE_PATTERN = /^\+?[0-9 .()-]{6,25}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const notBlank: ValidatorFn = (control: AbstractControl) =>
  typeof control.value === "string" && control.value.trim() === ""
    ? { required: true }
    : null;

@Component({
  selector: "app-contact-mon-domifa",
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: "./contact-mon-domifa.component.html",
})
export class ContactMonDomifaComponent implements OnInit, OnDestroy {
  public readonly SUBJECTS = MON_DOMIFA_CONTACT_SUBJECTS.map((value) => ({
    value,
    ...MON_DOMIFA_CONTACT_SUBJECTS_DEF[value],
  }));

  public readonly REGIONS = [...REGIONS_DEF]
    .map(({ regionCode, regionName }) => ({ regionCode, regionName }))
    .sort((a, b) => a.regionName.localeCompare(b.regionName, "fr"));

  private readonly ALL_DEPARTEMENTS = Object.values(DEPARTEMENTS_MAP).sort(
    (a, b) => a.departmentCode.localeCompare(b.departmentCode, "fr")
  );

  public readonly contactForm = this.formBuilder.nonNullable.group({
    nom: ["", [Validators.required, notBlank, Validators.maxLength(200)]],
    prenom: ["", [Validators.required, notBlank, Validators.maxLength(200)]],
    email: ["", [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
    phone: ["", [Validators.pattern(PHONE_PATTERN)]],
    regionCode: [""],
    departement: [""],
    structureName: [
      "",
      [Validators.required, notBlank, Validators.minLength(2)],
    ],
    subject: ["" as MonDomifaContactSubject | ""],
    content: [""],
  });

  public readonly domifaStructuresUrl =
    "https://domifa.fabrique.social.gouv.fr/";

  public submitted = false;
  public loading = false;
  public success = false;
  public error: string | null = null;

  // Auto-responses are tracked once per subject and per page view
  private readonly trackedAutoResponses = new Set<MonDomifaContactSubject>();
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

  // Answer displayed as soon as the subject is selected
  public get response(): string | null {
    return this.selectedSubject?.response ?? null;
  }

  // Subjects answered on screen only cannot be sent to the support team
  public get canSend(): boolean {
    return !!this.selectedSubject?.sendToSupport;
  }

  public get needsMessage(): boolean {
    return !!this.selectedSubject?.requiresMessage;
  }

  public get departements() {
    const regionCode = this.f.regionCode.value;
    return regionCode
      ? this.ALL_DEPARTEMENTS.filter((dep) => dep.regionCode === regionCode)
      : this.ALL_DEPARTEMENTS;
  }

  public ngOnInit(): void {
    this.seoService.updateTitleAndTags(
      "Contacter le support Mon DomiFa",
      "Besoin d'aide ? Contactez le support Mon DomiFa pour toute question liée à votre domiciliation"
    );

    this.subscription.add(
      this.f.subject.valueChanges.subscribe((subject) => {
        this.error = null;
        this.success = false;
        this.updateMessageValidators();
        if (
          subject &&
          !MON_DOMIFA_CONTACT_SUBJECTS_DEF[subject].sendToSupport
        ) {
          this.trackAutoResponse(subject);
        }
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

    if (!this.canSend || this.contactForm.invalid) {
      return;
    }

    this.loading = true;
    const payload = this.contactForm.getRawValue() as MonDomifaContactPayload;

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
        notBlank,
        Validators.minLength(10),
        Validators.maxLength(5000),
      ]);
    } else {
      content.clearValidators();
    }
    content.updateValueAndValidity();
  }

  private trackAutoResponse(subject: MonDomifaContactSubject): void {
    if (this.trackedAutoResponses.has(subject)) {
      return;
    }
    this.trackedAutoResponses.add(subject);
    this.matomo.trackEvent(MATOMO_CATEGORY, "reponse_automatique", subject);
  }
}
