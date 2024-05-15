import { GeneralService } from "./../../services/general.service";
import { UserStructure } from "@domifa/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";

import { CustomToastService } from "../../../shared/services/custom-toast.service";
import { AuthService } from "../../../shared/services/auth.service";
import { Title, Meta } from "@angular/platform-browser";
import {
  EmailValidator,
  NoWhiteSpaceValidator,
  validateUpload,
} from "../../../../shared";
import { Subscription } from "rxjs";

@Component({
  selector: "app-contact-support",
  templateUrl: "./contact-support.component.html",
})
export class ContactSupportComponent implements OnInit, OnDestroy {
  public submitted: boolean;
  public success: boolean;
  public loading: boolean;

  private subscription = new Subscription();
  public contactForm!: UntypedFormGroup;

  public me!: UserStructure | null;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly generalService: GeneralService,
    private readonly toastService: CustomToastService,
    private readonly authService: AuthService,
    private readonly titleService: Title,
    private readonly meta: Meta
  ) {
    this.me = null;
    this.submitted = false;
    this.success = false;
    this.loading = false;
  }

  public get f(): { [key: string]: AbstractControl } {
    return this.contactForm.controls;
  }

  public ngOnInit(): void {
    this.titleService.setTitle("Contacter l'équipe de DomiFa");
    this.me = this.authService.currentUserValue;

    this.meta.updateTag({
      name: "description",
      content:
        "Vous avez une question ? Ce formulaire vous permettra de contacter l'équipe DomiFa",
    });

    let email = null;
    let structureName = null;
    let name = null;
    let structureId = null;
    let userId = null;

    if (this.me) {
      email = this.me.email;
      structureName = this.me?.structure?.nom;
      structureId = this.me?.structure?.id;
      userId = this.me.id;
      name = this.me.nom + " " + this.me.prenom;
    }

    this.contactForm = this.formBuilder.group({
      content: [
        "",
        [Validators.required, Validators.minLength(10), NoWhiteSpaceValidator],
      ],
      email: [email, [Validators.required, EmailValidator]],
      file: [""],
      fileSource: ["", [validateUpload("STRUCTURE_DOC", false)]],
      name: [
        name,
        [Validators.required, Validators.minLength(2), NoWhiteSpaceValidator],
      ],
      structureId: [structureId, []],
      structureName: [
        structureName,
        [Validators.required, Validators.minLength(2), NoWhiteSpaceValidator],
      ],
      userId: [userId, []],
    });
  }

  public onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];

    this.contactForm.patchValue({
      fileSource: file,
    });
  }

  public sendContactMessage(): void {
    this.submitted = true;

    if (this.contactForm.invalid) {
      this.toastService.error("Le formulaire d'upload comporte des erreurs");
      return;
    }

    this.loading = true;

    const formData = new FormData();

    if (this.contactForm.controls.fileSource.value) {
      formData.append("file", this.contactForm.controls.fileSource.value);
    }

    formData.append("name", this.contactForm.controls.name.value);
    formData.append("userId", this.contactForm.controls.userId.value);
    formData.append("structureId", this.contactForm.controls.structureId.value);
    formData.append(
      "structureName",
      this.contactForm.controls.structureName.value
    );

    formData.append("email", this.contactForm.controls.email.value);
    formData.append("content", this.contactForm.controls.content.value);

    this.subscription.add(
      this.generalService.sendContact(formData).subscribe({
        next: () => {
          this.loading = false;
          this.success = true;
          this.submitted = false;
          this.contactForm.reset();
          this.toastService.success("Fichier uploadé avec succès");
        },
        error: () => {
          this.loading = false;
          this.toastService.error("Impossible d'uploader le fichier");
        },
      })
    );
  }
  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
